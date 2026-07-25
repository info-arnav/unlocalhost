import { subdomainFromHost } from '@unlocalhost/shared/domain';
import type { Request, Response } from 'express';
import type { RequestHandler } from 'http-proxy-middleware';
import type { Config } from '../../config.js';
import type { WakeService } from './wake.service.js';

export class ProxyController {
  constructor(
    private readonly config: Config,
    private readonly wake: WakeService,
    private readonly proxy: RequestHandler,
  ) {}

  handle = async (req: Request, res: Response): Promise<void> => {
    const host = req.header('x-forwarded-host') ?? req.header('host') ?? '';
    const subdomain = subdomainFromHost(host, this.config.BASE_DOMAIN);

    if (!subdomain) {
      res.status(400).json({ error: 'Unknown host' });
      return;
    }

    const outcome = await this.wake.ensureAwake(subdomain);

    switch (outcome.kind) {
      case 'unknown':
        res.status(404).json({ error: 'No such app' });
        return;

      case 'failed':
        res.status(502).json({ error: 'This app failed to build' });
        return;

      case 'building':
        res
          .status(503)
          .set('retry-after', '5')
          .json({ error: 'App is building' });
        return;

      case 'timeout':
        res.status(504).json({ error: 'App took too long to start' });
        return;

      case 'ready':
        this.proxy(req, res, (error?: unknown) => {
          if (error && !res.headersSent) {
            res.status(502).json({ error: 'App is not responding' });
          }
        });
        return;
    }
  };
}
