import { unauthorized } from '@unlocalhost/shared/error';
import type { SessionService } from '@unlocalhost/shared/session';
import type { NextFunction, Request, Response } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    sessionUserId?: string;
  }
}

export function createSessionAuth(
  sessions: SessionService,
  cookieName: string,
) {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const cookies = req.cookies as Record<string, string> | undefined;
    const session = await sessions.read(cookies?.[cookieName]);

    if (!session?.userId) {
      next(
        unauthorized(
          'NOT_SIGNED_IN',
          'Sign in with GitHub before approving a device',
        ),
      );
      return;
    }

    req.sessionUserId = session.userId;
    next();
  };
}

export function requireSessionUser(req: Request): string {
  if (!req.sessionUserId) {
    throw unauthorized('NOT_SIGNED_IN', 'Sign in with GitHub first');
  }

  return req.sessionUserId;
}
