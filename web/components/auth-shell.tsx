import { Logo } from '@/components/logo';
import styles from './auth-shell.module.css';

export function AuthShell({
  chip,
  title,
  blurb,
  children,
  foot,
}: {
  chip?: React.ReactNode;
  title: string;
  blurb: React.ReactNode;
  children: React.ReactNode;
  foot?: React.ReactNode;
}) {
  return (
    <main className={styles.screen} id="main">
      <div className={styles.card}>
        <span className={styles.mark}>
          <Logo size={32} />
        </span>
        {chip ? <div className={styles.hostChip}>{chip}</div> : null}
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.blurb}>{blurb}</p>
        <div className={styles.stack}>{children}</div>
        {foot ? <p className={styles.foot}>{foot}</p> : null}
      </div>
    </main>
  );
}

export const shellStyles = styles;
