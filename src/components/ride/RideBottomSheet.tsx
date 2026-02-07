/**
 * RideBottomSheet Component
 * 
 * Uber-style draggable bottom sheet for ride selection.
 * Shows ride options with a drag handle at the top.
 */

import { motion, useDragControls, useMotionValue, useTransform, animate } from "framer-motion";
import { useRef, useState, useEffect, ReactNode } from "react";

interface RideBottomSheetProps {
  children: ReactNode;
  snapPoints?: number[]; // percentage of screen height (e.g., [0.4, 0.85])
  initialSnap?: number;
  onSnapChange?: (snapIndex: number) => void;
}

export default function RideBottomSheet({ 
  children, 
  snapPoints = [0.45, 0.85],
  initialSnap = 0,
  onSnapChange
}: RideBottomSheetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const y = useMotionValue(0);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [currentSnap, setCurrentSnap] = useState(initialSnap);

  // Update window height on resize
  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate snap positions in pixels from bottom
  const snapPositions = snapPoints.map(p => windowHeight * (1 - p));

  // Set initial position
  useEffect(() => {
    y.set(snapPositions[initialSnap]);
  }, [windowHeight]);

  // Handle drag end - snap to nearest position
  const handleDragEnd = () => {
    const currentY = y.get();
    
    // Find nearest snap point
    let nearestSnap = 0;
    let minDistance = Math.abs(currentY - snapPositions[0]);
    
    snapPositions.forEach((pos, index) => {
      const distance = Math.abs(currentY - pos);
      if (distance < minDistance) {
        minDistance = distance;
        nearestSnap = index;
      }
    });

    // Animate to snap position
    animate(y, snapPositions[nearestSnap], {
      type: "spring",
      stiffness: 400,
      damping: 40,
    });

    if (nearestSnap !== currentSnap) {
      setCurrentSnap(nearestSnap);
      onSnapChange?.(nearestSnap);
    }
  };

  // Border radius that changes based on position
  const borderRadius = useTransform(y, [0, windowHeight * 0.3], [0, 24]);

  return (
    <motion.div
      ref={containerRef}
      drag="y"
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={{
        top: snapPositions[snapPositions.length - 1],
        bottom: snapPositions[0]
      }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      style={{ y, borderTopLeftRadius: borderRadius, borderTopRightRadius: borderRadius }}
      className="fixed left-0 right-0 bottom-0 bg-white z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] overflow-hidden"
    >
      {/* Drag Handle */}
      <div
        onPointerDown={(e) => dragControls.start(e)}
        className="flex justify-center py-3 cursor-grab active:cursor-grabbing touch-none"
      >
        <div className="w-10 h-1 bg-zinc-300 rounded-full" />
      </div>

      {/* Content */}
      <div className="px-4 pb-24 max-h-[85vh] overflow-y-auto overscroll-contain">
        {children}
      </div>
    </motion.div>
  );
}
