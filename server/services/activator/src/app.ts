import { contextMiddleware } from '@unlocalhost/shared/context';
import type { Database } from '@unlocalhost/shared/db';
import { createErrorMiddleware } from '@unlocalhost/shared/error';
import { createHttpLogger, type Logger } from '@unlocalhost/shared/logger';
import express, { type Express } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import type { Config } from './config.js';
import { DokkuClient } from './modules/dokku/dokku.client.js';
import { SweeperService } from './modules/sweeper/sweeper.service.js';
import { ProxyController } from './modules/wake/proxy.controller.js';
import { WakeRepository } from './modules/wake/wake.repository.js';
import { WakeService } from './modules/wake/wake.service.js';

export interface ActivatorApp {
  app: Express;
  sweeper: SweeperService;
}

export function createApp(
  config: Config,
  db: Database,
  logger: Logger,
): ActivatorApp {
  const app = express();

  const dokku = new DokkuClient({
    host: config.DOKKU_HOST,
    user: config.DOKKU_USER,
    sshKeyPath: config.DOKKU_SSH_KEY_PATH,
    commandTimeoutMs: config.DOKKU_COMMAND_TIMEOUT_MS,
  });

  const repository = new WakeRepository(db);
  const wake = new WakeService(
    repository,
    dokku,
    config.COLD_START_TIMEOUT_MS,
    logger,
  );
  const sweeper = new SweeperService(
    repository,
    dokku,
    config.IDLE_TIMEOUT_MS,
    config.SWEEP_INTERVAL_MS,
    logger,
  );

  const proxy = createProxyMiddleware({
    target: config.UPSTREAM_ORIGIN,
    changeOrigin: false,
    ws: true,
    xfwd: true,
  });

  const controller = new ProxyController(config, wake, proxy);

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(contextMiddleware);

  app.get('/healthz', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.get('/readyz', async (_req, res) => {
    try {
      await db.pool.query('select 1');
      res.status(200).json({ status: 'ready' });
    } catch {
      res.status(503).json({ status: 'unavailable' });
    }
  });

  app.use(createHttpLogger(logger));
  app.use(controller.handle);
  app.use(createErrorMiddleware(logger));

  return { app, sweeper };
}
