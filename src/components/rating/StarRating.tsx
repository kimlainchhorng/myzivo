/**
 * StarRating Component
 * Reusable 1-5 star rating input with touch support
 */

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  label?: string;
}

const sizeClasses = {
  sm: "h-5 w-5",
  md: "h-8 w-8",
  lg: "h-10 w-10",
};

const StarRating = ({
  value,
  onChange,
  size = "md",
  disabled = false,
  label,
}: StarRatingProps) => {
  const handleClick = (rating: number) => {
    if (!disabled) {
      onChange(rating);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <span className="text-sm font-medium text-foreground">{label}</span>
      )}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            disabled={disabled}
            className={cn(
              "transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm",
              disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:scale-110"
            )}
            aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                star <= value
                  ? "fill-primary text-primary"
                  : "fill-transparent text-muted-foreground"
              )}
            />
          </button>
        ))}
      </div>
      {value > 0 && (
        <span className="text-xs text-muted-foreground">
          {value === 5
            ? "Excellent!"
            : value === 4
            ? "Great"
            : value === 3
            ? "Good"
            : value === 2
            ? "Fair"
            : "Poor"}
        </span>
      )}
    </div>
  );
};

export default StarRating;
