import type { RedisClient } from '@unlocalhost/shared/cache';
import { allowlist, apps, type Database } from '@unlocalhost/shared/db';
import { and, eq } from 'drizzle-orm';

const APP_TTL_SECONDS = 60;
const ALLOW_TTL_SECONDS = 30;

export interface ResolvedApp {
  id: string;
  status: 'building' | 'running' | 'sleeping' | 'failed';
}

export class AllowlistRepository {
  constructor(
    private readonly db: Database,
    private readonly redis: RedisClient,
  ) {}

  private appKey(subdomain: string): string {
    return `authgate:app:${subdomain}`;
  }

  private allowKey(appId: string, email: string): string {
    return `authgate:allow:${appId}:${email}`;
  }

  async resolveApp(subdomain: string): Promise<ResolvedApp | null> {
    const cached = await this.redis.get(this.appKey(subdomain));

    if (cached !== null) {
      return cached === '' ? null : (JSON.parse(cached) as ResolvedApp);
    }

    const [row] = await this.db
      .select({ id: apps.id, status: apps.status })
      .from(apps)
      .where(eq(apps.subdomain, subdomain))
      .limit(1);

    const resolved = row ?? null;

    await this.redis.set(
      this.appKey(subdomain),
      resolved ? JSON.stringify(resolved) : '',
      'EX',
      APP_TTL_SECONDS,
    );

    return resolved;
  }

  async isAllowed(appId: string, email: string): Promise<boolean> {
    const key = this.allowKey(appId, email);
    const cached = await this.redis.get(key);

    if (cached !== null) return cached === '1';

    const [row] = await this.db
      .select({ id: allowlist.id })
      .from(allowlist)
      .where(and(eq(allowlist.appId, appId), eq(allowlist.email, email)))
      .limit(1);

    const allowed = row !== undefined;

    await this.redis.set(key, allowed ? '1' : '0', 'EX', ALLOW_TTL_SECONDS);

    return allowed;
  }
}
