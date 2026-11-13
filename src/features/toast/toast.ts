import { DEFAULT_OPTIONS_BY_TYPE } from "./constants";
import { addToast, dismissAllToasts, dismissToast } from "./store";
import type { ToastOptions, ToastPosition, ToastType } from "./types";

export type ToastInput = Partial<ToastOptions> & {
  type?: ToastType;
  title?: string;
  message?: string;
  position?: ToastPosition;
};

function buildOptions(type: ToastType, input: ToastInput = {}): ToastOptions {
  const defaults = DEFAULT_OPTIONS_BY_TYPE[type];

  return {
    ...defaults,
    ...input,
    type,
    title: input.title ?? defaults.title,
    message: input.message ?? defaults.message,
    position: input.position ?? defaults.position,
    backgroundColor: input.backgroundColor ?? defaults.backgroundColor,
    textColor: input.textColor ?? defaults.textColor,
    showIcon: input.showIcon ?? defaults.showIcon,
    showCloseButton: input.showCloseButton ?? defaults.showCloseButton,
    animation: input.animation ?? defaults.animation,
  };
}

function notify(input: ToastInput = {}): string {
  const type = input.type ?? "info";
  const options = buildOptions(type, input);
  return addToast(options);
}

export const toast = Object.assign(notify, {
  success: (title: string, input: Partial<Omit<ToastOptions, "type" | "title">> & { message?: string } = {}) =>
    addToast(buildOptions("success", { ...input, title, message: input.message ?? "" })),
  error: (title: string, input: Partial<Omit<ToastOptions, "type" | "title">> & { message?: string } = {}) =>
    addToast(buildOptions("error", { ...input, title, message: input.message ?? "" })),
  warning: (title: string, input: Partial<Omit<ToastOptions, "type" | "title">> & { message?: string } = {}) =>
    addToast(buildOptions("warning", { ...input, title, message: input.message ?? "" })),
  info: (title: string, input: Partial<Omit<ToastOptions, "type" | "title">> & { message?: string } = {}) =>
    addToast(buildOptions("info", { ...input, title, message: input.message ?? "" })),
  dismiss: dismissToast,
  dismissAll: dismissAllToasts,
});

export type ToastApi = typeof toast;
