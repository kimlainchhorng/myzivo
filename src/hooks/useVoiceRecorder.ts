/**
 * useVoiceRecorder — Hold-to-record voice notes with waveform sampling
 */
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

export interface VoiceRecording {
  blob: Blob;
  durationMs: number;
  waveform: number[];
  mimeType: string;
}

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const stream = useRef<MediaStream | null>(null);
  const startedAt = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafId = useRef<number | null>(null);
  const samples = useRef<number[]>([]);
  const audioCtx = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const sampleTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelled = useRef(false);

  const stopAll = useCallback(() => {
    if (timer.current) { clearInterval(timer.current); timer.current = null; }
    if (rafId.current !== null) { cancelAnimationFrame(rafId.current); rafId.current = null; }
    if (sampleTimer.current) { clearInterval(sampleTimer.current); sampleTimer.current = null; }
    stream.current?.getTracks().forEach((t) => t.stop());
    audioCtx.current?.close().catch(() => {});
    stream.current = null;
    audioCtx.current = null;
    analyser.current = null;
  }, []);

  const start = useCallback(async () => {
    try {
      cancelled.current = false;
      chunks.current = [];
      samples.current = [];
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = s;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const rec = new MediaRecorder(s, { mimeType });
      recorder.current = rec;
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunks.current.push(e.data); };
      rec.start(100);

      // Waveform sampling
      const ctx = new AudioContext();
      audioCtx.current = ctx;
      const src = ctx.createMediaStreamSource(s);
      const an = ctx.createAnalyser();
      an.fftSize = 256;
      src.connect(an);
      analyser.current = an;
      const buf = new Uint8Array(an.frequencyBinCount);
      sampleTimer.current = setInterval(() => {
        an.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / buf.length);
        samples.current.push(Math.min(1, rms * 2));
      }, 80);

      startedAt.current = Date.now();
      setIsRecording(true);
      setElapsedMs(0);
      // Smooth rAF tick — paints from frame 1 instead of waiting 100ms.
      const tick = () => {
        setElapsedMs(Date.now() - startedAt.current);
        rafId.current = requestAnimationFrame(tick);
      };
      rafId.current = requestAnimationFrame(tick);
    } catch (e) {
      toast.error("Microphone permission denied");
      stopAll();
    }
  }, [stopAll]);

  const stop = useCallback(async (): Promise<VoiceRecording | null> => {
    return new Promise((resolve) => {
      const rec = recorder.current;
      if (!rec || rec.state === "inactive") {
        stopAll();
        setIsRecording(false);
        resolve(null);
        return;
      }
      rec.onstop = () => {
        const duration = Date.now() - startedAt.current;
        const mimeType = rec.mimeType;
        const blob = new Blob(chunks.current, { type: mimeType });
        // Downsample waveform to 64 bins
        const src = samples.current;
        const bins = 64;
        const out: number[] = [];
        if (src.length > 0) {
          const step = src.length / bins;
          for (let i = 0; i < bins; i++) {
            const start = Math.floor(i * step);
            const end = Math.max(start + 1, Math.floor((i + 1) * step));
            let m = 0;
            for (let j = start; j < end && j < src.length; j++) m = Math.max(m, src[j]);
            out.push(Number(m.toFixed(3)));
          }
        }
        stopAll();
        setIsRecording(false);
        if (cancelled.current) {
          setAudioBlob(null);
          setDuration(0);
          setDurationMs(0);
          resolve(null);
        } else {
          setAudioBlob(blob);
          setDuration(Math.floor(duration / 1000));
          setDurationMs(duration);
          resolve({ blob, durationMs: duration, waveform: out, mimeType });
        }
      };
      rec.stop();
    });
  }, [stopAll]);

  const cancel = useCallback(async () => {
    cancelled.current = true;
    await stop();
    setAudioBlob(null);
    setDuration(0);
    setDurationMs(0);
  }, [stop]);

  const pause = useCallback(() => {
    const rec = recorder.current;
    if (rec && rec.state === "recording") {
      try { rec.pause(); } catch { /* noop */ }
      if (rafId.current !== null) { cancelAnimationFrame(rafId.current); rafId.current = null; }
    }
  }, []);

  const resume = useCallback(() => {
    const rec = recorder.current;
    if (rec && rec.state === "paused") {
      try { rec.resume(); } catch { /* noop */ }
      const baseElapsed = elapsedMs;
      const resumedAt = Date.now();
      const tick = () => {
        setElapsedMs(baseElapsed + (Date.now() - resumedAt));
        rafId.current = requestAnimationFrame(tick);
      };
      rafId.current = requestAnimationFrame(tick);
    }
  }, [elapsedMs]);

  const clearBlob = useCallback(() => {
    setAudioBlob(null);
    setDuration(0);
    setDurationMs(0);
  }, []);

  return {
    isRecording,
    elapsedMs,
    audioBlob,
    duration,
    durationMs,
    start,
    stop,
    cancel,
    pause,
    resume,
    clearBlob,
    // Legacy aliases used by PersonalChat / GroupChat
    startRecording: start,
    stopRecording: stop,
    cancelRecording: cancel,
    pauseRecording: pause,
    resumeRecording: resume,
  };
}
