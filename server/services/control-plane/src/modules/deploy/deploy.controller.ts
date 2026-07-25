import { badRequest } from '@unlocalhost/shared/error';
import type { NextFunction, Request, Response } from 'express';
import { requireUser } from '../auth/bearer.middleware.js';
import type { AppsService } from '../apps/apps.service.js';
import type { GitHubClient } from '../github/github.client.js';
import { parseRepoFullName } from '../github/github.client.js';
import { deploySchema, logsQuerySchema } from './deploy.schema.js';
import type { DeployService } from './deploy.service.js';
import type { DokkuClient } from '../dokku/dokku.client.js';

export class DeployController {
  constructor(
    private readonly apps: AppsService,
    private readonly deploys: DeployService,
    private readonly github: GitHubClient,
    private readonly dokku: DokkuClient,
    private readonly appSlug: string,
  ) {}

  deploy = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = requireUser(req);
      const parsed = deploySchema.safeParse(req.body);

      if (!parsed.success) {
        next(
          badRequest(
            'INVALID_BODY',
            parsed.error.issues[0]?.message ?? 'Invalid body',
          ),
        );
        return;
      }

      const ref = parseRepoFullName(parsed.data.repoFullName);
      let installationId: string;

      try {
        installationId = await this.github.findInstallationId(ref);
      } catch {
        res.status(409).json({
          error: {
            code: 'APP_NOT_INSTALLED',
            message: 'unlocalhost cannot read that repository yet',
            installUrl: `https://github.com/apps/${this.appSlug}/installations/new`,
          },
        });
        return;
      }

      const existing = (await this.apps.listByOwner(user.id)).find(
        (app) => app.repoFullName === parsed.data.repoFullName,
      );

      const app =
        existing ??
        (await this.apps.create({
          ownerId: user.id,
          name: ref.repo,
          repoFullName: parsed.data.repoFullName,
          repoUrl: `https://github.com/${parsed.data.repoFullName}`,
        }));

      if (parsed.data.emails?.length) {
        await this.apps.share(app.id, parsed.data.emails);
      }

      const result = await this.deploys.deploy({
        appId: app.id,
        repoFullName: parsed.data.repoFullName,
        installationId,
        env: parsed.data.env,
        branch: parsed.data.branch,
      });

      res.status(result.status === 'succeeded' ? 200 : 422).json({
        ...result,
        appId: app.id,
        subdomain: app.subdomain,
        allowlist: await this.apps.listAllowlist(app.id),
      });
    } catch (error) {
      next(error);
    }
  };

  logs = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = requireUser(req);
      const query = logsQuerySchema.safeParse(req.query);
      const app = await this.apps.getOwned(req.params.id as string, user.id);

      const lines = query.success ? query.data.lines : 200;
      const logs = await this.dokku.logs(app.subdomain, lines).catch(() => '');
      const history = await this.apps.recentDeployments(app.id, 5);

      res.json({ logs, deployments: history });
    } catch (error) {
      next(error);
    }
  };
}
