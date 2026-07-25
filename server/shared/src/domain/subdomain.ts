export const RESERVED_SUBDOMAINS = new Set([
  'admin',
  'api',
  'app',
  'apps',
  'auth',
  'billing',
  'blog',
  'cdn',
  'dashboard',
  'devtools',
  'docs',
  'ftp',
  'git',
  'help',
  'imap',
  'internal',
  'login',
  'mail',
  'mcp',
  'ns1',
  'ns2',
  'oauth',
  'pop',
  'root',
  'signin',
  'signup',
  'smtp',
  'sso',
  'staging',
  'static',
  'status',
  'support',
  'test',
  'unlocalhost',
  'webmail',
  'www',
]);

const VALID_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export function isReservedSubdomain(candidate: string): boolean {
  const normalized = candidate.toLowerCase();

  if (RESERVED_SUBDOMAINS.has(normalized)) return true;
  if (normalized.includes('auth')) return true;
  if (normalized.includes('login')) return true;
  if (normalized.includes('admin')) return true;

  return false;
}

export function isValidSubdomain(candidate: string): boolean {
  return VALID_PATTERN.test(candidate) && !candidate.includes('--');
}

export function normalizeSubdomain(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 63);
}

export function subdomainFromHost(
  host: string,
  baseDomain: string,
): string | null {
  const hostname = (host.split(':')[0] ?? '').toLowerCase();
  const suffix = `.${baseDomain.toLowerCase()}`;

  if (!hostname.endsWith(suffix)) return null;

  const label = hostname.slice(0, -suffix.length);

  if (!label || label.includes('.')) return null;

  return label;
}
