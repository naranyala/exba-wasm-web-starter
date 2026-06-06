import { z } from 'zod';

export const HLIRSchema = z.union([
  z.object({ type: z.literal('UIUpdate'), target_screen: z.string(), state: z.string() }),
  z.object({ type: z.literal('SystemNotification'), level: z.string(), msg: z.string() }),
  z.object({ type: z.literal('ExternalLink'), url: z.string(), target: z.string() }),
]);

export const LLIRSchema = z.union([
  z.object({ type: z.literal('UpdateText'), id: z.string(), text: z.string() }),
  z.object({ type: z.literal('SetAttribute'), id: z.string(), attr: z.string(), value: z.string() }),
  z.object({ type: z.literal('TriggerEvent'), id: z.string(), event: z.string() }),
  z.object({ type: z.literal('Log'), message: z.string() }),
  z.object({ type: z.literal('Anomaly'), code: z.string(), details: z.string() }),
]);

export const IRBundleSchema = z.object({
  version: z.string(),
  hlir: HLIRSchema.nullable(),
  llir: z.array(LLIRSchema),
});

export type HLIR = z.infer<typeof HLIRSchema>;
export type LLIR = z.infer<typeof LLIRSchema>;

export interface IRBundle {
  version: string;
  hlir: HLIR | null;
  llir: LLIR[];
}
