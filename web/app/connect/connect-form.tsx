'use client';

import { useRef, useState } from 'react';
import { site } from '@/lib/site';
import styles from './connect-form.module.css';

const LENGTH = 8;

export function ConnectForm({ initialCode }: { initialCode: string }) {
  const [code, setCode] = useState(initialCode.slice(0, LENGTH));
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>(
    'idle',
  );
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const chars = code.padEnd(LENGTH, ' ').split('');

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    if (code.length < LENGTH) return;

    setState('sending');
    setMessage('');

    try {
      const response = await fetch(`${site.apiOrigin}/v1/device/approve`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userCode: `${code.slice(0, 4)}-${code.slice(4)}`.toUpperCase(),
        }),
      });

      if (response.status === 401) {
        window.location.href = `${site.authOrigin}/login/github?returnTo=${encodeURIComponent(
          `${site.origin}/connect?code=${code}`,
        )}`;
        return;
      }

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;

        setState('error');
        setMessage(
          body?.error?.message ?? 'That code is not valid or has expired.',
        );
        return;
      }

      setState('done');
      setMessage('Approved. Head back to your agent, it is already signed in.');
    } catch {
      setState('error');
      setMessage(
        'Could not reach unlocalhost. Check your connection and try again.',
      );
    }
  }

  if (state === 'done') {
    return <p className={`${styles.msg} ${styles.ok}`}>{message}</p>;
  }

  return (
    <form onSubmit={submit}>
      <button
        type="button"
        className={styles.tap}
        onClick={() => inputRef.current?.focus()}
        aria-label="Enter your device code"
      >
        <span className={styles.slots}>
          {chars.map((char, index) => (
            <span key={index}>
              {index === 4 ? <span className={styles.sep}>&#8211;</span> : null}
              <span
                className={styles.slot}
                data-filled={char.trim().length > 0}
              >
                {char.trim()}
              </span>
            </span>
          ))}
        </span>
      </button>

      <input
        ref={inputRef}
        className={styles.input}
        value={code}
        onChange={(event) =>
          setCode(
            event.target.value
              .replace(/[^a-zA-Z0-9]/g, '')
              .toUpperCase()
              .slice(0, LENGTH),
          )
        }
        inputMode="text"
        autoComplete="one-time-code"
        autoFocus
        aria-label="Device code"
      />

      <button
        className={styles.submit}
        type="submit"
        disabled={code.length < LENGTH || state === 'sending'}
      >
        {state === 'sending' ? 'Approving' : 'Approve this device'}
      </button>

      {message ? (
        <p className={`${styles.msg} ${styles.err}`}>{message}</p>
      ) : null}
    </form>
  );
}
