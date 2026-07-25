import { createDatabase } from '@unlocalhost/db';
import express from 'express';
import pino from 'pino';
import { loadConfig } from './config.js';

const logger = pino({ name: 'activator' });
const config = loadConfig();
const db = createDatabase(config.DATABASE_URL);

const app = express();
app.disable('x-powered-by');

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

const server = app.listen(config.PORT, () => {
  logger.info({ port: config.PORT }, 'activator listening');
});

async function shutdown(signal: string) {
  logger.info({ signal }, 'shutting down');
  server.close(async () => {
    await db.close();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
