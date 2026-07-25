import Link from 'next/link';
import { Breakout } from '@/components/breakout';
import { FloatingNav } from '@/components/nav/floating-nav';
import { Refusal } from '@/components/refusal';
import { SiteFooter } from '@/components/site-footer';
import { site } from '@/lib/site';
import styles from './page.module.css';

const faq = [
  {
    q: 'How do I share localhost with a friend?',
    a: 'Tell your coding agent to deploy it and name who should get in. You get back a real link, and only the people you named can open it after signing in with GitHub or Google.',
  },
  {
    q: 'Is this an ngrok alternative with authentication?',
    a: 'Yes. A tunnel gives you a public address anyone with the link can open, and it dies when you close your laptop. unlocalhost gives you a permanent link with a sign in wall in front of it.',
  },
  {
    q: 'Do I have to write any login code?',
    a: 'No. Sign in is handled before a request ever reaches your app, so your code never sees an unauthorised visitor.',
  },
  {
    q: 'What access do you get to my GitHub?',
    a: 'Read only, and only for the repositories you choose. Your agent pushes code with your own credentials. We never hold write access to anything.',
  },
  {
    q: 'Can I run it on my own server?',
    a: 'Yes. It is MIT licensed and the whole platform runs from one compose file on a single machine.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
};

export default function Home() {
  return (
    <>
      <FloatingNav />

      <main id="main" className={styles.main}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c'),
          }}
        />

        <section className={`wrap ${styles.hero}`}>
          <h1 className={styles.h1}>
            un<em>localhost</em> your app
          </h1>

          <p className={styles.lede}>
            Your agent can build the whole thing. It still cannot host it. Say
            one sentence and get a real link with sign in already in front of
            it, so only the people you name can open it.
          </p>

          <div className={styles.ctaRow}>
            <Link className={styles.primary} href="/docs">
              Start sharing
            </Link>
            <Link className={styles.secondary} href="#how">
              See how it works
            </Link>
          </div>

          <p className={styles.metrics}>
            <span>
              <i />
              MIT licensed
            </span>
            <span>
              <i />
              Self hostable
            </span>
            <span>
              <i />
              No auth code to write
            </span>
          </p>
        </section>

        <section className="wrap" style={{ paddingBottom: '96px' }}>
          <Breakout />
        </section>

        <section className={`wrap ${styles.section}`} id="why">
          <div className={styles.head}>
            <span className="eyebrow">The gap</span>
            <h2 className={styles.h2}>
              Hosting is the one part your agent cannot do for you
            </h2>
            <p className={styles.sub}>
              It writes the app, fixes the bugs, and explains the code. Then it
              stops, because putting something online needs a server, a domain,
              a certificate, and a login system. So people reach for whatever is
              fastest, and that is where things go wrong.
            </p>
          </div>

          <div className={styles.stall}>
            <article className={styles.stallItem}>
              <span className={styles.stallTag}>What usually happens</span>
              <h3>The link goes out with no lock on it</h3>
              <p>
                A public URL with no sign in means anyone who sees it can read
                what is inside. Pasted into a group chat, it travels further
                than you meant.
              </p>
            </article>
            <article className={styles.stallItem}>
              <span className={styles.stallTag}>What usually happens</span>
              <h3>Keys end up in the repository</h3>
              <p>
                An API key committed by accident is public the moment the repo
                is. Bots scan for exactly this, and they find it in minutes.
              </p>
            </article>
            <article className={styles.stallItem}>
              <span className={styles.stallTag}>What usually happens</span>
              <h3>Login gets bolted on at the end</h3>
              <p>
                Auth written in a hurry, by someone who has never written auth,
                guarding real data. It usually looks fine and usually is not.
              </p>
            </article>
          </div>
        </section>

        <section className={`wrap ${styles.section}`} id="security">
          <div className={styles.head}>
            <span className="eyebrow">Security</span>
            <h2 className={styles.h2}>
              We would rather block your deploy than publish your keys
            </h2>
          </div>

          <div className={styles.proof}>
            <div className={styles.proofCopy}>
              <h3>Every deploy is read before it runs</h3>
              <p>
                We scan the code for committed secrets first. If we find an env
                file or something shaped like a key, the deploy stops and tells
                you which file to fix. Nothing goes online.
              </p>
              <p>
                Sign in is checked at the edge, before a request reaches your
                app, so there is no auth for you to write and none for you to
                get wrong. Access starts when you name someone and ends the
                moment you remove them.
              </p>
            </div>
            <Refusal />
          </div>
        </section>

        <section className={`wrap ${styles.section}`} id="how">
          <div className={styles.head}>
            <span className="eyebrow">How it works</span>
            <h2 className={styles.h2}>
              Sign in with GitHub, then say the sentence
            </h2>
            <p className={styles.sub}>
              Three steps, once. Everything after that is a sentence to the
              agent you already have open.
            </p>
          </div>

          <div className={styles.steps}>
            <article className={styles.step}>
              <div className={styles.stepNum}>Step 1</div>
              <h3>Connect once</h3>
              <p>
                Add unlocalhost to your coding agent and sign in with GitHub in
                the browser. One visit, and you never do it again.
              </p>
            </article>
            <article className={styles.step}>
              <div className={styles.stepNum}>Step 2</div>
              <h3>Say who gets in</h3>
              <p>
                Tell the agent to deploy it and name the email addresses
                allowed. It pushes the code using your own git access, not ours.
              </p>
            </article>
            <article className={styles.step}>
              <div className={styles.stepNum}>Step 3</div>
              <h3>Send the link</h3>
              <p>
                Your friend opens it, signs in with GitHub or Google, and lands
                in your app. Everyone else is turned away at the door.
              </p>
            </article>
          </div>
        </section>

        <section className={`wrap ${styles.section}`} id="faq">
          <div className={styles.head}>
            <span className="eyebrow">Questions</span>
            <h2 className={styles.h2}>Straight answers</h2>
          </div>

          <div className={styles.faqList}>
            {faq.map((item) => (
              <article className={styles.faqItem} key={item.q}>
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.closing}>
          <div className={`wrap ${styles.closingInner}`}>
            <h2 className={styles.h2}>Ship the thing you already built</h2>
            <p className={styles.sub}>
              It is running on your machine right now. Give it an address and a
              guest list.
            </p>
            <div className={styles.ctaRow}>
              <Link className={styles.primary} href="/docs">
                Read the setup guide
              </Link>
              <a
                className={styles.secondary}
                href={site.repo}
                target="_blank"
                rel="noreferrer noopener"
              >
                View the source
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
