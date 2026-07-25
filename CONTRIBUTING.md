# Contributing to unlocalhost

Thanks for your interest in contributing! unlocalhost turns localhost into a shareable,
authenticated link — deploy + auth + MCP in one open-source, self-hostable product.

## Repository layout

| Path | What it is |
|---|---|
| `web/` | Landing page, sign in screens, docs |
| `server/gateway/` | Public API ingress: CORS, rate limiting, request ids |
| `server/services/auth-gate/` | OAuth, sessions, and the allowlist check on every request |
| `server/services/control-plane/` | Apps, sharing, GitHub App, deploy pipeline |
| `server/services/activator/` | Wakes sleeping apps, sleeps idle ones |
| `server/services/mcp-server/` | The `unlocalhost` npm package your agent talks to |
| `server/shared/` | Database, logging, crypto, errors, sessions, security |
| `deploy/` | Compose stack, Caddyfile, env, secrets |
| `docs/` | Internal notes, gitignored |

## Getting started

Everything is one npm workspace, so a single install covers the frontend and
every backend service.

```bash
git clone https://github.com/info-arnav/unlocalhost.git
cd unlocalhost
npm install
npm run build
```

Copy `deploy/.env.example` to `deploy/.env` to configure local values. Never commit real
credentials — `.env` files are gitignored and a pre-commit hook enforces it.

Useful commands:

```bash
npm run dev                    # the Next.js site
npm run build                  # shared first, then every workspace
npm run typecheck
npm run lint
npm run db:generate            # after changing the Drizzle schema
npm run db:migrate
```

## How to contribute

1. **Open an issue first** for anything non-trivial — bugs, features, design questions.
   For small fixes (typos, obvious bugs) a direct PR is fine.
2. **Fork and branch** from `main`. Use a descriptive branch name (`fix/auth-gate-redirect`,
   `feat/mcp-share-tool`).
3. **Follow conventional commits**: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`.
   Commit messages are linted.
4. **Keep PRs focused** — one concern per PR. Small PRs get reviewed fast; large mixed PRs
   stall.
5. **Lint before pushing**: `npm run lint`. CI must pass before merge.

## Code guidelines

- One concern per file. Organize by domain (`modules/auth/`), not by type.
- **Every backend module uses the same layering**: `x.routes.ts` (paths only) →
  `x.controller.ts` (HTTP in/out) → `x.service.ts` (business logic) → `x.repository.ts`
  (data access), with `x.schema.ts` holding the Zod schemas. Controllers never query the
  database; services never touch `req`/`res`.
- **No HTML in backend services.** User-facing pages live in `web/`; services redirect to
  `WEB_ORIGIN`.
- **No comments.** Code should explain itself through naming and structure. If something
  needs a comment, rename or restructure it instead.
- **No test files.** This project verifies changes by running them, not by test suites.
  Please don't add test frameworks or test scripts.
- No speculative abstractions — build for the current scope.
- Validate at system boundaries (user input, external APIs); trust internal code.
- Security is part of every change: parameterize queries, treat all external input as
  untrusted, check authn/authz on every new endpoint, never log secrets.

## Security-sensitive areas

Changes to `auth-gate`, session handling, allowlist checks, secret routing, or MCP token
handling get extra review scrutiny. If your change touches these, call it out explicitly in
the PR description. Never send security vulnerabilities as public PRs/issues — see
[SECURITY.md](SECURITY.md).

## Code of conduct

By participating you agree to our [Code of Conduct](CODE_OF_CONDUCT.md).
