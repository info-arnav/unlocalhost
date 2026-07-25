import type { Metadata } from 'next';
import { CopyBlock } from '@/components/copy-block';
import { FloatingNav } from '@/components/nav/floating-nav';
import { SiteFooter } from '@/components/site-footer';
import { site } from '@/lib/site';
import styles from '../prose.module.css';

export const metadata: Metadata = {
  title: 'Docs',
  description:
    'Set up unlocalhost by asking your coding agent to do it, then deploy with one sentence.',
  alternates: { canonical: '/docs' },
};

const mcpConfig = `{
  "mcpServers": {
    "unlocalhost": {
      "command": "npx",
      "args": ["-y", "@unlocalhost/unlocalhost"]
    }
  }
}`;

export default function DocsPage() {
  return (
    <>
      <FloatingNav />

      <main id="main" className={`wrap ${styles.page}`}>
        <header className={styles.head}>
          <span className="eyebrow">Docs</span>
          <h1 className={styles.title}>
            You do not install this. Your agent does.
          </h1>
          <p className={styles.updated}>
            Three sentences, and you never touch a config file
          </p>
        </header>

        <div className={styles.body}>
          <h2>1. Ask your agent to set it up</h2>
          <p>
            Paste this into whatever agent you already have open. It will add
            unlocalhost, restart itself if it needs to, and tell you when it is
            ready.
          </p>

          <CopyBlock
            tone="say"
            label="say this to your agent"
            value={`Read ${site.origin}/install and set up unlocalhost for me`}
          />

          <div className={styles.callout}>
            <p>
              That page is written for agents rather than people. Yours will
              fetch it, work out which config file to edit, and do it.
            </p>
          </div>

          <h3>If you would rather do it yourself</h3>
          <p>Claude Code, in your terminal:</p>
          <CopyBlock value="claude mcp add unlocalhost -- npx -y @unlocalhost/unlocalhost" />

          <p>Cursor, Windsurf, and everything else, in your MCP config file:</p>
          <CopyBlock value={mcpConfig} />

          <h2>2. Sign in, once</h2>
          <p>
            Ask your agent to sign in. It shows a short code, you approve it in
            the browser, and that machine is signed in for good.
          </p>
          <CopyBlock
            tone="say"
            label="say this"
            value="sign in to unlocalhost"
          />
          <p>
            You sign in with GitHub, and you will be asked to let us read the
            repositories you want to deploy. Read only, and only the ones you
            pick.
          </p>

          <h2>3. Deploy</h2>
          <p>
            Say what to ship and who is allowed in. Your agent creates the
            repository, pushes with your own git credentials, and asks us to
            build it.
          </p>
          <CopyBlock
            tone="say"
            label="say this"
            value="deploy this and let sarah@gmail.com in"
          />
          <p>
            You get a link like <code>sarahs-todo.{site.baseDomain}</code>.
            Sarah opens it, signs in, and lands in your app. Everyone else is
            turned away before your code runs.
          </p>

          <h2>Changing who has access</h2>
          <p>Say it in words. Removing someone takes effect immediately.</p>
          <CopyBlock
            tone="say"
            label="say this"
            value={`also let mike@example.com into the todo app\nremove sarah from the todo app`}
          />

          <h2>Environment variables</h2>
          <p>
            Never commit a <code>.env</code> file. We scan every deploy and
            refuse to publish anything with a secret in it. Tell your agent to
            pass the values instead, and they are encrypted at rest and injected
            into your app when it builds.
          </p>

          <h2>When something breaks</h2>
          <p>
            Ask for the logs. Your agent can read the build output, find the
            problem, fix the code, and deploy again without you reading a stack
            trace.
          </p>
          <CopyBlock
            tone="say"
            label="say this"
            value="the todo app failed to build, check the logs and fix it"
          />

          <h2>Run it yourself</h2>
          <p>
            unlocalhost is MIT licensed and the whole platform runs from one
            compose file on a single server. Point the package at your own
            instance with an environment variable.
          </p>
          <CopyBlock value="UNLOCALHOST_URL=https://api.yourdomain.com npx @unlocalhost/unlocalhost" />
          <p>
            The full setup guide lives in the{' '}
            <a href={site.repo} target="_blank" rel="noreferrer noopener">
              repository
            </a>
            .
          </p>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
