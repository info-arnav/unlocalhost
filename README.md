<div align="center">

<img src="web/public/unlocalhost.png" alt="unlocalhost" width="88" />

# unlocalhost

**Turn localhost into a link only the people you name can open.**

Sign in is built in, so you write no auth code and touch no servers.

[Website](https://www.unlocalhost.tech) · [Docs](https://www.unlocalhost.tech/docs) · MIT licensed · Self hostable

</div>

---

## The problem

Your coding agent can write the whole application. It cannot host it, because
hosting needs a server, a domain, a certificate, and a login system. So people
reach for whatever is fastest, and that is where things go wrong: a public URL
with no sign in, an API key committed by accident, or auth bolted on at the end
by someone who has never written auth.

unlocalhost closes that gap. You say one sentence to the agent you already have
open, and you get back a real URL with a guest list in front of it.

```
you    deploy this and let sarah@gmail.com in

agent  pushed your code to a private repo
agent  building
agent  live at sarahs-todo.unlocalhost.tech
agent  sarah@gmail.com can sign in and open it
```

## How it works

1. You add unlocalhost to your coding agent as an MCP server and sign in once
   with GitHub.
2. You tell the agent to deploy, and name who is allowed in.
3. **Your agent pushes the code using your own git credentials.** unlocalhost
   never holds write access to anything.
4. We clone read only, scan for committed secrets and refuse to continue if we
   find any, then build and run it.
5. Visitors sign in with GitHub or Google. Their verified email is checked
   against the guest list before the request ever reaches your app.

## What makes it different

|                         | Tunnel (ngrok)      | Platform (Vercel)   | unlocalhost          |
| ----------------------- | ------------------- | ------------------- | -------------------- |
| Survives closing laptop | No                  | Yes                 | Yes                  |
| Private by default      | No                  | No                  | **Yes**              |
| Auth you have to write  | All of it           | All of it           | **None**             |
| Runs on your own server | No                  | No                  | **Yes**              |

## Quick start

```bash
claude mcp add unlocalhost -- npx -y unlocalhost
```

Or in any MCP client config:

```json
{
  "mcpServers": {
    "unlocalhost": {
      "command": "npx",
      "args": ["-y", "unlocalhost"]
    }
  }
}
```

Then ask your agent to sign in to unlocalhost, and deploy.

## Self hosting

The hosted service runs this exact code. Nothing is held back, there is no
phone home, and no license check.

```bash
git clone https://github.com/info-arnav/unlocalhost.git
cd unlocalhost/deploy
cp .env.example .env      # fill it in
docker compose --env-file .env run --rm migrate
docker compose --env-file .env up -d
```

You need a domain with wildcard DNS, a DNS provider API token for wildcard TLS,
a GitHub App, and a Google OAuth client. The full walkthrough is in
[`docs/server-setup.md`](docs/server-setup.md).

## Architecture

```
internet :443 → Caddy → auth-gate /verify → activator → Dokku → your app
```

| Package                        | Job                                                          |
| ------------------------------ | ------------------------------------------------------------ |
| `web`                          | Landing page, sign in screens, docs                          |
| `server/gateway`               | Public API ingress, CORS, rate limiting, request ids          |
| `server/services/auth-gate`    | OAuth, sessions, and the allowlist check on every request     |
| `server/services/control-plane`| Apps, sharing, GitHub App, deploy pipeline                    |
| `server/services/activator`    | Wakes sleeping apps, puts idle ones back to sleep             |
| `server/services/mcp-server`   | The `unlocalhost` npm package your agent talks to             |
| `server/shared`                | Database, logging, crypto, errors, sessions                   |

Borrowed rather than built: [Dokku](https://dokku.com) and
[Nixpacks](https://nixpacks.com) turn a repository into a running container,
[Caddy](https://caddyserver.com) handles wildcard TLS. The novel part is small
on purpose.

## Security

- Apps are private until you name someone. Removing them revokes access at once.
- Every deploy is scanned for committed secrets and refused if any are found.
- Sign in is enforced at the edge, before a request reaches your app.
- Environment variables are encrypted at rest with AES 256 GCM.
- We hold read only access, and only to repositories you pick.

Found a vulnerability? Please follow [`SECURITY.md`](SECURITY.md) rather than
opening a public issue.

## Contributing

Read [`CONTRIBUTING.md`](CONTRIBUTING.md) first. In short: every backend module
follows `routes → controller → service → repository`, code carries no comments,
and there are no test files. Verification is done by running things.

## Licence

MIT. See [`LICENSE`](LICENSE).
