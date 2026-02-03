/**
 * Hotelbeds Transfers Hook
 * Provides transfer search and booking functionality
 */

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  TransferSearchParams,
  TransferAvailabilityResponse,
  TransferBookingRequest,
  TransferBookingResponse,
  HotelbedsTransfer,
  ZivoTransfer,
  HotelbedsApiResponse,
} from "@/types/hotelbeds";

const HOTELBEDS_TRANSFERS_FUNCTION = "hotelbeds-transfers";

// Transform Hotelbeds transfer to ZIVO format
function transformTransfer(transfer: HotelbedsTransfer): ZivoTransfer {
  const typeMap: Record<string, "private" | "shared" | "shuttle"> = {
    PRIVATE: "private",
    SHARED: "shared",
    SHUTTLE: "shuttle",
  };

  // Check for free cancellation
  const now = new Date();
  const hasCancellation = transfer.cancellationPolicies?.some(
    policy => new Date(policy.from) > now
  );

  return {
    id: transfer.id,
    rateKey: transfer.rateKey,
    type: typeMap[transfer.transferType] || "private",
    vehicleName: transfer.vehicle.name,
    vehicleCategory: transfer.category.name,
    maxPassengers: transfer.maxPaxCapacity || 4,
    price: transfer.price.totalAmount,
    currency: transfer.price.currencyId,
    pickupDate: transfer.pickupInformation.date,
    pickupTime: transfer.pickupInformation.time,
    pickupLocation: transfer.pickupInformation.from.description,
    dropoffLocation: transfer.pickupInformation.to.description,
    imageUrl: transfer.content?.images?.[0]?.url,
    freeCancellation: hasCancellation || false,
    cancellationDeadline: transfer.cancellationPolicies?.[0]?.from,
  };
}

export interface TransferBookingFormData {
  holder: {
    name: string;
    surname: string;
    email: string;
    phone: string;
  };
  transfer: {
    rateKey: string;
    flightNumber?: string;
    flightCompany?: string;
  };
  remarks?: string;
}

export interface TransferBookingResult {
  reference: string;
  clientReference: string;
  status: string;
  pickupLocation: string;
  dropoffLocation: string;
  totalAmount: number;
  currency: string;
}

export function useHotelbedsTransfers() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ZivoTransfer[]>([]);

  // Search transfers
  const search = useCallback(async (params: TransferSearchParams): Promise<ZivoTransfer[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const requestBody: any = {
        action: "availability",
        language: "en",
        fromType: params.fromType,
        fromCode: params.fromCode,
        toType: params.toType,
        toCode: params.toCode,
        outbound: {
          date: params.outboundDate,
          time: params.outboundTime,
        },
        adults: params.adults,
        children: params.children,
        infants: params.infants,
      };

      // Add inbound if round trip
      if (params.inboundDate && params.inboundTime) {
        requestBody.inbound = {
          date: params.inboundDate,
          time: params.inboundTime,
        };
      }

      const { data, error: fetchError } = await supabase.functions.invoke<HotelbedsApiResponse<TransferAvailabilityResponse>>(
        HOTELBEDS_TRANSFERS_FUNCTION,
        {
          body: requestBody,
        }
      );

      if (fetchError) throw fetchError;
      if (!data?.success) throw new Error(data?.error || "Search failed");

      const transfers = data.data?.services || [];
      const transformedTransfers = transfers.map(transformTransfer);
      
      // Sort by price
      transformedTransfers.sort((a, b) => a.price - b.price);
      
      setResults(transformedTransfers);
      return transformedTransfers;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Search failed";
      setError(message);
      setResults([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Book transfer
  const book = useCallback(async (formData: TransferBookingFormData): Promise<TransferBookingResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const clientReference = `ZIVO-TRF-${Date.now().toString(36).toUpperCase()}`;

      const bookingRequest: TransferBookingRequest = {
        holder: {
          name: formData.holder.name,
          surname: formData.holder.surname,
          email: formData.holder.email,
          phone: formData.holder.phone,
        },
        transfers: [{
          rateKey: formData.transfer.rateKey,
          transferDetails: [{
            type: "FLIGHT",
            direction: "ARRIVAL",
            code: formData.transfer.flightNumber || "",
            companyName: formData.transfer.flightCompany,
            number: formData.transfer.flightNumber,
          }],
        }],
        clientReference,
        remark: formData.remarks,
      };

      const { data, error: fetchError } = await supabase.functions.invoke<HotelbedsApiResponse<TransferBookingResponse>>(
        HOTELBEDS_TRANSFERS_FUNCTION,
        {
          body: {
            action: "book",
            ...bookingRequest,
          },
        }
      );

      if (fetchError) throw fetchError;
      if (!data?.success) throw new Error(data?.error || "Booking failed");

      const booking = data.data?.booking;
      if (!booking) {
        throw new Error("Booking confirmation not received");
      }

      const firstTransfer = booking.transfers?.[0];
      
      return {
        reference: booking.reference,
        clientReference: booking.clientReference,
        status: booking.status,
        pickupLocation: firstTransfer?.pickupInformation?.from?.description || "Pickup",
        dropoffLocation: firstTransfer?.pickupInformation?.to?.description || "Dropoff",
        totalAmount: booking.totalAmount,
        currency: booking.currency,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Booking failed";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check API status
  const checkStatus = useCallback(async (): Promise<boolean> => {
    try {
      const { data, error: fetchError } = await supabase.functions.invoke(
        HOTELBEDS_TRANSFERS_FUNCTION,
        { body: { action: "status" } }
      );
      
      if (fetchError) return false;
      return data?.success === true;
    } catch {
      return false;
    }
  }, []);

  return {
    isLoading,
    error,
    results,
    search,
    book,
    checkStatus,
  };
}
