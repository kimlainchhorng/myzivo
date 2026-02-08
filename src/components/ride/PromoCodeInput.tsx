/**
 * Promo Code Input Component for Rides
 * Allows users to enter and apply promo codes with validation
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Tag, Loader2, X, CheckCircle2 } from 'lucide-react';
import { ValidatedRidePromo } from '@/hooks/useRidePromoValidation';

interface PromoCodeInputProps {
  onApply: (code: string) => Promise<ValidatedRidePromo>;
  onRemove: () => void;
  isValidating: boolean;
  appliedPromo: ValidatedRidePromo | null;
  error?: string | null;
  disabled?: boolean;
  className?: string;
}

export function PromoCodeInput({
  onApply,
  onRemove,
  isValidating,
  appliedPromo,
  error,
  disabled,
  className,
}: PromoCodeInputProps) {
  const [code, setCode] = useState('');

  const handleApply = async () => {
    if (!code.trim() || isValidating || disabled) return;
    await onApply(code.trim());
    // Keep code in input if failed, clear if success
  };

  const handleRemove = () => {
    setCode('');
    onRemove();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApply();
    }
  };

  // Applied state - show success badge
  if (appliedPromo?.valid) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-emerald-800 text-sm">
                {appliedPromo.code}
              </span>
              <span className="text-emerald-600 text-sm">
                −${appliedPromo.discount_amount?.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-emerald-600 truncate">
              {appliedPromo.description}
            </p>
          </div>
          <button
            onClick={handleRemove}
            className="p-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
            aria-label="Remove promo code"
          >
            <X className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      </div>
    );
  }

  // Input state
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm text-zinc-600 font-medium">Promo Code</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            placeholder="Enter code"
            disabled={disabled || isValidating}
            className="pl-10 h-11 bg-zinc-100 border-0 text-zinc-900 placeholder-zinc-500 uppercase"
            style={{ fontSize: '16px' }}
          />
        </div>
        <Button
          onClick={handleApply}
          disabled={!code.trim() || isValidating || disabled}
          className="h-11 px-5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-xl"
        >
          {isValidating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Apply'
          )}
        </Button>
      </div>
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          {error}
        </p>
      )}
    </div>
  );
}
