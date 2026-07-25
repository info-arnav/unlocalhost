import Link from 'next/link';
import { Logo } from '@/components/logo';
import { site } from '@/lib/site';
import styles from './site-footer.module.css';

const columns = [
  {
    title: 'Product',
    links: [
      { href: '/docs', label: 'Docs' },
      { href: '/#how', label: 'How it works' },
      { href: '/#security', label: 'Security' },
      { href: '/#faq', label: 'Questions' },
    ],
  },
  {
    title: 'Open source',
    links: [
      { href: site.repo, label: 'Source code', external: true },
      {
        href: `${site.repo}/blob/main/LICENSE`,
        label: 'MIT licence',
        external: true,
      },
      {
        href: `${site.repo}/issues`,
        label: 'Report a problem',
        external: true,
      },
      {
        href: `${site.repo}/blob/main/SECURITY.md`,
        label: 'Disclose a vulnerability',
        external: true,
      },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`wrap ${styles.top}`}>
        <div className={styles.pitch}>
          <span className={styles.mark}>
            <Logo size={30} />
          </span>
          <p className={styles.line}>
            <span className={styles.dashed}>localhost:3000</span>
            <span className={styles.arrow} aria-hidden="true">
              &rarr;
            </span>
            <span className={styles.solid}>a link with a guest list</span>
          </p>
          <p className={styles.blurb}>
            Run the whole thing yourself on one machine, or use ours. Same code
            either way.
          </p>
        </div>

        <nav className={styles.cols} aria-label="Footer">
          {columns.map((col) => (
            <div key={col.title}>
              <h2 className={styles.colTitle}>{col.title}</h2>
              <ul>
                {col.links.map((link) => (
                  <li key={link.label}>
                    {'external' in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href}>{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className={`wrap ${styles.bottom}`}>
        <span>
          Built by{' '}
          <a href={site.repo} target="_blank" rel="noreferrer noopener">
            info-arnav
          </a>
        </span>
        <span>MIT licensed</span>
      </div>
    </footer>
  );
}
