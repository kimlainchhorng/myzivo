/**
 * ConfettiEffect - Celebratory confetti animation for success states
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  rotation: number;
}

interface ConfettiEffectProps {
  show?: boolean;
  duration?: number;
  pieceCount?: number;
}

const CONFETTI_COLORS = [
  "hsl(45, 100%, 50%)",   // Gold
  "hsl(40, 85%, 55%)",    // Dark gold
  "hsl(50, 90%, 60%)",    // Light gold
  "hsl(221, 83%, 53%)",   // Primary blue
  "hsl(142, 71%, 45%)",   // Success green
  "hsl(0, 0%, 100%)",     // White
];

export default function ConfettiEffect({ 
  show = true, 
  duration = 3000,
  pieceCount = 50 
}: ConfettiEffectProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setVisible(true);
      // Generate confetti pieces
      const newPieces: ConfettiPiece[] = Array.from({ length: pieceCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        rotation: Math.random() * 360,
      }));
      setPieces(newPieces);

      // Auto-hide after duration
      const timer = setTimeout(() => setVisible(false), duration);
      return () => clearTimeout(timer);
    }
  }, [show, pieceCount, duration]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {pieces.map((piece) => (
          <motion.div
            key={piece.id}
            initial={{
              y: -20,
              x: `${piece.x}vw`,
              rotate: 0,
              opacity: 1,
            }}
            animate={{
              y: "110vh",
              rotate: piece.rotation + 720,
              opacity: 0,
            }}
            transition={{
              duration: piece.duration,
              delay: piece.delay,
              ease: "linear",
            }}
            style={{ backgroundColor: piece.color }}
            className="absolute w-3 h-3 rounded-sm"
          />
        ))}
      </AnimatePresence>
    </div>
  );
}