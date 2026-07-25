export interface ApiError {
  code: string;
  message: string;
  installUrl?: string;
}

export class ApiClient {
  constructor(
    private readonly baseUrl: string,
    private token: string | undefined,
  ) {}

  setToken(token: string): void {
    this.token = token;
  }

  get authenticated(): boolean {
    return this.token !== undefined;
  }

  async request<T>(
    path: string,
    init: { method?: string; body?: unknown } = {},
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: init.method ?? 'GET',
      headers: {
        'content-type': 'application/json',
        ...(this.token ? { authorization: `Bearer ${this.token}` } : {}),
      },
      ...(init.body !== undefined ? { body: JSON.stringify(init.body) } : {}),
    });

    const text = await response.text();
    const parsed: unknown = text ? JSON.parse(text) : {};

    if (!response.ok) {
      const body = parsed as { error?: ApiError };
      const error = body.error ?? {
        code: 'HTTP_ERROR',
        message: `Request failed with ${response.status}`,
      };

      throw Object.assign(new Error(error.message), {
        code: error.code,
        installUrl: error.installUrl,
        status: response.status,
      });
    }

    return parsed as T;
  }
}
