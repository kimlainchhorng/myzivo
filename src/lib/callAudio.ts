type StopTone = () => void;

const SAMPLE_RATE = 22050;
const INCOMING_RINGTONE_SRC = createToneDataUrl([
  { frequency: 440, durationMs: 200 },
  { frequency: 480, durationMs: 200 },
  { frequency: 440, durationMs: 200 },
  { frequency: 480, durationMs: 200 },
  { frequency: null, durationMs: 200 },
  { frequency: 440, durationMs: 200 },
  { frequency: 480, durationMs: 200 },
  { frequency: 440, durationMs: 200 },
  { frequency: 480, durationMs: 200 },
  { frequency: null, durationMs: 2000 },
]);

const OUTGOING_RINGBACK_SRC = createToneDataUrl([
  { frequency: 440, durationMs: 800 },
  { frequency: null, durationMs: 400 },
  { frequency: 440, durationMs: 800 },
  { frequency: null, durationMs: 2800 },
]);

let incomingAudio: HTMLAudioElement | null = null;
let outgoingAudio: HTMLAudioElement | null = null;
let primeRegistered = false;
let incomingArmed = false;
let outgoingArmed = false;
let incomingRequested = false;
let outgoingRequested = false;

interface ToneSegment {
  frequency: number | null;
  durationMs: number;
}

function clampSample(value: number) {
  return Math.max(-1, Math.min(1, value));
}

function createToneDataUrl(segments: ToneSegment[]) {
  const totalSamples = segments.reduce((sum, segment) => sum + Math.floor((segment.durationMs / 1000) * SAMPLE_RATE), 0);
  const pcm = new Int16Array(totalSamples);

  let offset = 0;
  for (const segment of segments) {
    const segmentSamples = Math.floor((segment.durationMs / 1000) * SAMPLE_RATE);
    for (let i = 0; i < segmentSamples; i += 1) {
      const attack = Math.min(1, i / (SAMPLE_RATE * 0.01));
      const release = Math.min(1, (segmentSamples - i) / (SAMPLE_RATE * 0.01));
      const envelope = Math.min(attack, release);
      const sample = segment.frequency
        ? Math.sin((2 * Math.PI * segment.frequency * i) / SAMPLE_RATE) * 0.45 * envelope
        : 0;
      pcm[offset + i] = Math.floor(clampSample(sample) * 32767);
    }
    offset += segmentSamples;
  }

  const wavBytes = encodeWav(pcm, SAMPLE_RATE);
  return `data:audio/wav;base64,${bytesToBase64(wavBytes)}`;
}

function encodeWav(samples: Int16Array, sampleRate: number) {
  const dataLength = samples.length * 2;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataLength, true);

  for (let i = 0; i < samples.length; i += 1) {
    view.setInt16(44 + i * 2, samples[i], true);
  }

  return new Uint8Array(buffer);
}

function writeString(view: DataView, offset: number, value: string) {
  for (let i = 0; i < value.length; i += 1) {
    view.setUint8(offset + i, value.charCodeAt(i));
  }
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createLoopingAudio(src: string) {
  const audio = new Audio(src);
  audio.loop = true;
  audio.preload = "auto";
  audio.setAttribute("playsinline", "true");
  audio.setAttribute("webkit-playsinline", "true");
  return audio;
}

function getIncomingAudio() {
  if (!incomingAudio) incomingAudio = createLoopingAudio(INCOMING_RINGTONE_SRC);
  return incomingAudio;
}

function getOutgoingAudio() {
  if (!outgoingAudio) outgoingAudio = createLoopingAudio(OUTGOING_RINGBACK_SRC);
  return outgoingAudio;
}

async function armAudioElement(audio: HTMLAudioElement) {
  audio.pause();
  audio.currentTime = 0;
  audio.muted = true;
  await audio.play();
}

async function primeIncomingAudio() {
  try {
    const audio = getIncomingAudio();
    await armAudioElement(audio);
    incomingArmed = true;
    if (incomingRequested) {
      audio.currentTime = 0;
      audio.muted = false;
    }
  } catch {
    incomingArmed = false;
  }
}

async function primeOutgoingAudio() {
  try {
    const audio = getOutgoingAudio();
    await armAudioElement(audio);
    outgoingArmed = true;
    if (outgoingRequested) {
      audio.currentTime = 0;
      audio.muted = false;
    }
  } catch {
    outgoingArmed = false;
  }
}

export async function primeCallAudio() {
  await Promise.all([primeIncomingAudio(), primeOutgoingAudio()]);
}

export function registerCallAudioUnlock() {
  if (typeof window === "undefined") return () => {};
  if (primeRegistered) return () => {};

  const unlock = () => {
    void primeCallAudio();
  };

  primeRegistered = true;
  window.addEventListener("pointerdown", unlock, { capture: true, passive: true });
  window.addEventListener("touchstart", unlock, { capture: true, passive: true });
  window.addEventListener("click", unlock, { capture: true, passive: true });
  window.addEventListener("keydown", unlock, { capture: true, passive: true });

  return () => {};
}

function resetLoop(audio: HTMLAudioElement) {
  audio.muted = true;
  audio.currentTime = 0;
}

function startLoop(audio: HTMLAudioElement) {
  audio.currentTime = 0;
  audio.muted = false;
}

function stopLoop(audio: HTMLAudioElement, clearRequested: () => void): StopTone {
  return () => {
    clearRequested();
    resetLoop(audio);
  };
}

export function playIncomingRingtone(): StopTone {
  const audio = getIncomingAudio();
  incomingRequested = true;

  if (!incomingArmed) {
    console.warn("[callAudio] Incoming ringtone not armed yet");
    void primeIncomingAudio();
    return stopLoop(audio, () => { incomingRequested = false; });
  }

  startLoop(audio);
  return stopLoop(audio, () => { incomingRequested = false; });
}

export function playOutgoingRingback(): StopTone {
  const audio = getOutgoingAudio();
  outgoingRequested = true;

  if (!outgoingArmed) {
    console.warn("[callAudio] Outgoing ringback not armed yet");
    void primeOutgoingAudio();
    return stopLoop(audio, () => { outgoingRequested = false; });
  }

  startLoop(audio);
  return stopLoop(audio, () => { outgoingRequested = false; });
}
