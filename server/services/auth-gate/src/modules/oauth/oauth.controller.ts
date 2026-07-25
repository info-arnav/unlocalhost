import { badRequest, unauthorized } from '@unlocalhost/shared/error';
import type { NextFunction, Request, Response } from 'express';
import type { SessionService } from '@unlocalhost/shared/session';
import type { UsersRepository } from '../users/users.repository.js';
import { callbackQuerySchema, providerParamSchema } from './oauth.schema.js';
import type { OAuthService } from './oauth.service.js';
import type { StateService } from './state.service.js';

export class OAuthController {
  constructor(
    private readonly service: OAuthService,
    private readonly sessions: SessionService,
    private readonly state: StateService,
    private readonly users: UsersRepository,
  ) {}

  authorize = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const params = providerParamSchema.safeParse(req.params);

      if (!params.success) {
        next(badRequest('UNKNOWN_PROVIDER', 'Unsupported sign-in provider'));
        return;
      }

      const provider = this.service.provider(params.data.provider);

      if (!provider) {
        next(badRequest('UNKNOWN_PROVIDER', 'Unsupported sign-in provider'));
        return;
      }

      const returnTo = this.service.resolveReturnTo(req.query.returnTo);
      const nonce = await this.state.start(res, returnTo);

      res.redirect(302, provider.authorizeUrl(nonce));
    } catch (error) {
      next(error);
    }
  };

  callback = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const params = providerParamSchema.safeParse(req.params);
      const query = callbackQuerySchema.safeParse(req.query);
      const stored = await this.state.consume(req, res);

      if (!params.success) {
        next(badRequest('UNKNOWN_PROVIDER', 'Unsupported sign-in provider'));
        return;
      }

      if (!query.success) {
        next(badRequest('MISSING_CODE', 'Provider returned no code'));
        return;
      }

      if (!stored || stored.nonce !== query.data.state) {
        next(unauthorized('STATE_MISMATCH', 'Sign-in expired, please retry'));
        return;
      }

      const identity = await this.service.verifyCallback(
        params.data.provider,
        query.data.code,
      );

      const userId =
        identity.provider === 'github'
          ? await this.users.upsertByGithubId({
              githubId: identity.providerAccountId,
              githubLogin: identity.name,
              email: identity.email,
            })
          : undefined;

      const token = await this.sessions.issue({
        email: identity.email,
        name: identity.name,
        provider: identity.provider,
        userId,
      });

      this.sessions.attach(res, token);
      res.redirect(302, stored.returnTo);
    } catch (error) {
      next(error);
    }
  };

  logout = (req: Request, res: Response): void => {
    this.sessions.clear(res);
    res.redirect(302, this.service.resolveReturnTo(req.query.returnTo));
  };
}
