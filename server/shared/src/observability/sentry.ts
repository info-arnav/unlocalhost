import * as Sentry from '@sentry/node';

let enabled = false;

export interface SentryOptions {
  dsn?: string | undefined;
  environment: string;
  release?: string | undefined;
  tracesSampleRate?: number;
}

export function initSentry({
  dsn,
  environment,
  release,
  tracesSampleRate = 0.1,
}: SentryOptions): boolean {
  if (!dsn) return false;

  Sentry.init({
    dsn,
    environment,
    ...(release ? { release } : {}),
    tracesSampleRate,
    sendDefaultPii: false,
    beforeSend(event) {
      if (event.request?.headers) {
        delete event.request.headers.cookie;
        delete event.request.headers.authorization;
      }
      if (event.request?.cookies) {
        delete event.request.cookies;
      }
      return event;
    },
  });

  enabled = true;
  return true;
}

export function captureException(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  if (!enabled) return;
  Sentry.captureException(error, context ? { extra: context } : undefined);
}

export function closeSentry(timeout = 2000): Promise<boolean> {
  if (!enabled) return Promise.resolve(true);
  return Sentry.close(timeout);
}
