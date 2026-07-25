import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const SKIP_DIRECTORIES = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  '.next',
  'vendor',
  '__pycache__',
]);

const ENV_FILE = /^\.env(\..+)?$/;
const ENV_ALLOWED = /^\.env\.(example|sample|template)$/;

const CREDENTIAL_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: 'private key', pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { label: 'github token', pattern: /\bgh[pousr]_[A-Za-z0-9]{36}\b/ },
  { label: 'github pat', pattern: /\bgithub_pat_[A-Za-z0-9_]{60,}\b/ },
  { label: 'aws access key', pattern: /\bAKIA[0-9A-Z]{16}\b/ },
  { label: 'openai key', pattern: /\bsk-[A-Za-z0-9]{32,}\b/ },
  { label: 'slack token', pattern: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/ },
  { label: 'stripe key', pattern: /\bsk_live_[A-Za-z0-9]{16,}\b/ },
];

const MAX_FILE_BYTES = 512_000;

export interface SecretFinding {
  file: string;
  reason: string;
}

export class SecretScanService {
  async scan(rootDir: string): Promise<SecretFinding[]> {
    const findings: SecretFinding[] = [];

    await this.walk(rootDir, rootDir, findings);

    return findings;
  }

  private async walk(
    rootDir: string,
    current: string,
    findings: SecretFinding[],
  ): Promise<void> {
    const entries = await readdir(current, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(current, entry.name);

      if (entry.isDirectory()) {
        if (SKIP_DIRECTORIES.has(entry.name)) continue;
        await this.walk(rootDir, fullPath, findings);
        continue;
      }

      if (!entry.isFile()) continue;

      const relativePath = relative(rootDir, fullPath);

      if (ENV_FILE.test(entry.name) && !ENV_ALLOWED.test(entry.name)) {
        findings.push({
          file: relativePath,
          reason: 'environment file committed to the repository',
        });
        continue;
      }

      const info = await stat(fullPath);

      if (info.size > MAX_FILE_BYTES) continue;

      const content = await readFile(fullPath, 'utf8').catch(() => null);

      if (content === null) continue;

      for (const { label, pattern } of CREDENTIAL_PATTERNS) {
        if (pattern.test(content)) {
          findings.push({
            file: relativePath,
            reason: `looks like a ${label}`,
          });
          break;
        }
      }
    }
  }
}
