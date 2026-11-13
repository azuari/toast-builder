import { describe, expect, it } from "vitest";

import { DEFAULT_OPTIONS_BY_TYPE } from "./constants";
import { toastReducer } from "./store";
import type { ToastItem } from "./types";

const createToast = (id: string, position: ToastItem["position"]): ToastItem => ({
  ...DEFAULT_OPTIONS_BY_TYPE.info,
  id,
  title: "Info",
  message: "Sample",
  duration: 3000,
  persistent: false,
  position,
  backgroundColor: "#3b82f6",
  textColor: "#ffffff",
  showIcon: true,
  showCloseButton: true,
  animation: "fade",
  createdAt: 0,
  remaining: 3000,
  paused: false,
  status: "visible",
  lastUpdatedAt: 1000,
});

describe("toastReducer", () => {
  it("adds a toast", () => {
    const next = toastReducer([], { type: "ADD", toast: createToast("toast-1", "top-right") });
    expect(next).toHaveLength(1);
    expect(next[0]?.id).toBe("toast-1");
  });

  it("evicts the oldest toast at a position when there are more than five", () => {
    const toasts = Array.from({ length: 5 }, (_, index) =>
      createToast(`toast-${index + 1}`, "top-right"),
    );

    const next = toastReducer(toasts, {
      type: "ADD",
      toast: createToast("toast-6", "top-right"),
    });

    expect(next).toHaveLength(5);
    expect(next.every((toast) => toast.id !== "toast-1")).toBe(true);
  });

  it("caps toasts per scope and position independently", () => {
    const scoped = (id: string, scope?: string): ToastItem => ({
      ...createToast(id, "top-right"),
      scope,
    });
    const preview = Array.from({ length: 5 }, (_, index) => scoped(`p-${index}`, "preview"));

    const next = toastReducer(preview, { type: "ADD", toast: scoped("page-1") });

    expect(next).toHaveLength(6);
    expect(next.filter((toast) => toast.scope === "preview")).toHaveLength(5);
  });

  it("dismisses a toast and bumps it into exiting state", () => {
    const next = toastReducer([createToast("toast-1", "top-right")], {
      type: "DISMISS",
      id: "toast-1",
    });

    expect(next[0]?.status).toBe("exiting");
  });

  it(" pauses and resumes remaining time correctly", () => {
    const paused = toastReducer([createToast("toast-1", "top-right")], {
      type: "PAUSE",
      id: "toast-1",
      now: 1500,
    });

    expect(paused[0]?.remaining).toBe(2500);
    expect(paused[0]?.paused).toBe(true);

    const resumed = toastReducer(paused, {
      type: "RESUME",
      id: "toast-1",
      now: 2500,
    });

    expect(resumed[0]?.paused).toBe(false);
    expect(resumed[0]?.lastUpdatedAt).toBe(2500);
  });
});
