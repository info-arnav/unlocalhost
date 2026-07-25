import type { Metadata } from 'next';
import { FloatingNav } from '@/components/nav/floating-nav';
import { SiteFooter } from '@/components/site-footer';
import { site } from '@/lib/site';
import styles from '../prose.module.css';

export const metadata: Metadata = {
  title: 'Terms',
  description:
    'The rules for using the hosted unlocalhost service, in plain language.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <>
      <FloatingNav />

      <main id="main" className={`wrap ${styles.page}`}>
        <header className={styles.head}>
          <span className="eyebrow">Legal</span>
          <h1 className={styles.title}>Terms</h1>
          <p className={styles.updated}>Last updated 26 July 2026</p>
        </header>

        <div className={styles.body}>
          <div className={styles.callout}>
            <p>
              These cover the hosted service at {site.baseDomain}. If you run
              unlocalhost on your own server, only the MIT licence applies and
              none of this does.
            </p>
          </div>

          <h2>What you are agreeing to</h2>
          <p>
            By deploying an app here you accept these terms. If you do not, do
            not use the hosted service. The software itself remains yours to use
            under the MIT licence.
          </p>

          <h2>Your code is yours</h2>
          <p>
            We claim no ownership over anything you deploy. You give us
            permission to clone, build, and run it for the sole purpose of
            providing the service, and nothing more.
          </p>

          <h2>You are responsible for what you ship</h2>
          <p>
            You confirm you have the right to deploy the code, and that it and
            its data comply with the law where you and your users are. If your
            app collects personal data, being lawful about it is your
            responsibility, not ours.
          </p>

          <h2>What you may not do</h2>
          <ul>
            <li>Anything illegal, or anything that harms other people.</li>
            <li>
              Malware, phishing, or pages impersonating another person or
              company.
            </li>
            <li>
              Mining cryptocurrency, sending spam, or attacking other systems.
            </li>
            <li>
              Deliberately consuming resources to degrade the service for
              others.
            </li>
            <li>
              Working around the guest list to make a private app public without
              meaning to.
            </li>
          </ul>
          <p>
            We may suspend or remove an app that breaks these rules. Where it is
            reasonable we will tell you first, but for active harm we will act
            immediately.
          </p>

          <h2>Free service, honest expectations</h2>
          <p>
            The hosted service is free and provided as is. Apps that receive no
            traffic are put to sleep and wake again on the next visit, which
            means the first request after a quiet period is slower.
          </p>
          <p>
            There is no uptime guarantee. Do not put anything critical here
            without your own backups. If you need guarantees, run it yourself,
            which is exactly why it is open source.
          </p>

          <h2>Accounts</h2>
          <p>
            You need a GitHub account. Keep it secure, because anyone with
            access to it can manage your apps. Tell us promptly if you think
            your account has been compromised.
          </p>

          <h2>Ending it</h2>
          <p>
            You can delete your apps and account whenever you like. We may close
            an account that breaks these terms. If we shut the service down we
            will give reasonable notice so you can move.
          </p>

          <h2>Liability</h2>
          <p>
            To the extent the law allows, we are not liable for lost data, lost
            profits, or damage arising from your use of a free service. The
            software carries no warranty, as stated in the MIT licence.
          </p>

          <h2>Changes</h2>
          <p>
            These terms may change. The date at the top shows the last revision,
            and the full history is public in{' '}
            <a href={site.repo} target="_blank" rel="noreferrer noopener">
              the repository
            </a>
            .
          </p>

          <h2>Contact</h2>
          <p>
            Reach us through{' '}
            <a
              href={`${site.repo}/issues`}
              target="_blank"
              rel="noreferrer noopener"
            >
              our issue tracker
            </a>
            .
          </p>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
