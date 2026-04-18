/**
 * useVirtualBackground — DISABLED.
 * All segmentation, masking, and background processing have been removed.
 * The hook now passes the raw camera MediaStream through unchanged.
 */
import { useEffect, useState } from "react";

export type VirtualBgKind = "off" | "blur" | "image";
export interface VirtualBgConfig {
  kind: VirtualBgKind;
  imageUrl?: string;
  blurPx?: number;
}

export type VirtualBgStatus = "loading" | "ready" | "off" | "error";

export function useVirtualBackground(
  source: MediaStream | null,
  _config: VirtualBgConfig,
) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status] = useState<VirtualBgStatus>("off");

  useEffect(() => {
    setStream(source);
  }, [source]);

  return { stream, status };
}
