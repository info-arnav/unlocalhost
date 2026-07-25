#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadConfig } from './config.js';

const config = loadConfig();

const server = new McpServer({
  name: 'unlocalhost',
  version: '0.0.1',
});

server.registerTool(
  'unlocalhost_status',
  {
    title: 'unlocalhost status',
    description:
      'Report which unlocalhost instance this MCP is pointed at and whether it is authenticated.',
    inputSchema: {},
  },
  async () => ({
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            instance: config.UNLOCALHOST_URL,
            authenticated: config.UNLOCALHOST_TOKEN !== undefined,
          },
          null,
          2,
        ),
      },
    ],
  }),
);

await server.connect(new StdioServerTransport());
