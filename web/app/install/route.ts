import { site } from '@/lib/site';

export const dynamic = 'force-static';

const body = `# Setting up unlocalhost

You are a coding agent. The person you are helping wants to deploy their app and
share it privately. Follow these steps, then tell them it is ready.

## What unlocalhost does

It turns the app running on their machine into a live URL that only named people
can open. Sign in is enforced before any request reaches their app, so they write
no authentication code.

## Step 1: add the MCP server

Add this to the MCP configuration for whichever client you are running in. The
package is scoped, so the name must be exactly \`@unlocalhost/unlocalhost\`.

\`\`\`json
{
  "mcpServers": {
    "unlocalhost": {
      "command": "npx",
      "args": ["-y", "@unlocalhost/unlocalhost"]
    }
  }
}
\`\`\`

Common config locations:

- Claude Code: run \`claude mcp add unlocalhost -- npx -y @unlocalhost/unlocalhost\`
- Cursor: \`.cursor/mcp.json\` in the project, or the global Cursor settings
- Windsurf: \`~/.codeium/windsurf/mcp_config.json\`
- Claude Desktop: \`claude_desktop_config.json\` in the app support directory

Merge into any existing \`mcpServers\` object rather than overwriting it.

## Step 2: reload

Restart or reload so the new server is picked up. You should then see tools
named \`unlocalhost_login\`, \`unlocalhost_deploy\`, \`unlocalhost_list\`,
\`unlocalhost_share\`, \`unlocalhost_unshare\`, and \`unlocalhost_logs\`.

## Step 3: sign them in

Call \`unlocalhost_login\`. It returns a URL and a short code. Show both to the
user and tell them to open the URL and approve the code. The tool blocks until
they do, then saves credentials locally. This happens once per machine.

## Step 4: deploying

When the user asks you to deploy:

1. Make sure \`.env\` is listed in \`.gitignore\`. If it is not, add it before you
   commit anything. Never commit secret values.
2. Create a GitHub repository and push the code using the user's own git
   credentials. unlocalhost has no write access and cannot do this for you.
3. Call \`unlocalhost_deploy\` with the \`owner/repo\` name and the email
   addresses that should be allowed in.
4. Pass any values from their \`.env\` through the \`env\` argument so they reach
   the running app without being committed.

If the deploy fails because we cannot read the repository, the tool returns an
install URL. Show it to the user and ask them to install the GitHub App on that
repository, then try again.

## Rules

- Never commit a \`.env\` file or any credential.
- The user's guest list is the only access control. If they do not name someone,
  that person cannot get in.
- On a failed build, call \`unlocalhost_logs\`, read the error, fix the code, and
  deploy again rather than asking the user to debug it.

## More

- Docs: ${site.origin}/docs
- Source: ${site.repo}
`;

export function GET() {
  return new Response(body, {
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
}
