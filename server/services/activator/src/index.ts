import { createDatabase } from '@unlocalhost/shared/db';
import { createLogger } from '@unlocalhost/shared/logger';
import { closeSentry, initSentry } from '@unlocalhost/shared/observability';
import { createApp } from './app.js';
import { config } from './config.js';

initSentry({
  dsn: config.SENTRY_DSN,
  environment: config.NODE_ENV,
  release: config.RELEASE,
});

const logger = createLogger({ name: 'activator' });
const db = createDatabase(config.DATABASE_URL);
const { app, sweeper } = createApp(config, db, logger);

const server = app.listen(config.PORT, () => {
  logger.info({ port: config.PORT }, 'activator listening');
  sweeper.start();
});

async function shutdown(signal: string) {
  logger.info({ signal }, 'shutting down');
  sweeper.stop();
  server.close(async () => {
    await db.close();
    await closeSentry();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
