import type { RedisClient } from '@unlocalhost/shared/cache';
import { contextMiddleware } from '@unlocalhost/shared/context';
import {
  createErrorMiddleware,
  forbidden,
  notFound,
  tooManyRequests,
} from '@unlocalhost/shared/error';
import { createHttpLogger, type Logger } from '@unlocalhost/shared/logger';
import { internalHeaders } from '@unlocalhost/shared/security';
import cors from 'cors';
import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import type { Config } from './config.js';

export function createApp(
  config: Config,
  logger: Logger,
  redis: RedisClient,
): Express {
  const app = express();
  const isDev = config.NODE_ENV === 'development';

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(contextMiddleware);
  app.use(createHttpLogger(logger));
  app.use(helmet());

  const allowedOrigins = [
    `https://${config.BASE_DOMAIN}`,
    `https://www.${config.BASE_DOMAIN}`,
    `https://app.${config.BASE_DOMAIN}`,
    ...(isDev ? ['http://localhost:3000', 'http://localhost:8000'] : []),
  ];

  app.use(
    cors({
      origin(origin, cb) {
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        cb(forbidden('CORS_BLOCKED', 'Blocked by CORS'));
      },
      credentials: true,
    }),
  );

  app.get('/healthz', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.get('/readyz', async (_req, res) => {
    try {
      await redis.ping();
      res.status(200).json({ status: 'ready' });
    } catch {
      res.status(503).json({ status: 'unavailable' });
    }
  });

  const rateLimiter = new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'gateway_rl',
    points: config.RATE_LIMIT_POINTS,
    duration: config.RATE_LIMIT_DURATION_SEC,
  });

  app.use(async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await rateLimiter.consume(req.ip ?? 'unknown');
      next();
    } catch {
      next(tooManyRequests('RATE_LIMIT', 'Too many requests'));
    }
  });

  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.path.includes('/internal/')) {
      return next(
        forbidden('FORBIDDEN', 'Access to internal routes is not allowed'),
      );
    }
    next();
  });

  app.use(
    createProxyMiddleware({
      pathFilter: '/v1',
      target: config.CONTROL_PLANE_URL,
      changeOrigin: true,
      xfwd: true,
      headers: internalHeaders(config.INTERNAL_AUTH_KEY, 'gateway'),
    }),
  );

  app.use((req, _res, next) => {
    next(notFound('NOT_FOUND', `No route for ${req.method} ${req.path}`));
  });

  app.use(createErrorMiddleware(logger));

  return app;
}
