import { createPrivateKey, type KeyObject } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { SignJWT } from 'jose';
import { internal, notFound } from '@unlocalhost/shared/error';

const API = 'https://api.github.com';
const JWT_TTL_SECONDS = 540;

interface InstallationTokenResponse {
  token: string;
  expires_at: string;
}

interface CachedToken {
  token: string;
  expiresAt: number;
}

export interface RepoRef {
  owner: string;
  repo: string;
}

export function parseRepoFullName(fullName: string): RepoRef {
  const [owner, repo] = fullName.split('/');

  if (!owner || !repo || repo.includes('/')) {
    throw notFound('INVALID_REPO', 'Repository must be in owner/name form');
  }

  return { owner, repo };
}

export class GitHubClient {
  private readonly privateKey: KeyObject;
  private readonly tokenCache = new Map<string, CachedToken>();

  constructor(
    private readonly appId: string,
    privateKeyPath: string,
  ) {
    this.privateKey = createPrivateKey(readFileSync(privateKeyPath, 'utf8'));
  }

  private async appJwt(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);

    return new SignJWT({})
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuer(this.appId)
      .setIssuedAt(now - 60)
      .setExpirationTime(now + JWT_TTL_SECONDS)
      .sign(this.privateKey);
  }

  private async request<T>(
    path: string,
    token: string,
    init?: RequestInit,
  ): Promise<T> {
    const response = await fetch(`${API}${path}`, {
      ...init,
      headers: {
        authorization: `Bearer ${token}`,
        accept: 'application/vnd.github+json',
        'x-github-api-version': '2022-11-28',
        'user-agent': 'unlocalhost',
        ...init?.headers,
      },
    });

    if (response.status === 404) {
      throw notFound('GITHUB_NOT_FOUND', `GitHub returned 404 for ${path}`);
    }

    if (!response.ok) {
      throw internal(
        'GITHUB_ERROR',
        `GitHub returned ${response.status} for ${path}`,
      );
    }

    return (await response.json()) as T;
  }

  async findInstallationId(ref: RepoRef): Promise<string> {
    const jwt = await this.appJwt();
    const installation = await this.request<{ id: number }>(
      `/repos/${ref.owner}/${ref.repo}/installation`,
      jwt,
    );

    return String(installation.id);
  }

  async installationToken(installationId: string): Promise<string> {
    const cached = this.tokenCache.get(installationId);

    if (cached && cached.expiresAt > Date.now() + 60_000) {
      return cached.token;
    }

    const jwt = await this.appJwt();
    const result = await this.request<InstallationTokenResponse>(
      `/app/installations/${installationId}/access_tokens`,
      jwt,
      { method: 'POST' },
    );

    this.tokenCache.set(installationId, {
      token: result.token,
      expiresAt: Date.parse(result.expires_at),
    });

    return result.token;
  }

  async cloneUrl(ref: RepoRef, installationId: string): Promise<string> {
    const token = await this.installationToken(installationId);

    return `https://x-access-token:${token}@github.com/${ref.owner}/${ref.repo}.git`;
  }

  async defaultBranch(ref: RepoRef, installationId: string): Promise<string> {
    const token = await this.installationToken(installationId);
    const repo = await this.request<{ default_branch: string }>(
      `/repos/${ref.owner}/${ref.repo}`,
      token,
    );

    return repo.default_branch;
  }
}
