import type { Request } from 'express';

export interface ForwardedRequest {
  host: string;
  proto: string;
  uri: string;
  originalUrl: string;
}

export function forwardedRequest(req: Request): ForwardedRequest {
  const host = req.header('x-forwarded-host') ?? req.header('host') ?? '';
  const proto = req.header('x-forwarded-proto') ?? 'https';
  const uri = req.header('x-forwarded-uri') ?? '/';

  return { host, proto, uri, originalUrl: `${proto}://${host}${uri}` };
}
