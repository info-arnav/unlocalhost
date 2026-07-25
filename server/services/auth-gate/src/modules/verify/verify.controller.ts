import type { NextFunction, Request, Response } from 'express';
import type { Config } from '../../config.js';
import type { SessionService } from '@unlocalhost/shared/session';
import { forwardedRequest } from './verify.schema.js';
import type { VerifyService } from './verify.service.js';

export class VerifyController {
  constructor(
    private readonly config: Config,
    private readonly sessions: SessionService,
    private readonly service: VerifyService,
  ) {}

  private webUrl(path: string, params: Record<string, string>): string {
    const url = new URL(path, this.config.WEB_ORIGIN);

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    return url.toString();
  }

  verify = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const forwarded = forwardedRequest(req);
      const cookies = req.cookies as Record<string, string> | undefined;
      const session = await this.sessions.read(
        cookies?.[this.config.SESSION_COOKIE_NAME],
      );

      const outcome = await this.service.authorize(forwarded.host, session);

      switch (outcome.kind) {
        case 'unknown-host':
          res.status(400).json({ error: 'Unknown host' });
          return;

        case 'unknown-app':
          res.status(404).json({ error: 'No such app' });
          return;

        case 'needs-login':
          res.redirect(
            302,
            this.webUrl('/login', { returnTo: forwarded.originalUrl }),
          );
          return;

        case 'denied':
          res.redirect(
            302,
            this.webUrl('/denied', {
              email: outcome.email,
              app: forwarded.host,
            }),
          );
          return;

        case 'allowed':
          res.setHeader('X-Unlocalhost-Email', outcome.email);
          res.setHeader('X-Unlocalhost-App', outcome.appId);
          res.status(200).end();
          return;
      }
    } catch (error) {
      next(error);
    }
  };
}
