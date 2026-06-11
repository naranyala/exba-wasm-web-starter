import { z } from 'zod';

// ─── XSS Protection ───────────────────────────────────────────
const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/**
 * Safely escapes characters in a string to prevent XSS attacks when rendering HTML.
 * @param str The raw input string.
 * @returns An HTML-safe escaped string.
 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);
}

/**
 * Zod schema for High-Level Intermediate Representation (HLIR) effects.
 * 
 * HLIR instructions handle system-level actions:
 * - UpdateState: Patches the global application state.
 * - Navigate: Changes the current route.
 * - Notify: Triggers a system notification.
 * - InvokeJS: Calls a globally defined JavaScript function.
 * - SyncData: Triggers a synchronization event.
 * - UIUpdate: Updates the state of a specific screen.
 */
export const HLIRSchema = z.union([
  z.object({
    type: z.literal('UpdateState'),
    payload: z.object({ patch: z.string() }),
  }),
  z.object({
    type: z.literal('Navigate'),
    payload: z.object({ path: z.string() }),
  }),
  z.object({
    type: z.literal('Notify'),
    payload: z.object({ level: z.string(), msg: z.string() }),
  }),
  z.object({
    type: z.literal('InvokeJS'),
    payload: z.object({ func: z.string(), args: z.any() }),
  }),
  z.object({
    type: z.literal('SyncData'),
    payload: z.object({ key: z.string() }),
  }),
  z.object({
    type: z.literal('UIUpdate'),
    target_screen: z.string(),
    state: z.string(),
  }),
]);

/**
 * Zod schema for Low-Level Intermediate Representation (LLIR) instructions.
 * 
 * LLIR instructions perform direct, granular DOM manipulations:
 * - UpdateText: Sets the textContent of an element.
 * - SetAttribute / RemoveAttribute: Modifies element attributes.
 * - AddClass / RemoveClass / ToggleClass: Modifies element CSS classes.
 * - SetStyle: Sets a specific CSS property.
 * - TriggerEvent: Dispatches a DOM event from an element.
 * - Log: Prints a message to the browser console.
 * - Anomaly: Reports an error or unusual state.
 */
export const LLIRSchema = z.union([
  z.object({ type: z.literal('UpdateText'), id: z.string(), text: z.string() }),
  z.object({
    type: z.literal('SetAttribute'),
    id: z.string(),
    attr: z.string(),
    value: z.string(),
  }),
  z.object({
    type: z.literal('RemoveAttribute'),
    id: z.string(),
    attr: z.string(),
  }),
  z.object({
    type: z.literal('AddClass'),
    id: z.string(),
    class: z.string(),
  }),
  z.object({
    type: z.literal('RemoveClass'),
    id: z.string(),
    class: z.string(),
  }),
  z.object({
    type: z.literal('ToggleClass'),
    id: z.string(),
    class: z.string(),
  }),
  z.object({
    type: z.literal('SetStyle'),
    id: z.string(),
    prop: z.string(),
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

/**
 * Zod schema for an IR Bundle.
 * 
 * A bundle contains a version identifier and lists of HLIR and LLIR instructions 
 * to be processed atomically by the `IRProcessor`.
 */
export const IRBundleSchema = z.object({
  version: z.string(),
  hlir: z.array(HLIRSchema).nullable(),
  llir: z.array(LLIRSchema),
});

/** Inferred TypeScript type for HLIR instructions */
export type HLIR = z.infer<typeof HLIRSchema>;
/** Inferred TypeScript type for LLIR instructions */
export type LLIR = z.infer<typeof LLIRSchema>;
/** Inferred TypeScript type for IR bundles */
export type IRBundle = z.infer<typeof IRBundleSchema>;
