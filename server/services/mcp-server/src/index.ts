#!/usr/bin/env node
import { createRequire } from 'node:module';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ApiClient } from './api/client.js';
import { DeviceLogin } from './api/device-login.js';
import { config, saveToken } from './config.js';
import {
  deployInput,
  logsInput,
  shareInput,
  unshareInput,
} from './tools/definitions.js';

const api = new ApiClient(config.instance, config.token);
const deviceLogin = new DeviceLogin(api);

const { version } = createRequire(import.meta.url)('../package.json') as {
  version: string;
};

const server = new McpServer({ name: 'unlocalhost', version });

function text(value: unknown) {
  return {
    content: [
      {
        type: 'text' as const,
        text:
          typeof value === 'string' ? value : JSON.stringify(value, null, 2),
      },
    ],
  };
}

function requireAuth(): string | null {
  if (api.authenticated) return null;

  return 'Not signed in to unlocalhost. Run the unlocalhost_login tool first, then retry.';
}

server.registerTool(
  'unlocalhost_login',
  {
    title: 'Sign in to unlocalhost',
    description:
      'Start a one-time browser sign-in. Show the user the returned URL and code, then wait — this tool blocks until they approve.',
    inputSchema: {},
  },
  async () => {
    const grant = await deviceLogin.start();
    const deadline = Date.now() + grant.expiresIn * 1000;

    while (Date.now() < deadline) {
      await new Promise((resolve) =>
        setTimeout(resolve, grant.interval * 1000),
      );

      const token = await deviceLogin.poll(grant.deviceCode);

      if (token) {
        api.setToken(token);
        saveToken(config.configPath, config.instance, token);

        return text(
          `Signed in. Credentials saved to ${config.configPath}. You can deploy now.`,
        );
      }
    }

    return text(
      `Sign-in timed out. Ask the user to visit ${grant.verificationUriComplete} and enter ${grant.userCode}, then run this tool again.`,
    );
  },
);

server.registerTool(
  'unlocalhost_deploy',
  {
    title: 'Deploy a repository',
    description:
      "Deploy a GitHub repository and get a private URL. IMPORTANT: before calling this, you must yourself create a GitHub repository and push the code using the user's own git credentials, and make sure .env is listed in .gitignore. Pass any .env values through the env argument instead of committing them. STORAGE: the deployed app gets a persistent disk at /app/data and an env var DATABASE_PATH set to /app/data/app.db. If the app stores data, use SQLite at process.env.DATABASE_PATH. There is no managed Postgres or MySQL, and anything written outside /app/data is lost on the next deploy.",
    inputSchema: deployInput,
  },
  async ({ repoFullName, emails, branch, env }) => {
    const unauthenticated = requireAuth();

    if (unauthenticated) return text(unauthenticated);

    try {
      const result = await api.request<Record<string, unknown>>('/v1/deploy', {
        method: 'POST',
        body: { repoFullName, emails, branch, env },
      });

      return text(result);
    } catch (error) {
      const installUrl = (error as { installUrl?: string }).installUrl;

      if (installUrl) {
        return text(
          `unlocalhost cannot read ${repoFullName} yet. Ask the user to install the GitHub App at ${installUrl}, then run this tool again.`,
        );
      }

      return text(`Deploy failed: ${(error as Error).message}`);
    }
  },
);

server.registerTool(
  'unlocalhost_list',
  {
    title: 'List deployed apps',
    description: 'List the apps this user has deployed, with URLs and status.',
    inputSchema: {},
  },
  async () => {
    const unauthenticated = requireAuth();

    if (unauthenticated) return text(unauthenticated);

    return text(await api.request('/v1/apps'));
  },
);

server.registerTool(
  'unlocalhost_share',
  {
    title: 'Share an app',
    description: 'Grant email addresses access to a deployed app.',
    inputSchema: shareInput,
  },
  async ({ appId, emails }) => {
    const unauthenticated = requireAuth();

    if (unauthenticated) return text(unauthenticated);

    return text(
      await api.request(`/v1/apps/${appId}/share`, {
        method: 'POST',
        body: { emails },
      }),
    );
  },
);

server.registerTool(
  'unlocalhost_unshare',
  {
    title: 'Revoke access to an app',
    description:
      'Remove email addresses from an app allowlist. Takes effect immediately.',
    inputSchema: unshareInput,
  },
  async ({ appId, emails }) => {
    const unauthenticated = requireAuth();

    if (unauthenticated) return text(unauthenticated);

    return text(
      await api.request(`/v1/apps/${appId}/unshare`, {
        method: 'POST',
        body: { emails },
      }),
    );
  },
);

server.registerTool(
  'unlocalhost_logs',
  {
    title: 'Read app logs',
    description:
      'Fetch runtime and build logs for an app. Use this to diagnose a failed deploy, then fix the code and deploy again.',
    inputSchema: logsInput,
  },
  async ({ appId, lines }) => {
    const unauthenticated = requireAuth();

    if (unauthenticated) return text(unauthenticated);

    const query = lines === undefined ? '' : `?lines=${lines}`;

    return text(await api.request(`/v1/apps/${appId}/logs${query}`));
  },
);

server.registerTool(
  'unlocalhost_status',
  {
    title: 'unlocalhost status',
    description:
      'Report which unlocalhost instance this MCP is pointed at and whether it is signed in.',
    inputSchema: {},
  },
  async () =>
    text({
      instance: config.instance,
      authenticated: api.authenticated,
      configPath: config.configPath,
    }),
);

await server.connect(new StdioServerTransport());
