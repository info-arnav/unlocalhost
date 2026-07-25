import {
  allowlist,
  apps,
  type Database,
  deployments,
} from '@unlocalhost/shared/db';
import { and, desc, eq } from 'drizzle-orm';

export interface CreateAppRow {
  ownerId: string;
  subdomain: string;
  repoFullName: string | null;
  repoUrl: string | null;
}

export class AppsRepository {
  constructor(private readonly db: Database) {}

  async subdomainExists(subdomain: string): Promise<boolean> {
    const [row] = await this.db
      .select({ id: apps.id })
      .from(apps)
      .where(eq(apps.subdomain, subdomain))
      .limit(1);

    return row !== undefined;
  }

  async insert(values: CreateAppRow) {
    const [row] = await this.db
      .insert(apps)
      .values({ ...values, status: 'building' })
      .returning();

    return row;
  }

  async listByOwner(ownerId: string) {
    return this.db
      .select()
      .from(apps)
      .where(eq(apps.ownerId, ownerId))
      .orderBy(desc(apps.createdAt));
  }

  async findOwnedById(appId: string, ownerId: string) {
    const [row] = await this.db
      .select()
      .from(apps)
      .where(and(eq(apps.id, appId), eq(apps.ownerId, ownerId)))
      .limit(1);

    return row ?? null;
  }

  async addAllowlistEntries(appId: string, emails: string[]): Promise<void> {
    await this.db
      .insert(allowlist)
      .values(emails.map((email) => ({ appId, email })))
      .onConflictDoNothing();
  }

  async removeAllowlistEntries(appId: string, emails: string[]): Promise<void> {
    for (const email of emails) {
      await this.db
        .delete(allowlist)
        .where(and(eq(allowlist.appId, appId), eq(allowlist.email, email)));
    }
  }

  async listAllowlist(appId: string): Promise<string[]> {
    const rows = await this.db
      .select({ email: allowlist.email })
      .from(allowlist)
      .where(eq(allowlist.appId, appId))
      .orderBy(allowlist.email);

    return rows.map((row) => row.email);
  }

  async recentDeployments(appId: string, limit: number) {
    return this.db
      .select()
      .from(deployments)
      .where(eq(deployments.appId, appId))
      .orderBy(desc(deployments.createdAt))
      .limit(limit);
  }
}
