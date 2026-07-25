import { subdomainFromHost } from '@unlocalhost/shared/domain';
import type { SessionClaims } from '../session/session.service.js';
import type { AllowlistRepository } from './allowlist.repository.js';

export type VerifyOutcome =
  | { kind: 'unknown-host' }
  | { kind: 'unknown-app' }
  | { kind: 'needs-login' }
  | { kind: 'denied'; email: string }
  | { kind: 'allowed'; email: string; appId: string };

export class VerifyService {
  constructor(
    private readonly allowlist: AllowlistRepository,
    private readonly baseDomain: string,
  ) {}

  async authorize(
    host: string,
    session: SessionClaims | null,
  ): Promise<VerifyOutcome> {
    const subdomain = subdomainFromHost(host, this.baseDomain);

    if (!subdomain) return { kind: 'unknown-host' };

    const app = await this.allowlist.resolveApp(subdomain);

    if (!app) return { kind: 'unknown-app' };
    if (!session) return { kind: 'needs-login' };

    const allowed = await this.allowlist.isAllowed(app.id, session.email);

    return allowed
      ? { kind: 'allowed', email: session.email, appId: app.id }
      : { kind: 'denied', email: session.email };
  }
}
