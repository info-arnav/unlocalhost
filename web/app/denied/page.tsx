import type { Metadata } from 'next';
import { AuthShell, shellStyles } from '@/components/auth-shell';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Not on the guest list',
  robots: { index: false, follow: false },
};

function cleanEmail(raw: string | undefined): string | null {
  if (!raw) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw) ? raw : null;
}

function cleanHost(raw: string | undefined): string | null {
  if (!raw) return null;
  return /^[a-z0-9.-]+$/i.test(raw) ? raw : null;
}

export default async function DeniedPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; app?: string }>;
}) {
  const params = await searchParams;
  const email = cleanEmail(params.email);
  const app = cleanHost(params.app);

  return (
    <AuthShell
      chip={
        app ? (
          <>
            private <b>{app}</b>
          </>
        ) : null
      }
      title="You are not on the guest list"
      blurb={
        email ? (
          <>
            You are signed in as <code>{email}</code>. Whoever owns this app has
            not shared it with that address.
          </>
        ) : (
          <>
            You are signed in, but whoever owns this app has not shared it with
            your address.
          </>
        )
      }
      foot="Ask them to add you, then reload this page."
    >
      <a
        className={shellStyles.provider}
        href={`${site.authOrigin}/logout?returnTo=${encodeURIComponent(site.origin)}`}
      >
        Sign in with a different account
      </a>
    </AuthShell>
  );
}
