import { loadConfig } from '@unlocalhost/shared/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(7002),
  DATABASE_URL: z.string().min(1),
  IDLE_TIMEOUT_MS: z.coerce.number().int().positive().default(900_000),
  SWEEP_INTERVAL_MS: z.coerce.number().int().positive().default(60_000),
  COLD_START_TIMEOUT_MS: z.coerce.number().int().positive().default(60_000),
  SENTRY_DSN: z.string().optional(),
  RELEASE: z.string().optional(),
});

export type Config = z.infer<typeof schema>;

export const config: Config = loadConfig(schema);
