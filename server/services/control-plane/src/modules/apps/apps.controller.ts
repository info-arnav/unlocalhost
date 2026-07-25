import { badRequest } from '@unlocalhost/shared/error';
import type { NextFunction, Request, Response } from 'express';
import type { Config } from '../../config.js';
import { requireUser } from '../auth/bearer.middleware.js';
import {
  appIdParamSchema,
  createAppSchema,
  shareSchema,
} from './apps.schema.js';
import type { AppsService } from './apps.service.js';

export class AppsController {
  constructor(
    private readonly config: Config,
    private readonly service: AppsService,
  ) {}

  private publicUrl(subdomain: string): string {
    return `https://${subdomain}.${this.config.BASE_DOMAIN}`;
  }

  private appId(req: Request): string {
    const parsed = appIdParamSchema.safeParse(req.params);

    if (!parsed.success) {
      throw badRequest('INVALID_APP_ID', 'App id must be a uuid');
    }

    return parsed.data.id;
  }

  list = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = requireUser(req);
      const rows = await this.service.listByOwner(user.id);

      res.json({
        apps: rows.map((app) => ({
          id: app.id,
          subdomain: app.subdomain,
          url: this.publicUrl(app.subdomain),
          status: app.status,
          repoFullName: app.repoFullName,
          lastActiveAt: app.lastActiveAt,
          createdAt: app.createdAt,
        })),
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = requireUser(req);
      const parsed = createAppSchema.safeParse(req.body);

      if (!parsed.success) {
        next(
          badRequest(
            'INVALID_BODY',
            parsed.error.issues[0]?.message ?? 'Invalid body',
          ),
        );
        return;
      }

      const app = await this.service.create({
        ownerId: user.id,
        name: parsed.data.name,
        repoFullName: parsed.data.repoFullName,
        repoUrl: parsed.data.repoUrl,
      });

      const shared = parsed.data.emails
        ? await this.service.share(app.id, parsed.data.emails)
        : [];

      res.status(201).json({
        id: app.id,
        subdomain: app.subdomain,
        url: this.publicUrl(app.subdomain),
        status: app.status,
        allowlist: shared,
      });
    } catch (error) {
      next(error);
    }
  };

  get = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = requireUser(req);
      const app = await this.service.getOwned(this.appId(req), user.id);

      res.json({
        id: app.id,
        subdomain: app.subdomain,
        url: this.publicUrl(app.subdomain),
        status: app.status,
        repoFullName: app.repoFullName,
        allowlist: await this.service.listAllowlist(app.id),
        deployments: await this.service.recentDeployments(app.id),
      });
    } catch (error) {
      next(error);
    }
  };

  share = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = requireUser(req);
      const parsed = shareSchema.safeParse(req.body);

      if (!parsed.success) {
        next(
          badRequest(
            'INVALID_BODY',
            'emails must be a list of valid addresses',
          ),
        );
        return;
      }

      const app = await this.service.getOwned(this.appId(req), user.id);
      const added = await this.service.share(app.id, parsed.data.emails);

      res.json({
        added,
        allowlist: await this.service.listAllowlist(app.id),
      });
    } catch (error) {
      next(error);
    }
  };

  unshare = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = requireUser(req);
      const parsed = shareSchema.safeParse(req.body);

      if (!parsed.success) {
        next(
          badRequest(
            'INVALID_BODY',
            'emails must be a list of valid addresses',
          ),
        );
        return;
      }

      const app = await this.service.getOwned(this.appId(req), user.id);
      const removed = await this.service.unshare(app.id, parsed.data.emails);

      res.json({
        removed,
        allowlist: await this.service.listAllowlist(app.id),
      });
    } catch (error) {
      next(error);
    }
  };
}
