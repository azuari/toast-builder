import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";

interface ColorFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  hint?: string;
}

export function ColorField({ id, label, value, onChange, invalid, hint }: ColorFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-12 cursor-pointer rounded-lg border border-slate-200 bg-transparent p-0 dark:border-slate-700"
        />
        <Input
          id={`${id}-hex`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn("max-w-[8rem]", invalid && "border-red-500 focus-visible:border-red-500")}
          aria-invalid={invalid || undefined}
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
      </div>
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
