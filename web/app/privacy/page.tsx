import type { Metadata } from 'next';
import { FloatingNav } from '@/components/nav/floating-nav';
import { SiteFooter } from '@/components/site-footer';
import { site } from '@/lib/site';
import styles from '../prose.module.css';

export const metadata: Metadata = {
  title: 'Privacy',
  description:
    'Exactly what unlocalhost stores, why it stores it, and how to have it deleted.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <>
      <FloatingNav />

      <main id="main" className={`wrap ${styles.page}`}>
        <header className={styles.head}>
          <span className="eyebrow">Legal</span>
          <h1 className={styles.title}>Privacy</h1>
          <p className={styles.updated}>Last updated 26 July 2026</p>
        </header>

        <div className={styles.body}>
          <div className={styles.callout}>
            <p>
              The short version: we store your email so we know who you are, the
              name of each app you deploy, and the addresses you share with. We
              do not store your source code, and we cannot read the contents of
              your app.
            </p>
          </div>

          <h2>What we store</h2>

          <h3>If you deploy apps</h3>
          <ul>
            <li>
              Your GitHub user id, username, and verified email address, so we
              know which apps are yours.
            </li>
            <li>
              The full name of each repository you deploy, and the subdomain
              assigned to it.
            </li>
            <li>
              Environment variables you choose to pass us, encrypted with
              AES&nbsp;256&nbsp;GCM and only decrypted to inject into your
              running app.
            </li>
            <li>
              Build logs and deployment history, so you can debug a failed
              build.
            </li>
            <li>
              An access token for your coding agent, stored only as a hash. The
              original is on your machine.
            </li>
          </ul>

          <h3>If you open an app someone shared</h3>
          <ul>
            <li>
              Your verified email address, checked against the guest list for
              that app.
            </li>
            <li>
              A sign in session, held in a cookie on your device, valid for
              thirty days.
            </li>
          </ul>

          <h2>What we do not store</h2>
          <ul>
            <li>
              <strong>Your source code.</strong> It is cloned to build your app
              and the working copy is deleted immediately afterwards. It lives
              in your GitHub account, not ours.
            </li>
            <li>
              <strong>Anything inside your running app.</strong> Whatever your
              app saves belongs to your app, on disk, and is not readable by us
              through any product feature.
            </li>
            <li>
              <strong>Passwords.</strong> Sign in is handled by GitHub and
              Google. We never see a password.
            </li>
            <li>
              <strong>Secrets in logs.</strong> Tokens, cookies, and environment
              values are stripped before anything is written to a log.
            </li>
          </ul>

          <h2>What we access on GitHub</h2>
          <p>
            Read only, and only for the repositories you explicitly install the
            app on. We can read code in order to build it. We cannot push,
            create, delete, or modify anything. You can revoke this at any time
            in your GitHub settings, and we lose access immediately.
          </p>

          <h2>Who else sees your data</h2>
          <p>
            We do not sell data and we do not run advertising. Data is processed
            by the services that keep the platform running: our own server,
            GitHub and Google for sign in, Cloudflare for DNS, and Sentry for
            crash reports. Crash reports have cookies and authorisation headers
            removed before they are sent.
          </p>

          <h2>Where it is stored</h2>
          <p>
            On a single server we operate, with encrypted backups. If you run
            unlocalhost yourself, none of your data reaches us at all. Same
            software, your machine, your rules.
          </p>

          <h2>Deleting your data</h2>
          <p>
            Ask your agent to delete an app and its record, guest list,
            environment variables, and logs are removed. To delete your account
            entirely, open an issue or email us and we will remove everything
            within thirty days.
          </p>

          <h2>Contact</h2>
          <p>
            Questions or requests go to{' '}
            <a
              href={`${site.repo}/issues`}
              target="_blank"
              rel="noreferrer noopener"
            >
              our issue tracker
            </a>
            . Security problems should follow the disclosure process in{' '}
            <a
              href={`${site.repo}/blob/main/SECURITY.md`}
              target="_blank"
              rel="noreferrer noopener"
            >
              SECURITY.md
            </a>{' '}
            instead of a public issue.
          </p>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
