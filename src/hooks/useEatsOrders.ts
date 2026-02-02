import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

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
  total: number;
}

// Fetch all active restaurants
export function useRestaurants() {
  return useQuery({
    queryKey: ["restaurants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("status", "active")
        .eq("is_open", true)
        .order("rating", { ascending: false });

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
        .from("restaurants")
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
        .from("menu_items")
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
        .from("food_orders")
        .insert({
          restaurant_id: input.restaurant_id,
          customer_id: customerId || '00000000-0000-0000-0000-000000000000', // Placeholder for guest
          items: itemsJson,
          subtotal: input.subtotal,
          delivery_fee: input.delivery_fee,
          total_amount: input.total,
          delivery_address: input.delivery_address,
          delivery_lat: 0, // Will be geocoded later
          delivery_lng: 0,
          special_instructions: input.delivery_instructions 
            ? `${input.delivery_instructions}\n\n---\nCustomer Info: ${customerInfo}`
            : `Customer Info: ${customerInfo}`,
          status: "pending" as BookingStatus,
        })
        .select()
        .single();

      if (orderError) throw orderError;

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
        .from("food_orders")
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
      const { data, error } = await supabase
        .from("food_orders")
        .update(updates as never)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

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
        .from("restaurants")
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
        .from("food_orders")
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
