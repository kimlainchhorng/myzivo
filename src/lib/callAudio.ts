type StopTone = () => void;

interface ToneStep {
  frequency: number | null;
  duration: number;
}

let audioContext: AudioContext | null = null;

function getCallAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  // If the old context was closed, discard it
  if (audioContext && audioContext.state === "closed") {
    audioContext = null;
  }

  if (audioContext) return audioContext;

  const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtor) return null;

  audioContext = new AudioCtor();
  return audioContext;
}

export async function primeCallAudio() {
  const ctx = getCallAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state === "suspended" || ctx.state === "interrupted" as any) {
      await ctx.resume();
    }

    // Play a tiny silent buffer to fully unlock on iOS
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = ctx.createBuffer(1, 1, 22050);
    gain.gain.value = 0.0001;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(0);
    source.onended = () => {
      try { source.disconnect(); } catch {}
      try { gain.disconnect(); } catch {}
    };
  } catch {}
}

export function registerCallAudioUnlock() {
  if (typeof window === "undefined") return () => {};

  const unlock = () => { void primeCallAudio(); };

  // Use capture phase so we catch gestures before anything else
  window.addEventListener("pointerup", unlock, { capture: true, passive: true });
  window.addEventListener("touchend", unlock, { capture: true, passive: true });
  window.addEventListener("click", unlock, { capture: true, passive: true });
  window.addEventListener("keydown", unlock, { capture: true, passive: true });

  // Try immediately (works if page already had interaction)
  unlock();

  return () => {
    window.removeEventListener("pointerup", unlock, { capture: true } as any);
    window.removeEventListener("touchend", unlock, { capture: true } as any);
    window.removeEventListener("click", unlock, { capture: true } as any);
    window.removeEventListener("keydown", unlock, { capture: true } as any);
  };
}

function playTonePattern(steps: ToneStep[], volume: number): StopTone {
  const ctx = getCallAudioContext();
  if (!ctx) {
    console.warn("[callAudio] No AudioContext available");
    return () => {};
  }

  // Ensure context is running
  if (ctx.state !== "running") {
    void ctx.resume().catch(() => {});
  }

  const gainNode = ctx.createGain();
  gainNode.gain.value = volume;
  gainNode.connect(ctx.destination);

  let stopped = false;
  let currentOsc: OscillatorNode | null = null;
  let timeout: number | null = null;

  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      if (stopped) { resolve(); return; }
      timeout = window.setTimeout(resolve, ms);
    });

  const playStep = (step: ToneStep) =>
    new Promise<void>((resolve) => {
      if (stopped) { resolve(); return; }

      if (step.frequency === null) {
        timeout = window.setTimeout(resolve, step.duration);
        return;
      }

      // Re-check context state before each tone
      if (ctx.state !== "running") {
        void ctx.resume().catch(() => {});
      }

      const osc = ctx.createOscillator();
      currentOsc = osc;
      osc.type = "sine";
      osc.frequency.value = step.frequency;
      osc.connect(gainNode);
      osc.start();

      timeout = window.setTimeout(() => {
        try { osc.stop(); } catch {}
        try { osc.disconnect(); } catch {}
        if (currentOsc === osc) currentOsc = null;
        resolve();
      }, step.duration);
    });

  const loop = async () => {
    // Wait up to 3s for audio context to become running
    for (let i = 0; i < 12 && !stopped; i++) {
      if (ctx.state === "running") break;
      void ctx.resume().catch(() => {});
      await wait(250);
    }

    if (stopped || ctx.state !== "running") {
      console.warn("[callAudio] AudioContext never reached running state:", ctx.state);
      return;
    }

    while (!stopped) {
      for (const step of steps) {
        await playStep(step);
        if (stopped) return;
      }
    }
  };

  void loop();

  return () => {
    stopped = true;
    if (timeout) clearTimeout(timeout);
    try { currentOsc?.stop(); } catch {}
    try { currentOsc?.disconnect(); } catch {}
    try { gainNode.disconnect(); } catch {}
  };
}

/**
 * Classic telephone ring — two-tone "BRRING" repeated with pauses.
 */
export function playIncomingRingtone(): StopTone {
  return playTonePattern(
    [
      { frequency: 440, duration: 200 },
      { frequency: 480, duration: 200 },
      { frequency: 440, duration: 200 },
      { frequency: 480, duration: 200 },
      { frequency: null, duration: 200 },
      { frequency: 440, duration: 200 },
      { frequency: 480, duration: 200 },
      { frequency: 440, duration: 200 },
      { frequency: 480, duration: 200 },
      { frequency: null, duration: 2000 },
    ],
    0.35,
  );
}

/**
 * Caller ringback — standard single-tone "ring…ring" pattern.
 */
export function playOutgoingRingback(): StopTone {
  return playTonePattern(
    [
      { frequency: 440, duration: 800 },
      { frequency: null, duration: 400 },
      { frequency: 440, duration: 800 },
      { frequency: null, duration: 2800 },
    ],
    0.18,
  );
}
