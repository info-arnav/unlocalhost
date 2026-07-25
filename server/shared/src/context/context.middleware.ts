import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { runWithContext } from './context.js';

export function contextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const rid = req.header('x-request-id') ?? randomUUID();
  res.setHeader('x-request-id', rid);
  runWithContext({ rid }, () => next());
}
