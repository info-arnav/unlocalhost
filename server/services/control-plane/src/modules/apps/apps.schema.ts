import { z } from 'zod';

const emailList = z.array(z.email()).min(1).max(100);

export const createAppSchema = z.object({
  name: z.string().min(1).max(64),
  repoFullName: z.string().min(3).max(140).optional(),
  repoUrl: z.url().optional(),
  emails: emailList.optional(),
});

export const shareSchema = z.object({ emails: emailList });

export const appIdParamSchema = z.object({ id: z.uuid() });

export type CreateAppBody = z.infer<typeof createAppSchema>;
export type ShareBody = z.infer<typeof shareSchema>;
