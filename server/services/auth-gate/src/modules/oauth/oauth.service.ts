import { unauthorized } from '@unlocalhost/shared/error';
import type {
  OAuthProvider,
  VerifiedIdentity,
} from './providers/provider.types.js';

export class OAuthService {
  constructor(
    private readonly providers: Record<string, OAuthProvider>,
    private readonly baseDomain: string,
    private readonly webOrigin: string,
  ) {}

  provider(id: string): OAuthProvider | null {
    return this.providers[id] ?? null;
  }

  isSafeReturnTo(candidate: string): boolean {
    let url: URL;

    try {
      url = new URL(candidate);
    } catch {
      return false;
    }

    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;

    const host = url.hostname.toLowerCase();
    const base = this.baseDomain.toLowerCase();

    return host === base || host.endsWith(`.${base}`);
  }

  resolveReturnTo(raw: unknown): string {
    return typeof raw === 'string' && this.isSafeReturnTo(raw)
      ? raw
      : this.webOrigin;
  }

  async verifyCallback(
    providerId: string,
    code: string,
  ): Promise<VerifiedIdentity> {
    const provider = this.provider(providerId);

    if (!provider) {
      throw unauthorized('UNKNOWN_PROVIDER', 'Unsupported sign-in provider');
    }

    return provider.verify(code);
  }
}
