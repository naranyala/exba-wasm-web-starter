import { z } from 'zod';

// ─── XSS Protection ───────────────────────────────────────────
const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);
}

// ─── HLIR Schema ──────────────────────────────────────────────
export const HLIRSchema = z.union([
  z.object({
    type: z.literal('UIUpdate'),
    target_screen: z.string(),
    state: z.string(),
  }),
  z.object({
    type: z.literal('SystemNotification'),
    level: z.string(),
    msg: z.string(),
  }),
  z.object({
    type: z.literal('ExternalLink'),
    url: z.string(),
    target: z.string(),
  }),
]);

// ─── LLIR Schema ──────────────────────────────────────────────
export const LLIRSchema = z.union([
  z.object({ type: z.literal('UpdateText'), id: z.string(), text: z.string() }),
  z.object({
    type: z.literal('SetAttribute'),
    id: z.string(),
    attr: z.string(),
    value: z.string(),
  }),
  z.object({
    type: z.literal('TriggerEvent'),
    id: z.string(),
    event: z.string(),
  }),
  z.object({ type: z.literal('Log'), message: z.string() }),
  z.object({
    type: z.literal('Anomaly'),
    code: z.string(),
    details: z.string(),
  }),
]);

// ─── IR Bundle Schema ─────────────────────────────────────────
export const IRBundleSchema = z.object({
  version: z.string(),
  hlir: HLIRSchema.nullable(),
  llir: z.array(LLIRSchema),
});

export type HLIR = z.infer<typeof HLIRSchema>;
export type LLIR = z.infer<typeof LLIRSchema>;
export type IRBundle = z.infer<typeof IRBundleSchema>;
