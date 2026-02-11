/**
 * Calculate Price Edge Function
 * Server-side pricing engine with promo validation and A/B assignment
 */
import { serve, createClient } from "../_shared/deps.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PriceRequest {
  product_type: 'flight' | 'hotel' | 'activity' | 'transfer' | 'car_rental';
  supplier_price: number;
  tax_amount?: number;
  promo_code?: string;
  user_id?: string;
  session_id?: string;
  order_id?: string;
  experiment_ids?: string[];
  metadata?: Record<string, any>;
}

interface PricingRule {
  id: string;
  name: string;
  rule_type: 'markup_percent' | 'markup_flat' | 'service_fee_percent' | 'service_fee_flat';
  value: number;
  applies_to: string;
  min_order_value: number | null;
  max_order_value: number | null;
  priority: number;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body: PriceRequest = await req.json();
    const {
      product_type,
      supplier_price,
      tax_amount = 0,
      promo_code,
      user_id,
      session_id,
      order_id,
      experiment_ids = [],
      metadata = {}
    } = body;

    // Validate required fields
    if (!product_type || supplier_price === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: product_type, supplier_price' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get active pricing rules
    const { data: rules, error: rulesError } = await supabase
      .from('pricing_rules')
      .select('*')
      .eq('is_active', true)
      .or(`applies_to.eq.all,applies_to.eq.${product_type}`)
      .order('priority', { ascending: false });

    if (rulesError) {
      console.error('Error fetching pricing rules:', rulesError);
    }

    // Calculate markup and service fees
    let markupAmount = 0;
    let serviceFee = 0;
    const appliedRules: string[] = [];

    if (rules && rules.length > 0) {
      for (const rule of rules as PricingRule[]) {
        // Check order value constraints
        if (rule.min_order_value && supplier_price < rule.min_order_value) continue;
        if (rule.max_order_value && supplier_price > rule.max_order_value) continue;

        switch (rule.rule_type) {
          case 'markup_percent':
            markupAmount += supplier_price * (rule.value / 100);
            appliedRules.push(rule.id);
            break;
          case 'markup_flat':
            markupAmount += rule.value;
            appliedRules.push(rule.id);
            break;
          case 'service_fee_percent':
            serviceFee += supplier_price * (rule.value / 100);
            appliedRules.push(rule.id);
            break;
          case 'service_fee_flat':
            serviceFee += rule.value;
            appliedRules.push(rule.id);
            break;
        }
      }
    }

    // Round to 2 decimal places
    markupAmount = Math.round(markupAmount * 100) / 100;
    serviceFee = Math.round(serviceFee * 100) / 100;

    // Calculate subtotal before discount
    const subtotal = supplier_price + markupAmount + serviceFee + tax_amount;

    // Validate promo code if provided
    let discountAmount = 0;
    let promoId: string | null = null;
    let promoDetails: any = null;

    if (promo_code) {
      const { data: promoResult } = await supabase.rpc('validate_promo_code', {
        p_code: promo_code,
        p_user_id: user_id || null,
        p_order_total: subtotal,
        p_product_type: product_type
      });

      if (promoResult && promoResult.valid) {
        discountAmount = promoResult.discount_amount || 0;
        promoId = promoResult.promo_id;
        promoDetails = {
          id: promoResult.promo_id,
          name: promoResult.promo_name,
          discount_type: promoResult.discount_type,
          discount_amount: discountAmount
        };
      } else if (promoResult && !promoResult.valid) {
        return new Response(
          JSON.stringify({
            error: 'Invalid promo code',
            details: promoResult.error
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get experiment variants
    const experimentVariants: Record<string, string> = {};
    for (const expId of experiment_ids) {
      const { data: variant } = await supabase.rpc('get_experiment_variant', {
        p_experiment_id: expId,
        p_user_id: user_id || null,
        p_session_id: session_id || null
      });
      
      if (variant) {
        experimentVariants[expId] = variant;
      }
    }

    // Calculate final price
    const finalPrice = Math.max(subtotal - discountAmount, 0);

    // Log the calculation for audit
    const { error: logError } = await supabase
      .from('price_calculations')
      .insert({
        order_id: order_id || null,
        user_id: user_id || null,
        session_id: session_id || null,
        product_type,
        supplier_price,
        markup_amount: markupAmount,
        service_fee: serviceFee,
        tax_amount,
        discount_amount: discountAmount,
        final_price: finalPrice,
        promo_code: promo_code || null,
        promo_id: promoId,
        pricing_rules_applied: appliedRules,
        experiment_variant: Object.keys(experimentVariants).length > 0 
          ? JSON.stringify(experimentVariants) 
          : null,
        pricing_version: 1,
        calculation_inputs: {
          ...metadata,
          timestamp: new Date().toISOString()
        }
      });

    if (logError) {
      console.error('Error logging price calculation:', logError);
    }

    // Return pricing breakdown
    return new Response(
      JSON.stringify({
        success: true,
        pricing: {
          supplier_price: supplier_price,
          markup_amount: markupAmount,
          service_fee: serviceFee,
          tax_amount: tax_amount,
          subtotal: subtotal,
          discount_amount: discountAmount,
          final_price: finalPrice,
          currency: 'USD'
        },
        promo: promoDetails,
        experiments: experimentVariants,
        rules_applied: appliedRules.length,
        pricing_version: 1
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error calculating price:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
