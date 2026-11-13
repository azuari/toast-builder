import { createId } from "@/lib/id";

import { DEFAULT_TOAST_OPTIONS } from "./constants";
import type { ToastItem, ToastOptions } from "./types";

export type ToastAction =
  | { type: "ADD"; toast: ToastItem }
  | { type: "DISMISS"; id: string }
  | { type: "REMOVE"; id: string }
  | { type: "PAUSE"; id: string; now: number }
  | { type: "RESUME"; id: string; now: number }
  | { type: "DISMISS_ALL" }
  | { type: "SYNC"; toasts: ToastItem[] };

export const MAX_TOASTS_PER_POSITION = 5;

const listeners = new Set<() => void>();
let state: ToastItem[] = [];

export function toastReducer(stateList: ToastItem[], action: ToastAction): ToastItem[] {
  switch (action.type) {
    case "ADD": {
      const next = [...stateList, action.toast];
      const grouped = new Map<string, ToastItem[]>();

      for (const toast of next) {
        const key = `${toast.scope ?? ""}:${toast.position}`;
        const existing = grouped.get(key) ?? [];
        existing.push(toast);
        grouped.set(key, existing);
      }

      const kept: ToastItem[] = [];

      for (const items of grouped.values()) {
        const ordered = [...items].sort((a, b) => a.createdAt - b.createdAt);
        const eligible = ordered.slice(-MAX_TOASTS_PER_POSITION);
        kept.push(...eligible);
      }

      return kept.sort((a, b) => a.createdAt - b.createdAt);
    }
    case "DISMISS": {
      return stateList.map((toast) =>
        toast.id === action.id ? { ...toast, paused: true, status: "exiting" } : toast,
      );
    }
    case "REMOVE": {
      return stateList.filter((toast) => toast.id !== action.id);
    }
    case "PAUSE": {
      return stateList.map((toast) => {
        if (toast.id !== action.id || toast.paused) {
          return toast;
        }

        const elapsed = Math.max(0, action.now - toast.lastUpdatedAt);
        const remaining = Math.max(0, toast.remaining - elapsed);

        return {
          ...toast,
          remaining,
          paused: true,
          lastUpdatedAt: action.now,
        };
      });
    }
    case "RESUME": {
      return stateList.map((toast) => {
        if (toast.id !== action.id || !toast.paused) {
          return toast;
        }

        return {
          ...toast,
          paused: false,
          lastUpdatedAt: action.now,
        };
      });
    }
    case "DISMISS_ALL": {
      return stateList.map((toast) => ({ ...toast, paused: true, status: "exiting" }));
    }
    case "SYNC": {
      return action.toasts;
    }
    default:
      return stateList;
  }
}

export function createToastItem(options: ToastOptions, scope?: string): ToastItem {
  const now = Date.now();

  return {
    ...options,
    scope,
    id: createId(),
    createdAt: now,
    remaining: options.persistent ? 0 : options.duration,
    paused: false,
    status: "visible",
    lastUpdatedAt: now,
  };
}

export function getToastSnapshot() {
  return state;
}

export function subscribeToToasts(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function dispatchToastAction(action: ToastAction) {
  const nextState = toastReducer(state, action);
  if (nextState === state) {
    return;
  }

  state = nextState;
  for (const listener of [...listeners]) {
    listener();
  }
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function dismissToast(id: string) {
  dispatchToastAction({
    type: prefersReducedMotion() ? "REMOVE" : "DISMISS",
    id,
  });
}

export function dismissAllToasts() {
  if (prefersReducedMotion()) {
    clearToasts();
    return;
  }

  dispatchToastAction({ type: "DISMISS_ALL" });
}

export function clearToasts() {
  if (state.length === 0) {
    return;
  }

  state = [];
  for (const listener of [...listeners]) {
    listener();
  }
}

export function addToast(options: ToastOptions, scope?: string) {
  const toast = createToastItem(options, scope);
  dispatchToastAction({ type: "ADD", toast });
  return toast.id;
}

export function ensureDefaultToastOptions(input: Partial<ToastOptions> = {}): ToastOptions {
  return {
    ...DEFAULT_TOAST_OPTIONS,
    ...input,
    type: input.type ?? DEFAULT_TOAST_OPTIONS.type,
    position: input.position ?? DEFAULT_TOAST_OPTIONS.position,
    animation: input.animation ?? DEFAULT_TOAST_OPTIONS.animation,
  };
}
