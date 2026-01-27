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
      admin_driver_actions: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string
          driver_id: string
          id: string
          metadata: Json | null
          reason: string | null
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string
          driver_id: string
          id?: string
          metadata?: Json | null
          reason?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string
          driver_id?: string
          id?: string
          metadata?: Json | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_driver_actions_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
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
      announcements: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          ends_at: string | null
          id: string
          is_active: boolean | null
          starts_at: string | null
          target_audience: string | null
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          starts_at?: string | null
          target_audience?: string | null
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          starts_at?: string | null
          target_audience?: string | null
          title?: string
          type?: string | null
          updated_at?: string | null
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
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      batch_stops: {
        Row: {
          address: string
          arrived_at: string | null
          batch_id: string
          completed_at: string | null
          food_order_id: string | null
          id: string
          lat: number
          lng: number
          notes: string | null
          status: string
          stop_order: number
          stop_type: string
          trip_id: string | null
        }
        Insert: {
          address: string
          arrived_at?: string | null
          batch_id: string
          completed_at?: string | null
          food_order_id?: string | null
          id?: string
          lat: number
          lng: number
          notes?: string | null
          status?: string
          stop_order: number
          stop_type: string
          trip_id?: string | null
        }
        Update: {
          address?: string
          arrived_at?: string | null
          batch_id?: string
          completed_at?: string | null
          food_order_id?: string | null
          id?: string
          lat?: number
          lng?: number
          notes?: string | null
          status?: string
          stop_order?: number
          stop_type?: string
          trip_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "batch_stops_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "delivery_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_stops_food_order_id_fkey"
            columns: ["food_order_id"]
            isOneToOne: false
            referencedRelation: "food_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_stops_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      bill_split_payments: {
        Row: {
          amount: number
          bill_split_id: string
          created_at: string
          id: string
          is_paid: boolean | null
          paid_at: string | null
          payer_name: string | null
          payment_method: string | null
          tip_amount: number | null
        }
        Insert: {
          amount: number
          bill_split_id: string
          created_at?: string
          id?: string
          is_paid?: boolean | null
          paid_at?: string | null
          payer_name?: string | null
          payment_method?: string | null
          tip_amount?: number | null
        }
        Update: {
          amount?: number
          bill_split_id?: string
          created_at?: string
          id?: string
          is_paid?: boolean | null
          paid_at?: string | null
          payer_name?: string | null
          payment_method?: string | null
          tip_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bill_split_payments_bill_split_id_fkey"
            columns: ["bill_split_id"]
            isOneToOne: false
            referencedRelation: "bill_splits"
            referencedColumns: ["id"]
          },
        ]
      }
      bill_splits: {
        Row: {
          created_at: string
          id: string
          order_id: string | null
          original_amount: number
          restaurant_id: string
          split_type: string
          status: string | null
          total_splits: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id?: string | null
          original_amount: number
          restaurant_id: string
          split_type?: string
          status?: string | null
          total_splits?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string | null
          original_amount?: number
          restaurant_id?: string
          split_type?: string
          status?: string | null
          total_splits?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bill_splits_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
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
      chat_messages: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          order_id: string | null
          sender_id: string
          sender_type: string
          trip_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          order_id?: string | null
          sender_id: string
          sender_type: string
          trip_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          order_id?: string | null
          sender_id?: string
          sender_type?: string
          trip_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "food_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_settings: {
        Row: {
          commission_percentage: number
          created_at: string
          id: string
          is_active: boolean | null
          maximum_fee: number | null
          minimum_fee: number | null
          name: string
          service_type: string
          updated_at: string
          vehicle_type: string | null
        }
        Insert: {
          commission_percentage?: number
          created_at?: string
          id?: string
          is_active?: boolean | null
          maximum_fee?: number | null
          minimum_fee?: number | null
          name: string
          service_type: string
          updated_at?: string
          vehicle_type?: string | null
        }
        Update: {
          commission_percentage?: number
          created_at?: string
          id?: string
          is_active?: boolean | null
          maximum_fee?: number | null
          minimum_fee?: number | null
          name?: string
          service_type?: string
          updated_at?: string
          vehicle_type?: string | null
        }
        Relationships: []
      }
      community_tip_likes: {
        Row: {
          created_at: string
          driver_id: string
          id: string
          tip_id: string
        }
        Insert: {
          created_at?: string
          driver_id: string
          id?: string
          tip_id: string
        }
        Update: {
          created_at?: string
          driver_id?: string
          id?: string
          tip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_tip_likes_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_tip_likes_tip_id_fkey"
            columns: ["tip_id"]
            isOneToOne: false
            referencedRelation: "community_tips"
            referencedColumns: ["id"]
          },
        ]
      }
      community_tips: {
        Row: {
          category: string
          content: string
          created_at: string
          driver_id: string
          id: string
          is_featured: boolean
          likes: number
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          driver_id: string
          id?: string
          is_featured?: boolean
          likes?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          driver_id?: string
          id?: string
          is_featured?: boolean
          likes?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_tips_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
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
      customer_feedback: {
        Row: {
          ambiance_rating: number | null
          comment: string | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          food_rating: number | null
          id: string
          is_public: boolean | null
          order_id: string | null
          rating: number
          responded_at: string | null
          response: string | null
          restaurant_id: string
          sentiment: string | null
          service_rating: number | null
          updated_at: string
        }
        Insert: {
          ambiance_rating?: number | null
          comment?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          food_rating?: number | null
          id?: string
          is_public?: boolean | null
          order_id?: string | null
          rating: number
          responded_at?: string | null
          response?: string | null
          restaurant_id: string
          sentiment?: string | null
          service_rating?: number | null
          updated_at?: string
        }
        Update: {
          ambiance_rating?: number | null
          comment?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          food_rating?: number | null
          id?: string
          is_public?: boolean | null
          order_id?: string | null
          rating?: number
          responded_at?: string | null
          response?: string | null
          restaurant_id?: string
          sentiment?: string | null
          service_rating?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_feedback_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_order_items: {
        Row: {
          created_at: string
          id: string
          menu_item_id: string | null
          menu_item_name: string
          notes: string | null
          order_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          menu_item_id?: string | null
          menu_item_name: string
          notes?: string | null
          order_id: string
          quantity?: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          menu_item_id?: string | null
          menu_item_name?: string
          notes?: string | null
          order_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "customer_order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "customer_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_orders: {
        Row: {
          assigned_chef: string | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          estimated_prep_minutes: number | null
          id: string
          notes: string | null
          prep_started_at: string | null
          priority: string | null
          restaurant_id: string
          status: string
          table_id: string | null
          table_number: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          assigned_chef?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          estimated_prep_minutes?: number | null
          id?: string
          notes?: string | null
          prep_started_at?: string | null
          priority?: string | null
          restaurant_id: string
          status?: string
          table_id?: string | null
          table_number?: string | null
          total_amount?: number
          updated_at?: string
        }
        Update: {
          assigned_chef?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          estimated_prep_minutes?: number | null
          id?: string
          notes?: string | null
          prep_started_at?: string | null
          priority?: string | null
          restaurant_id?: string
          status?: string
          table_id?: string | null
          table_number?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_orders_assigned_chef_fkey"
            columns: ["assigned_chef"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_orders_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "restaurant_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_batches: {
        Row: {
          completed_at: string | null
          created_at: string
          driver_id: string
          id: string
          started_at: string | null
          status: string
          total_distance_km: number | null
          total_earnings: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          driver_id: string
          id?: string
          started_at?: string | null
          status?: string
          total_distance_km?: number | null
          total_earnings?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          driver_id?: string
          id?: string
          started_at?: string | null
          status?: string
          total_distance_km?: number | null
          total_earnings?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_batches_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_cash_collections: {
        Row: {
          amount: number
          collection_method: string | null
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          driver_id: string
          id: string
          notes: string | null
          reference_number: string | null
          status: string | null
        }
        Insert: {
          amount: number
          collection_method?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          driver_id: string
          id?: string
          notes?: string | null
          reference_number?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          collection_method?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          driver_id?: string
          id?: string
          notes?: string | null
          reference_number?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_cash_collections_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_certifications: {
        Row: {
          certification_icon: string
          certification_name: string
          description: string | null
          driver_id: string
          earned_at: string
          id: string
        }
        Insert: {
          certification_icon?: string
          certification_name: string
          description?: string | null
          driver_id: string
          earned_at?: string
          id?: string
        }
        Update: {
          certification_icon?: string
          certification_name?: string
          description?: string | null
          driver_id?: string
          earned_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_certifications_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
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
      driver_earnings: {
        Row: {
          base_amount: number
          bonus_amount: number | null
          created_at: string
          description: string | null
          driver_id: string
          earning_type: string
          id: string
          is_cash_collected: boolean | null
          net_amount: number
          payment_method: string | null
          platform_fee: number | null
          tip_amount: number | null
          trip_id: string | null
        }
        Insert: {
          base_amount?: number
          bonus_amount?: number | null
          created_at?: string
          description?: string | null
          driver_id: string
          earning_type?: string
          id?: string
          is_cash_collected?: boolean | null
          net_amount?: number
          payment_method?: string | null
          platform_fee?: number | null
          tip_amount?: number | null
          trip_id?: string | null
        }
        Update: {
          base_amount?: number
          bonus_amount?: number | null
          created_at?: string
          description?: string | null
          driver_id?: string
          earning_type?: string
          id?: string
          is_cash_collected?: boolean | null
          net_amount?: number
          payment_method?: string | null
          platform_fee?: number | null
          tip_amount?: number | null
          trip_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_earnings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_earnings_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string
          driver_id: string
          has_receipt: boolean | null
          id: string
          is_deductible: boolean | null
          notes: string | null
          receipt_url: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date?: string
          description: string
          driver_id: string
          has_receipt?: boolean | null
          id?: string
          is_deductible?: boolean | null
          notes?: string | null
          receipt_url?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string
          driver_id?: string
          has_receipt?: boolean | null
          id?: string
          is_deductible?: boolean | null
          notes?: string | null
          receipt_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_expenses_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_location_history: {
        Row: {
          accuracy: number | null
          driver_id: string
          heading: number | null
          id: string
          is_online: boolean
          lat: number
          lng: number
          recorded_at: string
          speed: number | null
        }
        Insert: {
          accuracy?: number | null
          driver_id: string
          heading?: number | null
          id?: string
          is_online?: boolean
          lat: number
          lng: number
          recorded_at?: string
          speed?: number | null
        }
        Update: {
          accuracy?: number | null
          driver_id?: string
          heading?: number | null
          id?: string
          is_online?: boolean
          lat?: number
          lng?: number
          recorded_at?: string
          speed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_location_history_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_notifications: {
        Row: {
          action_url: string | null
          amount: number | null
          created_at: string
          description: string
          driver_id: string
          icon: string | null
          id: string
          is_read: boolean | null
          title: string
          type: string
        }
        Insert: {
          action_url?: string | null
          amount?: number | null
          created_at?: string
          description: string
          driver_id: string
          icon?: string | null
          id?: string
          is_read?: boolean | null
          title: string
          type: string
        }
        Update: {
          action_url?: string | null
          amount?: number | null
          created_at?: string
          description?: string
          driver_id?: string
          icon?: string | null
          id?: string
          is_read?: boolean | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_notifications_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_referrals: {
        Row: {
          bonus_earned: number | null
          completed_at: string | null
          created_at: string
          id: string
          referee_email: string | null
          referee_name: string
          referrer_id: string
          signed_up_at: string
          status: string
          trips_completed: number | null
        }
        Insert: {
          bonus_earned?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          referee_email?: string | null
          referee_name: string
          referrer_id: string
          signed_up_at?: string
          status?: string
          trips_completed?: number | null
        }
        Update: {
          bonus_earned?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          referee_email?: string | null
          referee_name?: string
          referrer_id?: string
          signed_up_at?: string
          status?: string
          trips_completed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_schedules: {
        Row: {
          created_at: string
          day_of_week: number
          driver_id: string
          end_time: string
          id: string
          is_active: boolean | null
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          driver_id: string
          end_time: string
          id?: string
          is_active?: boolean | null
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          driver_id?: string
          end_time?: string
          id?: string
          is_active?: boolean | null
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_schedules_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_settings: {
        Row: {
          auto_sync_enabled: boolean | null
          cache_trips_days: number | null
          created_at: string
          driver_id: string
          haptic_feedback_enabled: boolean | null
          id: string
          notification_earnings: boolean | null
          notification_messages: boolean | null
          notification_orders: boolean | null
          notification_promotions: boolean | null
          notification_sound_enabled: boolean | null
          notification_vibration_enabled: boolean | null
          offline_mode_enabled: boolean | null
          push_notifications_enabled: boolean | null
          sync_on_wifi_only: boolean | null
          theme: string | null
          updated_at: string
          voice_commands_enabled: boolean | null
          voice_feedback_enabled: boolean | null
          voice_language: string | null
        }
        Insert: {
          auto_sync_enabled?: boolean | null
          cache_trips_days?: number | null
          created_at?: string
          driver_id: string
          haptic_feedback_enabled?: boolean | null
          id?: string
          notification_earnings?: boolean | null
          notification_messages?: boolean | null
          notification_orders?: boolean | null
          notification_promotions?: boolean | null
          notification_sound_enabled?: boolean | null
          notification_vibration_enabled?: boolean | null
          offline_mode_enabled?: boolean | null
          push_notifications_enabled?: boolean | null
          sync_on_wifi_only?: boolean | null
          theme?: string | null
          updated_at?: string
          voice_commands_enabled?: boolean | null
          voice_feedback_enabled?: boolean | null
          voice_language?: string | null
        }
        Update: {
          auto_sync_enabled?: boolean | null
          cache_trips_days?: number | null
          created_at?: string
          driver_id?: string
          haptic_feedback_enabled?: boolean | null
          id?: string
          notification_earnings?: boolean | null
          notification_messages?: boolean | null
          notification_orders?: boolean | null
          notification_promotions?: boolean | null
          notification_sound_enabled?: boolean | null
          notification_vibration_enabled?: boolean | null
          offline_mode_enabled?: boolean | null
          push_notifications_enabled?: boolean | null
          sync_on_wifi_only?: boolean | null
          theme?: string | null
          updated_at?: string
          voice_commands_enabled?: boolean | null
          voice_feedback_enabled?: boolean | null
          voice_language?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_settings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: true
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_shifts: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          created_at: string
          driver_id: string
          earnings: number | null
          end_time: string
          id: string
          notes: string | null
          shift_date: string
          start_time: string
          status: string
          trips_completed: number | null
          updated_at: string
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          created_at?: string
          driver_id: string
          earnings?: number | null
          end_time: string
          id?: string
          notes?: string | null
          shift_date: string
          start_time: string
          status?: string
          trips_completed?: number | null
          updated_at?: string
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          created_at?: string
          driver_id?: string
          earnings?: number | null
          end_time?: string
          id?: string
          notes?: string | null
          shift_date?: string
          start_time?: string
          status?: string
          trips_completed?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_shifts_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_training_progress: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string
          driver_id: string
          id: string
          lessons_completed: number
          started_at: string | null
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string
          driver_id: string
          id?: string
          lessons_completed?: number
          started_at?: string | null
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string
          driver_id?: string
          id?: string
          lessons_completed?: number
          started_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_training_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "training_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_training_progress_driver_id_fkey"
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
      emergency_contacts: {
        Row: {
          created_at: string
          driver_id: string
          id: string
          is_primary: boolean | null
          name: string
          phone: string
          relationship: string | null
        }
        Insert: {
          created_at?: string
          driver_id: string
          id?: string
          is_primary?: boolean | null
          name: string
          phone: string
          relationship?: string | null
        }
        Update: {
          created_at?: string
          driver_id?: string
          id?: string
          is_primary?: boolean | null
          name?: string
          phone?: string
          relationship?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_contacts_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          category: string | null
          created_at: string
          id: string
          location: string | null
          model: string | null
          name: string
          notes: string | null
          purchase_date: string | null
          restaurant_id: string
          serial_number: string | null
          status: string | null
          updated_at: string
          warranty_expiry: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          location?: string | null
          model?: string | null
          name: string
          notes?: string | null
          purchase_date?: string | null
          restaurant_id: string
          serial_number?: string | null
          status?: string | null
          updated_at?: string
          warranty_expiry?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          location?: string | null
          model?: string | null
          name?: string
          notes?: string | null
          purchase_date?: string | null
          restaurant_id?: string
          serial_number?: string | null
          status?: string | null
          updated_at?: string
          warranty_expiry?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          budget_monthly: number | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          restaurant_id: string
        }
        Insert: {
          budget_monthly?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          restaurant_id: string
        }
        Update: {
          budget_monthly?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          approved_by: string | null
          category_id: string | null
          created_at: string
          description: string
          expense_date: string
          id: string
          is_recurring: boolean | null
          notes: string | null
          payment_method: string | null
          receipt_url: string | null
          recurrence_frequency: string | null
          restaurant_id: string
          status: string | null
          updated_at: string
          vendor: string | null
        }
        Insert: {
          amount: number
          approved_by?: string | null
          category_id?: string | null
          created_at?: string
          description: string
          expense_date?: string
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          recurrence_frequency?: string | null
          restaurant_id: string
          status?: string | null
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          amount?: number
          approved_by?: string | null
          category_id?: string | null
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          recurrence_frequency?: string | null
          restaurant_id?: string
          status?: string | null
          updated_at?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
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
      floor_plans: {
        Row: {
          created_at: string
          height: number
          id: string
          is_active: boolean | null
          name: string
          restaurant_id: string
          updated_at: string
          width: number
        }
        Insert: {
          created_at?: string
          height?: number
          id?: string
          is_active?: boolean | null
          name?: string
          restaurant_id: string
          updated_at?: string
          width?: number
        }
        Update: {
          created_at?: string
          height?: number
          id?: string
          is_active?: boolean | null
          name?: string
          restaurant_id?: string
          updated_at?: string
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "floor_plans_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
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
      forum_post_likes: {
        Row: {
          created_at: string
          driver_id: string
          id: string
          post_id: string
        }
        Insert: {
          created_at?: string
          driver_id: string
          id?: string
          post_id: string
        }
        Update: {
          created_at?: string
          driver_id?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_post_likes_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          category: string
          content: string
          created_at: string
          driver_id: string
          id: string
          is_pinned: boolean | null
          likes: number | null
          replies_count: number | null
          title: string
          updated_at: string
          views: number | null
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          driver_id: string
          id?: string
          is_pinned?: boolean | null
          likes?: number | null
          replies_count?: number | null
          title: string
          updated_at?: string
          views?: number | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          driver_id?: string
          id?: string
          is_pinned?: boolean | null
          likes?: number | null
          replies_count?: number | null
          title?: string
          updated_at?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_replies: {
        Row: {
          content: string
          created_at: string
          driver_id: string
          id: string
          likes: number | null
          post_id: string
        }
        Insert: {
          content: string
          created_at?: string
          driver_id: string
          id?: string
          likes?: number | null
          post_id: string
        }
        Update: {
          content?: string
          created_at?: string
          driver_id?: string
          id?: string
          likes?: number | null
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      fuel_entries: {
        Row: {
          created_at: string
          date: string
          driver_id: string
          gallons: number
          id: string
          mpg: number | null
          notes: string | null
          odometer: number
          price_per_gallon: number
          station_name: string | null
          total_cost: number
        }
        Insert: {
          created_at?: string
          date?: string
          driver_id: string
          gallons: number
          id?: string
          mpg?: number | null
          notes?: string | null
          odometer: number
          price_per_gallon: number
          station_name?: string | null
          total_cost: number
        }
        Update: {
          created_at?: string
          date?: string
          driver_id?: string
          gallons?: number
          id?: string
          mpg?: number | null
          notes?: string | null
          odometer?: number
          price_per_gallon?: number
          station_name?: string | null
          total_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "fuel_entries_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_card_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          gift_card_id: string
          id: string
          notes: string | null
          order_id: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          gift_card_id: string
          id?: string
          notes?: string | null
          order_id?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          gift_card_id?: string
          id?: string
          notes?: string | null
          order_id?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_card_transactions_gift_card_id_fkey"
            columns: ["gift_card_id"]
            isOneToOne: false
            referencedRelation: "gift_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_cards: {
        Row: {
          code: string
          created_at: string
          current_balance: number
          expires_at: string | null
          id: string
          initial_balance: number
          is_active: boolean | null
          message: string | null
          purchaser_email: string | null
          purchaser_name: string | null
          recipient_email: string | null
          recipient_name: string | null
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          current_balance: number
          expires_at?: string | null
          id?: string
          initial_balance: number
          is_active?: boolean | null
          message?: string | null
          purchaser_email?: string | null
          purchaser_name?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          current_balance?: number
          expires_at?: string | null
          id?: string
          initial_balance?: number
          is_active?: boolean | null
          message?: string | null
          purchaser_email?: string | null
          purchaser_name?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_cards_restaurant_id_fkey"
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
      goal_milestone_notifications: {
        Row: {
          goal_type: string
          id: string
          milestone: number
          notified_at: string | null
          period: string
          period_key: string
          user_id: string
        }
        Insert: {
          goal_type: string
          id?: string
          milestone: number
          notified_at?: string | null
          period: string
          period_key: string
          user_id: string
        }
        Update: {
          goal_type?: string
          id?: string
          milestone?: number
          notified_at?: string | null
          period?: string
          period_key?: string
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
      inventory_items: {
        Row: {
          category: string
          cost_per_unit: number
          created_at: string
          id: string
          last_restocked: string | null
          max_stock: number
          min_stock: number
          name: string
          notes: string | null
          quantity: number
          restaurant_id: string
          supplier: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          category?: string
          cost_per_unit?: number
          created_at?: string
          id?: string
          last_restocked?: string | null
          max_stock?: number
          min_stock?: number
          name: string
          notes?: string | null
          quantity?: number
          restaurant_id: string
          supplier?: string | null
          unit?: string
          updated_at?: string
        }
        Update: {
          category?: string
          cost_per_unit?: number
          created_at?: string
          id?: string
          last_restocked?: string | null
          max_stock?: number
          min_stock?: number
          name?: string
          notes?: string | null
          quantity?: number
          restaurant_id?: string
          supplier?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_members: {
        Row: {
          birthday: string | null
          created_at: string
          customer_name: string
          email: string
          id: string
          join_date: string | null
          last_visit: string | null
          lifetime_points: number | null
          phone: string | null
          points_balance: number | null
          preferences: Json | null
          restaurant_id: string
          tier: string | null
          updated_at: string
        }
        Insert: {
          birthday?: string | null
          created_at?: string
          customer_name: string
          email: string
          id?: string
          join_date?: string | null
          last_visit?: string | null
          lifetime_points?: number | null
          phone?: string | null
          points_balance?: number | null
          preferences?: Json | null
          restaurant_id: string
          tier?: string | null
          updated_at?: string
        }
        Update: {
          birthday?: string | null
          created_at?: string
          customer_name?: string
          email?: string
          id?: string
          join_date?: string | null
          last_visit?: string | null
          lifetime_points?: number | null
          phone?: string | null
          points_balance?: number | null
          preferences?: Json | null
          restaurant_id?: string
          tier?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_members_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_rewards: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          points_required: number
          restaurant_id: string
          reward_type: string
          reward_value: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          points_required: number
          restaurant_id: string
          reward_type: string
          reward_value?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          points_required?: number
          restaurant_id?: string
          reward_type?: string
          reward_value?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_rewards_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_transactions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          member_id: string
          order_id: string | null
          points_earned: number | null
          points_redeemed: number | null
          restaurant_id: string
          transaction_type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          member_id: string
          order_id?: string | null
          points_earned?: number | null
          points_redeemed?: number | null
          restaurant_id: string
          transaction_type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          member_id?: string
          order_id?: string | null
          points_earned?: number | null
          points_redeemed?: number | null
          restaurant_id?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "loyalty_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_transactions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_logs: {
        Row: {
          cost: number | null
          created_at: string
          description: string
          equipment_id: string | null
          id: string
          maintenance_type: string
          next_due_date: string | null
          notes: string | null
          performed_by: string | null
          performed_date: string
          restaurant_id: string
          status: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string
          description: string
          equipment_id?: string | null
          id?: string
          maintenance_type: string
          next_due_date?: string | null
          notes?: string | null
          performed_by?: string | null
          performed_date?: string
          restaurant_id: string
          status?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string
          description?: string
          equipment_id?: string | null
          id?: string
          maintenance_type?: string
          next_due_date?: string | null
          notes?: string | null
          performed_by?: string | null
          performed_date?: string
          restaurant_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_logs_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_logs_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          restaurant_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          restaurant_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          restaurant_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          category: string
          category_id: string | null
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
          category_id?: string | null
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
          category_id?: string | null
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
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      offline_sync_queue: {
        Row: {
          action_data: Json
          action_type: string
          created_at: string
          driver_id: string
          error_message: string | null
          id: string
          retry_count: number | null
          status: string | null
          synced_at: string | null
        }
        Insert: {
          action_data: Json
          action_type: string
          created_at?: string
          driver_id: string
          error_message?: string | null
          id?: string
          retry_count?: number | null
          status?: string | null
          synced_at?: string | null
        }
        Update: {
          action_data?: Json
          action_type?: string
          created_at?: string
          driver_id?: string
          error_message?: string | null
          id?: string
          retry_count?: number | null
          status?: string | null
          synced_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offline_sync_queue_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          driver_id: string | null
          id: string
          notes: string | null
          payout_method: string | null
          processed_at: string | null
          processed_by: string | null
          reference_id: string | null
          restaurant_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          driver_id?: string | null
          id?: string
          notes?: string | null
          payout_method?: string | null
          processed_at?: string | null
          processed_by?: string | null
          reference_id?: string | null
          restaurant_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          driver_id?: string | null
          id?: string
          notes?: string | null
          payout_method?: string | null
          processed_at?: string | null
          processed_by?: string | null
          reference_id?: string | null
          restaurant_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payouts_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_profile_changes: {
        Row: {
          change_data: Json
          change_type: string
          created_at: string
          driver_id: string
          file_path: string | null
          id: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["approval_status"]
          updated_at: string
        }
        Insert: {
          change_data: Json
          change_type: string
          created_at?: string
          driver_id: string
          file_path?: string | null
          id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
          updated_at?: string
        }
        Update: {
          change_data?: Json
          change_type?: string
          created_at?: string
          driver_id?: string
          file_path?: string | null
          id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_profile_changes_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
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
      promotion_usage: {
        Row: {
          created_at: string | null
          discount_applied: number
          food_order_id: string | null
          id: string
          promotion_id: string
          trip_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          discount_applied: number
          food_order_id?: string | null
          id?: string
          promotion_id: string
          trip_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          discount_applied?: number
          food_order_id?: string | null
          id?: string
          promotion_id?: string
          trip_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotion_usage_food_order_id_fkey"
            columns: ["food_order_id"]
            isOneToOne: false
            referencedRelation: "food_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_usage_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_usage_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          applicable_services: string[] | null
          code: string
          created_at: string | null
          created_by: string | null
          description: string | null
          discount_type: string | null
          discount_value: number
          ends_at: string | null
          id: string
          is_active: boolean | null
          max_discount: number | null
          min_order_amount: number | null
          name: string
          per_user_limit: number | null
          starts_at: string | null
          updated_at: string | null
          usage_count: number | null
          usage_limit: number | null
        }
        Insert: {
          applicable_services?: string[] | null
          code: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value: number
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_order_amount?: number | null
          name: string
          per_user_limit?: number | null
          starts_at?: string | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
        }
        Update: {
          applicable_services?: string[] | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_order_amount?: number | null
          name?: string
          per_user_limit?: number | null
          starts_at?: string | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          id: string
          inventory_item_id: string | null
          item_name: string
          notes: string | null
          purchase_order_id: string
          quantity: number
          received_quantity: number | null
          total_price: number
          unit: string
          unit_price: number
        }
        Insert: {
          id?: string
          inventory_item_id?: string | null
          item_name: string
          notes?: string | null
          purchase_order_id: string
          quantity: number
          received_quantity?: number | null
          total_price: number
          unit: string
          unit_price: number
        }
        Update: {
          id?: string
          inventory_item_id?: string | null
          item_name?: string
          notes?: string | null
          purchase_order_id?: string
          quantity?: number
          received_quantity?: number | null
          total_price?: number
          unit?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          actual_delivery: string | null
          created_at: string
          expected_delivery: string | null
          id: string
          notes: string | null
          order_date: string
          order_number: string
          restaurant_id: string
          status: string | null
          subtotal: number | null
          supplier_id: string
          tax: number | null
          total: number | null
          updated_at: string
        }
        Insert: {
          actual_delivery?: string | null
          created_at?: string
          expected_delivery?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          order_number: string
          restaurant_id: string
          status?: string | null
          subtotal?: number | null
          supplier_id: string
          tax?: number | null
          total?: number | null
          updated_at?: string
        }
        Update: {
          actual_delivery?: string | null
          created_at?: string
          expected_delivery?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          order_number?: string
          restaurant_id?: string
          status?: string | null
          subtotal?: number | null
          supplier_id?: string
          tax?: number | null
          total?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      push_notification_subscriptions: {
        Row: {
          auth_key: string | null
          created_at: string
          driver_id: string
          endpoint: string
          id: string
          is_active: boolean | null
          p256dh_key: string | null
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          auth_key?: string | null
          created_at?: string
          driver_id: string
          endpoint: string
          id?: string
          is_active?: boolean | null
          p256dh_key?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          auth_key?: string | null
          created_at?: string
          driver_id?: string
          endpoint?: string
          id?: string
          is_active?: boolean | null
          p256dh_key?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_notification_subscriptions_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
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
      recipe_ingredients: {
        Row: {
          id: string
          ingredient_name: string
          inventory_item_id: string | null
          notes: string | null
          quantity: number
          recipe_id: string
          total_cost: number | null
          unit: string
          unit_cost: number | null
        }
        Insert: {
          id?: string
          ingredient_name: string
          inventory_item_id?: string | null
          notes?: string | null
          quantity: number
          recipe_id: string
          total_cost?: number | null
          unit: string
          unit_cost?: number | null
        }
        Update: {
          id?: string
          ingredient_name?: string
          inventory_item_id?: string | null
          notes?: string | null
          quantity?: number
          recipe_id?: string
          total_cost?: number | null
          unit?: string
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          cook_time_minutes: number | null
          created_at: string
          description: string | null
          food_cost: number | null
          id: string
          instructions: string | null
          is_active: boolean | null
          menu_item_id: string | null
          name: string
          prep_time_minutes: number | null
          profit_margin: number | null
          restaurant_id: string
          selling_price: number | null
          updated_at: string
          yield_quantity: number | null
          yield_unit: string | null
        }
        Insert: {
          cook_time_minutes?: number | null
          created_at?: string
          description?: string | null
          food_cost?: number | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          menu_item_id?: string | null
          name: string
          prep_time_minutes?: number | null
          profit_margin?: number | null
          restaurant_id: string
          selling_price?: number | null
          updated_at?: string
          yield_quantity?: number | null
          yield_unit?: string | null
        }
        Update: {
          cook_time_minutes?: number | null
          created_at?: string
          description?: string | null
          food_cost?: number | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          menu_item_id?: string | null
          name?: string
          prep_time_minutes?: number | null
          profit_margin?: number | null
          restaurant_id?: string
          selling_price?: number | null
          updated_at?: string
          yield_quantity?: number | null
          yield_unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipes_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
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
      reorder_rules: {
        Row: {
          auto_order: boolean | null
          created_at: string
          id: string
          inventory_item_id: string
          is_active: boolean | null
          last_triggered_at: string | null
          preferred_supplier_id: string | null
          reorder_point: number
          reorder_quantity: number
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          auto_order?: boolean | null
          created_at?: string
          id?: string
          inventory_item_id: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          preferred_supplier_id?: string | null
          reorder_point: number
          reorder_quantity: number
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          auto_order?: boolean | null
          created_at?: string
          id?: string
          inventory_item_id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          preferred_supplier_id?: string | null
          reorder_point?: number
          reorder_quantity?: number
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reorder_rules_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reorder_rules_preferred_supplier_id_fkey"
            columns: ["preferred_supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reorder_rules_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          duration_minutes: number | null
          id: string
          party_size: number
          reminder_sent: boolean | null
          reservation_date: string
          reservation_time: string
          restaurant_id: string
          source: string | null
          special_requests: string | null
          status: string | null
          table_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          duration_minutes?: number | null
          id?: string
          party_size?: number
          reminder_sent?: boolean | null
          reservation_date: string
          reservation_time: string
          restaurant_id: string
          source?: string | null
          special_requests?: string | null
          status?: string | null
          table_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          duration_minutes?: number | null
          id?: string
          party_size?: number
          reminder_sent?: boolean | null
          reservation_date?: string
          reservation_time?: string
          restaurant_id?: string
          source?: string | null
          special_requests?: string | null
          status?: string | null
          table_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "restaurant_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_branches: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_restaurant_id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_restaurant_id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_restaurant_id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_branches_parent_restaurant_id_fkey"
            columns: ["parent_restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_tables: {
        Row: {
          capacity: number
          created_at: string
          floor_plan_id: string | null
          height: number | null
          id: string
          position_x: number | null
          position_y: number | null
          qr_token: string
          restaurant_id: string
          shape: string | null
          status: string
          table_number: string
          updated_at: string
          width: number | null
        }
        Insert: {
          capacity?: number
          created_at?: string
          floor_plan_id?: string | null
          height?: number | null
          id?: string
          position_x?: number | null
          position_y?: number | null
          qr_token?: string
          restaurant_id: string
          shape?: string | null
          status?: string
          table_number: string
          updated_at?: string
          width?: number | null
        }
        Update: {
          capacity?: number
          created_at?: string
          floor_plan_id?: string | null
          height?: number | null
          id?: string
          position_x?: number | null
          position_y?: number | null
          qr_token?: string
          restaurant_id?: string
          shape?: string | null
          status?: string
          table_number?: string
          updated_at?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_tables_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
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
      safety_alerts: {
        Row: {
          created_at: string
          description: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          lat: number | null
          lng: number | null
          location_area: string | null
          radius_km: number | null
          severity: string
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          lat?: number | null
          lng?: number | null
          location_area?: string | null
          radius_km?: number | null
          severity?: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          lat?: number | null
          lng?: number | null
          location_area?: string | null
          radius_km?: number | null
          severity?: string
          title?: string
        }
        Relationships: []
      }
      safety_incidents: {
        Row: {
          created_at: string
          date: string
          description: string
          driver_id: string
          id: string
          incident_type: string
          location: string | null
          photos_count: number | null
          resolution_notes: string | null
          resolved_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date?: string
          description: string
          driver_id: string
          id?: string
          incident_type: string
          location?: string | null
          photos_count?: number | null
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string
          driver_id?: string
          id?: string
          incident_type?: string
          location?: string | null
          photos_count?: number | null
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "safety_incidents_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
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
      scheduled_reports: {
        Row: {
          created_at: string
          format: string
          id: string
          include_inventory: boolean | null
          include_orders: boolean | null
          include_revenue: boolean | null
          include_staff: boolean | null
          is_active: boolean | null
          last_sent_at: string | null
          next_scheduled_at: string | null
          recipients: string[] | null
          report_name: string
          report_type: string
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          format?: string
          id?: string
          include_inventory?: boolean | null
          include_orders?: boolean | null
          include_revenue?: boolean | null
          include_staff?: boolean | null
          is_active?: boolean | null
          last_sent_at?: string | null
          next_scheduled_at?: string | null
          recipients?: string[] | null
          report_name: string
          report_type: string
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          format?: string
          id?: string
          include_inventory?: boolean | null
          include_orders?: boolean | null
          include_revenue?: boolean | null
          include_staff?: boolean | null
          is_active?: boolean | null
          last_sent_at?: string | null
          next_scheduled_at?: string | null
          recipients?: string[] | null
          report_name?: string
          report_type?: string
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_reports_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      sos_alerts: {
        Row: {
          cancelled_at: string | null
          driver_id: string
          id: string
          lat: number | null
          lng: number | null
          notes: string | null
          resolved_at: string | null
          status: string
          triggered_at: string
        }
        Insert: {
          cancelled_at?: string | null
          driver_id: string
          id?: string
          lat?: number | null
          lng?: number | null
          notes?: string | null
          resolved_at?: string | null
          status?: string
          triggered_at?: string
        }
        Update: {
          cancelled_at?: string | null
          driver_id?: string
          id?: string
          lat?: number | null
          lng?: number | null
          notes?: string | null
          resolved_at?: string | null
          status?: string
          triggered_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sos_alerts_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_members: {
        Row: {
          created_at: string
          email: string
          emergency_contact: string | null
          emergency_phone: string | null
          full_name: string
          hire_date: string | null
          hourly_rate: number | null
          id: string
          permissions: Json | null
          phone: string | null
          restaurant_id: string
          role: string
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          emergency_contact?: string | null
          emergency_phone?: string | null
          full_name: string
          hire_date?: string | null
          hourly_rate?: number | null
          id?: string
          permissions?: Json | null
          phone?: string | null
          restaurant_id: string
          role?: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          emergency_contact?: string | null
          emergency_phone?: string | null
          full_name?: string
          hire_date?: string | null
          hourly_rate?: number | null
          id?: string
          permissions?: Json | null
          phone?: string | null
          restaurant_id?: string
          role?: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_members_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_performance: {
        Row: {
          avg_order_time_minutes: number | null
          created_at: string
          customer_rating: number | null
          hours_worked: number | null
          id: string
          notes: string | null
          orders_served: number | null
          period_end: string
          period_start: string
          restaurant_id: string
          staff_id: string
          tips_earned: number | null
          total_sales: number | null
          updated_at: string
        }
        Insert: {
          avg_order_time_minutes?: number | null
          created_at?: string
          customer_rating?: number | null
          hours_worked?: number | null
          id?: string
          notes?: string | null
          orders_served?: number | null
          period_end: string
          period_start: string
          restaurant_id: string
          staff_id: string
          tips_earned?: number | null
          total_sales?: number | null
          updated_at?: string
        }
        Update: {
          avg_order_time_minutes?: number | null
          created_at?: string
          customer_rating?: number | null
          hours_worked?: number | null
          id?: string
          notes?: string | null
          orders_served?: number | null
          period_end?: string
          period_start?: string
          restaurant_id?: string
          staff_id?: string
          tips_earned?: number | null
          total_sales?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_performance_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_performance_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_schedules: {
        Row: {
          break_minutes: number | null
          created_at: string
          end_time: string
          id: string
          notes: string | null
          restaurant_id: string
          shift_date: string
          staff_id: string
          start_time: string
          status: string | null
          updated_at: string
        }
        Insert: {
          break_minutes?: number | null
          created_at?: string
          end_time: string
          id?: string
          notes?: string | null
          restaurant_id: string
          shift_date: string
          staff_id: string
          start_time: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          break_minutes?: number | null
          created_at?: string
          end_time?: string
          id?: string
          notes?: string | null
          restaurant_id?: string
          shift_date?: string
          staff_id?: string
          start_time?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_schedules_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_schedules_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          category: string | null
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          payment_terms: string | null
          phone: string | null
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          category?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          category?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string | null
          created_at: string | null
          description: string
          driver_id: string | null
          id: string
          priority: string | null
          resolved_at: string | null
          restaurant_id: string | null
          status: string | null
          subject: string
          ticket_number: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          description: string
          driver_id?: string | null
          id?: string
          priority?: string | null
          resolved_at?: string | null
          restaurant_id?: string | null
          status?: string | null
          subject: string
          ticket_number: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          description?: string
          driver_id?: string | null
          id?: string
          priority?: string | null
          resolved_at?: string | null
          restaurant_id?: string | null
          status?: string | null
          subject?: string
          ticket_number?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      surge_zones: {
        Row: {
          base_multiplier: number
          created_at: string
          id: string
          is_active: boolean
          lat: number
          lng: number
          name: string
          peak_hours_only: boolean
          radius_km: number
          updated_at: string
        }
        Insert: {
          base_multiplier?: number
          created_at?: string
          id?: string
          is_active?: boolean
          lat: number
          lng: number
          name: string
          peak_hours_only?: boolean
          radius_km?: number
          updated_at?: string
        }
        Update: {
          base_multiplier?: number
          created_at?: string
          id?: string
          is_active?: boolean
          lat?: number
          lng?: number
          name?: string
          peak_hours_only?: boolean
          radius_km?: number
          updated_at?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      ticket_replies: {
        Row: {
          created_at: string | null
          id: string
          is_admin: boolean | null
          message: string
          ticket_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
          message: string
          ticket_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
          message?: string
          ticket_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_replies_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          break_minutes: number | null
          clock_in: string
          clock_out: string | null
          created_at: string
          id: string
          notes: string | null
          restaurant_id: string
          staff_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          break_minutes?: number | null
          clock_in: string
          clock_out?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          restaurant_id: string
          staff_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          break_minutes?: number | null
          clock_in?: string
          clock_out?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          restaurant_id?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
        ]
      }
      tip_allocations: {
        Row: {
          amount: number
          created_at: string
          distribution_id: string
          hours_worked: number | null
          id: string
          percentage: number | null
          staff_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          distribution_id: string
          hours_worked?: number | null
          id?: string
          percentage?: number | null
          staff_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          distribution_id?: string
          hours_worked?: number | null
          id?: string
          percentage?: number | null
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tip_allocations_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "tip_distributions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tip_allocations_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
        ]
      }
      tip_distributions: {
        Row: {
          created_at: string
          distributed_by: string | null
          distribution_date: string
          distribution_method: string
          id: string
          notes: string | null
          restaurant_id: string
          total_tips: number
        }
        Insert: {
          created_at?: string
          distributed_by?: string | null
          distribution_date: string
          distribution_method?: string
          id?: string
          notes?: string | null
          restaurant_id: string
          total_tips: number
        }
        Update: {
          created_at?: string
          distributed_by?: string | null
          distribution_date?: string
          distribution_method?: string
          id?: string
          notes?: string | null
          restaurant_id?: string
          total_tips?: number
        }
        Relationships: [
          {
            foreignKeyName: "tip_distributions_distributed_by_fkey"
            columns: ["distributed_by"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tip_distributions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      training_courses: {
        Row: {
          badge_id: string | null
          category: string
          created_at: string
          description: string
          duration_minutes: number
          id: string
          is_locked_by_default: boolean | null
          lessons_count: number
          prerequisite_course_id: string | null
          sort_order: number | null
          title: string
        }
        Insert: {
          badge_id?: string | null
          category?: string
          created_at?: string
          description: string
          duration_minutes?: number
          id?: string
          is_locked_by_default?: boolean | null
          lessons_count?: number
          prerequisite_course_id?: string | null
          sort_order?: number | null
          title: string
        }
        Update: {
          badge_id?: string | null
          category?: string
          created_at?: string
          description?: string
          duration_minutes?: number
          id?: string
          is_locked_by_default?: boolean | null
          lessons_count?: number
          prerequisite_course_id?: string | null
          sort_order?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_courses_prerequisite_course_id_fkey"
            columns: ["prerequisite_course_id"]
            isOneToOne: false
            referencedRelation: "training_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      training_progress: {
        Row: {
          completed_at: string | null
          completed_lessons: number
          course_id: string
          created_at: string
          driver_id: string
          id: string
          started_at: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          completed_lessons?: number
          course_id: string
          created_at?: string
          driver_id: string
          id?: string
          started_at?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          completed_lessons?: number
          course_id?: string
          created_at?: string
          driver_id?: string
          id?: string
          started_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_progress_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          description: string | null
          driver_id: string | null
          food_order_id: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          restaurant_id: string | null
          status: string | null
          trip_id: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          driver_id?: string | null
          food_order_id?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          restaurant_id?: string | null
          status?: string | null
          trip_id?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          driver_id?: string | null
          food_order_id?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          restaurant_id?: string | null
          status?: string | null
          trip_id?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_food_order_id_fkey"
            columns: ["food_order_id"]
            isOneToOne: false
            referencedRelation: "food_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
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
      trusted_contacts: {
        Row: {
          auto_share: boolean | null
          created_at: string
          driver_id: string
          email: string | null
          id: string
          name: string
          phone: string
        }
        Insert: {
          auto_share?: boolean | null
          created_at?: string
          driver_id: string
          email?: string | null
          id?: string
          name: string
          phone: string
        }
        Update: {
          auto_share?: boolean | null
          created_at?: string
          driver_id?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "trusted_contacts_driver_id_fkey"
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
      vehicle_documents: {
        Row: {
          document_type: string
          expires_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          notes: string | null
          reviewed_at: string | null
          status: string
          uploaded_at: string
          vehicle_id: string
        }
        Insert: {
          document_type: string
          expires_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          reviewed_at?: string | null
          status?: string
          uploaded_at?: string
          vehicle_id: string
        }
        Update: {
          document_type?: string
          expires_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          reviewed_at?: string | null
          status?: string
          uploaded_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_documents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_maintenance_reminders: {
        Row: {
          completed_at: string | null
          created_at: string
          driver_id: string
          due_date: string | null
          due_mileage: number | null
          estimated_cost: number | null
          id: string
          notifications_enabled: boolean | null
          priority: string
          service_type: string
          status: string
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          driver_id: string
          due_date?: string | null
          due_mileage?: number | null
          estimated_cost?: number | null
          id?: string
          notifications_enabled?: boolean | null
          priority?: string
          service_type: string
          status?: string
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          driver_id?: string
          due_date?: string | null
          due_mileage?: number | null
          estimated_cost?: number | null
          id?: string
          notifications_enabled?: boolean | null
          priority?: string
          service_type?: string
          status?: string
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_maintenance_reminders_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_maintenance_reminders_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_service_logs: {
        Row: {
          cost: number
          created_at: string
          driver_id: string
          id: string
          mileage: number
          notes: string | null
          receipt_url: string | null
          service_date: string
          service_type: string
          shop_name: string | null
          vehicle_id: string
        }
        Insert: {
          cost?: number
          created_at?: string
          driver_id: string
          id?: string
          mileage: number
          notes?: string | null
          receipt_url?: string | null
          service_date?: string
          service_type: string
          shop_name?: string | null
          vehicle_id: string
        }
        Update: {
          cost?: number
          created_at?: string
          driver_id?: string
          id?: string
          mileage?: number
          notes?: string | null
          receipt_url?: string | null
          service_date?: string
          service_type?: string
          shop_name?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_service_logs_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_service_logs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          approval_status: Database["public"]["Enums"]["approval_status"]
          color: string | null
          created_at: string
          driver_id: string
          fuel_type: string | null
          health_score: number | null
          id: string
          is_primary: boolean | null
          last_oil_change: string | null
          last_tire_rotation: string | null
          license_plate: string
          make: string
          mileage: number | null
          model: string
          next_service_miles: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          updated_at: string
          vin: string | null
          year: number
        }
        Insert: {
          approval_status?: Database["public"]["Enums"]["approval_status"]
          color?: string | null
          created_at?: string
          driver_id: string
          fuel_type?: string | null
          health_score?: number | null
          id?: string
          is_primary?: boolean | null
          last_oil_change?: string | null
          last_tire_rotation?: string | null
          license_plate: string
          make: string
          mileage?: number | null
          model: string
          next_service_miles?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          updated_at?: string
          vin?: string | null
          year: number
        }
        Update: {
          approval_status?: Database["public"]["Enums"]["approval_status"]
          color?: string | null
          created_at?: string
          driver_id?: string
          fuel_type?: string | null
          health_score?: number | null
          id?: string
          is_primary?: boolean | null
          last_oil_change?: string | null
          last_tire_rotation?: string | null
          license_plate?: string
          make?: string
          mileage?: number | null
          model?: string
          next_service_miles?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          updated_at?: string
          vin?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_command_logs: {
        Row: {
          command_type: string
          confidence: number | null
          created_at: string
          driver_id: string
          id: string
          transcript: string | null
          was_successful: boolean | null
        }
        Insert: {
          command_type: string
          confidence?: number | null
          created_at?: string
          driver_id: string
          id?: string
          transcript?: string | null
          was_successful?: boolean | null
        }
        Update: {
          command_type?: string
          confidence?: number | null
          created_at?: string
          driver_id?: string
          id?: string
          transcript?: string | null
          was_successful?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_command_logs_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          check_in_time: string
          created_at: string
          customer_name: string
          customer_phone: string
          id: string
          notes: string | null
          party_size: number
          quoted_wait_minutes: number | null
          restaurant_id: string
          seated_time: string | null
          status: string | null
        }
        Insert: {
          check_in_time?: string
          created_at?: string
          customer_name: string
          customer_phone: string
          id?: string
          notes?: string | null
          party_size?: number
          quoted_wait_minutes?: number | null
          restaurant_id: string
          seated_time?: string | null
          status?: string | null
        }
        Update: {
          check_in_time?: string
          created_at?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          notes?: string | null
          party_size?: number
          quoted_wait_minutes?: number | null
          restaurant_id?: string
          seated_time?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      waste_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          restaurant_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          restaurant_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "waste_categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      waste_logs: {
        Row: {
          cost: number | null
          created_at: string
          id: string
          inventory_item_id: string | null
          item_name: string
          logged_by: string | null
          notes: string | null
          quantity: number
          reason: string
          restaurant_id: string
          unit: string
          waste_date: string
        }
        Insert: {
          cost?: number | null
          created_at?: string
          id?: string
          inventory_item_id?: string | null
          item_name: string
          logged_by?: string | null
          notes?: string | null
          quantity: number
          reason: string
          restaurant_id: string
          unit: string
          waste_date?: string
        }
        Update: {
          cost?: number | null
          created_at?: string
          id?: string
          inventory_item_id?: string | null
          item_name?: string
          logged_by?: string | null
          notes?: string | null
          quantity?: number
          reason?: string
          restaurant_id?: string
          unit?: string
          waste_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "waste_logs_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waste_logs_logged_by_fkey"
            columns: ["logged_by"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waste_logs_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
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
      can_customer_view_driver: {
        Args: { _driver_id: string }
        Returns: boolean
      }
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
      approval_status: "pending" | "approved" | "rejected"
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
      approval_status: ["pending", "approved", "rejected"],
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
