import { unauthorized } from '@unlocalhost/shared/error';
import type { VerifiedIdentity } from './provider.types.js';

const AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';
const TOKEN_URL = 'https://github.com/login/oauth/access_token';
const USER_URL = 'https://api.github.com/user';
const EMAILS_URL = 'https://api.github.com/user/emails';

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

export class GitHubProvider {
  readonly id = 'github' as const;

  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly redirectUri: string,
  ) {}

  authorizeUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      state,
      scope: 'read:user user:email',
    });

    return `${AUTHORIZE_URL}?${params.toString()}`;
  }

  private async exchangeCode(code: string): Promise<string> {
    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        code,
      }),
    });

    if (!response.ok) {
      throw unauthorized('OAUTH_EXCHANGE_FAILED', 'GitHub rejected the code');
    }

    const body = (await response.json()) as { access_token?: string };

    if (!body.access_token) {
      throw unauthorized('OAUTH_EXCHANGE_FAILED', 'GitHub returned no token');
    }

    return body.access_token;
  }

  private async fetchJson<T>(url: string, token: string): Promise<T> {
    const response = await fetch(url, {
      headers: {
        authorization: `Bearer ${token}`,
        accept: 'application/vnd.github+json',
        'user-agent': 'unlocalhost',
      },
    });

    if (!response.ok) {
      throw unauthorized(
        'OAUTH_PROFILE_FAILED',
        'GitHub profile lookup failed',
      );
    }

    return (await response.json()) as T;
  }

  async verify(code: string): Promise<VerifiedIdentity> {
    const token = await this.exchangeCode(code);

    const profile = await this.fetchJson<{
      login: string;
      id: number;
      name?: string;
    }>(USER_URL, token);

    const emails = await this.fetchJson<GitHubEmail[]>(EMAILS_URL, token);
    const primary = emails.find((entry) => entry.primary && entry.verified);

    if (!primary) {
      throw unauthorized(
        'EMAIL_NOT_VERIFIED',
        'Your GitHub account has no verified primary email',
      );
    }

    return {
      provider: this.id,
      email: primary.email.toLowerCase(),
      name: profile.name ?? profile.login,
      providerAccountId: String(profile.id),
    };
  }
}
