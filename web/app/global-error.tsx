'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#0b0f16',
          color: '#e8edf4',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          padding: 24,
          textAlign: 'center',
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, marginBottom: 10 }}>
            unlocalhost is down
          </h1>
          <p style={{ color: '#8b98a8', fontSize: 15, marginBottom: 22 }}>
            Something failed before the page could load. Your apps are not
            affected.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: '11px 22px',
              borderRadius: 999,
              border: 'none',
              background: '#4d93f0',
              color: '#fff',
              fontSize: 15,
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
          {error.digest ? (
            <p
              style={{
                marginTop: 18,
                fontSize: 12,
                color: '#5b6775',
                fontFamily: 'monospace',
              }}
            >
              {error.digest}
            </p>
          ) : null}
        </div>
      </body>
    </html>
  );
}
