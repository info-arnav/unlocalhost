import { loadConfig } from '@unlocalhost/shared/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(7000),
  DATABASE_URL: z.string().min(1),
  BASE_DOMAIN: z.string().min(1),
  ENCRYPTION_KEY: z.string().min(32),
  MAX_CONCURRENT_BUILDS: z.coerce.number().int().positive().max(4).default(1),
  BUILD_TIMEOUT_MS: z.coerce.number().int().positive().default(600_000),
  SENTRY_DSN: z.string().optional(),
  RELEASE: z.string().optional(),
});

export type Config = z.infer<typeof schema>;

export const config: Config = loadConfig(schema);
