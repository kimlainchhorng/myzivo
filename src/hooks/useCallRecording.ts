/**
 * useCallRecording — Record calls with consent tracking
 */
import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseCallRecordingOptions {
  callHistoryId?: string;
  userId: string;
}

export function useCallRecording({ callHistoryId, userId }: UseCallRecordingOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [consentGiven, setConsentGiven] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const startRecording = useCallback(async (localStream: MediaStream, remoteStream: MediaStream) => {
    if (isRecording) return;

    try {
      // Create AudioContext to mix local + remote audio
      const ctx = new AudioContext();
      const dest = ctx.createMediaStreamDestination();
      
      const localSource = ctx.createMediaStreamSource(localStream);
      localSource.connect(dest);
      
      const remoteSource = ctx.createMediaStreamSource(remoteStream);
      remoteSource.connect(dest);

      // Add video track if available
      const videoTrack = remoteStream.getVideoTracks()[0] || localStream.getVideoTracks()[0];
      const combinedStream = new MediaStream([
        ...dest.stream.getAudioTracks(),
        ...(videoTrack ? [videoTrack] : []),
      ]);

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(combinedStream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        await uploadRecording(blob);
        if (timerRef.current) clearInterval(timerRef.current);
        setRecordingDuration(0);
      };

      recorderRef.current = recorder;
      recorder.start(1000);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingDuration((d) => d + 1);
      }, 1000);

      toast.success("Recording started");
    } catch {
      toast.error("Failed to start recording");
    }
  }, [isRecording]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const uploadRecording = async (blob: Blob) => {
    try {
      const path = `${userId}/${Date.now()}_recording.webm`;
      const { error } = await supabase.storage
        .from("chat-media-files")
        .upload(path, blob, { contentType: "audio/webm" });

      if (error) throw error;

      const { data: urlData } = supabase.storage.from("chat-media-files").getPublicUrl(path);

      // Save recording metadata
      await (supabase as any).from("call_recordings").insert({
        call_history_id: callHistoryId || null,
        recorder_id: userId,
        recording_url: urlData.publicUrl,
        duration_seconds: recordingDuration,
        file_size_bytes: blob.size,
        consent_given_by: [userId],
        status: "ready",
      });

      toast.success("Recording saved");
    } catch {
      toast.error("Failed to save recording");
    }
  };

  const giveConsent = useCallback(() => {
    setConsentGiven(true);
  }, []);

  return {
    isRecording,
    recordingDuration,
    consentGiven,
    startRecording,
    stopRecording,
    giveConsent,
  };
}
