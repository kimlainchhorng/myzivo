/**
 * TicketQRCode - Premium QR code wrapper with golden styling
 */

import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";

interface TicketQRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export default function TicketQRCode({ 
  value, 
  size = 140,
  className 
}: TicketQRCodeProps) {
  return (
    <div className={cn(
      "relative p-4 rounded-2xl bg-background/80 dark:bg-zinc-900/80",
      "border-2 border-amber-500/30 shadow-lg",
      className
    )}>
      <QRCodeSVG
        value={value}
        size={size}
        bgColor="transparent"
        fgColor="currentColor"
        level="H"
        className="text-foreground"
      />
      <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-br from-amber-500/5 to-transparent" />
    </div>
  );
}