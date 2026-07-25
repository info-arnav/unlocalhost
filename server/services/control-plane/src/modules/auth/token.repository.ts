import { apiTokens, type Database, users } from '@unlocalhost/shared/db';
import { and, eq, isNull } from 'drizzle-orm';

export class TokenRepository {
  constructor(private readonly db: Database) {}

  async insert(
    userId: string,
    tokenHash: string,
    label: string,
  ): Promise<void> {
    await this.db.insert(apiTokens).values({ userId, tokenHash, label });
  }

  async findActiveByHash(tokenHash: string) {
    const [row] = await this.db
      .select({
        tokenId: apiTokens.id,
        id: users.id,
        email: users.email,
        githubLogin: users.githubLogin,
        githubInstallationId: users.githubInstallationId,
      })
      .from(apiTokens)
      .innerJoin(users, eq(users.id, apiTokens.userId))
      .where(
        and(eq(apiTokens.tokenHash, tokenHash), isNull(apiTokens.revokedAt)),
      )
      .limit(1);

    return row ?? null;
  }

  async touch(tokenId: string): Promise<void> {
    await this.db
      .update(apiTokens)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiTokens.id, tokenId));
  }

  async revokeByHash(tokenHash: string): Promise<void> {
    await this.db
      .update(apiTokens)
      .set({ revokedAt: new Date() })
      .where(eq(apiTokens.tokenHash, tokenHash));
  }
}
