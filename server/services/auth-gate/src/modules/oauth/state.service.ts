import { randomBytes } from 'node:crypto';
import type { CookieOptions, Request, Response } from 'express';
import { jwtVerify, SignJWT } from 'jose';

const ISSUER = 'unlocalhost';
const AUDIENCE = 'unlocalhost-oauth-state';
const TTL_SECONDS = 600;
const COOKIE_NAME = 'unlocalhost_oauth_state';

export interface OAuthState {
  nonce: string;
  returnTo: string;
}

export class StateService {
  private readonly key: Uint8Array;

  constructor(
    secret: string,
    private readonly baseDomain: string,
    private readonly secure: boolean,
  ) {
    this.key = new TextEncoder().encode(secret);
  }

  private cookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.secure,
      sameSite: 'lax',
      domain: `.${this.baseDomain}`,
      path: '/',
      maxAge: TTL_SECONDS * 1000,
    };
  }

  async start(res: Response, returnTo: string): Promise<string> {
    const nonce = randomBytes(16).toString('base64url');

    const token = await new SignJWT({ nonce, returnTo })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuer(ISSUER)
      .setAudience(AUDIENCE)
      .setIssuedAt()
      .setExpirationTime(`${TTL_SECONDS}s`)
      .sign(this.key);

    res.cookie(COOKIE_NAME, token, this.cookieOptions());

    return nonce;
  }

  async consume(req: Request, res: Response): Promise<OAuthState | null> {
    const cookies = req.cookies as Record<string, string> | undefined;
    const token = cookies?.[COOKIE_NAME];

    res.clearCookie(COOKIE_NAME, {
      ...this.cookieOptions(),
      maxAge: undefined,
    });

    if (!token) return null;

    try {
      const { payload } = await jwtVerify(token, this.key, {
        issuer: ISSUER,
        audience: AUDIENCE,
      });

      const nonce = payload.nonce;
      const returnTo = payload.returnTo;

      if (typeof nonce !== 'string' || typeof returnTo !== 'string') {
        return null;
      }

      return { nonce, returnTo };
    } catch {
      return null;
    }
  }
}
