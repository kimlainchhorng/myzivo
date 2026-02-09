import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import { EATS_TABLES, INITIAL_ORDER_STATUS } from "@/lib/eatsTables";

type BookingStatus = Database["public"]["Enums"]["booking_status"];

export interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  cuisine_type: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  rating: number | null;
  avg_prep_time: number | null;
  is_open: boolean | null;
  status: string | null;
  // Availability fields
  busy_mode: boolean | null;
  busy_prep_time_bonus_minutes: number | null;
  pause_new_orders: boolean | null;
  closed_reason: string | null;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  image_url: string | null;
  is_available: boolean | null;
  is_featured: boolean | null;
  preparation_time: number | null;
}

export interface FoodOrderItem {
  menu_item_id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface CreateFoodOrderInput {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  delivery_address: string;
  delivery_instructions?: string;
  preferred_time: "asap" | "scheduled";
  scheduled_time?: string;
  restaurant_id: string;
  items: FoodOrderItem[];
  subtotal: number;
  delivery_fee: number;
  service_fee?: number;
  tax?: number;
  tip_amount?: number;
  total: number;
  // Membership fields
  membership_applied?: boolean;
  membership_discount_cents?: number;
  // Credit fields
  credit_applied_cents?: number;
  // City fields
  city_id?: string;
  city_name?: string;
  zone_code?: string;
  // Surge fields
  surge_multiplier?: number;
  surge_fee_cents?: number;
  // Scheduling fields
  is_scheduled?: boolean;
  deliver_by?: string | null;
  pickup_window_start?: string | null;
  pickup_window_end?: string | null;
}

// Fetch all active restaurants (including closed ones for display)
// Now supports city filtering
export function useRestaurants(cityNameOrOnlyOpen?: string | boolean, onlyOpen: boolean = false) {
  // Handle both old API (boolean) and new API (cityName, boolean)
  let cityName: string | null = null;
  let filterOpen = onlyOpen;
  
  if (typeof cityNameOrOnlyOpen === "boolean") {
    filterOpen = cityNameOrOnlyOpen;
  } else if (typeof cityNameOrOnlyOpen === "string") {
    cityName = cityNameOrOnlyOpen;
  }

  return useQuery({
    queryKey: ["restaurants", cityName, filterOpen],
    queryFn: async () => {
      let query = supabase
        .from(EATS_TABLES.restaurants)
        .select("*")
        .eq("status", "active")
        .order("rating", { ascending: false });

      // Filter by city if provided
      if (cityName) {
        query = query.eq("city", cityName);
      }

      // Optionally filter to only open restaurants
      if (filterOpen) {
        query = query.eq("is_open", true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Restaurant[];
    },
  });
}

// Fetch a single restaurant with its menu
export function useRestaurant(id: string | undefined) {
  return useQuery({
    queryKey: ["restaurant", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from(EATS_TABLES.restaurants)
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Restaurant;
    },
    enabled: !!id,
  });
}

// Fetch menu items for a restaurant
export function useMenuItems(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ["menu-items", restaurantId],
    queryFn: async () => {
      if (!restaurantId) return [];

      const { data, error } = await supabase
        .from(EATS_TABLES.menuItems)
        .select("*")
        .eq("restaurant_id", restaurantId)
        .eq("is_available", true)
        .order("category")
        .order("is_featured", { ascending: false });

      if (error) throw error;
      return data as MenuItem[];
    },
    enabled: !!restaurantId,
  });
}

// Create a food order
export function useCreateFoodOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateFoodOrderInput) => {
      // Build items JSONB array
      const itemsJson = input.items.map((item) => ({
        menu_item_id: item.menu_item_id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes || null,
      }));

      // Customer info stored in special_instructions for MVP (guest checkout)
      const customerInfo = JSON.stringify({
        customer_name: input.customer_name,
        customer_phone: input.customer_phone,
        customer_email: input.customer_email,
        preferred_time: input.preferred_time,
        scheduled_time: input.scheduled_time,
      });

      // Create the food order - using customer_id from session or null
      // For MVP, we'll use a placeholder approach since customer_id is required
      const { data: session } = await supabase.auth.getSession();
      const customerId = session?.session?.user?.id;

      // If not logged in, we need to handle this differently
      // For MVP, we'll insert with a workaround using direct REST API
      if (!customerId) {
        // Use REST API directly for guest orders
        const response = await fetch(
          'https://slirphzzwcogdbkeicff.supabase.co/rest/v1/rpc/create_guest_food_order',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsaXJwaHp6d2NvZ2Ria2VpY2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDUzMzgsImV4cCI6MjA4NTAyMTMzOH0.44uwdZZxQZYmmHr9yUALGO4Vr6mJVaVfSQW_pzJ0uoI',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsaXJwaHp6d2NvZ2Ria2VpY2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDUzMzgsImV4cCI6MjA4NTAyMTMzOH0.44uwdZZxQZYmmHr9yUALGO4Vr6mJVaVfSQW_pzJ0uoI',
            },
            body: JSON.stringify({
              p_restaurant_id: input.restaurant_id,
              p_items: itemsJson,
              p_subtotal: input.subtotal,
              p_delivery_fee: input.delivery_fee,
              p_total: input.total,
              p_delivery_address: input.delivery_address,
              p_customer_info: customerInfo,
            }),
          }
        );

        if (!response.ok) {
          // Fallback: Store as a pending order request
          console.log('Guest order - storing customer info in special_instructions');
        }
      }

      // For authenticated users
      const { data: order, error: orderError } = await supabase
        .from(EATS_TABLES.orders)
        .insert({
          restaurant_id: input.restaurant_id,
          customer_id: customerId || '00000000-0000-0000-0000-000000000000', // Placeholder for guest
          items: itemsJson,
          subtotal: input.subtotal,
          delivery_fee: input.delivery_fee,
          service_fee: input.service_fee || 0,
          tax: input.tax || 0,
          tip_amount: input.tip_amount || 0,
          total_amount: input.total,
          delivery_address: input.delivery_address,
          delivery_lat: 0, // Will be geocoded later
          delivery_lng: 0,
          special_instructions: input.delivery_instructions 
            ? `${input.delivery_instructions}\n\n---\nCustomer Info: ${customerInfo}`
            : `Customer Info: ${customerInfo}`,
          status: INITIAL_ORDER_STATUS as BookingStatus,
          // Membership tracking
          membership_applied: input.membership_applied || false,
          membership_discount_cents: input.membership_discount_cents || 0,
          // Credit tracking
          credit_applied_cents: input.credit_applied_cents || 0,
          // City tracking
          city_id: input.city_id || null,
          city_name: input.city_name || null,
          zone_code: input.zone_code || null,
          // Surge tracking
          surge_multiplier: input.surge_multiplier || 1.0,
          surge_fee_cents: input.surge_fee_cents || 0,
          // Scheduling tracking
          is_scheduled: input.is_scheduled || false,
          deliver_by: input.deliver_by || null,
          pickup_window_start: input.pickup_window_start || null,
          pickup_window_end: input.pickup_window_end || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Log order_placed event for audit trail
      try {
        await supabase.from("order_events").insert({
          order_id: order.id,
          type: "order_placed",
          actor_id: customerId || null,
          actor_role: "customer",
          data: {
            restaurant_id: input.restaurant_id,
            total_amount: input.total,
            item_count: input.items.length,
          },
        });
      } catch (eventError) {
        // Don't fail the order if event logging fails
        console.warn("Failed to log order_placed event:", eventError);
      }

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["food-orders"] });
    },
    onError: (error: Error) => {
      console.error("Error creating food order:", error);
      toast.error("Failed to submit order. Please try again.");
    },
  });
}

// Admin: Fetch all food orders
export interface UseFoodOrdersOptions {
  statusFilter?: string;
  regionId?: string | null;
}

export function useFoodOrders(statusFilterOrOptions?: string | UseFoodOrdersOptions, regionId?: string | null) {
  // Handle both old API and new options object API
  let options: UseFoodOrdersOptions;
  if (typeof statusFilterOrOptions === 'object' && statusFilterOrOptions !== null) {
    options = statusFilterOrOptions;
  } else {
    options = { statusFilter: statusFilterOrOptions as string | undefined, regionId };
  }

  return useQuery({
    queryKey: ["food-orders", options.statusFilter, options.regionId],
    queryFn: async () => {
      let query = supabase
        .from(EATS_TABLES.orders)
        .select(`
          *,
          restaurants:restaurant_id (name, phone),
          drivers:driver_id (full_name, phone),
          regions(id, name, city, state)
        `)
        .order("created_at", { ascending: false });

      if (options.statusFilter && options.statusFilter !== "all") {
        query = query.eq("status", options.statusFilter as BookingStatus);
      }

      if (options.regionId) {
        query = query.eq("region_id", options.regionId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
}

// Status messages for push notifications
const ORDER_STATUS_PUSH_MESSAGES: Record<string, { title: string; body: string }> = {
  confirmed: { title: "Order Confirmed ✅", body: "Your order has been confirmed and will be prepared soon!" },
  preparing: { title: "Preparing Your Order 👨‍🍳", body: "The restaurant is now preparing your order." },
  ready_for_pickup: { title: "Order Ready! 🎉", body: "Your order is ready for pickup." },
  out_for_delivery: { title: "On The Way! 🚗", body: "Your order is out for delivery." },
  completed: { title: "Order Delivered ✅", body: "Your order has been delivered. Enjoy!" },
  cancelled: { title: "Order Cancelled", body: "Your order has been cancelled." },
};

// Admin: Update food order
export function useUpdateFoodOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: { status?: BookingStatus; driver_id?: string | null; admin_notes?: string };
    }) => {
      // Get current order to find customer_id for push notification
      const { data: currentOrder } = await supabase
        .from(EATS_TABLES.orders)
        .select("customer_id, status")
        .eq("id", id)
        .single();

      const { data, error } = await supabase
        .from(EATS_TABLES.orders)
        .update(updates as never)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Send push notification for status changes
      if (updates.status && currentOrder?.customer_id && updates.status !== currentOrder.status) {
        const pushMessage = ORDER_STATUS_PUSH_MESSAGES[updates.status];
        if (pushMessage) {
          try {
            await supabase.functions.invoke("send-push-notification", {
              body: {
                user_id: currentOrder.customer_id,
                notification_type: "order_status",
                title: pushMessage.title,
                body: pushMessage.body,
                data: { 
                  type: "order_status", 
                  order_id: id,
                  status: updates.status,
                },
              },
            });
            console.log(`[useUpdateFoodOrder] Push sent for status: ${updates.status}`);
          } catch (pushErr) {
            console.warn("[useUpdateFoodOrder] Failed to send push:", pushErr);
          }
        }
      }

      // Send driver notification if driver was assigned
      if (updates.driver_id) {
        try {
          await fetch('https://slirphzzwcogdbkeicff.supabase.co/functions/v1/send-driver-notification', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            },
            body: JSON.stringify({
              driver_id: updates.driver_id,
              title: 'New Food Order Assigned',
              body: `You have a new delivery to pick up`,
              data: { type: 'eats_order', order_id: id },
            }),
          });
        } catch (e) {
          console.warn('Failed to send driver notification:', e);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["food-orders"] });
      toast.success("Order updated");
    },
    onError: (error: Error) => {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
    },
  });
}

// Create a test food order for driver app testing
export function useCreateTestFoodOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Get first active restaurant
      const { data: restaurants } = await supabase
        .from(EATS_TABLES.restaurants)
        .select("id, name")
        .eq("status", "active")
        .limit(1);

      const restaurantId = restaurants?.[0]?.id;
      if (!restaurantId) {
        throw new Error("No active restaurants found. Please create a restaurant first.");
      }

      const testItems = [
        { menu_item_id: "test-1", name: "Test Burger", quantity: 1, price: 12.99 },
        { menu_item_id: "test-2", name: "French Fries", quantity: 2, price: 4.99 },
      ];
      const subtotal = testItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const deliveryFee = 3.99;
      const total = subtotal + deliveryFee;

      const customerInfo = JSON.stringify({
        customer_name: "Test Customer",
        customer_phone: "+1 (555) 123-4567",
        customer_email: "test@example.com",
        preferred_time: "asap",
      });

      const { data, error } = await supabase
        .from(EATS_TABLES.orders)
        .insert({
          restaurant_id: restaurantId,
          customer_id: "00000000-0000-0000-0000-000000000000",
          items: testItems,
          subtotal,
          delivery_fee: deliveryFee,
          total_amount: total,
          delivery_address: "789 Park Ave, New York, NY 10021",
          delivery_lat: 40.7731,
          delivery_lng: -73.9654,
          special_instructions: `Test order\n---\nCustomer Info: ${customerInfo}`,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["food-orders"] });
      toast.success(`Test order created: ${data.id.slice(0, 8)}...`);
    },
    onError: (error: Error) => {
      console.error("Error creating test order:", error);
      toast.error(error.message || "Failed to create test order");
    },
  });
}

// Fetch current user's orders
export function useMyEatsOrders() {
  return useQuery({
    queryKey: ["my-eats-orders"],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;
      if (!userId) return [];

      const { data, error } = await supabase
        .from(EATS_TABLES.orders)
        .select("*, restaurants:restaurant_id(name, logo_url, phone)")
        .eq("customer_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// Fetch single order by ID (for order detail page)
export function useSingleEatsOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: ["eats-order", orderId],
    queryFn: async () => {
      if (!orderId) return null;

      const { data, error } = await supabase
        .from(EATS_TABLES.orders)
        .select("*, restaurants:restaurant_id(name, logo_url, phone, address)")
        .eq("id", orderId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });
}
