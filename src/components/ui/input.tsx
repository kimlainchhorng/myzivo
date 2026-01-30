import * as React from "react";
import { cn } from "@/lib/utils";
import { X, AlertCircle, CheckCircle2, type LucideIcon } from "lucide-react";

export interface InputProps extends React.ComponentProps<"input"> {
  /** Icon to display on the left side */
  leftIcon?: LucideIcon;
  /** Icon to display on the right side */
  rightIcon?: LucideIcon;
  /** Show clear button when input has value */
  clearable?: boolean;
  /** Callback when clear button is clicked */
  onClear?: () => void;
  /** Validation state */
  validationState?: "default" | "success" | "error";
  /** Error message to display */
  errorMessage?: string;
  /** Success message to display */
  successMessage?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      clearable,
      onClear,
      validationState = "default",
      errorMessage,
      successMessage,
      value,
      ...props
    },
    ref
  ) => {
    const hasValue = value !== undefined && value !== "";
    const showClear = clearable && hasValue && !props.disabled;

    // Determine right-side content
    const getRightContent = () => {
      if (validationState === "error") {
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      }
      if (validationState === "success") {
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      }
      if (showClear) {
        return (
          <button
            type="button"
            onClick={onClear}
            className="p-0.5 rounded-full hover:bg-muted/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            tabIndex={-1}
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        );
      }
      if (RightIcon) {
        return <RightIcon className="w-4 h-4 text-muted-foreground" />;
      }
      return null;
    };

    const rightContent = getRightContent();
    const hasLeftIcon = !!LeftIcon;
    const hasRightContent = !!rightContent;

    return (
      <div className="w-full space-y-1">
        <div className="relative">
          {/* Left Icon */}
          {LeftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <LeftIcon className="w-4 h-4 text-muted-foreground" />
            </div>
          )}

          {/* Input */}
          <input
            type={type}
            value={value}
            className={cn(
              // Base styles
              "flex h-10 md:h-11 w-full rounded-xl border bg-background/50 backdrop-blur-sm text-sm transition-all duration-200",
              "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
              "placeholder:text-muted-foreground/70",
              // Focus styles
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1 focus-visible:border-primary/50",
              // Hover styles
              "hover:border-border/80",
              // Disabled styles
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30",
              // Validation states
              validationState === "default" && "border-input",
              validationState === "error" &&
                "border-destructive/50 focus-visible:ring-destructive/30 focus-visible:border-destructive",
              validationState === "success" &&
                "border-emerald-500/50 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500",
              // Padding based on icons
              hasLeftIcon ? "pl-10" : "px-3.5",
              hasRightContent ? "pr-10" : "px-3.5",
              className
            )}
            ref={ref}
            {...props}
          />

          {/* Right Content */}
          {rightContent && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
              {rightContent}
            </div>
          )}
        </div>

        {/* Validation Messages */}
        {validationState === "error" && errorMessage && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errorMessage}
          </p>
        )}
        {validationState === "success" && successMessage && (
          <p className="text-xs text-emerald-500 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {successMessage}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
