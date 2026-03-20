/**
 * Flight 3D Sky Header
 * Immersive animated header with real airplane flying through clouds,
 * sun/moon positioning, and sky colors that change based on real time of day.
 */
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Plane } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Time-of-day system ─── */
function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 8) return "dawn";
  if (hour >= 8 && hour < 12) return "morning";
  if (hour >= 12 && hour < 16) return "afternoon";
  if (hour >= 16 && hour < 19) return "sunset";
  if (hour >= 19 && hour < 21) return "dusk";
  return "night";
}

const skyGradients: Record<string, string> = {
  dawn: "from-amber-900/30 via-rose-400/20 to-sky-400/40",
  morning: "from-sky-300/30 via-sky-200/20 to-blue-400/30",
  afternoon: "from-sky-400/35 via-blue-300/20 to-cyan-300/25",
  sunset: "from-orange-500/30 via-rose-400/25 to-purple-500/20",
  dusk: "from-indigo-600/30 via-purple-500/20 to-slate-700/30",
  night: "from-slate-900/40 via-indigo-900/30 to-slate-800/35",
};

const sunMoonConfig: Record<string, { color: string; glow: string; top: string; opacity: number; isMoon: boolean }> = {
  dawn: { color: "bg-amber-300", glow: "shadow-amber-300/60", top: "70%", opacity: 0.9, isMoon: false },
  morning: { color: "bg-yellow-200", glow: "shadow-yellow-200/50", top: "25%", opacity: 0.85, isMoon: false },
  afternoon: { color: "bg-yellow-100", glow: "shadow-yellow-100/40", top: "15%", opacity: 0.7, isMoon: false },
  sunset: { color: "bg-orange-400", glow: "shadow-orange-400/60", top: "65%", opacity: 0.95, isMoon: false },
  dusk: { color: "bg-orange-300", glow: "shadow-orange-300/40", top: "80%", opacity: 0.5, isMoon: false },
  night: { color: "bg-slate-200", glow: "shadow-slate-200/30", top: "20%", opacity: 0.8, isMoon: true },
};

/* ─── Cloud component ─── */
function Cloud({ size, top, delay, duration, direction }: {
  size: "sm" | "md" | "lg";
  top: string;
  delay: number;
  duration: number;
  direction: "ltr" | "rtl";
}) {
  const sizes = {
    sm: "w-16 h-5",
    md: "w-28 h-8",
    lg: "w-40 h-10",
  };

  const from = direction === "ltr" ? "-15%" : "115%";
  const to = direction === "ltr" ? "115%" : "-15%";

  return (
    <motion.div
      className={cn("absolute", sizes[size])}
      style={{ top }}
      animate={{ x: [from, to] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear",
        delay,
      }}
    >
      {/* Cloud shape using layered rounded divs */}
      <div className="relative w-full h-full">
        <div className="absolute inset-0 bg-white/20 dark:bg-white/8 rounded-full blur-[2px]" />
        <div className="absolute left-[15%] -top-[40%] w-[45%] h-[90%] bg-white/25 dark:bg-white/10 rounded-full blur-[1px]" />
        <div className="absolute right-[20%] -top-[30%] w-[35%] h-[75%] bg-white/20 dark:bg-white/8 rounded-full blur-[1px]" />
        <div className="absolute left-[35%] -top-[55%] w-[30%] h-[80%] bg-white/22 dark:bg-white/9 rounded-full blur-[2px]" />
      </div>
    </motion.div>
  );
}

/* ─── Stars for night ─── */
function Stars() {
  const stars = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      left: `${8 + Math.random() * 84}%`,
      top: `${5 + Math.random() * 70}%`,
      size: 1 + Math.random() * 2,
      delay: Math.random() * 3,
    })), []
  );

  return (
    <>
      {stars.map((star, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/60"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
          }}
          animate={{ opacity: [0.3, 0.9, 0.3] }}
          transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: star.delay }}
        />
      ))}
    </>
  );
}

/* ─── Main animated airplane ─── */
function FlyingAirplane({ layer }: { layer: "front" | "back" }) {
  const isFront = layer === "front";

  return (
    <motion.div
      className="absolute"
      style={{
        top: isFront ? "35%" : "55%",
        zIndex: isFront ? 10 : 5,
      }}
      animate={{
        x: isFront ? ["-8%", "108%"] : ["108%", "-8%"],
        y: isFront
          ? [0, -8, 4, -6, 2, 0]
          : [0, 6, -4, 8, -2, 0],
      }}
      transition={{
        x: { duration: isFront ? 8 : 14, repeat: Infinity, ease: "linear" },
        y: { duration: isFront ? 4 : 6, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      <div
        className="relative"
        style={{
          transformStyle: "preserve-3d",
          transform: `perspective(400px) rotateX(${isFront ? -8 : 5}deg) rotateY(${isFront ? 12 : -10}deg)`,
        }}
      >
        {/* Airplane body */}
        <Plane
          className={cn(
            isFront ? "w-8 h-8 text-primary" : "w-5 h-5 text-primary/40",
            isFront ? "rotate-[0deg] -scale-x-100" : "rotate-[180deg]"
          )}
          strokeWidth={isFront ? 2.5 : 1.5}
        />
        {/* Engine glow / contrail */}
        {isFront && (
          <motion.div
            className="absolute top-1/2 -right-6 -translate-y-1/2 w-12 h-1 rounded-full"
            style={{
              background: "linear-gradient(to left, transparent, hsl(var(--primary) / 0.3), transparent)",
            }}
            animate={{ scaleX: [0.6, 1, 0.6], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        {/* Shadow on ground */}
        {isFront && (
          <div
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-6 h-1.5 rounded-full bg-foreground/5 blur-sm"
            style={{ transform: "perspective(200px) rotateX(70deg) translateX(-50%)" }}
          />
        )}
      </div>
    </motion.div>
  );
}

/* ─── Progress bar with 3D glow ─── */
function Header3DProgressBar() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[3px]">
      <motion.div
        className="h-full rounded-full"
        style={{
          background: "linear-gradient(90deg, hsl(var(--primary) / 0.1), hsl(var(--primary)), hsl(196 100% 60%), hsl(var(--primary) / 0.1))",
          boxShadow: "0 0 12px hsl(var(--primary) / 0.4), 0 0 4px hsl(var(--primary) / 0.6)",
        }}
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/* ─── Main Header Component ─── */
export default function Flight3DSkyHeader({ className }: { className?: string }) {
  const timeOfDay = useMemo(() => getTimeOfDay(), []);
  const sky = skyGradients[timeOfDay];
  const celestial = sunMoonConfig[timeOfDay];
  const isNight = timeOfDay === "night" || timeOfDay === "dusk";

  return (
    <div
      className={cn(
        "relative w-full h-28 overflow-hidden",
        className
      )}
      style={{
        perspective: "800px",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Sky gradient layer */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-b transition-colors duration-1000",
        sky
      )} />

      {/* Atmospheric haze */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />

      {/* Sun / Moon */}
      <motion.div
        className={cn(
          "absolute right-[15%] w-8 h-8 rounded-full",
          celestial.color,
          `shadow-[0_0_30px_8px] ${celestial.glow}`
        )}
        style={{ top: celestial.top }}
        animate={{
          scale: celestial.isMoon ? [1, 1.05, 1] : [1, 1.08, 1],
          opacity: [celestial.opacity, celestial.opacity * 0.9, celestial.opacity],
        }}
        transition={{ duration: celestial.isMoon ? 6 : 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Sun rays (daytime only) */}
      {!isNight && (
        <motion.div
          className="absolute right-[13%] w-16 h-16 rounded-full"
          style={{
            top: celestial.top,
            background: `radial-gradient(circle, ${celestial.color.includes("amber") ? "rgba(251,191,36,0.15)" : "rgba(253,224,71,0.1)"} 0%, transparent 70%)`,
          }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Stars (night only) */}
      {isNight && <Stars />}

      {/* Clouds — multiple layers for depth */}
      <Cloud size="lg" top="20%" delay={0} duration={22} direction="ltr" />
      <Cloud size="md" top="50%" delay={3} duration={18} direction="rtl" />
      <Cloud size="sm" top="30%" delay={7} duration={25} direction="ltr" />
      <Cloud size="md" top="65%" delay={10} duration={20} direction="ltr" />
      <Cloud size="sm" top="15%" delay={5} duration={28} direction="rtl" />

      {/* Flying airplanes */}
      <FlyingAirplane layer="back" />
      <FlyingAirplane layer="front" />

      {/* 3D depth ground perspective line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-4"
        style={{
          background: "linear-gradient(to top, hsl(var(--background)), transparent)",
        }}
      />

      {/* 3D Progress bar at bottom */}
      <Header3DProgressBar />
    </div>
  );
}
