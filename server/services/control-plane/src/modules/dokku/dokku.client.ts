import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);

const APP_NAME = /^[a-z0-9][a-z0-9-]{0,62}$/;
const ENV_KEY = /^[A-Za-z_][A-Za-z0-9_]*$/;

export interface DokkuOptions {
  host: string;
  user: string;
  sshKeyPath: string;
  commandTimeoutMs: number;
}

export interface CommandResult {
  stdout: string;
  stderr: string;
}

export class DokkuClient {
  constructor(private readonly options: DokkuOptions) {}

  private assertAppName(app: string): void {
    if (!APP_NAME.test(app)) {
      throw new Error(`Unsafe dokku app name: ${app}`);
    }
  }

  private sshArgs(command: string[]): string[] {
    return [
      '-i',
      this.options.sshKeyPath,
      '-o',
      'StrictHostKeyChecking=accept-new',
      '-o',
      'BatchMode=yes',
      `${this.options.user}@${this.options.host}`,
      ...command,
    ];
  }

  async exec(command: string[]): Promise<CommandResult> {
    const { stdout, stderr } = await run('ssh', this.sshArgs(command), {
      timeout: this.options.commandTimeoutMs,
      maxBuffer: 10_000_000,
    });

    return { stdout, stderr };
  }

  async appExists(app: string): Promise<boolean> {
    this.assertAppName(app);

    try {
      await this.exec(['apps:exists', app]);
      return true;
    } catch {
      return false;
    }
  }

  async createApp(app: string): Promise<void> {
    this.assertAppName(app);

    if (await this.appExists(app)) return;

    await this.exec(['apps:create', app]);
  }

  async setConfig(app: string, vars: Record<string, string>): Promise<void> {
    this.assertAppName(app);

    const pairs = Object.entries(vars).map(([key, value]) => {
      if (!ENV_KEY.test(key)) {
        throw new Error(`Unsafe env var name: ${key}`);
      }

      return `${key}=${value}`;
    });

    if (pairs.length === 0) return;

    await this.exec(['config:set', '--no-restart', app, ...pairs]);
  }

  async ensureStorage(app: string, mountPath: string): Promise<void> {
    this.assertAppName(app);

    await this.exec(['storage:ensure-directory', app]);

    const mount = `/var/lib/dokku/data/storage/${app}:${mountPath}`;

    try {
      await this.exec(['storage:mount', app, mount]);
    } catch (error) {
      const output = `${(error as Error).message}`.toLowerCase();

      if (!output.includes('already')) throw error;
    }
  }

  async setPorts(
    app: string,
    hostPort: number,
    containerPort: number,
  ): Promise<void> {
    this.assertAppName(app);

    if (!Number.isInteger(hostPort) || !Number.isInteger(containerPort)) {
      throw new Error('Port mappings must be integers');
    }

    await this.exec(['ports:set', app, `http:${hostPort}:${containerPort}`]);
  }

  async setDomain(app: string, domain: string): Promise<void> {
    this.assertAppName(app);

    if (!/^[a-z0-9.-]+$/.test(domain)) {
      throw new Error(`Unsafe domain: ${domain}`);
    }

    await this.exec(['domains:set', app, domain]);
  }

  async start(app: string): Promise<void> {
    this.assertAppName(app);
    await this.exec(['ps:start', app]);
  }

  async stop(app: string): Promise<void> {
    this.assertAppName(app);
    await this.exec(['ps:stop', app]);
  }

  async isRunning(app: string): Promise<boolean> {
    this.assertAppName(app);

    const { stdout } = await this.exec(['ps:report', app, '--deployed']);

    return stdout.trim().endsWith('true');
  }

  async logs(app: string, lines: number): Promise<string> {
    this.assertAppName(app);

    const { stdout } = await this.exec([
      'logs',
      app,
      '--num',
      String(Math.max(1, Math.min(lines, 1000))),
    ]);

    return stdout;
  }

  async destroy(app: string): Promise<void> {
    this.assertAppName(app);
    await this.exec(['--force', 'apps:destroy', app]);
  }

  gitRemote(app: string): string {
    this.assertAppName(app);

    return `${this.options.user}@${this.options.host}:${app}`;
  }
}
