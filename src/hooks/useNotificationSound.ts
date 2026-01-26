import { useCallback, useRef } from "react";

type SoundType = "newTrip" | "newOrder" | "statusUpdate" | "alert";

// Sound frequencies and patterns for different notification types
const SOUND_CONFIGS: Record<SoundType, { frequencies: number[]; durations: number[]; type: OscillatorType }> = {
  newTrip: {
    frequencies: [523, 659, 784], // C5, E5, G5 - ascending major chord
    durations: [150, 150, 300],
    type: "sine"
  },
  newOrder: {
    frequencies: [440, 554, 659], // A4, C#5, E5 - ascending
    durations: [100, 100, 200],
    type: "triangle"
  },
  statusUpdate: {
    frequencies: [440, 523], // A4, C5
    durations: [100, 150],
    type: "sine"
  },
  alert: {
    frequencies: [880, 660, 880], // High attention-grabbing
    durations: [100, 100, 200],
    type: "square"
  }
};

export const useNotificationSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playSound = useCallback((type: SoundType) => {
    try {
      const ctx = getAudioContext();
      const config = SOUND_CONFIGS[type];
      
      let startTime = ctx.currentTime;
      
      config.frequencies.forEach((freq, index) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.type = config.type;
        oscillator.frequency.setValueAtTime(freq, startTime);
        
        // Envelope for smoother sound
        const duration = config.durations[index] / 1000;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
        
        startTime += duration;
      });
    } catch (error) {
      console.warn("Could not play notification sound:", error);
    }
  }, [getAudioContext]);

  const playNewTripSound = useCallback(() => playSound("newTrip"), [playSound]);
  const playNewOrderSound = useCallback(() => playSound("newOrder"), [playSound]);
  const playStatusUpdateSound = useCallback(() => playSound("statusUpdate"), [playSound]);
  const playAlertSound = useCallback(() => playSound("alert"), [playSound]);

  return {
    playSound,
    playNewTripSound,
    playNewOrderSound,
    playStatusUpdateSound,
    playAlertSound
  };
};
