import { apps, type Database } from '@unlocalhost/shared/db';
import { and, eq, lt, or } from 'drizzle-orm';

export type AppStatus = 'building' | 'running' | 'sleeping' | 'failed';

export class WakeRepository {
  constructor(private readonly db: Database) {}

  async findBySubdomain(subdomain: string) {
    const [row] = await this.db
      .select({
        id: apps.id,
        subdomain: apps.subdomain,
        status: apps.status,
      })
      .from(apps)
      .where(eq(apps.subdomain, subdomain))
      .limit(1);

    return row ?? null;
  }

  async setStatus(appId: string, status: AppStatus): Promise<void> {
    await this.db.update(apps).set({ status }).where(eq(apps.id, appId));
  }

  async touch(appId: string): Promise<void> {
    await this.db
      .update(apps)
      .set({ lastActiveAt: new Date() })
      .where(eq(apps.id, appId));
  }

  async findIdleRunning(idleBefore: Date) {
    return this.db
      .select({ id: apps.id, subdomain: apps.subdomain })
      .from(apps)
      .where(
        and(
          eq(apps.status, 'running'),
          or(
            lt(apps.lastActiveAt, idleBefore),
            eq(apps.lastActiveAt, apps.createdAt),
          ),
        ),
      );
  }
}
