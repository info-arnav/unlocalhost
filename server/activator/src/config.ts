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
});

export type Config = z.infer<typeof schema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const result = schema.safeParse(env);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }

  return result.data;
}
