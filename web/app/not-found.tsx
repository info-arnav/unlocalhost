import Link from 'next/link';
import { AuthShell, shellStyles } from '@/components/auth-shell';

export default function NotFound() {
  return (
    <AuthShell
      chip={
        <>
          error <b>404</b>
        </>
      }
      title="Nothing lives here"
      blurb="This address does not point at anything. If you followed a shared link, ask whoever sent it to check it is still live."
      foot="Sleeping apps wake on their own, so a slow load is not a dead link."
    >
      <Link className={shellStyles.provider} href="/">
        Back to the start
      </Link>
    </AuthShell>
  );
}
