import { createHash, randomBytes } from 'node:crypto';
import type { TokenRepository } from './token.repository.js';

const PREFIX = 'ulh_';

export interface AuthenticatedUser {
  id: string;
  email: string;
  githubLogin: string;
  githubInstallationId: string | null;
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

export class TokenService {
  constructor(private readonly repository: TokenRepository) {}

  async issue(userId: string, label = 'mcp'): Promise<string> {
    const token = `${PREFIX}${randomBytes(32).toString('base64url')}`;

    await this.repository.insert(userId, hashToken(token), label);

    return token;
  }

  async authenticate(
    token: string | undefined,
  ): Promise<AuthenticatedUser | null> {
    if (!token || !token.startsWith(PREFIX)) return null;

    const row = await this.repository.findActiveByHash(hashToken(token));

    if (!row) return null;

    await this.repository.touch(row.tokenId);

    return {
      id: row.id,
      email: row.email,
      githubLogin: row.githubLogin,
      githubInstallationId: row.githubInstallationId,
    };
  }

  async revoke(token: string): Promise<void> {
    await this.repository.revokeByHash(hashToken(token));
  }
}
