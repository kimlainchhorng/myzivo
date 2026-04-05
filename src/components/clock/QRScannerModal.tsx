/**
 * QR Scanner Modal — uses device camera to scan QR codes for clock in/out
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, X, CheckCircle2, XCircle, Loader2, ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface QRScannerModalProps {
  open: boolean;
  onClose: () => void;
  onScan: (token: string) => Promise<{ success: boolean; message: string; action?: string }>;
  title?: string;
}

type ScanState = "scanning" | "processing" | "success" | "error";

export function QRScannerModal({ open, onClose, onScan, title = "Scan QR Code" }: QRScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);
  const [state, setState] = useState<ScanState>("scanning");
  const [message, setMessage] = useState("");
  const [actionType, setActionType] = useState("");

  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Start scanning with BarcodeDetector if available, else fallback
      if ("BarcodeDetector" in window) {
        const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
        scanIntervalRef.current = window.setInterval(async () => {
          if (!videoRef.current || state !== "scanning") return;
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const raw = barcodes[0].rawValue;
              if (raw) handleDetectedQR(raw);
            }
          } catch {}
        }, 300);
      } else {
        // Fallback: draw to canvas and attempt detection
        scanIntervalRef.current = window.setInterval(() => {
          if (!videoRef.current || !canvasRef.current || state !== "scanning") return;
          const ctx = canvasRef.current.getContext("2d");
          if (!ctx) return;
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
          ctx.drawImage(videoRef.current, 0, 0);
          // Without BarcodeDetector, we'll rely on manual entry or native camera
        }, 500);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setState("error");
      setMessage("Camera access denied. Please allow camera permissions.");
    }
  }, []);

  const handleDetectedQR = async (rawValue: string) => {
    if (state !== "scanning") return;
    setState("processing");
    setMessage("Validating QR code...");

    try {
      // Extract token from QR value (format: "ZIVO_CLOCK:{token}")
      const token = rawValue.startsWith("ZIVO_CLOCK:") ? rawValue.replace("ZIVO_CLOCK:", "") : rawValue;
      const result = await onScan(token);
      if (result.success) {
        setState("success");
        setMessage(result.message);
        setActionType(result.action || "");
      } else {
        setState("error");
        setMessage(result.message);
      }
    } catch (err) {
      setState("error");
      setMessage("Failed to process QR code");
    }
  };

  useEffect(() => {
    if (open) {
      setState("scanning");
      setMessage("");
      startCamera();
    } else {
      stopCamera();
    }
    return stopCamera;
  }, [open]);

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-[360px] p-0 gap-0 rounded-2xl overflow-hidden bg-black">
        <DialogHeader className="px-4 py-3 bg-black/80 backdrop-blur-sm relative z-10">
          <DialogTitle className="text-white text-[14px] font-semibold flex items-center gap-2">
            <Camera className="w-4 h-4" />
            {title}
          </DialogTitle>
          <button onClick={handleClose} className="absolute right-3 top-3 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        </DialogHeader>

        {/* Camera View */}
        <div className="relative aspect-square bg-black">
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
          <canvas ref={canvasRef} className="hidden" />

          {/* Scan overlay */}
          {state === "scanning" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-52 h-52 relative">
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/80 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/80 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/80 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/80 rounded-br-lg" />
                {/* Scanning line animation */}
                <motion.div
                  className="absolute left-2 right-2 h-0.5 bg-primary shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                  animate={{ top: ["10%", "90%", "10%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </div>
          )}

          {/* Status overlays */}
          <AnimatePresence>
            {state === "processing" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center"
              >
                <Loader2 className="w-10 h-10 text-white animate-spin mb-3" />
                <p className="text-white text-[13px] font-medium">{message}</p>
              </motion.div>
            )}
            {state === "success" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-emerald-900/80 flex flex-col items-center justify-center"
              >
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}>
                  <CheckCircle2 className="w-14 h-14 text-emerald-400 mb-3" />
                </motion.div>
                <p className="text-white text-[15px] font-bold mb-1">
                  {actionType === "clock_in" ? "Clocked In!" : actionType === "clock_out" ? "Clocked Out!" : "Success!"}
                </p>
                <p className="text-emerald-200 text-[12px] text-center px-6">{message}</p>
              </motion.div>
            )}
            {state === "error" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center"
              >
                <XCircle className="w-14 h-14 text-red-400 mb-3" />
                <p className="text-white text-[15px] font-bold mb-1">Failed</p>
                <p className="text-red-200 text-[12px] text-center px-6">{message}</p>
                <button
                  onClick={() => { setState("scanning"); setMessage(""); }}
                  className="mt-4 px-5 py-2 rounded-full bg-white/20 text-white text-[12px] font-semibold"
                >
                  Try Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom hint */}
        <div className="px-4 py-3 bg-black/80 text-center">
          <p className="text-white/60 text-[11px]">
            {state === "scanning" ? "Point your camera at the QR code" : ""}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
