import { createDatabase } from '@unlocalhost/db';
import { createLogger } from '@unlocalhost/logger';
import { createApp } from './app.js';
import { loadConfig } from './config.js';

const logger = createLogger({ name: 'auth-gate' });
const config = loadConfig();
const db = createDatabase(config.DATABASE_URL);
const app = createApp(config, db, logger);

const server = app.listen(config.PORT, () => {
  logger.info({ port: config.PORT }, 'auth-gate listening');
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
