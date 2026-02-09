/**
 * ZIVO Eats Unified API Layer
 * Single source of truth for all Eats-related database operations
 */
import { supabase } from "@/integrations/supabase/client";
import { EATS_TABLES, INITIAL_ORDER_STATUS } from "./eatsTables";
import type { Database } from "@/integrations/supabase/types";

type BookingStatus = Database["public"]["Enums"]["booking_status"];

// ==================== TYPES ====================

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
  total_orders: number | null;
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
  imageUrl?: string;
}

export interface CreateOrderParams {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_address: string;
  delivery_instructions?: string;
  restaurant_id: string;
  items: FoodOrderItem[];
  subtotal: number;
  delivery_fee: number;
  service_fee?: number;
  tax?: number;
  tip?: number;
  discount_amount?: number;
  promo_code?: string;
  total: number;
}

export interface EatsNotification {
  id: string;
  user_id: string | null;
  order_id: string | null;
  title: string;
  body: string;
  action_url: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  metadata: Record<string, unknown>;
}

export interface RestaurantFavorite {
  id: string;
  user_id: string;
  item_type: "restaurant";
  item_id: string;
  item_data: {
    name: string;
    logo_url: string | null;
    cuisine_type: string | null;
    rating: number | null;
    cover_image_url?: string | null;
  };
  created_at: string;
}

// ==================== RESTAURANTS ====================

export const eatsApi = {
  /**
   * Fetch all active restaurants
   */
  async getRestaurants(onlyOpen = false): Promise<Restaurant[]> {
    let query = supabase
      .from(EATS_TABLES.restaurants)
      .select("*")
      .eq("status", "active")
      .order("rating", { ascending: false });

    if (onlyOpen) {
      query = query.eq("is_open", true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Restaurant[];
  },

  /**
   * Fetch a single restaurant by ID
   */
  async getRestaurant(id: string): Promise<Restaurant | null> {
    const { data, error } = await supabase
      .from(EATS_TABLES.restaurants)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data as Restaurant | null;
  },

  // ==================== MENU ====================

  /**
   * Fetch menu items for a restaurant (includes unavailable items for display)
   */
  async getMenu(restaurantId: string): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from(EATS_TABLES.menuItems)
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("is_available", { ascending: false }) // Available items first
      .order("category")
      .order("is_featured", { ascending: false });

    if (error) throw error;
    return data as MenuItem[];
  },

  // ==================== ORDERS ====================

  /**
   * Create a new food order from cart
   */
  async createOrderFromCart(params: CreateOrderParams) {
    const { data: session } = await supabase.auth.getSession();
    const customerId = session?.session?.user?.id;

    // Build items JSONB array
    const itemsJson = params.items.map((item) => ({
      menu_item_id: item.menu_item_id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      notes: item.notes || null,
      imageUrl: item.imageUrl || null,
    }));

    // Customer info for guest checkout
    const customerInfo = JSON.stringify({
      customer_name: params.customer_name,
      customer_phone: params.customer_phone,
      customer_email: params.customer_email,
    });

    const { data: order, error } = await supabase
      .from(EATS_TABLES.orders)
      .insert({
        restaurant_id: params.restaurant_id,
        customer_id: customerId || "00000000-0000-0000-0000-000000000000",
        customer_name: params.customer_name,
        customer_phone: params.customer_phone,
        customer_email: params.customer_email || null,
        items: itemsJson,
        subtotal: params.subtotal,
        delivery_fee: params.delivery_fee,
        tax: params.tax || 0,
        total_amount: params.total,
        delivery_address: params.delivery_address,
        delivery_lat: 0,
        delivery_lng: 0,
        special_instructions: params.delivery_instructions
          ? `${params.delivery_instructions}\n\n---\nCustomer Info: ${customerInfo}`
          : `Customer Info: ${customerInfo}`,
        status: INITIAL_ORDER_STATUS as BookingStatus,
        promo_code: params.promo_code || null,
        discount_amount: params.discount_amount || 0,
      })
      .select()
      .single();

    if (error) throw error;
    return order;
  },

  /**
   * Fetch current user's orders
   */
  async getMyOrders() {
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

  /**
   * Fetch a single order by ID
   */
  async getOrder(orderId: string) {
    const { data, error } = await supabase
      .from(EATS_TABLES.orders)
      .select("*, restaurants:restaurant_id(name, logo_url, phone, address)")
      .eq("id", orderId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Subscribe to real-time order updates
   */
  subscribeToOrder(orderId: string, callback: (order: unknown) => void) {
    const channel = supabase
      .channel(`eats-order-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: EATS_TABLES.orders,
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          if (payload.new) {
            callback(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // ==================== ALERTS / NOTIFICATIONS ====================

  /**
   * Get eats-related notifications for current user
   */
  async getAlerts(): Promise<EatsNotification[]> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return [];

    const { data, error } = await supabase
      .from(EATS_TABLES.notifications)
      .select("*")
      .eq("user_id", session.session.user.id)
      .eq("channel", "in_app")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return (data || []) as unknown as EatsNotification[];
  },

  /**
   * Mark a single alert as read
   */
  async markAlertRead(alertId: string): Promise<void> {
    const { error } = await supabase
      .from(EATS_TABLES.notifications)
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", alertId);

    if (error) throw error;
  },

  /**
   * Mark all alerts as read
   */
  async markAllAlertsRead(): Promise<void> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return;

    const { error } = await supabase
      .from(EATS_TABLES.notifications)
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("user_id", session.session.user.id)
      .eq("is_read", false);

    if (error) throw error;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return 0;

    const { count, error } = await supabase
      .from(EATS_TABLES.notifications)
      .select("id", { count: "exact", head: true })
      .eq("user_id", session.session.user.id)
      .eq("channel", "in_app")
      .eq("is_read", false);

    if (error) {
      console.error("Error fetching unread count:", error);
      return 0;
    }
    return count || 0;
  },

  // ==================== FAVORITES ====================

  /**
   * Get user's favorite restaurants
   */
  async getFavorites(): Promise<RestaurantFavorite[]> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return [];

    const { data, error } = await supabase
      .from("user_favorites")
      .select("*")
      .eq("user_id", session.session.user.id)
      .eq("item_type", "restaurant")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as RestaurantFavorite[];
  },

  /**
   * Add a restaurant to favorites
   */
  async addFavorite(
    restaurantId: string,
    restaurantData: RestaurantFavorite["item_data"]
  ): Promise<void> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) throw new Error("Not authenticated");

    const { error } = await supabase.from("user_favorites").insert({
      user_id: session.session.user.id,
      item_type: "restaurant",
      item_id: restaurantId,
      item_data: restaurantData,
    });

    // Ignore duplicate error (already favorited)
    if (error && error.code !== "23505") throw error;
  },

  /**
   * Remove a restaurant from favorites
   */
  async removeFavorite(restaurantId: string): Promise<void> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return;

    const { error } = await supabase
      .from("user_favorites")
      .delete()
      .eq("user_id", session.session.user.id)
      .eq("item_type", "restaurant")
      .eq("item_id", restaurantId);

    if (error) throw error;
  },

  /**
   * Check if a restaurant is favorited
   */
  async isFavorite(restaurantId: string): Promise<boolean> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return false;

    const { data, error } = await supabase
      .from("user_favorites")
      .select("id")
      .eq("user_id", session.session.user.id)
      .eq("item_type", "restaurant")
      .eq("item_id", restaurantId)
      .maybeSingle();

    if (error) return false;
    return !!data;
  },
};
