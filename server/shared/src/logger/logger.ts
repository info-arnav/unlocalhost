import { pino, type Logger } from 'pino';
import { pinoHttp } from 'pino-http';
import { redactPaths } from './redact.js';

export type { Logger };

export interface LoggerOptions {
  name: string;
  level?: string;
  pretty?: boolean;
}

export function createLogger({
  name,
  level = process.env.LOG_LEVEL ?? 'info',
  pretty = process.env.NODE_ENV === 'development',
}: LoggerOptions): Logger {
  return pino({
    name,
    level,
    redact: { paths: redactPaths, censor: '[redacted]' },
    formatters: {
      level: (label) => ({ level: label }),
    },
    ...(pretty
      ? { transport: { target: 'pino-pretty', options: { colorize: true } } }
      : {}),
  });
}

export function createHttpLogger(logger: Logger) {
  return pinoHttp({
    logger,
    redact: { paths: redactPaths, censor: '[redacted]' },
    customLogLevel: (_req, res, err) => {
      if (err ?? res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
    serializers: {
      req: (req) => ({
        method: req.method,
        url: req.url,
        host: req.headers.host,
      }),
      res: (res) => ({ statusCode: res.statusCode }),
    },
  });
}
