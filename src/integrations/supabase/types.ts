export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      achievement_definitions: {
        Row: {
          category: string
          created_at: string | null
          description: string
          icon: string
          id: string
          name: string
          sort_order: number | null
          threshold: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          icon: string
          id: string
          name: string
          sort_order?: number | null
          threshold?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          name?: string
          sort_order?: number | null
          threshold?: number | null
        }
        Relationships: []
      }
      airlines: {
        Row: {
          code: string
          country: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
        }
        Insert: {
          code: string
          country?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
        }
        Update: {
          code?: string
          country?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      analytics_goals: {
        Row: {
          created_at: string
          goal_type: string
          id: string
          is_active: boolean | null
          period: string
          target_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          goal_type: string
          id?: string
          is_active?: boolean | null
          period: string
          target_value: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          goal_type?: string
          id?: string
          is_active?: boolean | null
          period?: string
          target_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      anomaly_logs: {
        Row: {
          actual_value: number
          anomaly_date: string
          anomaly_type: string
          created_at: string
          direction: string
          expected_value: number
          id: string
          message: string
          percent_deviation: number
          resolution_notes: string | null
          resolved_at: string | null
          root_cause_category: string | null
          root_cause_confirmed: boolean | null
          root_cause_title: string | null
          severity: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_value: number
          anomaly_date: string
          anomaly_type: string
          created_at?: string
          direction: string
          expected_value: number
          id?: string
          message: string
          percent_deviation: number
          resolution_notes?: string | null
          resolved_at?: string | null
          root_cause_category?: string | null
          root_cause_confirmed?: boolean | null
          root_cause_title?: string | null
          severity: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_value?: number
          anomaly_date?: string
          anomaly_type?: string
          created_at?: string
          direction?: string
          expected_value?: number
          id?: string
          message?: string
          percent_deviation?: number
          resolution_notes?: string | null
          resolved_at?: string | null
          root_cause_category?: string | null
          root_cause_confirmed?: boolean | null
          root_cause_title?: string | null
          severity?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      car_rentals: {
        Row: {
          actual_return_date: string | null
          additional_fees: number | null
          car_id: string
          created_at: string | null
          customer_id: string
          daily_rate: number
          deposit_paid: number | null
          driver_license_number: string | null
          id: string
          insurance_fee: number | null
          notes: string | null
          pickup_date: string
          pickup_location: string
          rating: number | null
          return_date: string
          return_location: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          subtotal: number
          total_amount: number
          total_days: number
          updated_at: string | null
        }
        Insert: {
          actual_return_date?: string | null
          additional_fees?: number | null
          car_id: string
          created_at?: string | null
          customer_id: string
          daily_rate: number
          deposit_paid?: number | null
          driver_license_number?: string | null
          id?: string
          insurance_fee?: number | null
          notes?: string | null
          pickup_date: string
          pickup_location: string
          rating?: number | null
          return_date: string
          return_location?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          subtotal: number
          total_amount: number
          total_days: number
          updated_at?: string | null
        }
        Update: {
          actual_return_date?: string | null
          additional_fees?: number | null
          car_id?: string
          created_at?: string | null
          customer_id?: string
          daily_rate?: number
          deposit_paid?: number | null
          driver_license_number?: string | null
          id?: string
          insurance_fee?: number | null
          notes?: string | null
          pickup_date?: string
          pickup_location?: string
          rating?: number | null
          return_date?: string
          return_location?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          subtotal?: number
          total_amount?: number
          total_days?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "car_rentals_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "rental_cars"
            referencedColumns: ["id"]
          },
        ]
      }
      cross_app_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          target_app: string
          token: string
          used: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          target_app: string
          token: string
          used?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          target_app?: string
          token?: string
          used?: boolean
          user_id?: string
        }
        Relationships: []
      }
      driver_documents: {
        Row: {
          document_type: string
          driver_id: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          notes: string | null
          reviewed_at: string | null
          status: string
          uploaded_at: string
        }
        Insert: {
          document_type: string
          driver_id: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          reviewed_at?: string | null
          status?: string
          uploaded_at?: string
        }
        Update: {
          document_type?: string
          driver_id?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          reviewed_at?: string | null
          status?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_documents_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_lat: number | null
          current_lng: number | null
          documents_verified: boolean | null
          email: string
          full_name: string
          id: string
          is_online: boolean | null
          license_number: string
          phone: string
          rating: number | null
          status: Database["public"]["Enums"]["driver_status"] | null
          total_trips: number | null
          updated_at: string
          user_id: string
          vehicle_model: string | null
          vehicle_plate: string
          vehicle_type: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          documents_verified?: boolean | null
          email: string
          full_name: string
          id?: string
          is_online?: boolean | null
          license_number: string
          phone: string
          rating?: number | null
          status?: Database["public"]["Enums"]["driver_status"] | null
          total_trips?: number | null
          updated_at?: string
          user_id: string
          vehicle_model?: string | null
          vehicle_plate: string
          vehicle_type: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          documents_verified?: boolean | null
          email?: string
          full_name?: string
          id?: string
          is_online?: boolean | null
          license_number?: string
          phone?: string
          rating?: number | null
          status?: Database["public"]["Enums"]["driver_status"] | null
          total_trips?: number | null
          updated_at?: string
          user_id?: string
          vehicle_model?: string | null
          vehicle_plate?: string
          vehicle_type?: string
        }
        Relationships: []
      }
      flight_bookings: {
        Row: {
          booking_reference: string
          cabin_class: string
          created_at: string | null
          customer_id: string
          flight_id: string
          id: string
          passengers: Json
          payment_status: string | null
          price_per_passenger: number
          return_flight_id: string | null
          seat_selection: Json | null
          special_requests: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          subtotal: number
          taxes_fees: number | null
          total_amount: number
          total_passengers: number
          updated_at: string | null
        }
        Insert: {
          booking_reference: string
          cabin_class?: string
          created_at?: string | null
          customer_id: string
          flight_id: string
          id?: string
          passengers: Json
          payment_status?: string | null
          price_per_passenger: number
          return_flight_id?: string | null
          seat_selection?: Json | null
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          subtotal: number
          taxes_fees?: number | null
          total_amount: number
          total_passengers: number
          updated_at?: string | null
        }
        Update: {
          booking_reference?: string
          cabin_class?: string
          created_at?: string | null
          customer_id?: string
          flight_id?: string
          id?: string
          passengers?: Json
          payment_status?: string | null
          price_per_passenger?: number
          return_flight_id?: string | null
          seat_selection?: Json | null
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          subtotal?: number
          taxes_fees?: number | null
          total_amount?: number
          total_passengers?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flight_bookings_flight_id_fkey"
            columns: ["flight_id"]
            isOneToOne: false
            referencedRelation: "flights"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_bookings_return_flight_id_fkey"
            columns: ["return_flight_id"]
            isOneToOne: false
            referencedRelation: "flights"
            referencedColumns: ["id"]
          },
        ]
      }
      flights: {
        Row: {
          aircraft_type: string | null
          airline_id: string
          arrival_airport: string
          arrival_city: string
          arrival_country: string
          arrival_time: string
          business_price: number | null
          business_seats_available: number | null
          created_at: string | null
          departure_airport: string
          departure_city: string
          departure_country: string
          departure_time: string
          duration_minutes: number
          economy_price: number
          economy_seats_available: number | null
          first_class_price: number | null
          first_class_seats_available: number | null
          flight_number: string
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          aircraft_type?: string | null
          airline_id: string
          arrival_airport: string
          arrival_city: string
          arrival_country: string
          arrival_time: string
          business_price?: number | null
          business_seats_available?: number | null
          created_at?: string | null
          departure_airport: string
          departure_city: string
          departure_country: string
          departure_time: string
          duration_minutes: number
          economy_price: number
          economy_seats_available?: number | null
          first_class_price?: number | null
          first_class_seats_available?: number | null
          flight_number: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          aircraft_type?: string | null
          airline_id?: string
          arrival_airport?: string
          arrival_city?: string
          arrival_country?: string
          arrival_time?: string
          business_price?: number | null
          business_seats_available?: number | null
          created_at?: string | null
          departure_airport?: string
          departure_city?: string
          departure_country?: string
          departure_time?: string
          duration_minutes?: number
          economy_price?: number
          economy_seats_available?: number | null
          first_class_price?: number | null
          first_class_seats_available?: number | null
          flight_number?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flights_airline_id_fkey"
            columns: ["airline_id"]
            isOneToOne: false
            referencedRelation: "airlines"
            referencedColumns: ["id"]
          },
        ]
      }
      food_orders: {
        Row: {
          created_at: string | null
          customer_id: string
          delivered_at: string | null
          delivery_address: string
          delivery_fee: number | null
          delivery_lat: number
          delivery_lng: number
          driver_id: string | null
          estimated_delivery_time: number | null
          estimated_prep_time: number | null
          id: string
          items: Json
          picked_up_at: string | null
          placed_at: string | null
          prepared_at: string | null
          rating: number | null
          restaurant_id: string
          special_instructions: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          subtotal: number
          tax: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          delivered_at?: string | null
          delivery_address: string
          delivery_fee?: number | null
          delivery_lat: number
          delivery_lng: number
          driver_id?: string | null
          estimated_delivery_time?: number | null
          estimated_prep_time?: number | null
          id?: string
          items: Json
          picked_up_at?: string | null
          placed_at?: string | null
          prepared_at?: string | null
          rating?: number | null
          restaurant_id: string
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          subtotal: number
          tax?: number | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          delivered_at?: string | null
          delivery_address?: string
          delivery_fee?: number | null
          delivery_lat?: number
          delivery_lng?: number
          driver_id?: string | null
          estimated_delivery_time?: number | null
          estimated_prep_time?: number | null
          id?: string
          items?: Json
          picked_up_at?: string | null
          placed_at?: string | null
          prepared_at?: string | null
          rating?: number | null
          restaurant_id?: string
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          subtotal?: number
          tax?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_orders_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_completions: {
        Row: {
          all_goals_met: boolean | null
          created_at: string | null
          deliveries_met: boolean | null
          earnings_met: boolean | null
          hours_met: boolean | null
          id: string
          period_end: string
          period_start: string
          period_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          all_goals_met?: boolean | null
          created_at?: string | null
          deliveries_met?: boolean | null
          earnings_met?: boolean | null
          hours_met?: boolean | null
          id?: string
          period_end: string
          period_start: string
          period_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          all_goals_met?: boolean | null
          created_at?: string | null
          deliveries_met?: boolean | null
          earnings_met?: boolean | null
          hours_met?: boolean | null
          id?: string
          period_end?: string
          period_start?: string
          period_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      hotel_bookings: {
        Row: {
          booking_reference: string
          check_in_date: string
          check_out_date: string
          created_at: string | null
          customer_id: string
          guest_email: string
          guest_name: string
          guest_phone: string | null
          guests: number
          hotel_id: string
          id: string
          nights: number
          payment_status: string | null
          price_per_night: number
          rating: number | null
          room_count: number
          room_id: string
          special_requests: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          subtotal: number
          taxes_fees: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          booking_reference: string
          check_in_date: string
          check_out_date: string
          created_at?: string | null
          customer_id: string
          guest_email: string
          guest_name: string
          guest_phone?: string | null
          guests?: number
          hotel_id: string
          id?: string
          nights: number
          payment_status?: string | null
          price_per_night: number
          rating?: number | null
          room_count?: number
          room_id: string
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          subtotal: number
          taxes_fees?: number | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          booking_reference?: string
          check_in_date?: string
          check_out_date?: string
          created_at?: string | null
          customer_id?: string
          guest_email?: string
          guest_name?: string
          guest_phone?: string | null
          guests?: number
          hotel_id?: string
          id?: string
          nights?: number
          payment_status?: string | null
          price_per_night?: number
          rating?: number | null
          room_count?: number
          room_id?: string
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          subtotal?: number
          taxes_fees?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hotel_bookings_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hotel_bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "hotel_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel_rooms: {
        Row: {
          amenities: Json | null
          bed_type: string | null
          created_at: string | null
          description: string | null
          hotel_id: string
          id: string
          images: Json | null
          is_available: boolean | null
          max_occupancy: number
          name: string
          price_per_night: number
          room_type: string
          size_sqm: number | null
          total_rooms: number
          updated_at: string | null
        }
        Insert: {
          amenities?: Json | null
          bed_type?: string | null
          created_at?: string | null
          description?: string | null
          hotel_id: string
          id?: string
          images?: Json | null
          is_available?: boolean | null
          max_occupancy?: number
          name: string
          price_per_night: number
          room_type: string
          size_sqm?: number | null
          total_rooms?: number
          updated_at?: string | null
        }
        Update: {
          amenities?: Json | null
          bed_type?: string | null
          created_at?: string | null
          description?: string | null
          hotel_id?: string
          id?: string
          images?: Json | null
          is_available?: boolean | null
          max_occupancy?: number
          name?: string
          price_per_night?: number
          room_type?: string
          size_sqm?: number | null
          total_rooms?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hotel_rooms_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      hotels: {
        Row: {
          address: string
          amenities: Json | null
          cancellation_policy: string | null
          check_in_time: string | null
          check_out_time: string | null
          city: string
          commission_rate: number | null
          country: string
          created_at: string | null
          description: string | null
          email: string
          id: string
          images: Json | null
          lat: number | null
          lng: number | null
          logo_url: string | null
          name: string
          owner_id: string
          phone: string
          rating: number | null
          star_rating: number | null
          status: Database["public"]["Enums"]["partner_status"] | null
          total_bookings: number | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address: string
          amenities?: Json | null
          cancellation_policy?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          city: string
          commission_rate?: number | null
          country: string
          created_at?: string | null
          description?: string | null
          email: string
          id?: string
          images?: Json | null
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          name: string
          owner_id: string
          phone: string
          rating?: number | null
          star_rating?: number | null
          status?: Database["public"]["Enums"]["partner_status"] | null
          total_bookings?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string
          amenities?: Json | null
          cancellation_policy?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          city?: string
          commission_rate?: number | null
          country?: string
          created_at?: string | null
          description?: string | null
          email?: string
          id?: string
          images?: Json | null
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          name?: string
          owner_id?: string
          phone?: string
          rating?: number | null
          star_rating?: number | null
          status?: Database["public"]["Enums"]["partner_status"] | null
          total_bookings?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          is_featured: boolean | null
          name: string
          preparation_time: number | null
          price: number
          restaurant_id: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_featured?: boolean | null
          name: string
          preparation_time?: number | null
          price: number
          restaurant_id: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_featured?: boolean | null
          name?: string
          preparation_time?: number | null
          price?: number
          restaurant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing: {
        Row: {
          base_fare: number
          created_at: string
          id: string
          is_active: boolean | null
          minimum_fare: number
          per_km_rate: number
          per_minute_rate: number
          surge_multiplier: number
          updated_at: string
          vehicle_type: string
        }
        Insert: {
          base_fare?: number
          created_at?: string
          id?: string
          is_active?: boolean | null
          minimum_fare?: number
          per_km_rate?: number
          per_minute_rate?: number
          surge_multiplier?: number
          updated_at?: string
          vehicle_type: string
        }
        Update: {
          base_fare?: number
          created_at?: string
          id?: string
          is_active?: boolean | null
          minimum_fare?: number
          per_km_rate?: number
          per_minute_rate?: number
          surge_multiplier?: number
          updated_at?: string
          vehicle_type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          driver_id: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
        }
        Insert: {
          auth: string
          created_at?: string
          driver_id: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
        }
        Update: {
          auth?: string
          created_at?: string
          driver_id?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_cars: {
        Row: {
          category: string
          color: string
          created_at: string | null
          daily_rate: number
          deposit_amount: number | null
          features: Json | null
          fuel_type: string
          id: string
          images: Json | null
          is_available: boolean | null
          lat: number | null
          license_plate: string
          lng: number | null
          location_address: string
          make: string
          mileage: number | null
          model: string
          monthly_rate: number | null
          owner_id: string
          rating: number | null
          seats: number
          status: Database["public"]["Enums"]["partner_status"] | null
          total_rentals: number | null
          transmission: string
          updated_at: string | null
          vin: string | null
          weekly_rate: number | null
          year: number
        }
        Insert: {
          category: string
          color: string
          created_at?: string | null
          daily_rate: number
          deposit_amount?: number | null
          features?: Json | null
          fuel_type?: string
          id?: string
          images?: Json | null
          is_available?: boolean | null
          lat?: number | null
          license_plate: string
          lng?: number | null
          location_address: string
          make: string
          mileage?: number | null
          model: string
          monthly_rate?: number | null
          owner_id: string
          rating?: number | null
          seats?: number
          status?: Database["public"]["Enums"]["partner_status"] | null
          total_rentals?: number | null
          transmission?: string
          updated_at?: string | null
          vin?: string | null
          weekly_rate?: number | null
          year: number
        }
        Update: {
          category?: string
          color?: string
          created_at?: string | null
          daily_rate?: number
          deposit_amount?: number | null
          features?: Json | null
          fuel_type?: string
          id?: string
          images?: Json | null
          is_available?: boolean | null
          lat?: number | null
          license_plate?: string
          lng?: number | null
          location_address?: string
          make?: string
          mileage?: number | null
          model?: string
          monthly_rate?: number | null
          owner_id?: string
          rating?: number | null
          seats?: number
          status?: Database["public"]["Enums"]["partner_status"] | null
          total_rentals?: number | null
          transmission?: string
          updated_at?: string | null
          vin?: string | null
          weekly_rate?: number | null
          year?: number
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          address: string
          avg_prep_time: number | null
          commission_rate: number | null
          cover_image_url: string | null
          created_at: string | null
          cuisine_type: string
          description: string | null
          email: string
          id: string
          is_open: boolean | null
          lat: number | null
          lng: number | null
          logo_url: string | null
          name: string
          opening_hours: Json | null
          owner_id: string
          phone: string
          rating: number | null
          status: Database["public"]["Enums"]["partner_status"] | null
          total_orders: number | null
          updated_at: string | null
        }
        Insert: {
          address: string
          avg_prep_time?: number | null
          commission_rate?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          cuisine_type: string
          description?: string | null
          email: string
          id?: string
          is_open?: boolean | null
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          name: string
          opening_hours?: Json | null
          owner_id: string
          phone: string
          rating?: number | null
          status?: Database["public"]["Enums"]["partner_status"] | null
          total_orders?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          avg_prep_time?: number | null
          commission_rate?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          cuisine_type?: string
          description?: string | null
          email?: string
          id?: string
          is_open?: boolean | null
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          name?: string
          opening_hours?: Json | null
          owner_id?: string
          phone?: string
          rating?: number | null
          status?: Database["public"]["Enums"]["partner_status"] | null
          total_orders?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      saved_locations: {
        Row: {
          address: string
          created_at: string
          icon: string | null
          id: string
          label: string
          lat: number
          lng: number
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string
          icon?: string | null
          id?: string
          label: string
          lat: number
          lng: number
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string
          icon?: string | null
          id?: string
          label?: string
          lat?: number
          lng?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trip_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          sender_id: string
          sender_type: string
          trip_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id: string
          sender_type: string
          trip_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id?: string
          sender_type?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_messages_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          completed_at: string | null
          created_at: string
          distance_km: number | null
          driver_id: string | null
          dropoff_address: string
          dropoff_lat: number
          dropoff_lng: number
          duration_minutes: number | null
          fare_amount: number | null
          id: string
          payment_status: string | null
          pickup_address: string
          pickup_lat: number
          pickup_lng: number
          rating: number | null
          rider_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["trip_status"] | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          distance_km?: number | null
          driver_id?: string | null
          dropoff_address: string
          dropoff_lat: number
          dropoff_lng: number
          duration_minutes?: number | null
          fare_amount?: number | null
          id?: string
          payment_status?: string | null
          pickup_address: string
          pickup_lat: number
          pickup_lng: number
          rating?: number | null
          rider_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["trip_status"] | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          distance_km?: number | null
          driver_id?: string | null
          dropoff_address?: string
          dropoff_lat?: number
          dropoff_lng?: number
          duration_minutes?: number | null
          fare_amount?: number | null
          id?: string
          payment_status?: string | null
          pickup_address?: string
          pickup_lat?: number
          pickup_lng?: number
          rating?: number | null
          rider_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["trip_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "trips_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievement_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount: number
          created_at: string
          driver_id: string
          id: string
          notes: string | null
          payment_method: string
          processed_at: string | null
          requested_at: string
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          driver_id: string
          id?: string
          notes?: string | null
          payment_method?: string
          processed_at?: string | null
          requested_at?: string
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          driver_id?: string
          id?: string
          notes?: string | null
          payment_method?: string
          processed_at?: string | null
          requested_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_tokens: { Args: never; Returns: undefined }
      create_driver_on_signup: {
        Args: {
          p_email: string
          p_full_name: string
          p_license_number: string
          p_phone: string
          p_user_id: string
          p_vehicle_model?: string
          p_vehicle_plate: string
          p_vehicle_type: string
        }
        Returns: string
      }
      create_sample_trips_for_driver: {
        Args: { p_driver_id: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      booking_status:
        | "pending"
        | "confirmed"
        | "in_progress"
        | "ready_for_pickup"
        | "completed"
        | "cancelled"
        | "refunded"
      driver_status: "pending" | "verified" | "rejected" | "suspended"
      partner_status: "pending" | "active" | "suspended" | "inactive"
      trip_status:
        | "requested"
        | "accepted"
        | "en_route"
        | "arrived"
        | "in_progress"
        | "completed"
        | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      booking_status: [
        "pending",
        "confirmed",
        "in_progress",
        "ready_for_pickup",
        "completed",
        "cancelled",
        "refunded",
      ],
      driver_status: ["pending", "verified", "rejected", "suspended"],
      partner_status: ["pending", "active", "suspended", "inactive"],
      trip_status: [
        "requested",
        "accepted",
        "en_route",
        "arrived",
        "in_progress",
        "completed",
        "cancelled",
      ],
    },
  },
} as const
