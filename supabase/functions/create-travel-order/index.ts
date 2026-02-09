/**
 * Create Travel Order
 * Creates a new order with items for hotel/activity/transfer bookings
 * Calculates ZIVO revenue (commission, markup, service fee) per item
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Default revenue rates (can be overridden by finance_settings)
const DEFAULT_COMMISSION_RATES: Record<string, number> = {
  hotel: 0.10,
  activity: 0.12,
  transfer: 0.08,
};

const DEFAULT_MARKUP_RATES: Record<string, number> = {
  hotel: 0.05,
  activity: 0.05,
  transfer: 0.05,
};

const SERVICE_FEE_CONFIG = {
  type: "percentage" as const,
  value: 0.05,
  min: 2.99,
  max: 49.99,
};

interface OrderItem {
  type: "hotel" | "activity" | "transfer";
  title: string;
  startDate: string;
  endDate?: string;
  adults: number;
  children?: number;
  quantity?: number;
  price: number;
  supplierNetPrice?: number; // Optional: supplier's net cost
  meta: Record<string, unknown>;
}

interface CreateOrderRequest {
  items: OrderItem[];
  holder: {
    name: string;
    email: string;
    phone?: string;
  };
  currency?: string;
}

interface FinanceSettings {
  commissionRates: Record<string, number>;
  markupRates: Record<string, number>;
  serviceFee: { type: string; value: number; min: number; max: number };
}

// Calculate revenue breakdown for an item
function calculateItemRevenue(
  item: OrderItem,
  settings: FinanceSettings
): {
  supplierNetPrice: number;
  zivoMarkup: number;
  zivoCommission: number;
  serviceFee: number;
  zivoRevenue: number;
  supplierPayout: number;
} {
  const qty = item.quantity || 1;
  const totalPrice = item.price * qty;
  
  // Supplier net price - either provided or calculated (price minus markup)
  const markupRate = settings.markupRates[item.type] || 0.05;
  const commissionRate = settings.commissionRates[item.type] || 0.10;
  
  // If supplier net price provided, use it; otherwise estimate from price
  const supplierNetPrice = item.supplierNetPrice 
    ? item.supplierNetPrice * qty
    : Math.round(totalPrice / (1 + markupRate) * 100) / 100;
  
  // Calculate markup (difference between sell price and supplier cost)
  const zivoMarkup = Math.round((totalPrice - supplierNetPrice) * 100) / 100;
  
  // Commission is based on supplier net price
  const zivoCommission = Math.round(supplierNetPrice * commissionRate * 100) / 100;
  
  // Service fee calculation
  let serviceFee = 0;
  if (settings.serviceFee.type === "percentage") {
    serviceFee = totalPrice * settings.serviceFee.value;
    serviceFee = Math.max(settings.serviceFee.min, Math.min(settings.serviceFee.max, serviceFee));
    serviceFee = Math.round(serviceFee * 100) / 100;
  } else {
    serviceFee = settings.serviceFee.value;
  }
  
  // Total ZIVO revenue
  const zivoRevenue = zivoMarkup + zivoCommission + serviceFee;
  
  // Supplier payout (what we owe the supplier)
  const supplierPayout = supplierNetPrice;
  
  return {
    supplierNetPrice,
    zivoMarkup,
    zivoCommission,
    serviceFee,
    zivoRevenue: Math.round(zivoRevenue * 100) / 100,
    supplierPayout: Math.round(supplierPayout * 100) / 100,
  };
}

// Fetch finance settings from database
// deno-lint-ignore no-explicit-any
async function getFinanceSettings(supabase: any): Promise<FinanceSettings> {
  const { data: settings } = await supabase
    .from("finance_settings")
    .select("setting_key, setting_value");
  
  const settingsMap = new Map(settings?.map((s: { setting_key: string; setting_value: unknown }) => [s.setting_key, s.setting_value]) || []);
  
  return {
    commissionRates: (settingsMap.get("default_commission_rate") as Record<string, number>) || DEFAULT_COMMISSION_RATES,
    markupRates: (settingsMap.get("default_markup_rate") as Record<string, number>) || DEFAULT_MARKUP_RATES,
    serviceFee: (settingsMap.get("service_fee") as typeof SERVICE_FEE_CONFIG) || SERVICE_FEE_CONFIG,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header (optional for guest checkout)
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id ?? null;
    }

    const body: CreateOrderRequest = await req.json();
    const { items, holder, currency = "USD" } = body;

    // Check if travel service is in maintenance
    const { data: serviceStatus } = await supabase
      .from("service_health_status")
      .select("status, is_paused")
      .eq("service_name", "hotels")
      .maybeSingle();

    if (serviceStatus?.status === "maintenance" || serviceStatus?.status === "outage" || serviceStatus?.is_paused) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Service temporarily unavailable",
          maintenance: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 503 }
      );
    }

    // Validate required fields
    if (!items || items.length === 0) {
      throw new Error("At least one item is required");
    }
    if (!holder?.name || !holder?.email) {
      throw new Error("Holder name and email are required");
    }

    // Get finance settings for revenue calculation
    const financeSettings = await getFinanceSettings(supabase);

    // Calculate revenue for each item
    const itemsWithRevenue = items.map((item) => {
      const revenue = calculateItemRevenue(item, financeSettings);
      return { item, revenue };
    });

    // Calculate totals
    const subtotal = items.reduce((sum, item) => {
      const qty = item.quantity || 1;
      return sum + (item.price * qty);
    }, 0);
    
    // Sum up service fees from items
    const totalServiceFees = itemsWithRevenue.reduce((sum, { revenue }) => sum + revenue.serviceFee, 0);
    const fees = Math.round(totalServiceFees * 100) / 100;
    
    // Tax placeholder (could be calculated based on destination)
    const taxes = 0;
    const total = Math.round((subtotal + fees + taxes) * 100) / 100;

    // Calculate total ZIVO revenue and supplier payout
    const totalZivoRevenue = itemsWithRevenue.reduce((sum, { revenue }) => sum + revenue.zivoRevenue, 0);
    const totalSupplierPayout = itemsWithRevenue.reduce((sum, { revenue }) => sum + revenue.supplierPayout, 0);

    // Create order with revenue columns
    const { data: order, error: orderError } = await supabase
      .from("travel_orders")
      .insert({
        user_id: userId,
        currency,
        subtotal,
        taxes,
        fees,
        total,
        total_zivo_revenue: Math.round(totalZivoRevenue * 100) / 100,
        total_supplier_payout: Math.round(totalSupplierPayout * 100) / 100,
        status: "draft",
        provider: "hotelbeds",
        holder_name: holder.name,
        holder_email: holder.email,
        holder_phone: holder.phone || null,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      throw new Error("Failed to create order");
    }

    // Create order items with revenue breakdown
    const orderItems = itemsWithRevenue.map(({ item, revenue }) => ({
      order_id: order.id,
      type: item.type,
      provider: "hotelbeds",
      title: item.title,
      start_date: item.startDate,
      end_date: item.endDate || null,
      adults: item.adults,
      children: item.children || 0,
      quantity: item.quantity || 1,
      price: item.price,
      supplier_net_price: revenue.supplierNetPrice,
      zivo_markup: revenue.zivoMarkup,
      zivo_commission: revenue.zivoCommission,
      service_fee: revenue.serviceFee,
      zivo_revenue: revenue.zivoRevenue,
      supplier_payout: revenue.supplierPayout,
      meta: item.meta,
      status: "reserved",
    }));

    const { data: insertedItems, error: itemsError } = await supabase
      .from("travel_order_items")
      .insert(orderItems)
      .select("id, type, zivo_revenue, zivo_commission, zivo_markup, service_fee");

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      // Rollback order
      await supabase.from("travel_orders").delete().eq("id", order.id);
      throw new Error("Failed to create order items");
    }

    // Record financial transactions for each revenue component
    const financialTransactions = [];
    for (const insertedItem of (insertedItems || [])) {
      if (insertedItem.zivo_commission > 0) {
        financialTransactions.push({
          order_id: order.id,
          order_item_id: insertedItem.id,
          type: "commission",
          amount: insertedItem.zivo_commission,
          currency,
          description: `Commission for ${insertedItem.type}`,
        });
      }
      if (insertedItem.zivo_markup > 0) {
        financialTransactions.push({
          order_id: order.id,
          order_item_id: insertedItem.id,
          type: "markup",
          amount: insertedItem.zivo_markup,
          currency,
          description: `Markup for ${insertedItem.type}`,
        });
      }
      if (insertedItem.service_fee > 0) {
        financialTransactions.push({
          order_id: order.id,
          order_item_id: insertedItem.id,
          type: "fee",
          amount: insertedItem.service_fee,
          currency,
          description: `Service fee for ${insertedItem.type}`,
        });
      }
    }

    if (financialTransactions.length > 0) {
      await supabase.from("financial_transactions").insert(financialTransactions);
    }

    // Log audit event
    await supabase.from("booking_audit_logs").insert({
      order_id: order.id,
      user_id: userId,
      event: "order_created",
      meta: {
        item_count: items.length,
        total,
        currency,
        item_types: items.map((i) => i.type),
      },
    });

    console.log("[CreateOrder] Order created:", order.order_number);

    return new Response(
      JSON.stringify({
        success: true,
        orderId: order.id,
        orderNumber: order.order_number,
        total: order.total,
        currency: order.currency,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    console.error("[CreateOrder] Error:", error);
    const message = error instanceof Error ? error.message : "An error occurred";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
