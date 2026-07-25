import {
  apps,
  type Database,
  deployments,
  envVars,
} from '@unlocalhost/shared/db';
import { eq } from 'drizzle-orm';

export type AppStatus = 'building' | 'running' | 'sleeping' | 'failed';
export type DeploymentStatus = 'queued' | 'building' | 'succeeded' | 'failed';

export class DeployRepository {
  constructor(private readonly db: Database) {}

  async createDeployment(appId: string, commitSha: string | null) {
    const [row] = await this.db
      .insert(deployments)
      .values({ appId, commitSha, status: 'queued' })
      .returning();

    return row;
  }

  async updateDeployment(
    id: string,
    values: { status?: DeploymentStatus; logs?: string; commitSha?: string },
  ): Promise<void> {
    await this.db.update(deployments).set(values).where(eq(deployments.id, id));
  }

  async setAppStatus(appId: string, status: AppStatus): Promise<void> {
    await this.db.update(apps).set({ status }).where(eq(apps.id, appId));
  }

  async markActive(appId: string): Promise<void> {
    await this.db
      .update(apps)
      .set({ lastActiveAt: new Date() })
      .where(eq(apps.id, appId));
  }

  async findAppById(appId: string) {
    const [row] = await this.db
      .select()
      .from(apps)
      .where(eq(apps.id, appId))
      .limit(1);

    return row ?? null;
  }

  async findAppByRepo(repoFullName: string) {
    const [row] = await this.db
      .select()
      .from(apps)
      .where(eq(apps.repoFullName, repoFullName))
      .limit(1);

    return row ?? null;
  }

  async listEnvVars(appId: string) {
    return this.db
      .select({ key: envVars.key, valueEncrypted: envVars.valueEncrypted })
      .from(envVars)
      .where(eq(envVars.appId, appId));
  }

  async replaceEnvVars(
    appId: string,
    entries: Array<{ key: string; valueEncrypted: string }>,
  ): Promise<void> {
    await this.db.delete(envVars).where(eq(envVars.appId, appId));

    if (entries.length === 0) return;

    await this.db
      .insert(envVars)
      .values(entries.map((entry) => ({ appId, ...entry })));
  }
}
