'use client';

import { AuthShell, shellStyles } from '@/components/auth-shell';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <AuthShell
      chip={
        <>
          error <b>{error.digest ?? 'unknown'}</b>
        </>
      }
      title="That did not load"
      blurb="Something broke on our side, not yours. Trying again usually works."
      foot="If it keeps happening, open an issue and include the code above."
    >
      <button className={shellStyles.provider} type="button" onClick={reset}>
        Try again
      </button>
    </AuthShell>
  );
}
