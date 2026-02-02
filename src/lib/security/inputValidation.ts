/**
 * Input Validation & Sanitization
 * Prevents XSS, SQL injection, and validates travel-specific inputs
 */

import { z } from 'zod';

// ============= Basic Sanitization =============

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data: protocol
    .trim();
}

/**
 * Sanitize HTML content (strip all tags)
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim();
}

/**
 * Escape HTML entities
 */
export function escapeHtml(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return input.replace(/[&<>"']/g, (char) => map[char] || char);
}

// ============= Travel-Specific Validation =============

/**
 * IATA airport code validation
 */
export const iataCodeSchema = z
  .string()
  .length(3, 'Airport code must be 3 characters')
  .regex(/^[A-Z]{3}$/, 'Invalid airport code format')
  .transform((val) => val.toUpperCase());

/**
 * Validate IATA code
 */
export function validateIataCode(code: string): { valid: boolean; code?: string; error?: string } {
  try {
    const result = iataCodeSchema.parse(code.toUpperCase().trim());
    return { valid: true, code: result };
  } catch (e) {
    if (e instanceof z.ZodError) {
      return { valid: false, error: e.errors[0]?.message || 'Invalid airport code' };
    }
    return { valid: false, error: 'Invalid airport code' };
  }
}

/**
 * Travel date validation
 */
export const travelDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format')
  .refine((date) => {
    const d = new Date(date);
    return !isNaN(d.getTime());
  }, 'Invalid date')
  .refine((date) => {
    const d = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d >= today;
  }, 'Date cannot be in the past');

/**
 * Validate travel date
 */
export function validateTravelDate(date: string): { valid: boolean; date?: string; error?: string } {
  try {
    const result = travelDateSchema.parse(date);
    return { valid: true, date: result };
  } catch (e) {
    if (e instanceof z.ZodError) {
      return { valid: false, error: e.errors[0]?.message || 'Invalid date' };
    }
    return { valid: false, error: 'Invalid date' };
  }
}

/**
 * Passenger count validation
 */
export const passengerCountSchema = z
  .number()
  .int('Passenger count must be a whole number')
  .min(1, 'At least 1 passenger required')
  .max(9, 'Maximum 9 passengers allowed');

/**
 * Hotel guest count validation
 */
export const guestCountSchema = z
  .number()
  .int('Guest count must be a whole number')
  .min(1, 'At least 1 guest required')
  .max(20, 'Maximum 20 guests allowed');

/**
 * Room count validation
 */
export const roomCountSchema = z
  .number()
  .int('Room count must be a whole number')
  .min(1, 'At least 1 room required')
  .max(10, 'Maximum 10 rooms allowed');

/**
 * Driver age validation (for car rentals)
 */
export const driverAgeSchema = z
  .number()
  .int('Age must be a whole number')
  .min(18, 'Driver must be at least 18 years old')
  .max(99, 'Invalid driver age');

/**
 * City name validation
 */
export const cityNameSchema = z
  .string()
  .min(2, 'City name too short')
  .max(100, 'City name too long')
  .regex(/^[a-zA-Z\s\-'.,]+$/, 'City name contains invalid characters')
  .transform((val) => sanitizeString(val));

/**
 * Email validation
 */
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .max(254, 'Email too long')
  .transform((val) => val.toLowerCase().trim());

/**
 * Phone validation
 */
export const phoneSchema = z
  .string()
  .min(7, 'Phone number too short')
  .max(20, 'Phone number too long')
  .regex(/^\+?[0-9\s\-()]+$/, 'Invalid phone format');

/**
 * Message/comment validation
 */
export const messageSchema = z
  .string()
  .min(10, 'Message too short')
  .max(2000, 'Message too long')
  .transform((val) => sanitizeString(val));

// ============= Composite Schemas =============

/**
 * Flight search parameters schema
 */
export const flightSearchSchema = z.object({
  origin: iataCodeSchema,
  destination: iataCodeSchema,
  departDate: travelDateSchema,
  returnDate: travelDateSchema.optional(),
  passengers: passengerCountSchema,
  cabinClass: z.enum(['economy', 'premium_economy', 'business', 'first']).optional(),
});

/**
 * Hotel search parameters schema
 */
export const hotelSearchSchema = z.object({
  destination: cityNameSchema,
  checkIn: travelDateSchema,
  checkOut: travelDateSchema,
  rooms: roomCountSchema,
  guests: guestCountSchema,
});

/**
 * Car search parameters schema
 */
export const carSearchSchema = z.object({
  pickupLocation: cityNameSchema,
  dropoffLocation: cityNameSchema.optional(),
  pickupDate: travelDateSchema,
  dropoffDate: travelDateSchema,
  driverAge: driverAgeSchema,
});

/**
 * Contact form schema
 */
export const contactFormSchema = z.object({
  name: z.string().min(2).max(100).transform(sanitizeString),
  email: emailSchema,
  subject: z.string().min(5).max(200).transform(sanitizeString),
  message: messageSchema,
  honeypot: z.string().max(0, 'Bot detected').optional(), // Hidden field for bots
});

// ============= Validation Functions =============

/**
 * Validate flight search params
 */
export function validateFlightSearch(params: unknown) {
  return flightSearchSchema.safeParse(params);
}

/**
 * Validate hotel search params
 */
export function validateHotelSearch(params: unknown) {
  return hotelSearchSchema.safeParse(params);
}

/**
 * Validate car search params
 */
export function validateCarSearch(params: unknown) {
  return carSearchSchema.safeParse(params);
}

/**
 * Validate contact form
 */
export function validateContactForm(params: unknown) {
  return contactFormSchema.safeParse(params);
}

// ============= Type Exports =============

export type FlightSearchParams = z.infer<typeof flightSearchSchema>;
export type HotelSearchParams = z.infer<typeof hotelSearchSchema>;
export type CarSearchParams = z.infer<typeof carSearchSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
