import type { Metadata } from 'next';
import { AuthShell, shellStyles } from '@/components/auth-shell';
import { authUrl, site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
};

function safeReturnTo(raw: string | undefined): string {
  if (!raw) return site.origin;

  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    const base = site.baseDomain.toLowerCase();
    const allowed = host === base || host.endsWith(`.${base}`);

    if (!allowed) return site.origin;
    if (url.protocol !== 'https:' && url.protocol !== 'http:')
      return site.origin;

    return url.toString();
  } catch {
    return site.origin;
  }
}

function appLabel(returnTo: string): string | null {
  try {
    return new URL(returnTo).hostname;
  } catch {
    return null;
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const params = await searchParams;
  const returnTo = safeReturnTo(params.returnTo);
  const label = appLabel(returnTo);

  return (
    <AuthShell
      chip={
        label ? (
          <>
            private <b>{label}</b>
          </>
        ) : null
      }
      title="Sign in to continue"
      blurb="This app is private. Sign in so we can check you are on the guest list."
      foot={
        <>
          Protected by unlocalhost. We only read your name and email.{' '}
          <a href="/privacy">What we store</a>
        </>
      }
    >
      <a className={shellStyles.provider} href={authUrl('github', returnTo)}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.8 10.9.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.2-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0C17.5 4.7 18.5 5 18.5 5c.6 1.6.2 2.8.1 3.1.8.9 1.2 1.9 1.2 3.2 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .4.2.7.8.6 4.6-1.5 7.8-5.8 7.8-10.9C23.5 5.7 18.3.5 12 .5Z" />
        </svg>
        Continue with GitHub
      </a>

      <a className={shellStyles.provider} href={authUrl('google', returnTo)}>
        <svg width="17" height="17" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.6Z"
          />
          <path
            fill="#34A853"
            d="M12 23.5c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3C3.7 21 7.6 23.5 12 23.5Z"
          />
          <path
            fill="#FBBC05"
            d="M5.6 14.2a6.9 6.9 0 0 1 0-4.4v-3H1.8a11.5 11.5 0 0 0 0 10.4l3.8-3Z"
          />
          <path
            fill="#EA4335"
            d="M12 4.8c1.7 0 3.2.6 4.4 1.7l3.3-3.3C17.7 1.3 15.1.5 12 .5 7.6.5 3.7 3 1.8 6.8l3.8 3c.9-2.7 3.4-5 6.4-5Z"
          />
        </svg>
        Continue with Google
      </a>
    </AuthShell>
  );
}
