import { closeRedis, getRedis } from '@unlocalhost/shared/cache';
import { createLogger } from '@unlocalhost/shared/logger';
import { closeSentry, initSentry } from '@unlocalhost/shared/observability';
import { createApp } from './app.js';
import { config } from './config.js';

initSentry({
  dsn: config.SENTRY_DSN,
  environment: config.NODE_ENV,
  release: config.RELEASE,
});

const logger = createLogger({ name: 'gateway' });
const redis = getRedis(config.REDIS_URL);
const app = createApp(config, logger, redis);

const server = app.listen(config.PORT, () => {
  logger.info({ port: config.PORT }, 'gateway listening');
});

async function shutdown(signal: string) {
  logger.info({ signal }, 'shutting down');
  server.close(async () => {
    await closeRedis();
    await closeSentry();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
