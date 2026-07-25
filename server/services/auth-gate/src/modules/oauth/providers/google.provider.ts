import { unauthorized } from '@unlocalhost/shared/error';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { VerifiedIdentity } from './provider.types.js';

const AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const JWKS_URL = new URL('https://www.googleapis.com/oauth2/v3/certs');
const ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];

export class GoogleProvider {
  readonly id = 'google' as const;
  private readonly jwks = createRemoteJWKSet(JWKS_URL);

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
      response_type: 'code',
      scope: 'openid email profile',
      prompt: 'select_account',
    });

    return `${AUTHORIZE_URL}?${params.toString()}`;
  }

  private async exchangeCode(code: string): Promise<string> {
    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code',
        code,
      }),
    });

    if (!response.ok) {
      throw unauthorized('OAUTH_EXCHANGE_FAILED', 'Google rejected the code');
    }

    const body = (await response.json()) as { id_token?: string };

    if (!body.id_token) {
      throw unauthorized(
        'OAUTH_EXCHANGE_FAILED',
        'Google returned no id_token',
      );
    }

    return body.id_token;
  }

  async verify(code: string): Promise<VerifiedIdentity> {
    const idToken = await this.exchangeCode(code);

    const { payload } = await jwtVerify(idToken, this.jwks, {
      audience: this.clientId,
      issuer: ISSUERS,
    }).catch(() => {
      throw unauthorized(
        'OAUTH_TOKEN_INVALID',
        'Google id_token failed verification',
      );
    });

    if (payload.email_verified !== true || typeof payload.email !== 'string') {
      throw unauthorized(
        'EMAIL_NOT_VERIFIED',
        'Your Google account email is not verified',
      );
    }

    return {
      provider: this.id,
      email: payload.email.toLowerCase(),
      name: typeof payload.name === 'string' ? payload.name : payload.email,
      providerAccountId: String(payload.sub),
    };
  }
}
