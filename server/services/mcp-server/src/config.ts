import { z } from 'zod';

const schema = z.object({
  UNLOCALHOST_URL: z.string().min(1).default('https://api.unlocalhost.tech'),
  UNLOCALHOST_TOKEN: z.string().min(1).optional(),
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

export const config: Config = loadConfig();
