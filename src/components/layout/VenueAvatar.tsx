import { cn } from "@/lib/utils";

/** Initials of a venue name, e.g. "Purple Spoon" → "PS". */
export function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** The venue's uploaded logo, or its initials on the brand colour. Size comes from `className`. */
export function VenueAvatar({ name, logoUrl, className }: { name: string; logoUrl?: string | null; className?: string }) {
  return logoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={logoUrl} alt={`${name} logo`} className={cn("object-cover bg-white", className)} />
  ) : (
    <span
      aria-hidden
      className={cn("bg-primary text-primary-foreground font-black flex items-center justify-center", className)}
    >
      {initialsOf(name)}
    </span>
  );
}
