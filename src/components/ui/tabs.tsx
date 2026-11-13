import * as React from "react";

import { cn } from "@/lib/cn";

interface TabsProps {
  tabs: string[];
  value: string;
  onChange: (tab: string) => void;
}

export function Tabs({ tabs, value, onChange }: TabsProps) {
  return (
    <div className="flex gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
            value === tab
              ? "bg-white text-violet-700 shadow-sm dark:bg-slate-900 dark:text-violet-300"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100",
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
