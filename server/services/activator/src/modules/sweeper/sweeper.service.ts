import type { Logger } from '@unlocalhost/shared/logger';
import type { DokkuClient } from '../dokku/dokku.client.js';
import type { WakeRepository } from '../wake/wake.repository.js';

export class SweeperService {
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly repository: WakeRepository,
    private readonly dokku: DokkuClient,
    private readonly idleTimeoutMs: number,
    private readonly intervalMs: number,
    private readonly logger: Logger,
  ) {}

  start(): void {
    if (this.timer) return;

    this.timer = setInterval(() => {
      void this.sweep();
    }, this.intervalMs);

    this.timer.unref();
  }

  stop(): void {
    if (!this.timer) return;

    clearInterval(this.timer);
    this.timer = null;
  }

  async sweep(): Promise<number> {
    const idleBefore = new Date(Date.now() - this.idleTimeoutMs);
    const idle = await this.repository.findIdleRunning(idleBefore);
    let stopped = 0;

    for (const app of idle) {
      try {
        await this.dokku.stop(app.subdomain);
        await this.repository.setStatus(app.id, 'sleeping');
        stopped += 1;
        this.logger.info({ subdomain: app.subdomain }, 'app put to sleep');
      } catch (error) {
        this.logger.warn(
          { err: error, subdomain: app.subdomain },
          'failed to stop idle app',
        );
      }
    }

    return stopped;
  }
}
