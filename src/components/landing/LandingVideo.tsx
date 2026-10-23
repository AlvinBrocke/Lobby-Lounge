"use client";

import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

type Props = { src: string; poster: string; label: string; className?: string };

// Muted loop that only plays while on screen (browsers only autoplay muted video).
export const LandingVideo = ({ src, poster, label, className = "" }: Props) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = ref.current;
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? video.play().catch(() => {}) : video.pause()),
      { threshold: 0.4 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  const toggleSound = () => {
    const video = ref.current;
    setMuted((m) => !m);
    // Reduced-motion viewers never autoplay, so the sound button also starts playback.
    if (video?.paused) video.play().catch(() => {});
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-ll-navy ${className}`}>
      <video
        ref={ref}
        src={src}
        poster={poster}
        muted={muted}
        loop
        playsInline
        preload="none"
        aria-label={label}
        className="block aspect-video w-full"
      />
      <button
        type="button"
        onClick={toggleSound}
        aria-label={muted ? "Turn sound on" : "Turn sound off"}
        className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        {muted ? <VolumeX className="h-4 w-4" aria-hidden /> : <Volume2 className="h-4 w-4" aria-hidden />}
      </button>
    </div>
  );
};
