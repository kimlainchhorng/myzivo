/**
 * Centralized Dependency Versions for Edge Functions
 * All edge functions should import from here to ensure consistent versions.
 * 
 * Usage:
 *   import { createClient, Stripe, serve } from "../_shared/deps.ts";
 */

export { serve } from "https://deno.land/std@0.190.0/http/server.ts";
export { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
export { default as Stripe } from "https://esm.sh/stripe@18.5.0";
