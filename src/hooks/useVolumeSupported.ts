"use client";

import { useEffect, useState } from "react";

/**
 * False on iPad/iPhone, where `HTMLMediaElement.volume` is read-only and only
 * the hardware buttons change loudness. A feature test rather than user-agent
 * sniffing: iPadOS reports itself as a Mac, so the UA can't be trusted.
 * Starts true so the server render and first client render agree.
 */
export function useVolumeSupported() {
  const [supported, setSupported] = useState(true);
  useEffect(() => {
    const probe = new Audio();
    probe.volume = 0.5;
    setSupported(probe.volume === 0.5);
  }, []);
  return supported;
}
