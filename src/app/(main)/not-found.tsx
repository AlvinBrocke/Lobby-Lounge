import Link from "next/link";
import { Music } from "lucide-react";

export default function AppNotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center min-h-[60vh]">
      {/* Icon */}
      <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
        <Music className="w-6 h-6 text-primary" />
      </div>

      {/* Code */}
      <p
        className="text-[72px] font-bold leading-none text-primary mb-4"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        404
      </p>

      {/* Text */}
      <h1
        className="text-xl font-bold text-foreground mb-2"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        Page not found
      </h1>
      <p className="text-muted-foreground text-sm mb-8 max-w-xs">
        This page doesn&apos;t exist or you don&apos;t have access to it.
      </p>

      <Link
        href="/dashboard"
        className="px-5 py-2.5 bg-primary text-[#04201d] rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
