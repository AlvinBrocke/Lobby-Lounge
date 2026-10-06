/**
 * Browser text-to-speech, used for "AI voice" announcements. Voices come from
 * the device's operating system, so the list differs between machines.
 */

import { speechPitch, speechRate } from "./announcements";

export function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** English voices available on this device. */
export function englishVoices(): SpeechSynthesisVoice[] {
  if (!speechSupported()) return [];
  return window.speechSynthesis.getVoices().filter((voice) => voice.lang.startsWith("en"));
}

/**
 * Speaks `text` and resolves when it finishes (or fails). If `voiceName`
 * isn't installed on this device, the browser's default voice is used.
 */
export function speak(
  text: string,
  opts: { voiceName?: string; pitch: number; speed: number; volume: number },
): { done: Promise<void>; cancel: () => void } {
  if (!speechSupported()) return { done: Promise.resolve(), cancel: () => {} };
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.pitch = speechPitch(opts.pitch);
  utterance.rate = speechRate(opts.speed);
  utterance.volume = opts.volume;
  const voice = englishVoices().find((v) => v.name === opts.voiceName);
  if (voice) utterance.voice = voice;

  const done = new Promise<void>((resolve) => {
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
  });
  synth.cancel();
  synth.speak(utterance);
  return { done, cancel: () => synth.cancel() };
}
