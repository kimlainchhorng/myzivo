// CSS animations used instead of framer-motion for performance
import { X, Car, UtensilsCrossed, Plane, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationProps {
  id: string;
  type: "ride" | "food" | "flight" | "success";
  title: string;
  message: string;
  onClose: (id: string) => void;
}

const iconMap = {
  ride: Car,
  food: UtensilsCrossed,
  flight: Plane,
  success: CheckCircle2,
};

const gradientMap = {
  ride: "from-primary to-teal-400",
  food: "from-eats to-orange-500",
  flight: "from-sky-500 to-blue-500",
  success: "from-emerald-500 to-green-500",
};

const NotificationToast = ({ id, type, title, message, onClose }: NotificationProps) => {
  const Icon = iconMap[type];
  const gradient = gradientMap[type];

  return (
    <div
      className="relative p-4 rounded-2xl bg-gradient-to-br from-card/95 to-card border border-border/50 shadow-2xl backdrop-blur-xl max-w-sm overflow-hidden animate-in fade-in slide-in-from-top-4 zoom-in-95 duration-300"
    >
      {/* Background glow */}
      <div className={cn(
        "absolute -top-10 -left-10 w-20 h-20 bg-gradient-to-br rounded-full blur-2xl opacity-30",
        gradient
      )} />

      <div className="relative flex items-start gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg flex-shrink-0 animate-in zoom-in duration-300",
            gradient
          )}
          style={{ animationDelay: '100ms', animationFillMode: 'both' }}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm">{title}</h4>
          <p className="text-xs text-muted-foreground line-clamp-2">{message}</p>
        </div>
        <button
          onClick={() => onClose(id)}
          className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-all duration-200 flex-shrink-0 hover:scale-110 active:scale-90"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
