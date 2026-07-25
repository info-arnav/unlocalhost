import express, { type Express } from 'express';
import helmet from 'helmet';
import type { Database } from '@unlocalhost/db';
import type { Config } from './config.js';

export function createApp(config: Config, db: Database): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(express.json({ limit: '1mb' }));

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

  void config;

  return app;
}
