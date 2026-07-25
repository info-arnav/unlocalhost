import { contextMiddleware } from '@unlocalhost/shared/context';
import { createDatabase } from '@unlocalhost/shared/db';
import { createErrorMiddleware } from '@unlocalhost/shared/error';
import { createHttpLogger, createLogger } from '@unlocalhost/shared/logger';
import { closeSentry, initSentry } from '@unlocalhost/shared/observability';
import express from 'express';
import { config } from './config.js';

initSentry({
  dsn: config.SENTRY_DSN,
  environment: config.NODE_ENV,
  release: config.RELEASE,
});

const logger = createLogger({ name: 'activator' });
const db = createDatabase(config.DATABASE_URL);

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(contextMiddleware);
app.use(createHttpLogger(logger));

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

const server = app.listen(config.PORT, () => {
  logger.info({ port: config.PORT }, 'activator listening');
});

async function shutdown(signal: string) {
  logger.info({ signal }, 'shutting down');
  server.close(async () => {
    await db.close();
    await closeSentry();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
