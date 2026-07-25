import { timingSafeEqual } from 'node:crypto';
import type { IncomingHttpHeaders } from 'node:http';
import type { NextFunction, Request, Response } from 'express';
import { forbidden } from '../error/error.factory.js';

export function isInternalRequest(
  headers: IncomingHttpHeaders,
  expectedKey: string,
): boolean {
  const raw = headers['x-internal-key'];
  const provided = Array.isArray(raw) ? raw[0] : raw;

  if (!provided || !expectedKey) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expectedKey);

  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}

export function createInternalAuth(expectedKey: string, serviceName: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!isInternalRequest(req.headers, expectedKey)) {
      next(
        forbidden('FORBIDDEN', `${serviceName} accepts internal calls only`),
      );
      return;
    }
    next();
  };
}

export function internalHeaders(
  key: string,
  callerName: string,
): Record<string, string> {
  return { 'x-internal-key': key, 'x-internal-caller': callerName };
}
