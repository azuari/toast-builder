import * as React from "react";

import { cn } from "@/lib/cn";

interface SegmentedControlProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

export function SegmentedControl({ value, onChange, options }: SegmentedControlProps) {
  return (
    <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-900">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          className={cn(
            "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
            value === option
              ? "bg-white text-violet-700 shadow-sm dark:bg-slate-800 dark:text-violet-300"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
