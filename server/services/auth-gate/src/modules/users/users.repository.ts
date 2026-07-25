import { type Database, users } from '@unlocalhost/shared/db';
import { eq } from 'drizzle-orm';

export interface UpsertUserInput {
  githubId: string;
  githubLogin: string;
  email: string;
}

export class UsersRepository {
  constructor(private readonly db: Database) {}

  async upsertByGithubId(input: UpsertUserInput): Promise<string> {
    const [row] = await this.db
      .insert(users)
      .values(input)
      .onConflictDoUpdate({
        target: users.githubId,
        set: { email: input.email, githubLogin: input.githubLogin },
      })
      .returning({ id: users.id });

    if (row) return row.id;

    const [existing] = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.githubId, input.githubId))
      .limit(1);

    if (!existing) {
      throw new Error('Failed to upsert user');
    }

    return existing.id;
  }
}
