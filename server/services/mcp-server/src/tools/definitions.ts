import { z } from 'zod';

export const deployInput = {
  repoFullName: z
    .string()
    .regex(/^[\w.-]+\/[\w.-]+$/, 'owner/repo')
    .describe(
      "The GitHub repository you just pushed, as owner/repo. You must create and push this repository yourself using the user's own git credentials before calling this tool.",
    ),
  emails: z
    .array(z.string())
    .optional()
    .describe(
      'Email addresses allowed to open the app. Everyone else is blocked.',
    ),
  branch: z
    .string()
    .optional()
    .describe('Branch to deploy. Defaults to the repo default.'),
  env: z
    .record(z.string(), z.string())
    .optional()
    .describe(
      'Environment variables from the local .env file. Pass them here — never commit .env to the repository.',
    ),
};

export const shareInput = {
  appId: z.string().describe('The app id returned by deploy or list.'),
  emails: z.array(z.string()).describe('Email addresses to grant access to.'),
};

export const unshareInput = {
  appId: z.string().describe('The app id returned by deploy or list.'),
  emails: z
    .array(z.string())
    .describe('Email addresses to revoke access from.'),
};

export const logsInput = {
  appId: z.string().describe('The app id returned by deploy or list.'),
  lines: z
    .number()
    .optional()
    .describe('How many log lines to return. Default 200.'),
};
