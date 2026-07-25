import { z } from 'zod';

export const deploySchema = z.object({
  repoFullName: z.string().regex(/^[\w.-]+\/[\w.-]+$/, 'Must be owner/repo'),
  branch: z.string().min(1).max(255).optional(),
  env: z.record(z.string(), z.string()).optional(),
  emails: z.array(z.email()).max(100).optional(),
});

export const logsQuerySchema = z.object({
  lines: z.coerce.number().int().min(1).max(1000).default(200),
});

export type DeployBody = z.infer<typeof deploySchema>;
