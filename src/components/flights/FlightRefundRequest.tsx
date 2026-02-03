/**
 * Flight Refund Request Component
 * Allows users to request a refund for their flight booking
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import {
  RefreshCcw,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  Loader2,
  Info,
} from 'lucide-react';
import { useRequestFlightRefund, canRequestRefund } from '@/hooks/useFlightBooking';
import { cn } from '@/lib/utils';

interface FlightRefundRequestProps {
  booking: {
    id: string;
    booking_reference: string;
    total_amount: number;
    currency: string;
    ticketing_status: string;
    payment_status: string;
    refund_status: string | null;
    refund_reason?: string | null;
    refund_requested_at?: string | null;
    refund_processed_at?: string | null;
  };
}

const refundStatusInfo: Record<string, { label: string; color: string; icon: React.ReactNode; description: string }> = {
  requested: {
    label: 'Refund Requested',
    color: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
    icon: <Clock className="w-4 h-4" />,
    description: 'Your refund request has been submitted and is being reviewed.',
  },
  under_review: {
    label: 'Under Review',
    color: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
    icon: <Clock className="w-4 h-4" />,
    description: 'Our team is reviewing your refund request.',
  },
  approved: {
    label: 'Approved',
    color: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30',
    icon: <CheckCircle className="w-4 h-4" />,
    description: 'Your refund has been approved and is being processed.',
  },
  denied: {
    label: 'Denied',
    color: 'bg-red-500/20 text-red-600 border-red-500/30',
    icon: <XCircle className="w-4 h-4" />,
    description: 'Your refund request was denied. Contact support for more information.',
  },
  refunded: {
    label: 'Refunded',
    color: 'bg-violet-500/20 text-violet-600 border-violet-500/30',
    icon: <DollarSign className="w-4 h-4" />,
    description: 'Your refund has been processed. Funds will appear in 5-10 business days.',
  },
};

export function FlightRefundRequest({ booking }: FlightRefundRequestProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const requestRefund = useRequestFlightRefund();

  const canRequest = canRequestRefund({
    id: booking.id,
    booking_reference: booking.booking_reference,
    ticketing_status: booking.ticketing_status as any,
    payment_status: booking.payment_status,
    total_amount: booking.total_amount,
    currency: booking.currency,
    created_at: '',
  });

  const hasExistingRequest = booking.refund_status && booking.refund_status !== 'denied';
  const statusInfo = booking.refund_status ? refundStatusInfo[booking.refund_status] : null;

  const handleSubmit = () => {
    requestRefund.mutate(
      { bookingId: booking.id, reason },
      {
        onSuccess: () => {
          setIsOpen(false);
          setReason('');
        },
      }
    );
  };

  // Show existing refund status
  if (hasExistingRequest && statusInfo) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("gap-1", statusInfo.color)}>
            {statusInfo.icon}
            {statusInfo.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {statusInfo.description}
        </p>
        {booking.refund_status === 'refunded' && (
          <p className="text-sm font-medium text-emerald-600">
            ${booking.total_amount?.toFixed(2)} {booking.currency} has been refunded.
          </p>
        )}
      </div>
    );
  }

  // Show request refund button
  if (!canRequest) {
    return (
      <Alert className="border-muted">
        <Info className="w-4 h-4" />
        <AlertDescription>
          Refund requests are only available for issued tickets with completed payments.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <RefreshCcw className="w-4 h-4" />
          Request Refund
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Refund</DialogTitle>
          <DialogDescription>
            Submit a refund request for booking {booking.booking_reference}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Booking Summary */}
          <div className="p-4 rounded-lg bg-muted/50 border">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Booking Reference</span>
                <p className="font-mono font-medium">{booking.booking_reference}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Amount</span>
                <p className="font-bold">${booking.total_amount?.toFixed(2)} {booking.currency}</p>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Refund</Label>
            <Textarea
              id="reason"
              placeholder="Please explain why you're requesting a refund..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>

          {/* Notice */}
          <Alert className="border-amber-500/30 bg-amber-500/5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <AlertDescription className="text-sm">
              Refund requests are reviewed within 24-48 hours. Refund amounts may vary based on 
              airline fare rules and how close we are to departure.
            </AlertDescription>
          </Alert>

          {/* Support Contact */}
          <div className="text-center text-sm text-muted-foreground">
            Need help? Contact us at{' '}
            <a href="mailto:support@hizovo.com" className="text-primary hover:underline">
              support@hizovo.com
            </a>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason.trim() || requestRefund.isPending}
          >
            {requestRefund.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              'Submit Request'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}