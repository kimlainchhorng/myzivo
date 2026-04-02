/**
 * useScreenShare — Add screen sharing to a WebRTC peer connection
 */
import { useState, useRef, useCallback } from "react";

export function useScreenShare(pc: RTCPeerConnection | null) {
  const [isSharing, setIsSharing] = useState(false);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const originalSenderRef = useRef<RTCRtpSender | null>(null);

  const startSharing = useCallback(async () => {
    if (!pc || isSharing) return;

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      const screenTrack = screenStream.getVideoTracks()[0];
      screenStreamRef.current = screenStream;

      // Find the existing video sender and replace its track
      const videoSender = pc.getSenders().find((s) => s.track?.kind === "video");
      if (videoSender) {
        originalSenderRef.current = videoSender;
        await videoSender.replaceTrack(screenTrack);
      } else {
        pc.addTrack(screenTrack, screenStream);
      }

      setIsSharing(true);

      // Auto-stop when user clicks "Stop sharing" in browser UI
      screenTrack.onended = () => {
        stopSharing();
      };
    } catch {
      // User cancelled or not supported
    }
  }, [pc, isSharing]);

  const stopSharing = useCallback(async () => {
    if (!pc || !isSharing) return;

    // Restore original video track
    const sender = originalSenderRef.current;
    if (sender) {
      const localStream = pc.getTransceivers()
        .find((t) => t.sender === sender)?.sender.track;
      // We need to get the camera track back - find from local stream
      const senders = pc.getSenders();
      const cameraTrack = senders.find((s) => s.track?.kind === "video" && s !== sender)?.track;
      if (cameraTrack) {
        await sender.replaceTrack(cameraTrack);
      }
    }

    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;
    originalSenderRef.current = null;
    setIsSharing(false);
  }, [pc, isSharing]);

  const toggleSharing = useCallback(async () => {
    if (isSharing) {
      await stopSharing();
    } else {
      await startSharing();
    }
  }, [isSharing, startSharing, stopSharing]);

  return { isSharing, startSharing, stopSharing, toggleSharing };
}
