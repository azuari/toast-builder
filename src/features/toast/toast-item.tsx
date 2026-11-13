"use client";

import { CircleCheck, CircleX, Info, TriangleAlert, X } from "lucide-react";

import { cn } from "@/lib/cn";

import { dismissToast, dispatchToastAction } from "./store";
import type { ToastItem } from "./types";

const iconMap = {
  success: CircleCheck,
  error: CircleX,
  warning: TriangleAlert,
  info: Info,
};

export function Toast({ toast, isPreview = false }: { toast: ToastItem; isPreview?: boolean }) {
  const Icon = iconMap[toast.type];
  const liveRole = isPreview ? undefined : toast.type === "error" || toast.type === "warning" ? "alert" : "status";
  const liveRegion = isPreview ? undefined : toast.type === "error" || toast.type === "warning" ? "assertive" : "polite";

  return (
    <div
      role={liveRole}
      aria-live={liveRegion}
      aria-hidden={isPreview ? true : undefined}
      className={cn(
        "pointer-events-auto w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/20 bg-white/95 text-slate-900 shadow-xl backdrop-blur-sm will-change-transform dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-100",
        toast.status === "exiting" && "animate-toast-fade-out",
      )}
      style={{
        backgroundColor: toast.backgroundColor,
        color: toast.textColor,
        animation:
          toast.status === "exiting"
            ? undefined
            : toast.animation === "slide"
              ? "toast-slide-in"
              : toast.animation === "bounce"
                ? "toast-bounce-in"
                : "toast-fade-in",
      }}
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
      onBlur={() => {
        dispatchToastAction({ type: "RESUME", id: toast.id, now: Date.now() });
      }}
    >
      <div className="flex items-start gap-3 p-4">
        {toast.showIcon ? (
          <div className="mt-0.5 rounded-full bg-white/15 p-1.5">
            <Icon className="h-4 w-4" />
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          {toast.title ? <p className="text-sm font-semibold leading-5">{toast.title}</p> : null}
          {toast.message ? <p className="mt-1 text-sm leading-5 opacity-90">{toast.message}</p> : null}
        </div>

        {toast.showCloseButton ? (
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => dismissToast(toast.id)}
            className="rounded-full p-1 transition-colors hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {!toast.persistent ? (
        <div className="h-1 overflow-hidden bg-black/10">
          <div
            className="h-full w-full rounded-full bg-white/80"
            style={{
              width: "100%",
              transformOrigin: "left center",
              animation: `toast-progress ${Math.max(toast.remaining, 200)}ms linear forwards`,
              animationPlayState: toast.paused ? "paused" : "running",
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
