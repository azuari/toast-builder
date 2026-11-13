import * as React from "react";

import { cn } from "@/lib/cn";

interface FieldProps {
  label: string;
  children: React.ReactNode;
  hint?: string;
  error?: string;
  className?: string;
}

export function Field({ label, children, hint, error, className }: FieldProps) {
  return (
    <label className={cn("block space-y-2", className)}>
      <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-slate-500 dark:text-slate-400">{hint}</span> : null}
      {error ? <span className="block text-xs text-red-600 dark:text-red-400">{error}</span> : null}
    </label>
  );
}
