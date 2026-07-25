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
