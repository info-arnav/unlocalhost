'use client';

import { useState } from 'react';
import styles from './copy-block.module.css';

export function CopyBlock({
  label,
  value,
  tone = 'code',
}: {
  label?: string;
  value: string;
  tone?: 'code' | 'say';
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={styles.block} data-tone={tone}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <div className={styles.row}>
        <pre className={styles.pre}>
          <code>{value}</code>
        </pre>
        <button
          type="button"
          className={styles.btn}
          onClick={copy}
          aria-label={copied ? 'Copied' : 'Copy to clipboard'}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
