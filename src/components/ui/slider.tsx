import * as React from "react";

import { cn } from "@/lib/cn";

export type SliderProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="range"
        className={cn(
          "h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-violet-600 dark:bg-slate-700",
          className,
        )}
        {...props}
      />
    );
  },
);

Slider.displayName = "Slider";
