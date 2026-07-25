import type { CookieOptions, Response } from 'express';
import { jwtVerify, SignJWT } from 'jose';

const ISSUER = 'unlocalhost';
const AUDIENCE = 'unlocalhost-viewer';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export interface SessionClaims {
  email: string;
  name?: string | undefined;
  provider: 'github' | 'google';
}

export interface SessionOptions {
  secret: string;
  cookieName: string;
  baseDomain: string;
  secure: boolean;
}

export class SessionService {
  private readonly key: Uint8Array;

  constructor(private readonly options: SessionOptions) {
    this.key = new TextEncoder().encode(options.secret);
  }

  async issue(claims: SessionClaims): Promise<string> {
    return new SignJWT({ ...claims })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuer(ISSUER)
      .setAudience(AUDIENCE)
      .setSubject(claims.email)
      .setIssuedAt()
      .setExpirationTime(`${MAX_AGE_SECONDS}s`)
      .sign(this.key);
  }

  async read(token: string | undefined): Promise<SessionClaims | null> {
    if (!token) return null;

    try {
      const { payload } = await jwtVerify(token, this.key, {
        issuer: ISSUER,
        audience: AUDIENCE,
      });

      const email = payload.email;
      const provider = payload.provider;

      if (typeof email !== 'string') return null;
      if (provider !== 'github' && provider !== 'google') return null;

      return {
        email,
        provider,
        name: typeof payload.name === 'string' ? payload.name : undefined,
      };
    } catch {
      return null;
    }
  }

  private cookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.options.secure,
      sameSite: 'lax',
      domain: `.${this.options.baseDomain}`,
      path: '/',
      maxAge: MAX_AGE_SECONDS * 1000,
    };
  }

  attach(res: Response, token: string): void {
    res.cookie(this.options.cookieName, token, this.cookieOptions());
  }

  clear(res: Response): void {
    res.clearCookie(this.options.cookieName, {
      ...this.cookieOptions(),
      maxAge: undefined,
    });
  }
}
