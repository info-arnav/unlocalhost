import type { ApiClient } from './client.js';

export interface DeviceStart {
  deviceCode: string;
  userCode: string;
  verificationUri: string;
  verificationUriComplete: string;
  expiresIn: number;
  interval: number;
}

export interface PollPending {
  status: 'pending';
}

export interface PollApproved {
  status: 'approved';
  token: string;
}

export class DeviceLogin {
  constructor(private readonly api: ApiClient) {}

  start(): Promise<DeviceStart> {
    return this.api.request<DeviceStart>('/v1/device/start', {
      method: 'POST',
    });
  }

  async poll(deviceCode: string): Promise<string | null> {
    try {
      const result = await this.api.request<PollPending | PollApproved>(
        '/v1/device/poll',
        { method: 'POST', body: { deviceCode } },
      );

      return result.status === 'approved' ? result.token : null;
    } catch (error) {
      const status = (error as { status?: number }).status;

      if (status === 202) return null;

      throw error;
    }
  }
}
