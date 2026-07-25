import { loadConfig } from '@unlocalhost/shared/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(7001),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  BASE_DOMAIN: z.string().min(1),
  SESSION_COOKIE_NAME: z.string().min(1).default('unlocalhost_session'),
  AUTH_SECRET: z.string().min(32),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  SENTRY_DSN: z.string().optional(),
  RELEASE: z.string().optional(),
});

export type Config = z.infer<typeof schema>;

export const config: Config = loadConfig(schema);
