"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: number[];
  defaultValue?: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      value,
      defaultValue,
      min = 0,
      max = 100,
      step = 1,
      onValueChange,
      ...props
    },
    ref,
  ) => {
    const [localValue, setLocalValue] = React.useState(
      defaultValue ? defaultValue[0] : 0,
    );

    const currentValue = value ? value[0] : localValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVal = parseFloat(e.target.value);
      setLocalValue(newVal);
      if (onValueChange) {
        onValueChange([newVal]);
      }
    };

    const percentage = ((currentValue - min) / (max - min)) * 100;

    return (
      <div
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className,
        )}
      >
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={handleChange}
          ref={ref}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          {...props}
        />
        <div className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-secondary/50">
          <div
            className="absolute h-full bg-primary transition-all duration-100 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div
          className="absolute h-4 w-4 rounded-full border-2 border-primary bg-background ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-sm"
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
    );
  },
);

Slider.displayName = "Slider";

export { Slider };
