import { SOUNDS } from '../constants';

const audioCache: Record<string, HTMLAudioElement> = {};

// Preload sounds
Object.entries(SOUNDS).forEach(([key, src]) => {
  const audio = new Audio(src);
  audioCache[key] = audio;
});

export const playSound = (soundKey: keyof typeof SOUNDS) => {
  const audio = audioCache[soundKey];
  if (audio) {
    // Clone node allows overlapping sounds (rapid fire)
    const clone = audio.cloneNode() as HTMLAudioElement;
    clone.volume = 0.5; // Reasonable volume
    clone.play().catch(e => console.warn("Audio play blocked", e));
  }
};