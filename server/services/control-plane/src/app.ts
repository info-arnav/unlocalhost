import type { RedisClient } from '@unlocalhost/shared/cache';
import { contextMiddleware } from '@unlocalhost/shared/context';
import type { Database } from '@unlocalhost/shared/db';
import { createErrorMiddleware, notFound } from '@unlocalhost/shared/error';
import { createHttpLogger, type Logger } from '@unlocalhost/shared/logger';
import { createInternalAuth } from '@unlocalhost/shared/security';
import express, { type Express } from 'express';
import helmet from 'helmet';
import type { Config } from './config.js';
import { AppsController } from './modules/apps/apps.controller.js';
import { AppsRepository } from './modules/apps/apps.repository.js';
import { createAppsRouter } from './modules/apps/apps.routes.js';
import { AppsService } from './modules/apps/apps.service.js';
import { createBearerAuth } from './modules/auth/bearer.middleware.js';
import { DeviceController } from './modules/auth/device.controller.js';
import { DeviceRepository } from './modules/auth/device.repository.js';
import { createDeviceRouter } from './modules/auth/device.routes.js';
import { DeviceService } from './modules/auth/device.service.js';
import { TokenRepository } from './modules/auth/token.repository.js';
import { TokenService } from './modules/auth/token.service.js';

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

  const deviceController = new DeviceController(config, devices, tokens);
  const appsController = new AppsController(config, appsService);

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(contextMiddleware);
  app.use(createHttpLogger(logger));
  app.use(helmet());

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

  app.use(createInternalAuth(config.INTERNAL_AUTH_KEY, 'control-plane'));
  app.use(express.json({ limit: '1mb' }));

  app.use('/v1', createDeviceRouter(deviceController));
  app.use('/v1', createBearerAuth(tokens), createAppsRouter(appsController));

  app.use((req, _res, next) => {
    next(notFound('NOT_FOUND', `No route for ${req.method} ${req.path}`));
  });

  app.use(createErrorMiddleware(logger));

  return app;
}
