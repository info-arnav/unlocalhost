import { createHash, randomBytes, randomInt } from 'node:crypto';
import type { DeviceRepository } from './device.repository.js';

const USER_CODE_ALPHABET = 'BCDFGHJKLMNPQRSTVWXZ23456789';
const USER_CODE_LENGTH = 8;
const EXPIRY_MINUTES = 15;
const POLL_INTERVAL_SECONDS = 5;

export interface DeviceGrant {
  deviceCode: string;
  userCode: string;
  expiresIn: number;
  interval: number;
}

export type PollResult =
  | { status: 'pending' }
  | { status: 'expired' }
  | { status: 'approved'; userId: string };

function generateUserCode(): string {
  const chars = Array.from(
    { length: USER_CODE_LENGTH },
    () => USER_CODE_ALPHABET[randomInt(USER_CODE_ALPHABET.length)] as string,
  );

  return `${chars.slice(0, 4).join('')}-${chars.slice(4).join('')}`;
}

function hash(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

export class DeviceService {
  constructor(private readonly repository: DeviceRepository) {}

  async start(): Promise<DeviceGrant> {
    const deviceCode = randomBytes(32).toString('base64url');
    const userCode = generateUserCode();

    await this.repository.insert({
      deviceCodeHash: hash(deviceCode),
      userCode,
      expiresAt: new Date(Date.now() + EXPIRY_MINUTES * 60_000),
    });

    return {
      deviceCode,
      userCode,
      expiresIn: EXPIRY_MINUTES * 60,
      interval: POLL_INTERVAL_SECONDS,
    };
  }

  approve(userCode: string, userId: string): Promise<boolean> {
    return this.repository.approve(userCode.toUpperCase(), userId);
  }

  async poll(deviceCode: string): Promise<PollResult> {
    const row = await this.repository.findByDeviceCodeHash(hash(deviceCode));

    if (!row || row.consumedAt !== null) return { status: 'expired' };
    if (row.expiresAt.getTime() < Date.now()) return { status: 'expired' };
    if (row.approvedAt === null || row.userId === null) {
      return { status: 'pending' };
    }

    await this.repository.markConsumed(row.id);

    return { status: 'approved', userId: row.userId };
  }
}
