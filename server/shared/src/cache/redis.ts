import { Redis } from 'ioredis';

export type RedisClient = Redis;

let client: Redis | null = null;

export function createRedis(url: string): Redis {
  return new Redis(url, {
    connectTimeout: 2000,
    maxRetriesPerRequest: 1,
    enableReadyCheck: true,
  });
}

export function getRedis(url: string): Redis {
  client ??= createRedis(url);
  return client;
}

export async function closeRedis(): Promise<void> {
  if (client) {
    await client.quit();
    client = null;
  }
}
