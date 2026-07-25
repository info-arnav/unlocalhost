import { unauthorized } from '@unlocalhost/shared/error';
import type { NextFunction, Request, Response } from 'express';
import type { AuthenticatedUser, TokenService } from './token.service.js';

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthenticatedUser;
  }
}

export function createBearerAuth(tokens: TokenService) {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const header = req.header('authorization') ?? '';
    const token = header.toLowerCase().startsWith('bearer ')
      ? header.slice(7).trim()
      : undefined;

    const user = await tokens.authenticate(token);

    if (!user) {
      next(unauthorized('UNAUTHENTICATED', 'Missing or invalid access token'));
      return;
    }

    req.user = user;
    next();
  };
}

export function requireUser(req: Request): AuthenticatedUser {
  if (!req.user) {
    throw unauthorized('UNAUTHENTICATED', 'Missing or invalid access token');
  }

  return req.user;
}
