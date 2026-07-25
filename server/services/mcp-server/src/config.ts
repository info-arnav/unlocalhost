import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { z } from 'zod';

const DEFAULT_INSTANCE = 'https://api.unlocalhost.tech';

const storedSchema = z.object({
  instance: z.string().min(1).optional(),
  token: z.string().min(1).optional(),
});

export type Stored = z.infer<typeof storedSchema>;

export interface Config {
  instance: string;
  token: string | undefined;
  configPath: string;
}

export function configPath(env: NodeJS.ProcessEnv = process.env): string {
  const base = env.XDG_CONFIG_HOME ?? join(env.HOME ?? homedir(), '.config');

  return join(base, 'unlocalhost', 'config.json');
}

function readStored(path: string): Stored {
  try {
    const parsed = storedSchema.safeParse(
      JSON.parse(readFileSync(path, 'utf8')),
    );

    return parsed.success ? parsed.data : {};
  } catch {
    return {};
  }
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const path = configPath(env);
  const stored = readStored(path);

  return {
    instance: env.UNLOCALHOST_URL ?? stored.instance ?? DEFAULT_INSTANCE,
    token: env.UNLOCALHOST_TOKEN ?? stored.token,
    configPath: path,
  };
}

export function saveToken(path: string, instance: string, token: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify({ instance, token }, null, 2), {
    mode: 0o600,
  });
}

export const config: Config = loadConfig();
