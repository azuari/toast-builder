import { z } from "zod";

export const toastTypeSchema = z.enum(["success", "error", "warning", "info"]);
export const toastPositionSchema = z.enum([
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
]);
export const toastAnimationSchema = z.enum(["fade", "slide", "bounce"]);

export const toastOptionsSchema = z.object({
  type: toastTypeSchema,
  title: z.string().max(60),
  message: z.string().max(200),
  duration: z.number().min(0).max(10000),
  persistent: z.boolean(),
  position: toastPositionSchema,
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  showIcon: z.boolean(),
  showCloseButton: z.boolean(),
  animation: toastAnimationSchema,
});

export const presetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(40),
  options: toastOptionsSchema,
  createdAt: z.string(),
});

export const presetsSchema = z.array(presetSchema);

export type ToastOptionsInput = z.infer<typeof toastOptionsSchema>;
export type PresetInput = z.infer<typeof presetSchema>;
