const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? 'unlocalhost.tech';

export const site = {
  name: 'unlocalhost',
  baseDomain,
  origin: process.env.NEXT_PUBLIC_WEB_ORIGIN ?? `https://www.${baseDomain}`,
  apiOrigin: process.env.NEXT_PUBLIC_API_ORIGIN ?? `https://api.${baseDomain}`,
  authOrigin:
    process.env.NEXT_PUBLIC_AUTH_ORIGIN ?? `https://auth.${baseDomain}`,
  repo: 'https://github.com/info-arnav/unlocalhost',
  tagline: 'Turn localhost into a link only your friends can open',
  description:
    'unlocalhost turns the app running on your machine into a live link with sign in already built in. Only the people you name can open it. Open source and self hostable.',
} as const;

export function authUrl(
  provider: 'github' | 'google',
  returnTo: string,
): string {
  const url = new URL(`/login/${provider}`, site.authOrigin);
  url.searchParams.set('returnTo', returnTo);
  return url.toString();
}
