import { randomInt } from 'node:crypto';
import type { RedisClient } from '@unlocalhost/shared/cache';
import {
  isReservedSubdomain,
  isValidSubdomain,
  normalizeSubdomain,
} from '@unlocalhost/shared/domain';
import { badRequest, notFound } from '@unlocalhost/shared/error';
import type { AppsRepository } from './apps.repository.js';

const SUFFIX_ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789';
const MAX_ATTEMPTS = 8;
const SUFFIX_LENGTH = 4;

export interface CreateAppInput {
  ownerId: string;
  name: string;
  repoFullName?: string | undefined;
  repoUrl?: string | undefined;
}

function randomSuffix(): string {
  return Array.from(
    { length: SUFFIX_LENGTH },
    () => SUFFIX_ALPHABET[randomInt(SUFFIX_ALPHABET.length)] as string,
  ).join('');
}

function normalizeEmails(emails: string[]): string[] {
  return [...new Set(emails.map((email) => email.trim().toLowerCase()))].filter(
    (email) => email.length > 0,
  );
}

export class AppsService {
  constructor(
    private readonly repository: AppsRepository,
    private readonly redis: RedisClient,
  ) {}

  async allocateSubdomain(desired: string): Promise<string> {
    const base = normalizeSubdomain(desired);

    if (!base) {
      throw badRequest('INVALID_NAME', 'App name produces an empty subdomain');
    }

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      const candidate = attempt === 0 ? base : `${base}-${randomSuffix()}`;

      if (!isValidSubdomain(candidate)) continue;
      if (isReservedSubdomain(candidate)) continue;
      if (await this.repository.subdomainExists(candidate)) continue;

      return candidate;
    }

    throw badRequest(
      'SUBDOMAIN_UNAVAILABLE',
      'Could not allocate a subdomain for that name',
    );
  }

  async create(input: CreateAppInput) {
    const subdomain = await this.allocateSubdomain(input.name);

    const row = await this.repository.insert({
      ownerId: input.ownerId,
      subdomain,
      repoFullName: input.repoFullName ?? null,
      repoUrl: input.repoUrl ?? null,
    });

    if (!row) throw badRequest('CREATE_FAILED', 'Could not create app');

    return row;
  }

  listByOwner(ownerId: string) {
    return this.repository.listByOwner(ownerId);
  }

  async getOwned(appId: string, ownerId: string) {
    const row = await this.repository.findOwnedById(appId, ownerId);

    if (!row) throw notFound('APP_NOT_FOUND', 'No such app');

    return row;
  }

  private async invalidateCache(
    appId: string,
    emails: string[],
  ): Promise<void> {
    if (emails.length === 0) return;

    await this.redis.del(
      ...emails.map((email) => `authgate:allow:${appId}:${email}`),
    );
  }

  async share(appId: string, emails: string[]): Promise<string[]> {
    const normalized = normalizeEmails(emails);

    if (normalized.length === 0) return [];

    await this.repository.addAllowlistEntries(appId, normalized);
    await this.invalidateCache(appId, normalized);

    return normalized;
  }

  async unshare(appId: string, emails: string[]): Promise<string[]> {
    const normalized = normalizeEmails(emails);

    if (normalized.length === 0) return [];

    await this.repository.removeAllowlistEntries(appId, normalized);
    await this.invalidateCache(appId, normalized);

    return normalized;
  }

  listAllowlist(appId: string) {
    return this.repository.listAllowlist(appId);
  }

  recentDeployments(appId: string, limit = 10) {
    return this.repository.recentDeployments(appId, limit);
  }
}
