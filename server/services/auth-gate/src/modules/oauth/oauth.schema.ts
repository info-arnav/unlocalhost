import { z } from 'zod';

export const providerParamSchema = z.object({
  provider: z.enum(['github', 'google']),
});

export const loginQuerySchema = z.object({
  returnTo: z.string().optional(),
});

export const callbackQuerySchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
});

export type ProviderParam = z.infer<typeof providerParamSchema>;
export type CallbackQuery = z.infer<typeof callbackQuerySchema>;

export const installCallbackSchema = z.object({
  code: z.string().min(1),
  installation_id: z.string().min(1),
});

export type InstallCallbackQuery = z.infer<typeof installCallbackSchema>;
