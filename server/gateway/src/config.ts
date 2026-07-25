import { loadConfig } from '@unlocalhost/shared/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(8000),
  BASE_DOMAIN: z.string().min(1),
  REDIS_URL: z.string().min(1),
  INTERNAL_AUTH_KEY: z.string().min(32),
  CONTROL_PLANE_URL: z.string().min(1).default('http://control-plane:7100'),
  RATE_LIMIT_POINTS: z.coerce.number().int().positive().default(600),
  RATE_LIMIT_DURATION_SEC: z.coerce.number().int().positive().default(60),
  SENTRY_DSN: z.string().optional(),
  RELEASE: z.string().optional(),
});

export type Config = z.infer<typeof schema>;

export const config: Config = loadConfig(schema);
