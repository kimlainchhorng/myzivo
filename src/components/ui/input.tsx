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
      <div className="w-full space-y-1.5">
        <div className="relative group">
          {/* Premium Glow Effect on Focus */}
          <div className={cn(
            "absolute -inset-0.5 rounded-2xl opacity-0 blur-md transition-all duration-500",
            "group-focus-within:opacity-100",
            validationState === "default" && "bg-gradient-to-r from-sky-500/30 via-primary/20 to-cyan-500/30",
            validationState === "error" && "bg-gradient-to-r from-destructive/30 to-red-500/30",
            validationState === "success" && "bg-gradient-to-r from-emerald-500/30 to-green-500/30"
          )} />
          
          {/* Left Icon */}
          {LeftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300",
                "bg-gradient-to-br from-sky-500/20 to-cyan-500/15 group-focus-within:from-sky-500/30 group-focus-within:to-cyan-500/25",
                validationState === "error" && "from-destructive/20 to-red-500/15",
                validationState === "success" && "from-emerald-500/20 to-green-500/15"
              )}>
                <LeftIcon className={cn(
                  "w-4.5 h-4.5 transition-colors duration-300",
                  validationState === "default" && "text-sky-400 group-focus-within:text-sky-300",
                  validationState === "error" && "text-destructive",
                  validationState === "success" && "text-emerald-400"
                )} />
              </div>
            </div>
          )}

          {/* Input */}
          <input
            type={type}
            value={value}
            className={cn(
              // Base styles - Premium
              "relative flex h-14 w-full rounded-xl border-2 text-base font-medium transition-all duration-300",
              "bg-muted/40 backdrop-blur-xl",
              "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
              "placeholder:text-muted-foreground/60 placeholder:font-normal",
              // Focus styles - Premium glow
              "focus-visible:outline-none focus-visible:ring-0 focus-visible:border-sky-500/60 focus-visible:bg-muted/60",
              // Hover styles
              "hover:border-border/80 hover:bg-muted/50",
              // Disabled styles
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/20",
              // Validation states
              validationState === "default" && "border-border/50",
              validationState === "error" &&
                "border-destructive/60 focus-visible:border-destructive bg-destructive/5",
              validationState === "success" &&
                "border-emerald-500/60 focus-visible:border-emerald-500 bg-emerald-500/5",
              // Padding based on icons - increased for larger icons
              hasLeftIcon ? "pl-16" : "px-4",
              hasRightContent ? "pr-12" : "px-4",
              className
            )}
            ref={ref}
            {...props}
          />

          {/* Right Content */}
          {rightContent && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center z-10">
              {rightContent}
            </div>
          )}
        </div>

        {/* Validation Messages - Enhanced */}
        {validationState === "error" && errorMessage && (
          <p className="text-sm text-destructive flex items-center gap-1.5 pl-1 animate-in fade-in slide-in-from-top-1 duration-200">
            <AlertCircle className="w-3.5 h-3.5" />
            {errorMessage}
          </p>
        )}
        {validationState === "success" && successMessage && (
          <p className="text-sm text-emerald-400 flex items-center gap-1.5 pl-1 animate-in fade-in slide-in-from-top-1 duration-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {successMessage}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
