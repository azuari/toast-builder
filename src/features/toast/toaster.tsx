"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import { useToast } from "./use-toast";
import { Toast } from "./toast-item";
import { dismissToast } from "./store";

const positions = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
] as const;

const subscribeToMount = () => () => {};
const getClientMountSnapshot = () => true;
const getServerMountSnapshot = () => false;

const stackClasses: Record<(typeof positions)[number], string> = {
  "top-left": "left-4 top-4 items-start",
  "top-center": "left-1/2 top-4 -translate-x-1/2 items-center",
  "top-right": "right-4 top-4 items-end",
  "bottom-left": "bottom-4 left-4 items-start",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center",
  "bottom-right": "bottom-4 right-4 items-end",
};

export function Toaster() {
  const { toasts } = useToast();
  const mounted = useSyncExternalStore(subscribeToMount, getClientMountSnapshot, getServerMountSnapshot);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      const latest = [...toasts].reverse().find((toast) => toast.status === "visible");
      if (latest) {
        dismissToast(latest.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toasts]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-50">
      {positions.map((position) => {
        const stack = toasts.filter((toast) => toast.position === position);
        if (!stack.length) return null;

        return (
          <div key={position} className={`pointer-events-none absolute flex flex-col gap-3 ${stackClasses[position]}`}>
            {stack.map((toast) => (
              <Toast key={toast.id} toast={toast} />
            ))}
          </div>
        );
      })}
    </div>,
    document.body,
  );
}
