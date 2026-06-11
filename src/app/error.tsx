"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0A0E12] flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-md">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>

        {/* Code */}
        <p
          className="text-[88px] font-bold leading-none text-red-400"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          500
        </p>

        {/* Heading */}
        <div>
          <h1
            className="text-2xl font-bold text-white mb-2"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Something went wrong
          </h1>
          <p className="text-[#6C7783] text-sm leading-relaxed">
            An unexpected error occurred. Try refreshing — if it persists, come back shortly.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-2">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-[#4ECDC4] text-[#04201d] rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 bg-white/5 border border-white/10 text-white/70 rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
