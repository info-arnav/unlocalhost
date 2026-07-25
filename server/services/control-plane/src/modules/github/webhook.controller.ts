import type { NextFunction, Request, Response } from 'express';
import type { Logger } from '@unlocalhost/shared/logger';
import type { DeployRepository } from '../deploy/deploy.repository.js';
import type { DeployService } from '../deploy/deploy.service.js';
import type { WebhookService } from './webhook.service.js';

export class WebhookController {
  constructor(
    private readonly service: WebhookService,
    private readonly deploys: DeployService,
    private readonly repository: DeployRepository,
    private readonly logger: Logger,
  ) {}

  github = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const raw = req.body as Buffer;

      if (
        !this.service.verifySignature(raw, req.header('x-hub-signature-256'))
      ) {
        res.status(401).json({ error: 'Invalid signature' });
        return;
      }

      if (req.header('x-github-event') !== 'push') {
        res.status(204).end();
        return;
      }

      const event = this.service.parsePush(JSON.parse(raw.toString('utf8')));

      if (!event || !this.service.isDefaultBranchPush(event)) {
        res.status(204).end();
        return;
      }

      const app = await this.repository.findAppByRepo(event.repoFullName);

      if (!app || !event.installationId) {
        res.status(204).end();
        return;
      }

      res.status(202).json({ status: 'rebuilding', appId: app.id });

      void this.deploys
        .deploy({
          appId: app.id,
          repoFullName: event.repoFullName,
          installationId: event.installationId,
        })
        .catch((error: unknown) => {
          this.logger.error(
            { err: error, appId: app.id },
            'webhook rebuild failed',
          );
        });
    } catch (error) {
      next(error);
    }
  };
}
