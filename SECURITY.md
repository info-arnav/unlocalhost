# Security Policy

unlocalhost handles OAuth flows, user secrets (`.env` values), and runs user code in
containers. We take security reports seriously.

## Reporting a vulnerability

**Do not open a public issue for security vulnerabilities.**

Report privately via [GitHub Security Advisories](https://github.com/info-arnav/unlocalhost/security/advisories/new).

Include, where possible:

- A description of the vulnerability and its impact
- Steps to reproduce
- Affected component (`control-plane`, `auth-gate`, `mcp-server`, `activator`, `web`)

You can expect an acknowledgement within 72 hours and a status update within 7 days.

## Scope

Especially interested in:

- Auth-gate bypasses (accessing an app without being on its allowlist)
- Session/cookie handling flaws across the shared parent domain
- Secret leakage (`.env` values reaching a repo, logs, or another user's app)
- Container escape or cross-app access on the host
- MCP token scope escalation (a per-user token reaching platform-level access)

## Supported versions

Only the latest release receives security fixes.
