import { z } from 'zod';

export const pollSchema = z.object({ deviceCode: z.string().min(1) });

export const approveSchema = z.object({
  userCode: z.string().min(1).max(16),
  userId: z.uuid(),
});

export type PollBody = z.infer<typeof pollSchema>;
export type ApproveBody = z.infer<typeof approveSchema>;
