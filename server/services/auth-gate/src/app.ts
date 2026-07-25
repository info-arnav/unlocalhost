import type { RedisClient } from '@unlocalhost/shared/cache';
import { contextMiddleware } from '@unlocalhost/shared/context';
import type { Database } from '@unlocalhost/shared/db';
import { createErrorMiddleware, notFound } from '@unlocalhost/shared/error';
import { createHttpLogger, type Logger } from '@unlocalhost/shared/logger';
import cookieParser from 'cookie-parser';
import express, { type Express } from 'express';
import helmet from 'helmet';
import type { Config } from './config.js';
import { OAuthController } from './modules/oauth/oauth.controller.js';
import { createOAuthRouter } from './modules/oauth/oauth.routes.js';
import { OAuthService } from './modules/oauth/oauth.service.js';
import { GitHubProvider } from './modules/oauth/providers/github.provider.js';
import { GoogleProvider } from './modules/oauth/providers/google.provider.js';
import type { OAuthProvider } from './modules/oauth/providers/provider.types.js';
import { StateService } from './modules/oauth/state.service.js';
import { SessionService } from '@unlocalhost/shared/session';
import { UsersRepository } from './modules/users/users.repository.js';
import { AllowlistRepository } from './modules/verify/allowlist.repository.js';
import { VerifyController } from './modules/verify/verify.controller.js';
import { createVerifyRouter } from './modules/verify/verify.routes.js';
import { VerifyService } from './modules/verify/verify.service.js';

export function createApp(
  config: Config,
  db: Database,
  redis: RedisClient,
  logger: Logger,
): Express {
  const app = express();
  const secure = config.NODE_ENV === 'production';
  const authOrigin = `https://auth.${config.BASE_DOMAIN}`;

  const sessions = new SessionService({
    secret: config.AUTH_SECRET,
    cookieName: config.SESSION_COOKIE_NAME,
    baseDomain: config.BASE_DOMAIN,
    secure,
  });

  const state = new StateService(
    config.AUTH_SECRET,
    config.BASE_DOMAIN,
    secure,
  );

  const providers: Record<string, OAuthProvider> = {
    github: new GitHubProvider(
      config.GITHUB_APP_CLIENT_ID,
      config.GITHUB_APP_CLIENT_SECRET,
      `${authOrigin}/auth/callback/github`,
    ),
    google: new GoogleProvider(
      config.GOOGLE_CLIENT_ID,
      config.GOOGLE_CLIENT_SECRET,
      `${authOrigin}/auth/callback/google`,
    ),
  };

  const oauthService = new OAuthService(
    providers,
    config.BASE_DOMAIN,
    config.WEB_ORIGIN,
  );
  const oauthController = new OAuthController(
    oauthService,
    sessions,
    state,
    new UsersRepository(db),
    config.WEB_ORIGIN,
  );

  const allowlistRepository = new AllowlistRepository(db, redis);
  const verifyService = new VerifyService(
    allowlistRepository,
    config.BASE_DOMAIN,
  );
  const verifyController = new VerifyController(
    config,
    sessions,
    verifyService,
  );

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(contextMiddleware);
  app.use(createHttpLogger(logger));
  app.use(helmet());
  app.use(cookieParser());

  app.get('/healthz', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.get('/readyz', async (_req, res) => {
    try {
      await db.pool.query('select 1');
      await redis.ping();
      res.status(200).json({ status: 'ready' });
    } catch {
      res.status(503).json({ status: 'unavailable' });
    }
  });

  app.use(createVerifyRouter(verifyController));
  app.use(createOAuthRouter(oauthController));

  app.use((req, _res, next) => {
    next(notFound('NOT_FOUND', `No route for ${req.method} ${req.path}`));
  });

  app.use(createErrorMiddleware(logger));

  return app;
}
