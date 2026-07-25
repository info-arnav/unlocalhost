import { contextMiddleware } from '@unlocalhost/shared/context';
import type { Database } from '@unlocalhost/shared/db';
import { createErrorMiddleware } from '@unlocalhost/shared/error';
import { createHttpLogger, type Logger } from '@unlocalhost/shared/logger';
import cookieParser from 'cookie-parser';
import express, { type Express } from 'express';
import helmet from 'helmet';
import type { Config } from './config.js';

export function createApp(
  config: Config,
  db: Database,
  logger: Logger,
): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(contextMiddleware);
  app.use(createHttpLogger(logger));
  app.use(helmet());
  app.use(cookieParser(config.AUTH_SECRET));

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

  app.use(createErrorMiddleware(logger));

  return app;
}
