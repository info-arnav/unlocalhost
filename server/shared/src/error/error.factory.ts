export class AppError extends Error {
  readonly code: string;
  readonly status: number;
  readonly expose: boolean;

  constructor(code: string, message: string, status = 500, expose = true) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.expose = expose;
  }
}

export const badRequest = (code: string, message: string) =>
  new AppError(code, message, 400, true);

export const unauthorized = (code: string, message: string) =>
  new AppError(code, message, 401, true);

export const forbidden = (code: string, message: string) =>
  new AppError(code, message, 403, true);

export const notFound = (code: string, message: string) =>
  new AppError(code, message, 404, true);

export const tooManyRequests = (code: string, message: string) =>
  new AppError(code, message, 429, true);

export const internal = (code: string, message = 'Internal error') =>
  new AppError(code, message, 500, false);
