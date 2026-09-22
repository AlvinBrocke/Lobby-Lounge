import { ListMusic } from "lucide-react";
import { cn } from "@/lib/utils";

/** Square cover art, falling back to a branded placeholder when a playlist has none. */
export function PlaylistCover({
  src,
  alt,
  className,
  iconClassName = "w-10 h-10",
}: {
  src?: string;
  alt: string;
  className?: string;
  iconClassName?: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={cn("object-cover", className)} />
    );
  }
  return (
    <div
      aria-hidden
      className={cn(
        "flex items-center justify-center bg-gradient-to-br from-primary/25 via-primary/10 to-secondary",
        className,
      )}
    >
      <ListMusic className={cn("text-primary/70", iconClassName)} />
    </div>
  );
}
