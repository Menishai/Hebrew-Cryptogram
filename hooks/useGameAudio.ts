
import { useCallback } from 'react';

type SoundType = 'correct' | 'wrong' | 'win' | 'letter-complete' | 'hint' | 'undo' | 'locked';

export const useGameAudio = (soundEnabled: boolean) => {
  const playSound = useCallback((type: SoundType) => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      
      const playTone = (freq: number, startTime: number, duration: number, vol: number, type: OscillatorType = 'sine') => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(vol, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      if (type === 'correct') { playTone(523.25, now, 0.15, 0.1); } 
      else if (type === 'undo') { playTone(392.00, now, 0.1, 0.1); playTone(329.63, now + 0.05, 0.1, 0.1); } 
      else if (type === 'hint') { playTone(440, now, 0.1, 0.1); playTone(880, now + 0.1, 0.2, 0.1); } 
      else if (type === 'letter-complete') { playTone(523.25, now, 0.2, 0.1); playTone(659.25, now + 0.05, 0.2, 0.1); playTone(783.99, now + 0.1, 0.3, 0.1); } 
      else if (type === 'wrong') { playTone(130.81, now, 0.3, 0.1, 'sawtooth'); } 
      else if (type === 'locked') { playTone(110, now, 0.2, 0.1, 'square'); } 
      else if (type === 'win') { playTone(523.25, now, 0.5, 0.1, 'triangle'); playTone(659.25, now, 0.5, 0.1, 'triangle'); playTone(783.99, now, 0.5, 0.1, 'triangle'); playTone(1046.50, now, 0.6, 0.1, 'triangle'); }
    } catch (e) { console.warn("Audio Context failed", e); }
  }, [soundEnabled]);

  return playSound;
};
