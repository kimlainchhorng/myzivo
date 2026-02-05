 /**
  * usePremiumScroll Hook
  * Detects scroll velocity and applies motion-blur effect for premium feel
  * When velocity > 800px/s, adds 'scrolling-fast' class to body
  */
 
 import { useEffect, useRef } from "react";
 
 interface PremiumScrollOptions {
   /** Velocity threshold in px/s to trigger blur */
   velocityThreshold?: number;
   /** Debounce time in ms before removing class */
   debounceMs?: number;
   /** Enable/disable the effect */
   enabled?: boolean;
 }
 
 export const usePremiumScroll = (options: PremiumScrollOptions = {}) => {
   const {
     velocityThreshold = 800,
     debounceMs = 150,
     enabled = true,
   } = options;
 
   const lastScrollY = useRef(0);
   const lastScrollTime = useRef(Date.now());
   const timeoutRef = useRef<NodeJS.Timeout | null>(null);
 
   useEffect(() => {
     if (!enabled) return;
 
     const handleScroll = () => {
       const now = Date.now();
       const deltaY = Math.abs(window.scrollY - lastScrollY.current);
       const deltaTime = now - lastScrollTime.current;
 
       // Calculate velocity in px/s
       const velocity = deltaTime > 0 ? (deltaY / deltaTime) * 1000 : 0;
 
       if (velocity > velocityThreshold) {
         document.body.classList.add("scrolling-fast");
 
         // Clear existing timeout
         if (timeoutRef.current) {
           clearTimeout(timeoutRef.current);
         }
 
         // Set timeout to remove class after velocity drops
         timeoutRef.current = setTimeout(() => {
           document.body.classList.remove("scrolling-fast");
         }, debounceMs);
       }
 
       lastScrollY.current = window.scrollY;
       lastScrollTime.current = now;
     };
 
     window.addEventListener("scroll", handleScroll, { passive: true });
 
     return () => {
       window.removeEventListener("scroll", handleScroll);
       if (timeoutRef.current) {
         clearTimeout(timeoutRef.current);
       }
       document.body.classList.remove("scrolling-fast");
     };
   }, [velocityThreshold, debounceMs, enabled]);
 };
 
 export default usePremiumScroll;