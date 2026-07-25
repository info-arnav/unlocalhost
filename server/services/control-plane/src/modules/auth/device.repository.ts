import { type Database, deviceAuthorizations } from '@unlocalhost/shared/db';
import { and, eq, gt, isNull } from 'drizzle-orm';

export interface InsertDeviceAuthorization {
  deviceCodeHash: string;
  userCode: string;
  expiresAt: Date;
}

export class DeviceRepository {
  constructor(private readonly db: Database) {}

  async insert(values: InsertDeviceAuthorization): Promise<void> {
    await this.db.insert(deviceAuthorizations).values(values);
  }

  async findByDeviceCodeHash(hash: string) {
    const [row] = await this.db
      .select()
      .from(deviceAuthorizations)
      .where(eq(deviceAuthorizations.deviceCodeHash, hash))
      .limit(1);

    return row ?? null;
  }

  async approve(userCode: string, userId: string): Promise<boolean> {
    const result = await this.db
      .update(deviceAuthorizations)
      .set({ userId, approvedAt: new Date() })
      .where(
        and(
          eq(deviceAuthorizations.userCode, userCode),
          gt(deviceAuthorizations.expiresAt, new Date()),
          isNull(deviceAuthorizations.approvedAt),
        ),
      )
      .returning({ id: deviceAuthorizations.id });

    return result.length > 0;
  }

  async markConsumed(id: string): Promise<void> {
    await this.db
      .update(deviceAuthorizations)
      .set({ consumedAt: new Date() })
      .where(eq(deviceAuthorizations.id, id));
  }
}
