import { createHmac, timingSafeEqual } from 'node:crypto';

export interface PushEvent {
  repoFullName: string;
  ref: string;
  defaultBranch: string;
  commitSha: string | null;
  installationId: string | null;
}

export class WebhookService {
  constructor(private readonly secret: string) {}

  verifySignature(
    rawBody: Buffer,
    signatureHeader: string | undefined,
  ): boolean {
    if (!signatureHeader?.startsWith('sha256=')) return false;

    const expected = `sha256=${createHmac('sha256', this.secret)
      .update(rawBody)
      .digest('hex')}`;

    const a = Buffer.from(signatureHeader);
    const b = Buffer.from(expected);

    if (a.length !== b.length) return false;

    return timingSafeEqual(a, b);
  }

  parsePush(payload: unknown): PushEvent | null {
    if (typeof payload !== 'object' || payload === null) return null;

    const body = payload as Record<string, unknown>;
    const repository = body.repository as Record<string, unknown> | undefined;
    const installation = body.installation as
      Record<string, unknown> | undefined;

    const repoFullName = repository?.full_name;
    const ref = body.ref;

    if (typeof repoFullName !== 'string' || typeof ref !== 'string')
      return null;

    return {
      repoFullName,
      ref,
      defaultBranch:
        typeof repository?.default_branch === 'string'
          ? repository.default_branch
          : 'main',
      commitSha: typeof body.after === 'string' ? body.after : null,
      installationId:
        installation?.id !== undefined ? String(installation.id) : null,
    };
  }

  isDefaultBranchPush(event: PushEvent): boolean {
    return event.ref === `refs/heads/${event.defaultBranch}`;
  }
}
