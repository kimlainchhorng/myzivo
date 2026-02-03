/**
 * Hook for tracking flight offer expiry and auto-redirect
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface UseFlightOfferExpiryOptions {
  expiresAt: string | undefined;
  offerId?: string;
  onExpired?: () => void;
  redirectPath?: string;
  warningThresholdSeconds?: number;
}

export function useFlightOfferExpiry({
  expiresAt,
  offerId,
  onExpired,
  redirectPath = '/flights',
  warningThresholdSeconds = 120,
}: UseFlightOfferExpiryOptions) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [hasWarned, setHasWarned] = useState(false);

  const calculateTimeLeft = useCallback(() => {
    if (!expiresAt) return null;
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    return Math.max(0, Math.floor((expiry - now) / 1000));
  }, [expiresAt]);

  useEffect(() => {
    if (!expiresAt) return;

    const updateTimer = () => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      // Show warning when approaching expiry
      if (remaining !== null && remaining <= warningThresholdSeconds && remaining > 0 && !hasWarned) {
        setHasWarned(true);
        toast({
          title: 'Price expiring soon',
          description: `This price is only valid for ${Math.ceil(remaining / 60)} more minute(s). Complete checkout now.`,
          variant: 'destructive',
          duration: 10000,
        });
      }

      // Handle expiry
      if (remaining !== null && remaining <= 0 && !isExpired) {
        setIsExpired(true);
        
        toast({
          title: 'Price expired',
          description: 'This flight offer has expired. Please search again for current prices.',
          variant: 'destructive',
          duration: 5000,
        });

        // Clear stored offer
        sessionStorage.removeItem('selectedFlight');
        
        // Call callback
        onExpired?.();

        // Redirect after delay
        setTimeout(() => {
          navigate(redirectPath);
        }, 2000);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, calculateTimeLeft, hasWarned, isExpired, warningThresholdSeconds, toast, onExpired, navigate, redirectPath]);

  return {
    timeLeft,
    isExpired,
    isExpiringSoon: timeLeft !== null && timeLeft <= warningThresholdSeconds && timeLeft > 0,
    expiresAt,
    formattedTime: timeLeft !== null ? formatTime(timeLeft) : null,
  };
}

function formatTime(seconds: number): string {
  if (seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Prefetch checkout data when user selects an offer
 */
export function usePrefetchCheckout() {
  const prefetch = useCallback((offerId: string) => {
    // Prefetch the checkout page resources
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = `/flights/checkout?offer=${offerId}`;
    document.head.appendChild(link);

    // Also prefetch the traveler info page
    const travelerLink = document.createElement('link');
    travelerLink.rel = 'prefetch';
    travelerLink.href = `/flights/traveler-info?offer=${offerId}`;
    document.head.appendChild(travelerLink);

    console.log('[Prefetch] Checkout pages queued for:', offerId);
  }, []);

  return { prefetch };
}
