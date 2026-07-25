import { site } from '@/lib/site';

export const dynamic = 'force-static';

const body = `# unlocalhost

> ${site.description}

unlocalhost turns an app running on a developer's own machine into a live URL
that only named people can open. Sign in is enforced before any request reaches
the app, so the developer writes no authentication code.

## Who it is for

People who build software with an AI coding agent such as Claude Code or Cursor.
The agent can write the whole application but cannot host it, because hosting
needs a server, a domain, a certificate, and a login system. unlocalhost closes
that gap.

## Setting it up

If you are an agent asked to set this up, fetch ${site.origin}/install for
instructions written for you. The npm package is @unlocalhost/unlocalhost.

## How it works

1. The developer asks their coding agent to set unlocalhost up. The agent adds
   it as an MCP server and signs them in once with GitHub.
2. They tell the agent to deploy, and name the email addresses allowed in.
3. The agent creates a repository and pushes the code using the developer's own
   git credentials. unlocalhost never holds write access.
4. unlocalhost clones the repository read only, scans it for committed secrets,
   refuses to continue if any are found, then builds and runs it.
5. Visitors sign in with GitHub or Google. Their verified email is checked
   against the guest list before the request reaches the app.

## How it differs from a tunnel

A tunnel such as ngrok gives a public address that anyone holding the link can
open, and it stops working when the developer closes their laptop. unlocalhost
gives a permanent address with an enforced guest list in front of it.

## How it differs from a hosting platform

Platforms such as Vercel, Netlify, and Render leave a deployment publicly
readable and leave authentication to the developer. unlocalhost makes private
the default and provides sign in as part of the platform.

## Licence and self hosting

MIT licensed. The entire platform runs from a single compose file on one
server, so anyone can operate their own instance. The hosted service at
${site.baseDomain} runs the same public code.

## Links

- Website: ${site.origin}
- Documentation: ${site.origin}/docs
- Source: ${site.repo}
`;

export function GET() {
  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
}
