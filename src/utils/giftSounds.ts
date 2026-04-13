/**
 * Gift sound effects using Web Audio API
 * No external dependencies — generates coin/sparkle sounds procedurally
 */

let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

/** Play a coin/chime sound when a gift is sent */
export function playGiftSound(comboCount: number = 1) {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;

    // Base frequency rises with combo
    const baseFreq = 800 + Math.min(comboCount, 15) * 40;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    // Chime tone
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.1);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.4);

    // Sparkle overtone for combos ≥ 3
    if (comboCount >= 3) {
      const sparkle = ctx.createOscillator();
      sparkle.type = "triangle";
      sparkle.frequency.setValueAtTime(baseFreq * 2, now + 0.05);
      sparkle.frequency.exponentialRampToValueAtTime(baseFreq * 3, now + 0.2);
      const sparkleGain = ctx.createGain();
      sparkleGain.connect(ctx.destination);
      sparkleGain.gain.setValueAtTime(0.08, now + 0.05);
      sparkleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      sparkle.connect(sparkleGain);
      sparkle.start(now + 0.05);
      sparkle.stop(now + 0.35);
    }

    // Extra impact for combos ≥ 5
    if (comboCount >= 5) {
      const impact = ctx.createOscillator();
      impact.type = "square";
      impact.frequency.setValueAtTime(200, now);
      impact.frequency.exponentialRampToValueAtTime(100, now + 0.15);
      const impactGain = ctx.createGain();
      impactGain.connect(ctx.destination);
      impactGain.gain.setValueAtTime(0.06, now);
      impactGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      impact.connect(impactGain);
      impact.start(now);
      impact.stop(now + 0.15);
    }
  } catch {
    // Silent fail — audio not critical
  }
}

/** Play a premium gift fanfare */
export function playPremiumGiftSound() {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0, now + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.12, now + i * 0.12 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.5);
      osc.connect(gain);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.5);
    });
  } catch {
    // Silent fail
  }
}
