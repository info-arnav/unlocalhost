import type { Logger } from '@unlocalhost/shared/logger';
import type { DokkuClient } from '../dokku/dokku.client.js';
import type { WakeRepository } from './wake.repository.js';

export type WakeOutcome =
  | { kind: 'unknown' }
  | { kind: 'ready'; appId: string }
  | { kind: 'building'; appId: string }
  | { kind: 'failed'; appId: string }
  | { kind: 'timeout'; appId: string };

const POLL_INTERVAL_MS = 750;

export class WakeService {
  private readonly inFlight = new Map<string, Promise<WakeOutcome>>();

  constructor(
    private readonly repository: WakeRepository,
    private readonly dokku: DokkuClient,
    private readonly coldStartTimeoutMs: number,
    private readonly logger: Logger,
  ) {}

  async ensureAwake(subdomain: string): Promise<WakeOutcome> {
    const app = await this.repository.findBySubdomain(subdomain);

    if (!app) return { kind: 'unknown' };

    if (app.status === 'failed') return { kind: 'failed', appId: app.id };
    if (app.status === 'building') return { kind: 'building', appId: app.id };

    if (app.status === 'running') {
      void this.repository.touch(app.id);
      return { kind: 'ready', appId: app.id };
    }

    const existing = this.inFlight.get(subdomain);

    if (existing) return existing;

    const wake = this.performWake(subdomain, app.id);
    this.inFlight.set(subdomain, wake);

    try {
      return await wake;
    } finally {
      this.inFlight.delete(subdomain);
    }
  }

  private async performWake(
    subdomain: string,
    appId: string,
  ): Promise<WakeOutcome> {
    this.logger.info({ subdomain }, 'cold starting app');

    await this.dokku.start(subdomain);

    const deadline = Date.now() + this.coldStartTimeoutMs;

    while (Date.now() < deadline) {
      if (await this.dokku.isRunning(subdomain).catch(() => false)) {
        await this.repository.setStatus(appId, 'running');
        await this.repository.touch(appId);
        this.logger.info({ subdomain }, 'app awake');

        return { kind: 'ready', appId };
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }

    this.logger.warn({ subdomain }, 'cold start timed out');

    return { kind: 'timeout', appId };
  }
}
