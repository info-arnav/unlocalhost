import type { RedisClient } from '@unlocalhost/shared/cache';
import { contextMiddleware } from '@unlocalhost/shared/context';
import type { Database } from '@unlocalhost/shared/db';
import { createErrorMiddleware, notFound } from '@unlocalhost/shared/error';
import { createHttpLogger, type Logger } from '@unlocalhost/shared/logger';
import { createInternalAuth } from '@unlocalhost/shared/security';
import cookieParser from 'cookie-parser';
import express, { type Express } from 'express';
import helmet from 'helmet';
import type { Config } from './config.js';
import { AppsController } from './modules/apps/apps.controller.js';
import { AppsRepository } from './modules/apps/apps.repository.js';
import { createAppsRouter } from './modules/apps/apps.routes.js';
import { AppsService } from './modules/apps/apps.service.js';
import { SessionService } from '@unlocalhost/shared/session';
import { createBearerAuth } from './modules/auth/bearer.middleware.js';
import { createSessionAuth } from './modules/auth/session.middleware.js';
import { DeviceController } from './modules/auth/device.controller.js';
import { DeviceRepository } from './modules/auth/device.repository.js';
import { createDeviceRouter } from './modules/auth/device.routes.js';
import { DeviceService } from './modules/auth/device.service.js';
import { TokenRepository } from './modules/auth/token.repository.js';
import { TokenService } from './modules/auth/token.service.js';
import { DeployController } from './modules/deploy/deploy.controller.js';
import { DeployRepository } from './modules/deploy/deploy.repository.js';
import { createDeployRouter } from './modules/deploy/deploy.routes.js';
import { DeployService } from './modules/deploy/deploy.service.js';
import { SecretScanService } from './modules/deploy/secret-scan.service.js';
import { DokkuClient } from './modules/dokku/dokku.client.js';
import { GitHubClient } from './modules/github/github.client.js';
import { WebhookController } from './modules/github/webhook.controller.js';
import { createWebhookRouter } from './modules/github/webhook.routes.js';
import { WebhookService } from './modules/github/webhook.service.js';

export function createApp(
  config: Config,
  db: Database,
  redis: RedisClient,
  logger: Logger,
): Express {
  const app = express();

  const tokens = new TokenService(new TokenRepository(db));
  const devices = new DeviceService(new DeviceRepository(db));
  const appsService = new AppsService(new AppsRepository(db), redis);
  const deployRepository = new DeployRepository(db);

  const github = new GitHubClient(
    config.GITHUB_APP_ID,
    config.GITHUB_APP_PRIVATE_KEY_PATH,
  );

  const dokku = new DokkuClient({
    host: config.DOKKU_HOST,
    user: config.DOKKU_USER,
    sshKeyPath: config.DOKKU_SSH_KEY_PATH,
    commandTimeoutMs: config.DOKKU_COMMAND_TIMEOUT_MS,
  });

  const deployService = new DeployService(
    config,
    deployRepository,
    github,
    dokku,
    new SecretScanService(),
    logger,
  );

  const sessions = new SessionService({
    secret: config.AUTH_SECRET,
    cookieName: config.SESSION_COOKIE_NAME,
    baseDomain: config.BASE_DOMAIN,
    secure: config.NODE_ENV === 'production',
  });
  const sessionAuth = createSessionAuth(sessions, config.SESSION_COOKIE_NAME);

  const deviceController = new DeviceController(config, devices, tokens);
  const appsController = new AppsController(config, appsService);
  const deployController = new DeployController(
    appsService,
    deployService,
    github,
    dokku,
    config.GITHUB_APP_SLUG,
  );
  const webhookController = new WebhookController(
    new WebhookService(config.GITHUB_WEBHOOK_SECRET),
    deployService,
    deployRepository,
    logger,
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

  app.use('/v1', createWebhookRouter(webhookController));

  app.use(createInternalAuth(config.INTERNAL_AUTH_KEY, 'control-plane'));
  app.use(express.json({ limit: '1mb' }));

  app.use('/v1', createDeviceRouter(deviceController, sessionAuth));
  app.use(
    '/v1',
    createBearerAuth(tokens),
    createAppsRouter(appsController),
    createDeployRouter(deployController),
  );

  app.use((req, _res, next) => {
    next(notFound('NOT_FOUND', `No route for ${req.method} ${req.path}`));
  });

  app.use(createErrorMiddleware(logger));

  return app;
}
