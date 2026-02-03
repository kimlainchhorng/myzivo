/**
 * Hotelbeds Hotels Booking Hook
 * Provides rate checking and booking functionality
 */

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  CheckRatesRequest,
  CheckRatesResponse,
  HotelBookingRequest,
  HotelBookingResponse,
  HotelbedsApiResponse,
  ZivoRate,
  GuestInfo,
  HolderInfo,
} from "@/types/hotelbeds";

const HOTELBEDS_HOTELS_FUNCTION = "hotelbeds-hotels";

export interface BookingFormData {
  holder: HolderInfo;
  rooms: Array<{
    rateKey: string;
    guests: GuestInfo[];
  }>;
  remarks?: string;
}

export interface BookingResult {
  reference: string;
  clientReference: string;
  status: string;
  hotelName: string;
  totalAmount: number;
  currency: string;
}

export function useHotelbedsBooking() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceChanged, setPriceChanged] = useState(false);
  const [updatedRate, setUpdatedRate] = useState<ZivoRate | null>(null);

  // Generate unique client reference
  const generateClientReference = (): string => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `ZIVO-${timestamp}-${random}`.toUpperCase();
  };

  // Check rates before booking (if rateType === "RECHECK")
  const checkRates = useCallback(async (rateKey: string): Promise<ZivoRate | null> => {
    setIsLoading(true);
    setError(null);
    setPriceChanged(false);

    try {
      const { data, error: fetchError } = await supabase.functions.invoke<HotelbedsApiResponse<CheckRatesResponse>>(
        HOTELBEDS_HOTELS_FUNCTION,
        {
          body: {
            action: "checkrates",
            rooms: [{ rateKey }],
          } as CheckRatesRequest,
        }
      );

      if (fetchError) throw fetchError;
      if (!data?.success) throw new Error(data?.error || "Rate check failed");

      const hotel = data.data?.hotel;
      if (!hotel?.rooms?.length) {
        throw new Error("Rate no longer available");
      }

      const room = hotel.rooms[0];
      const rate = room.rates[0];
      
      const updatedZivoRate: ZivoRate = {
        rateKey: rate.rateKey,
        price: parseFloat(rate.net),
        pricePerNight: parseFloat(rate.net) / 1, // Calculate per night if needed
        nights: 1,
        currency: hotel.currency,
        boardType: rate.boardCode,
        boardName: rate.boardName,
        paymentType: rate.paymentType === "AT_WEB" ? "prepaid" : "pay_at_hotel",
        requiresRecheck: false,
        freeCancellation: rate.cancellationPolicies?.some(
          policy => new Date(policy.from) > new Date()
        ) || false,
        cancellationDeadline: rate.cancellationPolicies?.[0]?.from,
      };

      setUpdatedRate(updatedZivoRate);
      return updatedZivoRate;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Rate check failed";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create booking
  const createBooking = useCallback(async (formData: BookingFormData): Promise<BookingResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const clientReference = generateClientReference();

      // Build booking request
      const bookingRequest: HotelBookingRequest = {
        holder: {
          name: formData.holder.name,
          surname: formData.holder.surname,
        },
        rooms: formData.rooms.map((room, roomIndex) => ({
          rateKey: room.rateKey,
          paxes: room.guests.map((guest, guestIndex) => ({
            roomId: roomIndex + 1,
            type: guest.type,
            name: guest.name,
            surname: guest.surname,
            age: guest.age,
          })),
        })),
        clientReference,
        remark: formData.remarks,
        tolerance: 5, // Allow 5 currency units price tolerance
      };

      const { data, error: fetchError } = await supabase.functions.invoke<HotelbedsApiResponse<HotelBookingResponse>>(
        HOTELBEDS_HOTELS_FUNCTION,
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

      const result: BookingResult = {
        reference: booking.reference,
        clientReference: booking.clientReference,
        status: booking.status,
        hotelName: booking.hotel?.name || "Hotel",
        totalAmount: parseFloat(booking.totalNet),
        currency: booking.currency,
      };

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Booking failed";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get booking details
  const getBooking = useCallback(async (bookingId: string): Promise<HotelBookingResponse["booking"] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase.functions.invoke<HotelbedsApiResponse<HotelBookingResponse>>(
        HOTELBEDS_HOTELS_FUNCTION,
        {
          body: {
            action: "getBooking",
            bookingId,
          },
        }
      );

      if (fetchError) throw fetchError;
      if (!data?.success) throw new Error(data?.error || "Failed to retrieve booking");

      return data.data?.booking || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to retrieve booking";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cancel booking
  const cancelBooking = useCallback(async (bookingId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase.functions.invoke<HotelbedsApiResponse<unknown>>(
        HOTELBEDS_HOTELS_FUNCTION,
        {
          body: {
            action: "cancelBooking",
            bookingId,
          },
        }
      );

      if (fetchError) throw fetchError;
      if (!data?.success) throw new Error(data?.error || "Cancellation failed");

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Cancellation failed";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    priceChanged,
    updatedRate,
    checkRates,
    createBooking,
    getBooking,
    cancelBooking,
    generateClientReference,
  };
}
