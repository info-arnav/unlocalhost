import Redis, { type Redis as RedisClient } from 'ioredis';

export type { RedisClient };

let client: RedisClient | null = null;

export function createRedis(url: string): RedisClient {
  return new Redis(url, {
    connectTimeout: 2000,
    maxRetriesPerRequest: 1,
    enableReadyCheck: true,
    lazyConnect: false,
  });
}

export function getRedis(url: string): RedisClient {
  client ??= createRedis(url);
  return client;
}

export async function closeRedis(): Promise<void> {
  if (client) {
    await client.quit();
    client = null;
  }
}
