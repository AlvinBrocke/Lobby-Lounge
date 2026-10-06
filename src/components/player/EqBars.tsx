import { cn } from "@/lib/utils";

/** Animated equaliser shown on whatever is currently playing. Freezes when paused. */
export function EqBars({
  playing = true,
  heights = [8, 14, 10, 13, 9],
  className,
}: {
  playing?: boolean;
  heights?: number[];
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn("inline-flex items-end gap-[1.5px]", !playing && "eq-bars-paused", className)}
    >
      {heights.map((h, i) => (
        <span key={i} className="eq-bar w-[2px]" style={{ height: h }} />
      ))}
    </span>
  );
}
