/**
 * Centralized Dependency Versions for Edge Functions
 * 
 * For Stripe, import separately to avoid bundling it in non-Stripe functions:
 *   import Stripe from "../_shared/stripe.ts";
 */

export { serve } from "https://deno.land/std@0.190.0/http/server.ts";
export { createClient } from "npm:@supabase/supabase-js@2.57.2";
