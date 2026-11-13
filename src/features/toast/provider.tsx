"use client";

import { useEffect, type ReactNode } from "react";

import { clearToasts } from "./store";

export function ToastProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    return () => {
      clearToasts();
    };
  }, []);

  return <>{children}</>;
}
