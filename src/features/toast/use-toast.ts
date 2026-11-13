"use client";

import { useSyncExternalStore } from "react";

import { getToastSnapshot, subscribeToToasts } from "./store";

export function useToast() {
  const toasts = useSyncExternalStore(
    (listener) => subscribeToToasts(listener),
    getToastSnapshot,
    getToastSnapshot,
  );

  return { toasts };
}
