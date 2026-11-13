"use client";

import { CircleCheck, CircleX, Info, TriangleAlert, X } from "lucide-react";
import { useEffect } from "react";

import { cn } from "@/lib/cn";

import { dismissToast, dispatchToastAction } from "./store";
import type { ToastAnimation, ToastItem } from "./types";

const iconMap = {
  success: CircleCheck,
  error: CircleX,
  warning: TriangleAlert,
  info: Info,
};

// Full class names so Tailwind can see them.
const enterAnimationClass: Record<ToastAnimation, string> = {
  fade: "animate-toast-fade-in",
  slide: "animate-toast-slide-in",
  bounce: "animate-toast-bounce-in",
};

export function Toast({ toast }: { toast: ToastItem }) {
  const Icon = iconMap[toast.type];
  const urgent = toast.type === "error" || toast.type === "warning";

  // Auto-dismiss. Hover/focus pauses the toast; the store keeps `remaining` up to date.
  useEffect(() => {
    if (toast.persistent || toast.paused || toast.status !== "visible") {
      return;
    }

    const timer = window.setTimeout(() => dismissToast(toast.id), Math.max(toast.remaining, 0));
    return () => window.clearTimeout(timer);
  }, [toast.id, toast.persistent, toast.paused, toast.status, toast.remaining]);

  return (
    <div
      role={urgent ? "alert" : "status"}
      aria-live={urgent ? "assertive" : "polite"}
      className={cn(
        "pointer-events-auto w-80 max-w-full overflow-hidden rounded-xl shadow-lg ring-1 ring-black/5 will-change-transform",
        toast.status === "exiting" ? "animate-toast-fade-out" : enterAnimationClass[toast.animation],
      )}
      style={{ backgroundColor: toast.backgroundColor, color: toast.textColor }}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget && toast.status === "exiting") {
          dispatchToastAction({ type: "REMOVE", id: toast.id });
        }
      }}
      onMouseEnter={() => {
        dispatchToastAction({ type: "PAUSE", id: toast.id, now: Date.now() });
      }}
      onMouseLeave={() => {
        dispatchToastAction({ type: "RESUME", id: toast.id, now: Date.now() });
      }}
      onFocus={() => {
        dispatchToastAction({ type: "PAUSE", id: toast.id, now: Date.now() });
      }}
      onBlur={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
          return;
        }
        dispatchToastAction({ type: "RESUME", id: toast.id, now: Date.now() });
      }}
    >
      <div className="flex items-start gap-3 p-4">
        {toast.showIcon ? (
          <div className="mt-0.5 shrink-0 rounded-full bg-white/20 p-1.5" aria-hidden="true">
            <Icon className="h-4 w-4" />
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          {toast.title ? <p className="text-sm font-bold leading-5">{toast.title}</p> : null}
          {toast.message ? <p className="mt-0.5 text-xs leading-4 opacity-90">{toast.message}</p> : null}
        </div>

        {toast.showCloseButton ? (
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => dismissToast(toast.id)}
            className="-mr-1 -mt-1 shrink-0 rounded-full p-1 transition-colors hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {!toast.persistent ? (
        <div className="h-1 overflow-hidden bg-black/10" aria-hidden="true">
          <div
            className="h-full w-full origin-left bg-white/70"
            style={{
              // Fixed total length; a negative delay starts the bar where the remaining time says it should be.
              animation: `toast-progress ${Math.max(toast.duration, 1)}ms linear forwards`,
              animationDelay: `-${Math.max(toast.duration - toast.remaining, 0)}ms`,
              animationPlayState: toast.paused ? "paused" : "running",
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
