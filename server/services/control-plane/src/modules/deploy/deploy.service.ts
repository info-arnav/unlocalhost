import { execFile } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { encrypt, decrypt } from '@unlocalhost/shared/crypto';
import { badRequest, internal } from '@unlocalhost/shared/error';
import type { Logger } from '@unlocalhost/shared/logger';
import type { Config } from '../../config.js';
import type { DokkuClient } from '../dokku/dokku.client.js';
import {
  type GitHubClient,
  parseRepoFullName,
} from '../github/github.client.js';
import { BuildQueue } from './build-queue.js';
import type { DeployRepository } from './deploy.repository.js';
import type { SecretScanService } from './secret-scan.service.js';

const run = promisify(execFile);

export interface DeployInput {
  appId: string;
  repoFullName: string;
  installationId: string;
  env?: Record<string, string> | undefined;
  branch?: string | undefined;
}

export interface DeployResult {
  deploymentId: string;
  status: 'succeeded' | 'failed';
  url: string;
  logs: string;
}

export class DeployService {
  private readonly queue: BuildQueue;

  constructor(
    private readonly config: Config,
    private readonly repository: DeployRepository,
    private readonly github: GitHubClient,
    private readonly dokku: DokkuClient,
    private readonly scanner: SecretScanService,
    private readonly logger: Logger,
  ) {
    this.queue = new BuildQueue(config.MAX_CONCURRENT_BUILDS);
  }

  get queueDepth(): number {
    return this.queue.pending;
  }

  async deploy(input: DeployInput): Promise<DeployResult> {
    const app = await this.repository.findAppById(input.appId);

    if (!app) throw badRequest('APP_NOT_FOUND', 'No such app');

    const deployment = await this.repository.createDeployment(app.id, null);

    if (!deployment)
      throw internal('DEPLOY_FAILED', 'Could not record deployment');

    return this.queue.run(async () => {
      await this.repository.updateDeployment(deployment.id, {
        status: 'building',
      });
      await this.repository.setAppStatus(app.id, 'building');

      const workdir = await mkdtemp(join(tmpdir(), 'unlocalhost-'));
      const transcript: string[] = [];

      try {
        const ref = parseRepoFullName(input.repoFullName);
        const cloneUrl = await this.github.cloneUrl(ref, input.installationId);
        const branch =
          input.branch ??
          (await this.github.defaultBranch(ref, input.installationId));

        transcript.push(`Cloning ${input.repoFullName}#${branch}`);

        await run(
          'git',
          ['clone', '--depth', '1', '--branch', branch, cloneUrl, workdir],
          { timeout: this.config.BUILD_TIMEOUT_MS },
        );

        const { stdout: sha } = await run('git', [
          '-C',
          workdir,
          'rev-parse',
          'HEAD',
        ]);
        const commitSha = sha.trim();

        transcript.push(`Checked out ${commitSha.slice(0, 8)}`);

        const findings = await this.scanner.scan(workdir);

        if (findings.length > 0) {
          const detail = findings
            .map((finding) => `  ${finding.file}: ${finding.reason}`)
            .join('\n');

          throw badRequest(
            'SECRETS_COMMITTED',
            `Refusing to deploy: secrets found in the repository.\n${detail}\n` +
              'Remove them, add the file to .gitignore, and pass values as env vars instead.',
          );
        }

        transcript.push('Secret scan passed');

        await this.dokku.createApp(app.subdomain);
        await this.dokku.ensureStorage(app.subdomain, '/app/data');
        await this.dokku.setDomain(
          app.subdomain,
          `${app.subdomain}.${this.config.BASE_DOMAIN}`,
        );
        await this.dokku.setPorts(
          app.subdomain,
          this.config.DOKKU_APP_HTTP_PORT,
          this.config.DOKKU_APP_CONTAINER_PORT,
        );

        if (input.env && Object.keys(input.env).length > 0) {
          await this.repository.replaceEnvVars(
            app.id,
            Object.entries(input.env).map(([key, value]) => ({
              key,
              valueEncrypted: encrypt(value, this.config.ENCRYPTION_KEY),
            })),
          );
        }

        const stored = await this.repository.listEnvVars(app.id);
        const envForApp = Object.fromEntries(
          stored.map((entry) => [
            entry.key,
            decrypt(entry.valueEncrypted, this.config.ENCRYPTION_KEY),
          ]),
        );

        await this.dokku.setConfig(app.subdomain, {
          ...envForApp,
          DATABASE_PATH: '/app/data/app.db',
        });

        transcript.push(`Applied ${Object.keys(envForApp).length} env vars`);
        transcript.push('Pushing to build system');

        const { stdout: pushOut, stderr: pushErr } = await run(
          'git',
          [
            '-C',
            workdir,
            'push',
            '--force',
            this.dokku.gitRemote(app.subdomain),
            `HEAD:refs/heads/main`,
          ],
          {
            timeout: this.config.BUILD_TIMEOUT_MS,
            env: {
              ...process.env,
              GIT_SSH_COMMAND: `ssh -i ${this.config.DOKKU_SSH_KEY_PATH} -o StrictHostKeyChecking=accept-new -o BatchMode=yes`,
            },
          },
        );

        transcript.push(pushOut, pushErr);

        const logs = transcript.filter(Boolean).join('\n');

        await this.repository.updateDeployment(deployment.id, {
          status: 'succeeded',
          commitSha,
          logs,
        });
        await this.repository.setAppStatus(app.id, 'running');
        await this.repository.markActive(app.id);

        return {
          deploymentId: deployment.id,
          status: 'succeeded' as const,
          url: `https://${app.subdomain}.${this.config.BASE_DOMAIN}`,
          logs,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const logs = [...transcript, `FAILED: ${message}`]
          .filter(Boolean)
          .join('\n');

        this.logger.warn(
          { appId: app.id, deploymentId: deployment.id },
          'deploy failed',
        );

        await this.repository.updateDeployment(deployment.id, {
          status: 'failed',
          logs,
        });
        await this.repository.setAppStatus(app.id, 'failed');

        return {
          deploymentId: deployment.id,
          status: 'failed' as const,
          url: `https://${app.subdomain}.${this.config.BASE_DOMAIN}`,
          logs,
        };
      } finally {
        await rm(workdir, { recursive: true, force: true });
      }
    });
  }
}
