import Link from "next/link";
import { Music } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0E12] flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#4ECDC4]/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-md">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#4ECDC4]/10 border border-[#4ECDC4]/20 flex items-center justify-center">
          <Music className="w-7 h-7 text-[#4ECDC4]" />
        </div>

        {/* Code */}
        <p
          className="text-[88px] font-bold leading-none text-[#4ECDC4]"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          404
        </p>

        {/* Heading */}
        <div>
          <h1
            className="text-2xl font-bold text-white mb-2"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Page not found
          </h1>
          <p className="text-[#6C7783] text-sm leading-relaxed">
            The track you&apos;re looking for doesn&apos;t exist or may have been moved.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-2">
          <Link
            href="/dashboard"
            className="px-5 py-2.5 bg-[#4ECDC4] text-[#04201d] rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 bg-white/5 border border-white/10 text-white/70 rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
