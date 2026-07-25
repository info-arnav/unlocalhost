import type { NextFunction, Request, Response } from 'express';
import { getRequestId } from '../context/context.js';
import type { Logger } from '../logger/logger.js';
import { captureException } from '../observability/sentry.js';
import { AppError } from './error.factory.js';

export function createErrorMiddleware(logger: Logger) {
  return (
    err: unknown,
    req: Request,
    res: Response,
    _next: NextFunction,
  ): void => {
    const rid = getRequestId();
    const isAppError = err instanceof AppError;
    const status = isAppError ? err.status : 500;
    const code = isAppError ? err.code : 'INTERNAL_ERROR';
    const message = err instanceof Error ? err.message : 'Unknown error';

    const payload = {
      rid,
      code,
      status,
      path: req.originalUrl,
      method: req.method,
    };

    if (status >= 500) {
      logger.error(
        { ...payload, stack: err instanceof Error ? err.stack : undefined },
        message,
      );
      captureException(err, payload);
    } else {
      logger.warn(payload, message);
    }

    res.status(status).json({
      error: {
        code,
        message:
          isAppError && err.expose ? err.message : 'Internal Server Error',
        rid,
      },
    });
  };
}
