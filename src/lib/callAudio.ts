type StopTone = () => void;

interface ToneStep {
  frequency: number | null;
  duration: number;
}

let audioContext: AudioContext | null = null;
let unlockCleanup: (() => void) | null = null;

function getCallAudioContext() {
  if (typeof window === "undefined") return null;
  if (audioContext) return audioContext;

  const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtor) return null;

  audioContext = new AudioCtor();
  return audioContext;
}

function warmCallAudioContext(ctx: AudioContext) {
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();

  source.buffer = ctx.createBuffer(1, 1, 22050);
  gain.gain.value = 0.0001;
  source.connect(gain);
  gain.connect(ctx.destination);
  source.start(0);

  source.onended = () => {
    try {
      source.disconnect();
    } catch {}
    try {
      gain.disconnect();
    } catch {}
  };
}

export async function primeCallAudio() {
  const ctx = getCallAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state !== "running") {
      await ctx.resume();
    }

    warmCallAudioContext(ctx);
  } catch {}
}

export function registerCallAudioUnlock() {
  if (typeof window === "undefined") return () => {};
  if (unlockCleanup) return unlockCleanup;

  const unlock = async () => {
    await primeCallAudio();

    if (getCallAudioContext()?.state === "running") {
      unlockCleanup?.();
    }
  };

  const cleanup = () => {
    window.removeEventListener("pointerup", unlock);
    window.removeEventListener("touchend", unlock);
    window.removeEventListener("keydown", unlock);
    unlockCleanup = null;
  };

  unlockCleanup = cleanup;

  window.addEventListener("pointerup", unlock, { passive: true });
  window.addEventListener("touchend", unlock, { passive: true });
  window.addEventListener("keydown", unlock);

  void unlock();

  return cleanup;
}

function playTonePattern(steps: ToneStep[], volume: number): StopTone {
  const ctx = getCallAudioContext();
  if (!ctx) return () => {};

  const gainNode = ctx.createGain();
  gainNode.gain.value = volume;
  gainNode.connect(ctx.destination);

  let stopped = false;
  let currentOsc: OscillatorNode | null = null;
  let timeout: ReturnType<typeof window.setTimeout> | null = null;

  const playStep = (step: ToneStep) =>
    new Promise<void>((resolve) => {
      if (stopped) {
        resolve();
        return;
      }

      if (step.frequency === null) {
        timeout = window.setTimeout(resolve, step.duration);
        return;
      }

      const osc = ctx.createOscillator();
      currentOsc = osc;
      osc.type = "sine";
      osc.frequency.value = step.frequency;
      osc.connect(gainNode);
      osc.start();

      timeout = window.setTimeout(() => {
        try {
          osc.stop();
        } catch {}
        try {
          osc.disconnect();
        } catch {}
        if (currentOsc === osc) currentOsc = null;
        resolve();
      }, step.duration);
    });

  const waitForAudio = async () => {
    while (!stopped) {
      await primeCallAudio();
      if (ctx.state === "running") return true;
      await new Promise<void>((resolve) => {
        timeout = window.setTimeout(resolve, 250);
      });
    }

    return false;
  };

  const loop = async () => {
    const ready = await waitForAudio();
    if (!ready || stopped) return;

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

    try {
      currentOsc?.stop();
    } catch {}
    try {
      currentOsc?.disconnect();
    } catch {}
    try {
      gainNode.disconnect();
    } catch {}
  };
}

export function playIncomingRingtone() {
  return playTonePattern(
    [
      { frequency: 440, duration: 400 },
      { frequency: null, duration: 100 },
      { frequency: 480, duration: 400 },
      { frequency: null, duration: 1500 },
    ],
    0.3,
  );
}

export function playOutgoingRingback() {
  return playTonePattern(
    [
      { frequency: 440, duration: 1000 },
      { frequency: null, duration: 3000 },
    ],
    0.15,
  );
}
