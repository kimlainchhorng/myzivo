import { useState, useEffect } from "react";
import { Clock, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CountdownTimerProps {
  endTime?: Date;
  label?: string;
  variant?: "compact" | "full";
}

const CountdownTimer = ({
  endTime = new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours default
  label = "Flash Sale Ends In",
  variant = "full",
}: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endTime.getTime() - Date.now();
      
      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  if (variant === "compact") {
    return (
      <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse">
        <Clock className="w-3 h-3 mr-1" />
        {formatNumber(timeLeft.hours)}:{formatNumber(timeLeft.minutes)}:{formatNumber(timeLeft.seconds)}
      </Badge>
    );
  }

  return (
    <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl p-4 text-center">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Zap className="w-5 h-5 text-red-400 animate-pulse" />
        <span className="font-medium text-red-400">{label}</span>
      </div>
      
      <div className="flex items-center justify-center gap-2">
        {[
          { value: timeLeft.hours, label: "HRS" },
          { value: timeLeft.minutes, label: "MIN" },
          { value: timeLeft.seconds, label: "SEC" },
        ].map((unit, index) => (
          <div key={unit.label} className="flex items-center gap-2">
            <div className="bg-card/80 backdrop-blur-sm rounded-xl px-4 py-2 min-w-[60px] shadow-sm">
              <p className="text-2xl font-bold font-mono">{formatNumber(unit.value)}</p>
              <p className="text-[10px] text-muted-foreground">{unit.label}</p>
            </div>
            {index < 2 && <span className="text-2xl font-bold text-muted-foreground">:</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountdownTimer;
