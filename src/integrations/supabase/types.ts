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
      abandoned_searches: {
        Row: {
          checkout_initiated: boolean | null
          checkout_initiated_at: string | null
          created_at: string
          email: string
          email_sent: boolean | null
          email_sent_at: string | null
          id: string
          search_params: Json
          search_session_id: string
          search_type: string
          searched_at: string
        }
        Insert: {
          checkout_initiated?: boolean | null
          checkout_initiated_at?: string | null
          created_at?: string
          email: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          id?: string
          search_params?: Json
          search_session_id: string
          search_type: string
          searched_at?: string
        }
        Update: {
          checkout_initiated?: boolean | null
          checkout_initiated_at?: string | null
          created_at?: string
          email?: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          id?: string
          search_params?: Json
          search_session_id?: string
          search_type?: string
          searched_at?: string
        }
        Relationships: []
      }
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
          {
            foreignKeyName: "admin_driver_actions_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_security_alerts: {
        Row: {
          alert_type: string
          created_at: string
          description: string | null
          event_id: string | null
          id: string
          is_read: boolean | null
          is_resolved: boolean | null
          metadata: Json | null
          related_driver_id: string | null
          related_user_id: string | null
          resolution_action: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          title: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          description?: string | null
          event_id?: string | null
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          metadata?: Json | null
          related_driver_id?: string | null
          related_user_id?: string | null
          resolution_action?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          title: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          description?: string | null
          event_id?: string | null
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          metadata?: Json | null
          related_driver_id?: string | null
          related_user_id?: string | null
          resolution_action?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_security_alerts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "security_events"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_click_logs: {
        Row: {
          created_at: string
          creator: string | null
          destination_url: string
          device_type: string | null
          final_url: string
          id: string
          ip_address: unknown
          page_source: string
          partner_id: string
          partner_name: string
          product: string
          referrer: string | null
          session_id: string
          subid: string
          subid_components: Json | null
          user_agent: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          created_at?: string
          creator?: string | null
          destination_url: string
          device_type?: string | null
          final_url: string
          id?: string
          ip_address?: unknown
          page_source: string
          partner_id: string
          partner_name: string
          product: string
          referrer?: string | null
          session_id: string
          subid: string
          subid_components?: Json | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          created_at?: string
          creator?: string | null
          destination_url?: string
          device_type?: string | null
          final_url?: string
          id?: string
          ip_address?: unknown
          page_source?: string
          partner_id?: string
          partner_name?: string
          product?: string
          referrer?: string | null
          session_id?: string
          subid?: string
          subid_components?: Json | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
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
            foreignKeyName: "batch_stops_food_order_id_fkey"
            columns: ["food_order_id"]
            isOneToOne: false
            referencedRelation: "food_orders_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_stops_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_stops_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips_masked"
            referencedColumns: ["id"]
          },
        ]
      }
      beta_launch_checklist: {
        Row: {
          created_at: string | null
          day1_admin_routing_works: boolean | null
          day1_cars_page_loads: boolean | null
          day1_completed_at: string | null
          day1_completed_by: string | null
          day1_footer_links_work: boolean | null
          day1_homepage_loads: boolean | null
          day1_list_car_page_loads: boolean | null
          day1_login_works: boolean | null
          day1_owner_routing_works: boolean | null
          day1_renter_routing_works: boolean | null
          day2_commission_deducted: boolean | null
          day2_completed_at: string | null
          day2_completed_by: string | null
          day2_insurance_disclosure_visible: boolean | null
          day2_stripe_connect_payout: boolean | null
          day2_stripe_test_payment: boolean | null
          day3_2018_rule_enforced: boolean | null
          day3_admin_approval_works: boolean | null
          day3_completed_at: string | null
          day3_completed_by: string | null
          day3_owner_dashboard_shows_data: boolean | null
          day3_owner_signup_works: boolean | null
          day3_vehicle_upload_works: boolean | null
          day4_booking_blocked_without_verification: boolean | null
          day4_completed_at: string | null
          day4_completed_by: string | null
          day4_confirmation_email_works: boolean | null
          day4_license_verification_works: boolean | null
          day4_renter_signup_works: boolean | null
          day5_cancellation_works: boolean | null
          day5_completed_at: string | null
          day5_completed_by: string | null
          day5_damage_report_works: boolean | null
          day5_dispute_panel_loads: boolean | null
          day5_payout_hold_works: boolean | null
          day6_city_status_live: boolean | null
          day6_completed_at: string | null
          day6_completed_by: string | null
          day6_non_live_cities_blocked: boolean | null
          day6_only_live_city_cars_shown: boolean | null
          day6_waitlist_shown_when_beta: boolean | null
          day7_bookings_enabled: boolean | null
          day7_completed_at: string | null
          day7_completed_by: string | null
          day7_first_renters_invited: boolean | null
          day7_first_transaction_monitored: boolean | null
          day7_support_contact_visible: boolean | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day1_admin_routing_works?: boolean | null
          day1_cars_page_loads?: boolean | null
          day1_completed_at?: string | null
          day1_completed_by?: string | null
          day1_footer_links_work?: boolean | null
          day1_homepage_loads?: boolean | null
          day1_list_car_page_loads?: boolean | null
          day1_login_works?: boolean | null
          day1_owner_routing_works?: boolean | null
          day1_renter_routing_works?: boolean | null
          day2_commission_deducted?: boolean | null
          day2_completed_at?: string | null
          day2_completed_by?: string | null
          day2_insurance_disclosure_visible?: boolean | null
          day2_stripe_connect_payout?: boolean | null
          day2_stripe_test_payment?: boolean | null
          day3_2018_rule_enforced?: boolean | null
          day3_admin_approval_works?: boolean | null
          day3_completed_at?: string | null
          day3_completed_by?: string | null
          day3_owner_dashboard_shows_data?: boolean | null
          day3_owner_signup_works?: boolean | null
          day3_vehicle_upload_works?: boolean | null
          day4_booking_blocked_without_verification?: boolean | null
          day4_completed_at?: string | null
          day4_completed_by?: string | null
          day4_confirmation_email_works?: boolean | null
          day4_license_verification_works?: boolean | null
          day4_renter_signup_works?: boolean | null
          day5_cancellation_works?: boolean | null
          day5_completed_at?: string | null
          day5_completed_by?: string | null
          day5_damage_report_works?: boolean | null
          day5_dispute_panel_loads?: boolean | null
          day5_payout_hold_works?: boolean | null
          day6_city_status_live?: boolean | null
          day6_completed_at?: string | null
          day6_completed_by?: string | null
          day6_non_live_cities_blocked?: boolean | null
          day6_only_live_city_cars_shown?: boolean | null
          day6_waitlist_shown_when_beta?: boolean | null
          day7_bookings_enabled?: boolean | null
          day7_completed_at?: string | null
          day7_completed_by?: string | null
          day7_first_renters_invited?: boolean | null
          day7_first_transaction_monitored?: boolean | null
          day7_support_contact_visible?: boolean | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day1_admin_routing_works?: boolean | null
          day1_cars_page_loads?: boolean | null
          day1_completed_at?: string | null
          day1_completed_by?: string | null
          day1_footer_links_work?: boolean | null
          day1_homepage_loads?: boolean | null
          day1_list_car_page_loads?: boolean | null
          day1_login_works?: boolean | null
          day1_owner_routing_works?: boolean | null
          day1_renter_routing_works?: boolean | null
          day2_commission_deducted?: boolean | null
          day2_completed_at?: string | null
          day2_completed_by?: string | null
          day2_insurance_disclosure_visible?: boolean | null
          day2_stripe_connect_payout?: boolean | null
          day2_stripe_test_payment?: boolean | null
          day3_2018_rule_enforced?: boolean | null
          day3_admin_approval_works?: boolean | null
          day3_completed_at?: string | null
          day3_completed_by?: string | null
          day3_owner_dashboard_shows_data?: boolean | null
          day3_owner_signup_works?: boolean | null
          day3_vehicle_upload_works?: boolean | null
          day4_booking_blocked_without_verification?: boolean | null
          day4_completed_at?: string | null
          day4_completed_by?: string | null
          day4_confirmation_email_works?: boolean | null
          day4_license_verification_works?: boolean | null
          day4_renter_signup_works?: boolean | null
          day5_cancellation_works?: boolean | null
          day5_completed_at?: string | null
          day5_completed_by?: string | null
          day5_damage_report_works?: boolean | null
          day5_dispute_panel_loads?: boolean | null
          day5_payout_hold_works?: boolean | null
          day6_city_status_live?: boolean | null
          day6_completed_at?: string | null
          day6_completed_by?: string | null
          day6_non_live_cities_blocked?: boolean | null
          day6_only_live_city_cars_shown?: boolean | null
          day6_waitlist_shown_when_beta?: boolean | null
          day7_bookings_enabled?: boolean | null
          day7_completed_at?: string | null
          day7_completed_by?: string | null
          day7_first_renters_invited?: boolean | null
          day7_first_transaction_monitored?: boolean | null
          day7_support_contact_visible?: boolean | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      beta_launch_status: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          created_at: string | null
          id: string
          notes: string | null
          paused_at: string | null
          paused_by: string | null
          status: Database["public"]["Enums"]["beta_launch_state"]
          updated_at: string | null
        }
        Insert: {
          activated_at?: string | null
          activated_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          paused_at?: string | null
          paused_by?: string | null
          status?: Database["public"]["Enums"]["beta_launch_state"]
          updated_at?: string | null
        }
        Update: {
          activated_at?: string | null
          activated_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          paused_at?: string | null
          paused_by?: string | null
          status?: Database["public"]["Enums"]["beta_launch_state"]
          updated_at?: string | null
        }
        Relationships: []
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
          {
            foreignKeyName: "bill_splits_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_returns: {
        Row: {
          booking_ref: string | null
          callback_params: Json | null
          created_at: string
          id: string
          partner_name: string | null
          redirect_log_id: string | null
          session_id: string
          status: string
          user_id: string | null
        }
        Insert: {
          booking_ref?: string | null
          callback_params?: Json | null
          created_at?: string
          id?: string
          partner_name?: string | null
          redirect_log_id?: string | null
          session_id: string
          status: string
          user_id?: string | null
        }
        Update: {
          booking_ref?: string | null
          callback_params?: Json | null
          created_at?: string
          id?: string
          partner_name?: string | null
          redirect_log_id?: string | null
          session_id?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_returns_redirect_log_id_fkey"
            columns: ["redirect_log_id"]
            isOneToOne: false
            referencedRelation: "partner_redirect_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      car_inventory: {
        Row: {
          created_at: string
          fuel: string
          id: string
          image_url: string | null
          location_city: string
          location_state: string
          make_id: string
          mileage: number
          model_id: string
          price: number
          transmission: string
          trim: string | null
          year: number
        }
        Insert: {
          created_at?: string
          fuel: string
          id?: string
          image_url?: string | null
          location_city: string
          location_state: string
          make_id: string
          mileage: number
          model_id: string
          price: number
          transmission: string
          trim?: string | null
          year: number
        }
        Update: {
          created_at?: string
          fuel?: string
          id?: string
          image_url?: string | null
          location_city?: string
          location_state?: string
          make_id?: string
          mileage?: number
          model_id?: string
          price?: number
          transmission?: string
          trim?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "car_inventory_make_id_fkey"
            columns: ["make_id"]
            isOneToOne: false
            referencedRelation: "car_makes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "car_inventory_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "car_models"
            referencedColumns: ["id"]
          },
        ]
      }
      car_makes: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      car_models: {
        Row: {
          created_at: string
          id: string
          make_id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          make_id: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          make_id?: string
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "car_models_make_id_fkey"
            columns: ["make_id"]
            isOneToOne: false
            referencedRelation: "car_makes"
            referencedColumns: ["id"]
          },
        ]
      }
      car_owner_documents: {
        Row: {
          created_at: string | null
          document_type: Database["public"]["Enums"]["car_owner_document_type"]
          expires_at: string | null
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          mime_type: string | null
          notes: string | null
          owner_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["document_review_status"] | null
        }
        Insert: {
          created_at?: string | null
          document_type: Database["public"]["Enums"]["car_owner_document_type"]
          expires_at?: string | null
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          mime_type?: string | null
          notes?: string | null
          owner_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["document_review_status"] | null
        }
        Update: {
          created_at?: string | null
          document_type?: Database["public"]["Enums"]["car_owner_document_type"]
          expires_at?: string | null
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          mime_type?: string | null
          notes?: string | null
          owner_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["document_review_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "car_owner_documents_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "car_owner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      car_owner_profiles: {
        Row: {
          address: string | null
          admin_review_notes: string | null
          bio: string | null
          city: string | null
          created_at: string | null
          date_of_birth: string | null
          documents_verified: boolean | null
          email: string | null
          full_name: string
          id: string
          insurance_option:
            | Database["public"]["Enums"]["car_owner_insurance_option"]
            | null
          payout_enabled: boolean | null
          phone: string | null
          rating: number | null
          response_rate: number | null
          response_time_hours: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          ssn_last_four: string | null
          state: string | null
          status: Database["public"]["Enums"]["car_owner_status"] | null
          stripe_account_currency: string | null
          stripe_account_id: string | null
          stripe_charges_enabled: boolean | null
          stripe_payouts_enabled: boolean | null
          total_trips: number | null
          updated_at: string | null
          user_id: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          admin_review_notes?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          documents_verified?: boolean | null
          email?: string | null
          full_name: string
          id?: string
          insurance_option?:
            | Database["public"]["Enums"]["car_owner_insurance_option"]
            | null
          payout_enabled?: boolean | null
          phone?: string | null
          rating?: number | null
          response_rate?: number | null
          response_time_hours?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          ssn_last_four?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["car_owner_status"] | null
          stripe_account_currency?: string | null
          stripe_account_id?: string | null
          stripe_charges_enabled?: boolean | null
          stripe_payouts_enabled?: boolean | null
          total_trips?: number | null
          updated_at?: string | null
          user_id: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          admin_review_notes?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          documents_verified?: boolean | null
          email?: string | null
          full_name?: string
          id?: string
          insurance_option?:
            | Database["public"]["Enums"]["car_owner_insurance_option"]
            | null
          payout_enabled?: boolean | null
          phone?: string | null
          rating?: number | null
          response_rate?: number | null
          response_time_hours?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          ssn_last_four?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["car_owner_status"] | null
          stripe_account_currency?: string | null
          stripe_account_id?: string | null
          stripe_charges_enabled?: boolean | null
          stripe_payouts_enabled?: boolean | null
          total_trips?: number | null
          updated_at?: string | null
          user_id?: string
          zip_code?: string | null
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
          {
            foreignKeyName: "car_rentals_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "rental_cars_public"
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
            foreignKeyName: "chat_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "food_orders_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips_masked"
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
            foreignKeyName: "community_tip_likes_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
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
          {
            foreignKeyName: "community_tips_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
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
          {
            foreignKeyName: "customer_feedback_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
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
          {
            foreignKeyName: "customer_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "customer_orders_masked"
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
            foreignKeyName: "customer_orders_assigned_chef_fkey"
            columns: ["assigned_chef"]
            isOneToOne: false
            referencedRelation: "staff_members_masked"
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
            foreignKeyName: "customer_orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
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
          region_id: string | null
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
          region_id?: string | null
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
          region_id?: string | null
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
          {
            foreignKeyName: "delivery_batches_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_batches_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
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
          {
            foreignKeyName: "driver_cash_collections_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
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
          {
            foreignKeyName: "driver_certifications_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_documents: {
        Row: {
          document_type: string
          driver_id: string
          expires_at: string | null
          expiry_notified_at: string | null
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
          expires_at?: string | null
          expiry_notified_at?: string | null
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
          expires_at?: string | null
          expiry_notified_at?: string | null
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
          {
            foreignKeyName: "driver_documents_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
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
            foreignKeyName: "driver_earnings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_earnings_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_earnings_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips_masked"
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
          {
            foreignKeyName: "driver_expenses_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
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
          {
            foreignKeyName: "driver_location_history_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_notification_logs: {
        Row: {
          body: string | null
          data: Json | null
          delivered_at: string | null
          driver_id: string
          error_message: string | null
          failed_at: string | null
          id: string
          notification_type: string
          opened_at: string | null
          platform: string | null
          sent_at: string | null
          title: string
        }
        Insert: {
          body?: string | null
          data?: Json | null
          delivered_at?: string | null
          driver_id: string
          error_message?: string | null
          failed_at?: string | null
          id?: string
          notification_type: string
          opened_at?: string | null
          platform?: string | null
          sent_at?: string | null
          title: string
        }
        Update: {
          body?: string | null
          data?: Json | null
          delivered_at?: string | null
          driver_id?: string
          error_message?: string | null
          failed_at?: string | null
          id?: string
          notification_type?: string
          opened_at?: string | null
          platform?: string | null
          sent_at?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_notification_logs_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_notification_logs_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
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
          {
            foreignKeyName: "driver_notifications_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
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
          {
            foreignKeyName: "driver_referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
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
          {
            foreignKeyName: "driver_schedules_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
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
          {
            foreignKeyName: "driver_settings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: true
            referencedRelation: "drivers_public"
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
          {
            foreignKeyName: "driver_shifts_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
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
          {
            foreignKeyName: "driver_training_progress_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_withdrawals: {
        Row: {
          amount: number
          created_at: string
          device_fingerprint: string | null
          driver_id: string
          failed_reason: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          method: string
          processed_at: string | null
          status: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          device_fingerprint?: string | null
          driver_id: string
          failed_reason?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          method: string
          processed_at?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          device_fingerprint?: string | null
          driver_id?: string
          failed_reason?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          method?: string
          processed_at?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_withdrawals_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_withdrawals_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          allowed_regions: string[] | null
          apns_token: string | null
          avatar_url: string | null
          created_at: string
          current_lat: number | null
          current_lng: number | null
          device_platform: string | null
          documents_verified: boolean | null
          eats_enabled: boolean | null
          email: string
          fcm_token: string | null
          full_name: string
          home_city: string | null
          id: string
          is_online: boolean | null
          license_number: string
          move_enabled: boolean | null
          phone: string
          rating: number | null
          region_id: string | null
          rides_enabled: boolean | null
          status: Database["public"]["Enums"]["driver_status"] | null
          total_trips: number | null
          updated_at: string
          user_id: string
          vehicle_model: string | null
          vehicle_plate: string
          vehicle_type: string
        }
        Insert: {
          allowed_regions?: string[] | null
          apns_token?: string | null
          avatar_url?: string | null
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          device_platform?: string | null
          documents_verified?: boolean | null
          eats_enabled?: boolean | null
          email: string
          fcm_token?: string | null
          full_name: string
          home_city?: string | null
          id?: string
          is_online?: boolean | null
          license_number: string
          move_enabled?: boolean | null
          phone: string
          rating?: number | null
          region_id?: string | null
          rides_enabled?: boolean | null
          status?: Database["public"]["Enums"]["driver_status"] | null
          total_trips?: number | null
          updated_at?: string
          user_id: string
          vehicle_model?: string | null
          vehicle_plate: string
          vehicle_type: string
        }
        Update: {
          allowed_regions?: string[] | null
          apns_token?: string | null
          avatar_url?: string | null
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          device_platform?: string | null
          documents_verified?: boolean | null
          eats_enabled?: boolean | null
          email?: string
          fcm_token?: string | null
          full_name?: string
          home_city?: string | null
          id?: string
          is_online?: boolean | null
          license_number?: string
          move_enabled?: boolean | null
          phone?: string
          rating?: number | null
          region_id?: string | null
          rides_enabled?: boolean | null
          status?: Database["public"]["Enums"]["driver_status"] | null
          total_trips?: number | null
          updated_at?: string
          user_id?: string
          vehicle_model?: string | null
          vehicle_plate?: string
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "drivers_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      eats_zones: {
        Row: {
          city_name: string
          created_at: string
          delivery_fee_base: number
          delivery_fee_per_mile: number
          id: string
          is_active: boolean
          service_fee_percent: number
          small_order_fee: number
          small_order_threshold: number
          tax_rate: number
          updated_at: string
          zone_code: string
        }
        Insert: {
          city_name: string
          created_at?: string
          delivery_fee_base?: number
          delivery_fee_per_mile?: number
          id?: string
          is_active?: boolean
          service_fee_percent?: number
          small_order_fee?: number
          small_order_threshold?: number
          tax_rate?: number
          updated_at?: string
          zone_code: string
        }
        Update: {
          city_name?: string
          created_at?: string
          delivery_fee_base?: number
          delivery_fee_per_mile?: number
          id?: string
          is_active?: boolean
          service_fee_percent?: number
          small_order_fee?: number
          small_order_threshold?: number
          tax_rate?: number
          updated_at?: string
          zone_code?: string
        }
        Relationships: []
      }
      email_consents: {
        Row: {
          consent_text: string | null
          consent_type: string
          consented_at: string
          created_at: string
          email: string
          id: string
          ip_address: unknown
          is_active: boolean | null
          metadata: Json | null
          search_session_id: string | null
          unsubscribed_at: string | null
          user_agent: string | null
        }
        Insert: {
          consent_text?: string | null
          consent_type?: string
          consented_at?: string
          created_at?: string
          email: string
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          metadata?: Json | null
          search_session_id?: string | null
          unsubscribed_at?: string | null
          user_agent?: string | null
        }
        Update: {
          consent_text?: string | null
          consent_type?: string
          consented_at?: string
          created_at?: string
          email?: string
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          metadata?: Json | null
          search_session_id?: string | null
          unsubscribed_at?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          booking_ref: string | null
          created_at: string
          email_type: string
          error_message: string | null
          id: string
          metadata: Json | null
          partner_name: string | null
          recipient_email: string
          resend_id: string | null
          search_session_id: string | null
          sent_at: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          booking_ref?: string | null
          created_at?: string
          email_type: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          partner_name?: string | null
          recipient_email: string
          resend_id?: string | null
          search_session_id?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          booking_ref?: string | null
          created_at?: string
          email_type?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          partner_name?: string | null
          recipient_email?: string
          resend_id?: string | null
          search_session_id?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          setting_key: string
          setting_value?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          setting_key?: string
          setting_value?: Json
          updated_at?: string
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
          {
            foreignKeyName: "emergency_contacts_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
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
          {
            foreignKeyName: "equipment_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      exchange_rates: {
        Row: {
          base_currency: string
          created_at: string
          fetched_at: string
          id: string
          rate: number
          target_currency: string
        }
        Insert: {
          base_currency?: string
          created_at?: string
          fetched_at?: string
          id?: string
          rate: number
          target_currency: string
        }
        Update: {
          base_currency?: string
          created_at?: string
          fetched_at?: string
          id?: string
          rate?: number
          target_currency?: string
        }
        Relationships: []
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
          {
            foreignKeyName: "expense_categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
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
            foreignKeyName: "expenses_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "staff_members_masked"
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
          {
            foreignKeyName: "expenses_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
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
          {
            foreignKeyName: "floor_plans_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      food_orders: {
        Row: {
          admin_override_reason: string | null
          admin_price_override: number | null
          created_at: string | null
          customer_email: string | null
          customer_id: string
          customer_name: string | null
          customer_phone: string | null
          delivered_at: string | null
          delivery_address: string
          delivery_fee: number | null
          delivery_lat: number
          delivery_lng: number
          delivery_photo_url: string | null
          delivery_pin: string | null
          delivery_pin_verified: boolean | null
          driver_id: string | null
          estimated_delivery_time: number | null
          estimated_prep_time: number | null
          id: string
          items: Json
          payment_status: string | null
          picked_up_at: string | null
          placed_at: string | null
          prepared_at: string | null
          quoted_delivery_fee: number | null
          quoted_service_fee: number | null
          quoted_small_order_fee: number | null
          quoted_subtotal: number | null
          quoted_tax: number | null
          quoted_tip: number | null
          quoted_total: number | null
          rating: number | null
          refund_status: string | null
          refunded_at: string | null
          region_id: string | null
          restaurant_id: string
          special_instructions: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          stripe_checkout_session_id: string | null
          stripe_payment_id: string | null
          subtotal: number
          tax: number | null
          total_amount: number
          updated_at: string | null
          zone_code: string | null
        }
        Insert: {
          admin_override_reason?: string | null
          admin_price_override?: number | null
          created_at?: string | null
          customer_email?: string | null
          customer_id: string
          customer_name?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          delivery_address: string
          delivery_fee?: number | null
          delivery_lat: number
          delivery_lng: number
          delivery_photo_url?: string | null
          delivery_pin?: string | null
          delivery_pin_verified?: boolean | null
          driver_id?: string | null
          estimated_delivery_time?: number | null
          estimated_prep_time?: number | null
          id?: string
          items: Json
          payment_status?: string | null
          picked_up_at?: string | null
          placed_at?: string | null
          prepared_at?: string | null
          quoted_delivery_fee?: number | null
          quoted_service_fee?: number | null
          quoted_small_order_fee?: number | null
          quoted_subtotal?: number | null
          quoted_tax?: number | null
          quoted_tip?: number | null
          quoted_total?: number | null
          rating?: number | null
          refund_status?: string | null
          refunded_at?: string | null
          region_id?: string | null
          restaurant_id: string
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          stripe_checkout_session_id?: string | null
          stripe_payment_id?: string | null
          subtotal: number
          tax?: number | null
          total_amount: number
          updated_at?: string | null
          zone_code?: string | null
        }
        Update: {
          admin_override_reason?: string | null
          admin_price_override?: number | null
          created_at?: string | null
          customer_email?: string | null
          customer_id?: string
          customer_name?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          delivery_address?: string
          delivery_fee?: number | null
          delivery_lat?: number
          delivery_lng?: number
          delivery_photo_url?: string | null
          delivery_pin?: string | null
          delivery_pin_verified?: boolean | null
          driver_id?: string | null
          estimated_delivery_time?: number | null
          estimated_prep_time?: number | null
          id?: string
          items?: Json
          payment_status?: string | null
          picked_up_at?: string | null
          placed_at?: string | null
          prepared_at?: string | null
          quoted_delivery_fee?: number | null
          quoted_service_fee?: number | null
          quoted_small_order_fee?: number | null
          quoted_subtotal?: number | null
          quoted_tax?: number | null
          quoted_tip?: number | null
          quoted_total?: number | null
          rating?: number | null
          refund_status?: string | null
          refunded_at?: string | null
          region_id?: string | null
          restaurant_id?: string
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          stripe_checkout_session_id?: string | null
          stripe_payment_id?: string | null
          subtotal?: number
          tax?: number | null
          total_amount?: number
          updated_at?: string | null
          zone_code?: string | null
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
            foreignKeyName: "food_orders_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_orders_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
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
            foreignKeyName: "forum_post_likes_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
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
          {
            foreignKeyName: "forum_posts_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
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
            foreignKeyName: "forum_replies_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
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
          {
            foreignKeyName: "fuel_entries_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
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
          {
            foreignKeyName: "gift_cards_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
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
            foreignKeyName: "hotel_bookings_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels_public"
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
          {
            foreignKeyName: "hotel_rooms_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels_public"
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
          {
            foreignKeyName: "inventory_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      launch_settings: {
        Row: {
          announcement_cities: string[] | null
          announcement_enabled: boolean | null
          announcement_text: string | null
          created_at: string | null
          daily_booking_limit_per_city: number | null
          emergency_pause: boolean
          emergency_pause_at: string | null
          emergency_pause_by: string | null
          emergency_pause_reason: string | null
          enforce_supply_minimum: boolean | null
          global_mode: string
          id: string
          min_owners_for_launch: number | null
          min_vehicles_for_launch: number | null
          mode_changed_at: string | null
          mode_changed_by: string | null
          updated_at: string | null
        }
        Insert: {
          announcement_cities?: string[] | null
          announcement_enabled?: boolean | null
          announcement_text?: string | null
          created_at?: string | null
          daily_booking_limit_per_city?: number | null
          emergency_pause?: boolean
          emergency_pause_at?: string | null
          emergency_pause_by?: string | null
          emergency_pause_reason?: string | null
          enforce_supply_minimum?: boolean | null
          global_mode?: string
          id?: string
          min_owners_for_launch?: number | null
          min_vehicles_for_launch?: number | null
          mode_changed_at?: string | null
          mode_changed_by?: string | null
          updated_at?: string | null
        }
        Update: {
          announcement_cities?: string[] | null
          announcement_enabled?: boolean | null
          announcement_text?: string | null
          created_at?: string | null
          daily_booking_limit_per_city?: number | null
          emergency_pause?: boolean
          emergency_pause_at?: string | null
          emergency_pause_by?: string | null
          emergency_pause_reason?: string | null
          enforce_supply_minimum?: boolean | null
          global_mode?: string
          id?: string
          min_owners_for_launch?: number | null
          min_vehicles_for_launch?: number | null
          mode_changed_at?: string | null
          mode_changed_by?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      login_sessions: {
        Row: {
          created_at: string
          device_fingerprint: string | null
          device_type: string | null
          driver_id: string | null
          expires_at: string | null
          id: string
          ip_address: string | null
          is_active: boolean | null
          is_trusted: boolean | null
          last_activity: string | null
          location_city: string | null
          location_country: string | null
          session_token: string
          terminated_at: string | null
          terminated_reason: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_fingerprint?: string | null
          device_type?: string | null
          driver_id?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          is_trusted?: boolean | null
          last_activity?: string | null
          location_city?: string | null
          location_country?: string | null
          session_token: string
          terminated_at?: string | null
          terminated_reason?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_fingerprint?: string | null
          device_type?: string | null
          driver_id?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          is_trusted?: boolean | null
          last_activity?: string | null
          location_city?: string | null
          location_country?: string | null
          session_token?: string
          terminated_at?: string | null
          terminated_reason?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "login_sessions_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "login_sessions_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
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
          {
            foreignKeyName: "loyalty_members_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
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
          {
            foreignKeyName: "loyalty_rewards_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
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
            foreignKeyName: "loyalty_transactions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "loyalty_members_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_transactions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_transactions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
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
          {
            foreignKeyName: "maintenance_logs_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
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
          {
            foreignKeyName: "menu_categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
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
          {
            foreignKeyName: "menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
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
          {
            foreignKeyName: "offline_sync_queue_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      p2p_bookings: {
        Row: {
          actual_return_date: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string | null
          daily_rate: number
          damage_report_id: string | null
          fuel_level_end: string | null
          fuel_level_start: string | null
          id: string
          insurance_accepted: boolean | null
          insurance_fee: number | null
          mileage_end: number | null
          mileage_start: number | null
          notes: string | null
          owner_id: string
          owner_payout: number
          payment_status:
            | Database["public"]["Enums"]["p2p_payment_status"]
            | null
          payout_eligible_at: string | null
          payout_held_at: string | null
          payout_hold_reason: string | null
          payout_id: string | null
          pickup_confirmed_at: string | null
          pickup_confirmed_by: string | null
          pickup_date: string
          pickup_location: string | null
          platform_fee: number | null
          refund_amount: number | null
          refund_status: string | null
          refunded_at: string | null
          renter_id: string
          renter_license_verified: boolean | null
          return_confirmed_at: string | null
          return_confirmed_by: string | null
          return_date: string
          return_location: string | null
          service_fee: number | null
          status: Database["public"]["Enums"]["p2p_booking_status"] | null
          stripe_charge_id: string | null
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          stripe_refund_id: string | null
          subtotal: number
          taxes: number | null
          terms_accepted: boolean | null
          total_amount: number
          total_days: number
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          actual_return_date?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string | null
          daily_rate: number
          damage_report_id?: string | null
          fuel_level_end?: string | null
          fuel_level_start?: string | null
          id?: string
          insurance_accepted?: boolean | null
          insurance_fee?: number | null
          mileage_end?: number | null
          mileage_start?: number | null
          notes?: string | null
          owner_id: string
          owner_payout: number
          payment_status?:
            | Database["public"]["Enums"]["p2p_payment_status"]
            | null
          payout_eligible_at?: string | null
          payout_held_at?: string | null
          payout_hold_reason?: string | null
          payout_id?: string | null
          pickup_confirmed_at?: string | null
          pickup_confirmed_by?: string | null
          pickup_date: string
          pickup_location?: string | null
          platform_fee?: number | null
          refund_amount?: number | null
          refund_status?: string | null
          refunded_at?: string | null
          renter_id: string
          renter_license_verified?: boolean | null
          return_confirmed_at?: string | null
          return_confirmed_by?: string | null
          return_date: string
          return_location?: string | null
          service_fee?: number | null
          status?: Database["public"]["Enums"]["p2p_booking_status"] | null
          stripe_charge_id?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_refund_id?: string | null
          subtotal: number
          taxes?: number | null
          terms_accepted?: boolean | null
          total_amount: number
          total_days: number
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          actual_return_date?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string | null
          daily_rate?: number
          damage_report_id?: string | null
          fuel_level_end?: string | null
          fuel_level_start?: string | null
          id?: string
          insurance_accepted?: boolean | null
          insurance_fee?: number | null
          mileage_end?: number | null
          mileage_start?: number | null
          notes?: string | null
          owner_id?: string
          owner_payout?: number
          payment_status?:
            | Database["public"]["Enums"]["p2p_payment_status"]
            | null
          payout_eligible_at?: string | null
          payout_held_at?: string | null
          payout_hold_reason?: string | null
          payout_id?: string | null
          pickup_confirmed_at?: string | null
          pickup_confirmed_by?: string | null
          pickup_date?: string
          pickup_location?: string | null
          platform_fee?: number | null
          refund_amount?: number | null
          refund_status?: string | null
          refunded_at?: string | null
          renter_id?: string
          renter_license_verified?: boolean | null
          return_confirmed_at?: string | null
          return_confirmed_by?: string | null
          return_date?: string
          return_location?: string | null
          service_fee?: number | null
          status?: Database["public"]["Enums"]["p2p_booking_status"] | null
          stripe_charge_id?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_refund_id?: string | null
          subtotal?: number
          taxes?: number | null
          terms_accepted?: boolean | null
          total_amount?: number
          total_days?: number
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "p2p_bookings_damage_report_id_fkey"
            columns: ["damage_report_id"]
            isOneToOne: false
            referencedRelation: "p2p_damage_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "p2p_bookings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "car_owner_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "p2p_bookings_payout_id_fkey"
            columns: ["payout_id"]
            isOneToOne: false
            referencedRelation: "p2p_payouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "p2p_bookings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "p2p_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      p2p_category_pricing: {
        Row: {
          category: string
          city: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          max_daily_price: number
          min_daily_price: number
          suggested_daily_price: number
          updated_at: string | null
        }
        Insert: {
          category: string
          city?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_daily_price: number
          min_daily_price: number
          suggested_daily_price: number
          updated_at?: string | null
        }
        Update: {
          category?: string
          city?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_daily_price?: number
          min_daily_price?: number
          suggested_daily_price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      p2p_commission_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          insurance_daily_fee: number | null
          is_active: boolean | null
          name: string
          owner_commission_pct: number | null
          renter_service_fee_pct: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          insurance_daily_fee?: number | null
          is_active?: boolean | null
          name: string
          owner_commission_pct?: number | null
          renter_service_fee_pct?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          insurance_daily_fee?: number | null
          is_active?: boolean | null
          name?: string
          owner_commission_pct?: number | null
          renter_service_fee_pct?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      p2p_damage_evidence: {
        Row: {
          caption: string | null
          created_at: string | null
          damage_report_id: string
          id: string
          image_type: string
          image_url: string
          uploaded_by: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          damage_report_id: string
          id?: string
          image_type: string
          image_url: string
          uploaded_by: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          damage_report_id?: string
          id?: string
          image_type?: string
          image_url?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "p2p_damage_evidence_damage_report_id_fkey"
            columns: ["damage_report_id"]
            isOneToOne: false
            referencedRelation: "p2p_damage_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      p2p_damage_reports: {
        Row: {
          admin_notes: string | null
          booking_id: string
          created_at: string | null
          date_noticed: string
          description: string
          estimated_repair_cost: number | null
          id: string
          priority: string | null
          reported_by: string
          reporter_role: string
          status: Database["public"]["Enums"]["p2p_damage_status"] | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          booking_id: string
          created_at?: string | null
          date_noticed: string
          description: string
          estimated_repair_cost?: number | null
          id?: string
          priority?: string | null
          reported_by: string
          reporter_role: string
          status?: Database["public"]["Enums"]["p2p_damage_status"] | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          booking_id?: string
          created_at?: string | null
          date_noticed?: string
          description?: string
          estimated_repair_cost?: number | null
          id?: string
          priority?: string | null
          reported_by?: string
          reporter_role?: string
          status?: Database["public"]["Enums"]["p2p_damage_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "p2p_damage_reports_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "p2p_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      p2p_dispute_resolutions: {
        Row: {
          admin_notes: string | null
          damage_report_id: string
          decision: string
          id: string
          owner_payout_adjustment: number | null
          renter_charge_amount: number | null
          resolved_at: string | null
          resolved_by: string | null
        }
        Insert: {
          admin_notes?: string | null
          damage_report_id: string
          decision: string
          id?: string
          owner_payout_adjustment?: number | null
          renter_charge_amount?: number | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Update: {
          admin_notes?: string | null
          damage_report_id?: string
          decision?: string
          id?: string
          owner_payout_adjustment?: number | null
          renter_charge_amount?: number | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "p2p_dispute_resolutions_damage_report_id_fkey"
            columns: ["damage_report_id"]
            isOneToOne: false
            referencedRelation: "p2p_damage_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      p2p_disputes: {
        Row: {
          admin_notes: string | null
          booking_id: string
          created_at: string | null
          description: string
          dispute_type: Database["public"]["Enums"]["p2p_dispute_type"]
          evidence: Json | null
          id: string
          priority: string | null
          raised_by: string
          resolution: string | null
          resolution_amount: number | null
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["p2p_dispute_status"] | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          booking_id: string
          created_at?: string | null
          description: string
          dispute_type: Database["public"]["Enums"]["p2p_dispute_type"]
          evidence?: Json | null
          id?: string
          priority?: string | null
          raised_by: string
          resolution?: string | null
          resolution_amount?: number | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["p2p_dispute_status"] | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          booking_id?: string
          created_at?: string | null
          description?: string
          dispute_type?: Database["public"]["Enums"]["p2p_dispute_type"]
          evidence?: Json | null
          id?: string
          priority?: string | null
          raised_by?: string
          resolution?: string | null
          resolution_amount?: number | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["p2p_dispute_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "p2p_disputes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "p2p_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      p2p_insurance_claims: {
        Row: {
          claim_reference: string | null
          coverage_amount: number | null
          coverage_decision: string | null
          created_by: string | null
          damage_report_id: string
          id: string
          insurance_provider: string
          notes: string | null
          resolved_at: string | null
          submitted_at: string | null
        }
        Insert: {
          claim_reference?: string | null
          coverage_amount?: number | null
          coverage_decision?: string | null
          created_by?: string | null
          damage_report_id: string
          id?: string
          insurance_provider: string
          notes?: string | null
          resolved_at?: string | null
          submitted_at?: string | null
        }
        Update: {
          claim_reference?: string | null
          coverage_amount?: number | null
          coverage_decision?: string | null
          created_by?: string | null
          damage_report_id?: string
          id?: string
          insurance_provider?: string
          notes?: string | null
          resolved_at?: string | null
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "p2p_insurance_claims_damage_report_id_fkey"
            columns: ["damage_report_id"]
            isOneToOne: false
            referencedRelation: "p2p_damage_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      p2p_launch_checklists: {
        Row: {
          city_id: string | null
          id: string
          insurance_active: boolean | null
          insurance_confirmation_ref: string | null
          insurance_coverage_type: string | null
          insurance_provider_name: string | null
          legal_damage_policy: boolean | null
          legal_insurance_disclosure: boolean | null
          legal_owner_terms: boolean | null
          legal_privacy_policy: boolean | null
          legal_renter_terms: boolean | null
          min_approved_cars: number | null
          min_approved_owners: number | null
          ops_cancellation_tested: boolean | null
          ops_damage_tested: boolean | null
          ops_dispute_tested: boolean | null
          ops_payout_delay_tested: boolean | null
          payments_connect_enabled: boolean | null
          payments_stripe_active: boolean | null
          payments_test_payment: boolean | null
          payments_test_payout: boolean | null
          support_confirmed: boolean | null
          support_email: string | null
          support_emergency_procedure: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          city_id?: string | null
          id?: string
          insurance_active?: boolean | null
          insurance_confirmation_ref?: string | null
          insurance_coverage_type?: string | null
          insurance_provider_name?: string | null
          legal_damage_policy?: boolean | null
          legal_insurance_disclosure?: boolean | null
          legal_owner_terms?: boolean | null
          legal_privacy_policy?: boolean | null
          legal_renter_terms?: boolean | null
          min_approved_cars?: number | null
          min_approved_owners?: number | null
          ops_cancellation_tested?: boolean | null
          ops_damage_tested?: boolean | null
          ops_dispute_tested?: boolean | null
          ops_payout_delay_tested?: boolean | null
          payments_connect_enabled?: boolean | null
          payments_stripe_active?: boolean | null
          payments_test_payment?: boolean | null
          payments_test_payout?: boolean | null
          support_confirmed?: boolean | null
          support_email?: string | null
          support_emergency_procedure?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          city_id?: string | null
          id?: string
          insurance_active?: boolean | null
          insurance_confirmation_ref?: string | null
          insurance_coverage_type?: string | null
          insurance_provider_name?: string | null
          legal_damage_policy?: boolean | null
          legal_insurance_disclosure?: boolean | null
          legal_owner_terms?: boolean | null
          legal_privacy_policy?: boolean | null
          legal_renter_terms?: boolean | null
          min_approved_cars?: number | null
          min_approved_owners?: number | null
          ops_cancellation_tested?: boolean | null
          ops_damage_tested?: boolean | null
          ops_dispute_tested?: boolean | null
          ops_payout_delay_tested?: boolean | null
          payments_connect_enabled?: boolean | null
          payments_stripe_active?: boolean | null
          payments_test_payment?: boolean | null
          payments_test_payout?: boolean | null
          support_confirmed?: boolean | null
          support_email?: string | null
          support_emergency_procedure?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "p2p_launch_checklists_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: true
            referencedRelation: "p2p_launch_cities"
            referencedColumns: ["id"]
          },
        ]
      }
      p2p_launch_cities: {
        Row: {
          bookings_today: number | null
          created_at: string | null
          created_by: string | null
          daily_booking_limit: number | null
          id: string
          last_booking_reset: string | null
          launch_status: Database["public"]["Enums"]["p2p_launch_status"] | null
          launched_at: string | null
          name: string
          paused_at: string | null
          state: string
          updated_at: string | null
        }
        Insert: {
          bookings_today?: number | null
          created_at?: string | null
          created_by?: string | null
          daily_booking_limit?: number | null
          id?: string
          last_booking_reset?: string | null
          launch_status?:
            | Database["public"]["Enums"]["p2p_launch_status"]
            | null
          launched_at?: string | null
          name: string
          paused_at?: string | null
          state: string
          updated_at?: string | null
        }
        Update: {
          bookings_today?: number | null
          created_at?: string | null
          created_by?: string | null
          daily_booking_limit?: number | null
          id?: string
          last_booking_reset?: string | null
          launch_status?:
            | Database["public"]["Enums"]["p2p_launch_status"]
            | null
          launched_at?: string | null
          name?: string
          paused_at?: string | null
          state?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      p2p_payouts: {
        Row: {
          amount: number
          booking_id: string | null
          booking_ids: string[] | null
          created_at: string | null
          failed_reason: string | null
          held_at: string | null
          held_by: string | null
          held_reason: string | null
          id: string
          is_held: boolean | null
          net_amount: number
          notes: string | null
          owner_id: string
          platform_fee: number | null
          processed_at: string | null
          processed_by: string | null
          requested_at: string | null
          status: Database["public"]["Enums"]["p2p_payout_status"] | null
          stripe_payout_id: string | null
          stripe_transfer_id: string | null
        }
        Insert: {
          amount: number
          booking_id?: string | null
          booking_ids?: string[] | null
          created_at?: string | null
          failed_reason?: string | null
          held_at?: string | null
          held_by?: string | null
          held_reason?: string | null
          id?: string
          is_held?: boolean | null
          net_amount: number
          notes?: string | null
          owner_id: string
          platform_fee?: number | null
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string | null
          status?: Database["public"]["Enums"]["p2p_payout_status"] | null
          stripe_payout_id?: string | null
          stripe_transfer_id?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          booking_ids?: string[] | null
          created_at?: string | null
          failed_reason?: string | null
          held_at?: string | null
          held_by?: string | null
          held_reason?: string | null
          id?: string
          is_held?: boolean | null
          net_amount?: number
          notes?: string | null
          owner_id?: string
          platform_fee?: number | null
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string | null
          status?: Database["public"]["Enums"]["p2p_payout_status"] | null
          stripe_payout_id?: string | null
          stripe_transfer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "p2p_payouts_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "p2p_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "p2p_payouts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "car_owner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      p2p_renter_invites: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string
          expires_at: string | null
          id: string
          invite_code: string
          used: boolean | null
          used_at: string | null
          waitlist_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invite_code: string
          used?: boolean | null
          used_at?: string | null
          waitlist_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invite_code?: string
          used?: boolean | null
          used_at?: string | null
          waitlist_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "p2p_renter_invites_waitlist_id_fkey"
            columns: ["waitlist_id"]
            isOneToOne: false
            referencedRelation: "p2p_renter_waitlist"
            referencedColumns: ["id"]
          },
        ]
      }
      p2p_renter_waitlist: {
        Row: {
          city: string
          created_at: string | null
          email: string
          full_name: string
          id: string
          status: string | null
        }
        Insert: {
          city: string
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          status?: string | null
        }
        Update: {
          city?: string
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          status?: string | null
        }
        Relationships: []
      }
      p2p_reviews: {
        Row: {
          accuracy: number | null
          booking_id: string
          cleanliness: number | null
          comment: string | null
          communication: number | null
          condition: number | null
          created_at: string | null
          id: string
          is_public: boolean | null
          owner_responded_at: string | null
          owner_response: string | null
          rating: number
          review_type: Database["public"]["Enums"]["p2p_review_type"]
          reviewee_id: string | null
          reviewer_id: string
          title: string | null
          value: number | null
          vehicle_id: string | null
        }
        Insert: {
          accuracy?: number | null
          booking_id: string
          cleanliness?: number | null
          comment?: string | null
          communication?: number | null
          condition?: number | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          owner_responded_at?: string | null
          owner_response?: string | null
          rating: number
          review_type: Database["public"]["Enums"]["p2p_review_type"]
          reviewee_id?: string | null
          reviewer_id: string
          title?: string | null
          value?: number | null
          vehicle_id?: string | null
        }
        Update: {
          accuracy?: number | null
          booking_id?: string
          cleanliness?: number | null
          comment?: string | null
          communication?: number | null
          condition?: number | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          owner_responded_at?: string | null
          owner_response?: string | null
          rating?: number
          review_type?: Database["public"]["Enums"]["p2p_review_type"]
          reviewee_id?: string | null
          reviewer_id?: string
          title?: string | null
          value?: number | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "p2p_reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "p2p_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "p2p_reviews_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "p2p_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      p2p_vehicles: {
        Row: {
          approval_status:
            | Database["public"]["Enums"]["p2p_vehicle_status"]
            | null
          category: Database["public"]["Enums"]["p2p_vehicle_category"]
          color: string | null
          created_at: string | null
          daily_rate: number
          description: string | null
          doors: number | null
          features: Json | null
          fuel_type: Database["public"]["Enums"]["p2p_fuel_type"] | null
          id: string
          images: Json | null
          instant_book: boolean | null
          is_available: boolean | null
          lat: number | null
          license_plate: string | null
          lng: number | null
          location_address: string | null
          location_city: string | null
          location_state: string | null
          location_zip: string | null
          make: string
          max_trip_days: number | null
          mileage: number | null
          min_trip_days: number | null
          model: string
          monthly_rate: number | null
          owner_id: string
          rating: number | null
          rejection_reason: string | null
          review_count: number | null
          seats: number | null
          total_trips: number | null
          transmission:
            | Database["public"]["Enums"]["p2p_transmission_type"]
            | null
          trim: string | null
          updated_at: string | null
          vin: string | null
          weekly_rate: number | null
          year: number
        }
        Insert: {
          approval_status?:
            | Database["public"]["Enums"]["p2p_vehicle_status"]
            | null
          category?: Database["public"]["Enums"]["p2p_vehicle_category"]
          color?: string | null
          created_at?: string | null
          daily_rate: number
          description?: string | null
          doors?: number | null
          features?: Json | null
          fuel_type?: Database["public"]["Enums"]["p2p_fuel_type"] | null
          id?: string
          images?: Json | null
          instant_book?: boolean | null
          is_available?: boolean | null
          lat?: number | null
          license_plate?: string | null
          lng?: number | null
          location_address?: string | null
          location_city?: string | null
          location_state?: string | null
          location_zip?: string | null
          make: string
          max_trip_days?: number | null
          mileage?: number | null
          min_trip_days?: number | null
          model: string
          monthly_rate?: number | null
          owner_id: string
          rating?: number | null
          rejection_reason?: string | null
          review_count?: number | null
          seats?: number | null
          total_trips?: number | null
          transmission?:
            | Database["public"]["Enums"]["p2p_transmission_type"]
            | null
          trim?: string | null
          updated_at?: string | null
          vin?: string | null
          weekly_rate?: number | null
          year: number
        }
        Update: {
          approval_status?:
            | Database["public"]["Enums"]["p2p_vehicle_status"]
            | null
          category?: Database["public"]["Enums"]["p2p_vehicle_category"]
          color?: string | null
          created_at?: string | null
          daily_rate?: number
          description?: string | null
          doors?: number | null
          features?: Json | null
          fuel_type?: Database["public"]["Enums"]["p2p_fuel_type"] | null
          id?: string
          images?: Json | null
          instant_book?: boolean | null
          is_available?: boolean | null
          lat?: number | null
          license_plate?: string | null
          lng?: number | null
          location_address?: string | null
          location_city?: string | null
          location_state?: string | null
          location_zip?: string | null
          make?: string
          max_trip_days?: number | null
          mileage?: number | null
          min_trip_days?: number | null
          model?: string
          monthly_rate?: number | null
          owner_id?: string
          rating?: number | null
          rejection_reason?: string | null
          review_count?: number | null
          seats?: number | null
          total_trips?: number | null
          transmission?:
            | Database["public"]["Enums"]["p2p_transmission_type"]
            | null
          trim?: string | null
          updated_at?: string | null
          vin?: string | null
          weekly_rate?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "p2p_vehicles_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "car_owner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      package_deliveries: {
        Row: {
          accepted_at: string | null
          actual_payout: number | null
          cancelled_at: string | null
          created_at: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          delivered_at: string | null
          delivery_photo_url: string | null
          delivery_speed: string | null
          driver_id: string | null
          dropoff_address: string
          dropoff_lat: number
          dropoff_lng: number
          estimated_payout: number | null
          id: string
          notes: string | null
          package_contents: string | null
          package_size: string | null
          package_weight: number | null
          picked_up_at: string | null
          pickup_address: string
          pickup_lat: number
          pickup_lng: number
          pickup_photo_url: string | null
          signature_url: string | null
          status: string | null
        }
        Insert: {
          accepted_at?: string | null
          actual_payout?: number | null
          cancelled_at?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          delivery_photo_url?: string | null
          delivery_speed?: string | null
          driver_id?: string | null
          dropoff_address: string
          dropoff_lat: number
          dropoff_lng: number
          estimated_payout?: number | null
          id?: string
          notes?: string | null
          package_contents?: string | null
          package_size?: string | null
          package_weight?: number | null
          picked_up_at?: string | null
          pickup_address: string
          pickup_lat: number
          pickup_lng: number
          pickup_photo_url?: string | null
          signature_url?: string | null
          status?: string | null
        }
        Update: {
          accepted_at?: string | null
          actual_payout?: number | null
          cancelled_at?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          delivery_photo_url?: string | null
          delivery_speed?: string | null
          driver_id?: string | null
          dropoff_address?: string
          dropoff_lat?: number
          dropoff_lng?: number
          estimated_payout?: number | null
          id?: string
          notes?: string | null
          package_contents?: string | null
          package_size?: string | null
          package_weight?: number | null
          picked_up_at?: string | null
          pickup_address?: string
          pickup_lat?: number
          pickup_lng?: number
          pickup_photo_url?: string | null
          signature_url?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "package_deliveries_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_deliveries_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_checkout_config: {
        Row: {
          checkout_mode: Database["public"]["Enums"]["checkout_mode"]
          checkout_url_template: string
          created_at: string
          id: string
          is_active: boolean
          logo_url: string | null
          partner_id: string
          partner_name: string
          priority: number
          service_type: Database["public"]["Enums"]["travel_service_type"]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          checkout_mode?: Database["public"]["Enums"]["checkout_mode"]
          checkout_url_template: string
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          partner_id: string
          partner_name: string
          priority?: number
          service_type: Database["public"]["Enums"]["travel_service_type"]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          checkout_mode?: Database["public"]["Enums"]["checkout_mode"]
          checkout_url_template?: string
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          partner_id?: string
          partner_name?: string
          priority?: number
          service_type?: Database["public"]["Enums"]["travel_service_type"]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      partner_redirect_logs: {
        Row: {
          booking_ref: string | null
          checkout_mode: string
          created_at: string
          id: string
          itinerary_id: string | null
          metadata: Json | null
          offer_id: string | null
          partner_id: string | null
          partner_name: string
          redirect_url: string
          returned_at: string | null
          search_params: Json | null
          search_type: Database["public"]["Enums"]["travel_partner_type"]
          session_id: string | null
          status: Database["public"]["Enums"]["partner_booking_status"]
          user_id: string | null
        }
        Insert: {
          booking_ref?: string | null
          checkout_mode?: string
          created_at?: string
          id?: string
          itinerary_id?: string | null
          metadata?: Json | null
          offer_id?: string | null
          partner_id?: string | null
          partner_name: string
          redirect_url: string
          returned_at?: string | null
          search_params?: Json | null
          search_type: Database["public"]["Enums"]["travel_partner_type"]
          session_id?: string | null
          status?: Database["public"]["Enums"]["partner_booking_status"]
          user_id?: string | null
        }
        Update: {
          booking_ref?: string | null
          checkout_mode?: string
          created_at?: string
          id?: string
          itinerary_id?: string | null
          metadata?: Json | null
          offer_id?: string | null
          partner_id?: string | null
          partner_name?: string
          redirect_url?: string
          returned_at?: string | null
          search_params?: Json | null
          search_type?: Database["public"]["Enums"]["travel_partner_type"]
          session_id?: string | null
          status?: Database["public"]["Enums"]["partner_booking_status"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_redirect_logs_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "travel_partners"
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
            foreignKeyName: "payouts_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
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
          {
            foreignKeyName: "pending_profile_changes_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
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
      pricing_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          service_type: string
          setting_key: string
          setting_value: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          service_type: string
          setting_key: string
          setting_value: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          service_type?: string
          setting_key?: string
          setting_value?: number
          updated_at?: string
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
            foreignKeyName: "promotion_usage_food_order_id_fkey"
            columns: ["food_order_id"]
            isOneToOne: false
            referencedRelation: "food_orders_masked"
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
          {
            foreignKeyName: "promotion_usage_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips_masked"
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
            foreignKeyName: "purchase_orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
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
          {
            foreignKeyName: "push_notification_subscriptions_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
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
          {
            foreignKeyName: "push_subscriptions_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
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
          {
            foreignKeyName: "recipes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      region_bonuses: {
        Row: {
          bonus_amount: number
          bonus_type: string
          created_at: string | null
          description: string | null
          ends_at: string
          id: string
          is_active: boolean | null
          name: string
          region_id: string
          service_type: string | null
          starts_at: string
          target_value: number
        }
        Insert: {
          bonus_amount: number
          bonus_type: string
          created_at?: string | null
          description?: string | null
          ends_at: string
          id?: string
          is_active?: boolean | null
          name: string
          region_id: string
          service_type?: string | null
          starts_at: string
          target_value: number
        }
        Update: {
          bonus_amount?: number
          bonus_type?: string
          created_at?: string | null
          description?: string | null
          ends_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          region_id?: string
          service_type?: string | null
          starts_at?: string
          target_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "region_bonuses_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      region_change_logs: {
        Row: {
          action: string
          changed_by: string | null
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          new_region_id: string | null
          old_region_id: string | null
          reason: string | null
        }
        Insert: {
          action: string
          changed_by?: string | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          new_region_id?: string | null
          old_region_id?: string | null
          reason?: string | null
        }
        Update: {
          action?: string
          changed_by?: string | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          new_region_id?: string | null
          old_region_id?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "region_change_logs_new_region_id_fkey"
            columns: ["new_region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "region_change_logs_old_region_id_fkey"
            columns: ["old_region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      region_settings: {
        Row: {
          broadcast_timeout_seconds: number | null
          config: Json | null
          created_at: string | null
          default_commission_pct: number | null
          dispatch_mode: string | null
          eats_commission_pct: number | null
          eats_enabled: boolean | null
          id: string
          max_dispatch_radius_km: number | null
          max_surge_multiplier: number | null
          minimum_payout_amount: number | null
          move_commission_pct: number | null
          move_enabled: boolean | null
          payout_schedule: string | null
          region_id: string
          rides_enabled: boolean | null
          surge_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          broadcast_timeout_seconds?: number | null
          config?: Json | null
          created_at?: string | null
          default_commission_pct?: number | null
          dispatch_mode?: string | null
          eats_commission_pct?: number | null
          eats_enabled?: boolean | null
          id?: string
          max_dispatch_radius_km?: number | null
          max_surge_multiplier?: number | null
          minimum_payout_amount?: number | null
          move_commission_pct?: number | null
          move_enabled?: boolean | null
          payout_schedule?: string | null
          region_id: string
          rides_enabled?: boolean | null
          surge_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          broadcast_timeout_seconds?: number | null
          config?: Json | null
          created_at?: string | null
          default_commission_pct?: number | null
          dispatch_mode?: string | null
          eats_commission_pct?: number | null
          eats_enabled?: boolean | null
          id?: string
          max_dispatch_radius_km?: number | null
          max_surge_multiplier?: number | null
          minimum_payout_amount?: number | null
          move_commission_pct?: number | null
          move_enabled?: boolean | null
          payout_schedule?: string | null
          region_id?: string
          rides_enabled?: boolean | null
          surge_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "region_settings_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: true
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          city: string
          country: string | null
          created_at: string | null
          currency: string | null
          disabled_at: string | null
          disabled_reason: string | null
          id: string
          is_active: boolean | null
          name: string
          state: string
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          city: string
          country?: string | null
          created_at?: string | null
          currency?: string | null
          disabled_at?: string | null
          disabled_reason?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          state: string
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          city?: string
          country?: string | null
          created_at?: string | null
          currency?: string | null
          disabled_at?: string | null
          disabled_reason?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          state?: string
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
      renter_documents: {
        Row: {
          created_at: string | null
          document_type: Database["public"]["Enums"]["renter_document_type"]
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          mime_type: string | null
          notes: string | null
          renter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status:
            | Database["public"]["Enums"]["renter_verification_status"]
            | null
        }
        Insert: {
          created_at?: string | null
          document_type: Database["public"]["Enums"]["renter_document_type"]
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          mime_type?: string | null
          notes?: string | null
          renter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?:
            | Database["public"]["Enums"]["renter_verification_status"]
            | null
        }
        Update: {
          created_at?: string | null
          document_type?: Database["public"]["Enums"]["renter_document_type"]
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          mime_type?: string | null
          notes?: string | null
          renter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?:
            | Database["public"]["Enums"]["renter_verification_status"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "renter_documents_renter_id_fkey"
            columns: ["renter_id"]
            isOneToOne: false
            referencedRelation: "renter_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      renter_profiles: {
        Row: {
          created_at: string | null
          date_of_birth: string
          full_name: string
          id: string
          license_expiration: string
          license_number: string
          license_state: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          updated_at: string | null
          user_id: string
          verification_status:
            | Database["public"]["Enums"]["renter_verification_status"]
            | null
        }
        Insert: {
          created_at?: string | null
          date_of_birth: string
          full_name: string
          id?: string
          license_expiration: string
          license_number: string
          license_state: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          updated_at?: string | null
          user_id: string
          verification_status?:
            | Database["public"]["Enums"]["renter_verification_status"]
            | null
        }
        Update: {
          created_at?: string | null
          date_of_birth?: string
          full_name?: string
          id?: string
          license_expiration?: string
          license_number?: string
          license_state?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          updated_at?: string | null
          user_id?: string
          verification_status?:
            | Database["public"]["Enums"]["renter_verification_status"]
            | null
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
          {
            foreignKeyName: "reorder_rules_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
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
            foreignKeyName: "reservations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
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
          {
            foreignKeyName: "restaurant_branches_parent_restaurant_id_fkey"
            columns: ["parent_restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
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
          {
            foreignKeyName: "restaurant_tables_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
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
          owner_id: string | null
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
          owner_id?: string | null
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
          owner_id?: string | null
          phone?: string
          rating?: number | null
          status?: Database["public"]["Enums"]["partner_status"] | null
          total_orders?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ride_requests: {
        Row: {
          admin_notes: string | null
          admin_override_reason: string | null
          admin_price_override: number | null
          assigned_driver_id: string | null
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          distance_miles: number | null
          dropoff_address: string
          dropoff_lat: number | null
          dropoff_lng: number | null
          duration_minutes: number | null
          estimated_fare_max: number | null
          estimated_fare_min: number | null
          id: string
          notes: string | null
          payment_amount: number | null
          payment_currency: string | null
          payment_status: string | null
          pickup_address: string
          pickup_lat: number | null
          pickup_lng: number | null
          quoted_base_fare: number | null
          quoted_booking_fee: number | null
          quoted_distance_fee: number | null
          quoted_service_fee: number | null
          quoted_surge_multiplier: number | null
          quoted_time_fee: number | null
          quoted_total: number | null
          refund_status: string | null
          refunded_at: string | null
          ride_type: string
          scheduled_at: string | null
          status: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string
          user_id: string | null
          zone_code: string | null
        }
        Insert: {
          admin_notes?: string | null
          admin_override_reason?: string | null
          admin_price_override?: number | null
          assigned_driver_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          distance_miles?: number | null
          dropoff_address: string
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          duration_minutes?: number | null
          estimated_fare_max?: number | null
          estimated_fare_min?: number | null
          id?: string
          notes?: string | null
          payment_amount?: number | null
          payment_currency?: string | null
          payment_status?: string | null
          pickup_address: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          quoted_base_fare?: number | null
          quoted_booking_fee?: number | null
          quoted_distance_fee?: number | null
          quoted_service_fee?: number | null
          quoted_surge_multiplier?: number | null
          quoted_time_fee?: number | null
          quoted_total?: number | null
          refund_status?: string | null
          refunded_at?: string | null
          ride_type?: string
          scheduled_at?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id?: string | null
          zone_code?: string | null
        }
        Update: {
          admin_notes?: string | null
          admin_override_reason?: string | null
          admin_price_override?: number | null
          assigned_driver_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          distance_miles?: number | null
          dropoff_address?: string
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          duration_minutes?: number | null
          estimated_fare_max?: number | null
          estimated_fare_min?: number | null
          id?: string
          notes?: string | null
          payment_amount?: number | null
          payment_currency?: string | null
          payment_status?: string | null
          pickup_address?: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          quoted_base_fare?: number | null
          quoted_booking_fee?: number | null
          quoted_distance_fee?: number | null
          quoted_service_fee?: number | null
          quoted_surge_multiplier?: number | null
          quoted_time_fee?: number | null
          quoted_total?: number | null
          refund_status?: string | null
          refunded_at?: string | null
          ride_type?: string
          scheduled_at?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id?: string | null
          zone_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ride_requests_assigned_driver_id_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ride_requests_assigned_driver_id_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      ride_zones: {
        Row: {
          base_fare: number
          booking_fee: number
          city_name: string
          created_at: string
          id: string
          is_active: boolean
          minimum_fare: number
          per_mile_rate: number
          per_minute_rate: number
          premium_multiplier: number
          service_fee_percent: number
          standard_multiplier: number
          surge_multiplier: number
          updated_at: string
          xl_multiplier: number
          zone_code: string
        }
        Insert: {
          base_fare?: number
          booking_fee?: number
          city_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          minimum_fare?: number
          per_mile_rate?: number
          per_minute_rate?: number
          premium_multiplier?: number
          service_fee_percent?: number
          standard_multiplier?: number
          surge_multiplier?: number
          updated_at?: string
          xl_multiplier?: number
          zone_code: string
        }
        Update: {
          base_fare?: number
          booking_fee?: number
          city_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          minimum_fare?: number
          per_mile_rate?: number
          per_minute_rate?: number
          premium_multiplier?: number
          service_fee_percent?: number
          standard_multiplier?: number
          surge_multiplier?: number
          updated_at?: string
          xl_multiplier?: number
          zone_code?: string
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
          {
            foreignKeyName: "safety_incidents_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
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
          {
            foreignKeyName: "scheduled_reports_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      search_sessions: {
        Row: {
          cabin_class: string | null
          created_at: string
          depart_date: string | null
          destination: string | null
          device_type: string | null
          guests: number | null
          id: string
          ip_address: unknown
          origin: string | null
          passengers: number | null
          return_date: string | null
          rooms: number | null
          search_params: Json | null
          session_id: string
          type: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          cabin_class?: string | null
          created_at?: string
          depart_date?: string | null
          destination?: string | null
          device_type?: string | null
          guests?: number | null
          id?: string
          ip_address?: unknown
          origin?: string | null
          passengers?: number | null
          return_date?: string | null
          rooms?: number | null
          search_params?: Json | null
          session_id: string
          type: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          cabin_class?: string | null
          created_at?: string
          depart_date?: string | null
          destination?: string | null
          device_type?: string | null
          guests?: number | null
          id?: string
          ip_address?: unknown
          origin?: string | null
          passengers?: number | null
          return_date?: string | null
          rooms?: number | null
          search_params?: Json | null
          session_id?: string
          type?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string
          device_fingerprint: string | null
          driver_id: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: string | null
          is_blocked: boolean | null
          location_data: Json | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device_fingerprint?: string | null
          driver_id?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          is_blocked?: boolean | null
          location_data?: Json | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device_fingerprint?: string | null
          driver_id?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          is_blocked?: boolean | null
          location_data?: Json | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_events_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_events_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
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
          {
            foreignKeyName: "sos_alerts_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
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
          {
            foreignKeyName: "staff_members_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
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
            foreignKeyName: "staff_performance_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_performance_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_performance_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_members_masked"
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
            foreignKeyName: "staff_schedules_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_schedules_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_schedules_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_members_masked"
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
          {
            foreignKeyName: "suppliers_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          auto_reply_sent: boolean | null
          booking_ref: string | null
          category: string | null
          created_at: string | null
          description: string
          driver_id: string | null
          id: string
          partner_name: string | null
          priority: string | null
          resolved_at: string | null
          restaurant_id: string | null
          search_session_id: string | null
          status: string | null
          subject: string
          ticket_number: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          auto_reply_sent?: boolean | null
          booking_ref?: string | null
          category?: string | null
          created_at?: string | null
          description: string
          driver_id?: string | null
          id?: string
          partner_name?: string | null
          priority?: string | null
          resolved_at?: string | null
          restaurant_id?: string | null
          search_session_id?: string | null
          status?: string | null
          subject: string
          ticket_number: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          auto_reply_sent?: boolean | null
          booking_ref?: string | null
          category?: string | null
          created_at?: string | null
          description?: string
          driver_id?: string | null
          id?: string
          partner_name?: string | null
          priority?: string | null
          resolved_at?: string | null
          restaurant_id?: string | null
          search_session_id?: string | null
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
            foreignKeyName: "support_tickets_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
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
            foreignKeyName: "time_entries_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "staff_members_masked"
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
            foreignKeyName: "time_entries_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_members_masked"
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
          {
            foreignKeyName: "tip_allocations_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_members_masked"
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
            foreignKeyName: "tip_distributions_distributed_by_fkey"
            columns: ["distributed_by"]
            isOneToOne: false
            referencedRelation: "staff_members_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tip_distributions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tip_distributions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
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
          {
            foreignKeyName: "training_progress_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
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
            foreignKeyName: "transactions_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
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
            foreignKeyName: "transactions_food_order_id_fkey"
            columns: ["food_order_id"]
            isOneToOne: false
            referencedRelation: "food_orders_masked"
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
            foreignKeyName: "transactions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips_masked"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_bookings: {
        Row: {
          created_at: string
          email: string
          id: string
          offer_id: string | null
          partner_booking_ref: string | null
          partner_redirect_url: string | null
          service_type: Database["public"]["Enums"]["travel_service_type"]
          status: Database["public"]["Enums"]["travel_booking_status"]
          traveler_info: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          offer_id?: string | null
          partner_booking_ref?: string | null
          partner_redirect_url?: string | null
          service_type: Database["public"]["Enums"]["travel_service_type"]
          status?: Database["public"]["Enums"]["travel_booking_status"]
          traveler_info?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          offer_id?: string | null
          partner_booking_ref?: string | null
          partner_redirect_url?: string | null
          service_type?: Database["public"]["Enums"]["travel_service_type"]
          status?: Database["public"]["Enums"]["travel_booking_status"]
          traveler_info?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "travel_bookings_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "travel_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_handoff_settings: {
        Row: {
          booking_timeout_seconds: number
          default_checkout_mode: string
          id: string
          require_consent_checkbox: boolean
          show_disclosure_modal: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          booking_timeout_seconds?: number
          default_checkout_mode?: string
          id?: string
          require_consent_checkbox?: boolean
          show_disclosure_modal?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          booking_timeout_seconds?: number
          default_checkout_mode?: string
          id?: string
          require_consent_checkbox?: boolean
          show_disclosure_modal?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      travel_offers: {
        Row: {
          created_at: string
          id: string
          is_selected: boolean | null
          offer_data: Json
          partner_id: string
          partner_name: string | null
          price_amount: number | null
          price_currency: string | null
          search_session_id: string | null
          service_type: Database["public"]["Enums"]["travel_service_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          is_selected?: boolean | null
          offer_data?: Json
          partner_id: string
          partner_name?: string | null
          price_amount?: number | null
          price_currency?: string | null
          search_session_id?: string | null
          service_type: Database["public"]["Enums"]["travel_service_type"]
        }
        Update: {
          created_at?: string
          id?: string
          is_selected?: boolean | null
          offer_data?: Json
          partner_id?: string
          partner_name?: string | null
          price_amount?: number | null
          price_currency?: string | null
          search_session_id?: string | null
          service_type?: Database["public"]["Enums"]["travel_service_type"]
        }
        Relationships: [
          {
            foreignKeyName: "travel_offers_search_session_id_fkey"
            columns: ["search_session_id"]
            isOneToOne: false
            referencedRelation: "travel_search_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_partners: {
        Row: {
          base_url: string
          checkout_mode: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          priority: number
          tracking_params: Json | null
          type: Database["public"]["Enums"]["travel_partner_type"]
          updated_at: string
        }
        Insert: {
          base_url: string
          checkout_mode?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          priority?: number
          tracking_params?: Json | null
          type: Database["public"]["Enums"]["travel_partner_type"]
          updated_at?: string
        }
        Update: {
          base_url?: string
          checkout_mode?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          priority?: number
          tracking_params?: Json | null
          type?: Database["public"]["Enums"]["travel_partner_type"]
          updated_at?: string
        }
        Relationships: []
      }
      travel_search_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          search_params: Json
          service_type: Database["public"]["Enums"]["travel_service_type"]
          session_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          search_params?: Json
          service_type: Database["public"]["Enums"]["travel_service_type"]
          session_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          search_params?: Json
          service_type?: Database["public"]["Enums"]["travel_service_type"]
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      travelers: {
        Row: {
          consent_given: boolean
          consent_given_at: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          full_name: string
          id: string
          nationality: string | null
          passport_number: string | null
          phone: string | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          consent_given?: boolean
          consent_given_at?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          full_name: string
          id?: string
          nationality?: string | null
          passport_number?: string | null
          phone?: string | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          consent_given?: boolean
          consent_given_at?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          full_name?: string
          id?: string
          nationality?: string | null
          passport_number?: string | null
          phone?: string | null
          session_id?: string
          user_id?: string | null
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
          {
            foreignKeyName: "trip_messages_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips_masked"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          completed_at: string | null
          created_at: string
          customer_email: string | null
          customer_lat: number | null
          customer_lng: number | null
          customer_name: string | null
          customer_phone: string | null
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
          region_id: string | null
          rider_id: string | null
          service_type: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["trip_status"] | null
          stripe_checkout_session_id: string | null
          stripe_payment_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_lat?: number | null
          customer_lng?: number | null
          customer_name?: string | null
          customer_phone?: string | null
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
          region_id?: string | null
          rider_id?: string | null
          service_type?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["trip_status"] | null
          stripe_checkout_session_id?: string | null
          stripe_payment_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_lat?: number | null
          customer_lng?: number | null
          customer_name?: string | null
          customer_phone?: string | null
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
          region_id?: string | null
          rider_id?: string | null
          service_type?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["trip_status"] | null
          stripe_checkout_session_id?: string | null
          stripe_payment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trips_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
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
          {
            foreignKeyName: "trusted_contacts_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      trusted_devices: {
        Row: {
          created_at: string
          device_fingerprint: string
          device_name: string | null
          device_type: string | null
          id: string
          is_active: boolean | null
          last_used: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_fingerprint: string
          device_name?: string | null
          device_type?: string | null
          id?: string
          is_active?: boolean | null
          last_used?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_fingerprint?: string
          device_name?: string | null
          device_type?: string | null
          id?: string
          is_active?: boolean | null
          last_used?: string | null
          user_id?: string
        }
        Relationships: []
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
      vehicle_availability: {
        Row: {
          booking_id: string | null
          created_at: string | null
          date: string
          id: string
          is_available: boolean | null
          price_override: number | null
          vehicle_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          date: string
          id?: string
          is_available?: boolean | null
          price_override?: number | null
          vehicle_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          date?: string
          id?: string
          is_available?: boolean | null
          price_override?: number | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_availability_booking"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "p2p_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_availability_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "p2p_vehicles"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "vehicle_documents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_documents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles_safe"
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
            foreignKeyName: "vehicle_maintenance_reminders_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_maintenance_reminders_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_maintenance_reminders_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_maintenance_reminders_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles_safe"
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
            foreignKeyName: "vehicle_service_logs_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_service_logs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_service_logs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_service_logs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles_safe"
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
          {
            foreignKeyName: "vehicles_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
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
          {
            foreignKeyName: "voice_command_logs_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
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
          {
            foreignKeyName: "waitlist_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
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
          {
            foreignKeyName: "waste_categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
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
            foreignKeyName: "waste_logs_logged_by_fkey"
            columns: ["logged_by"]
            isOneToOne: false
            referencedRelation: "staff_members_masked"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waste_logs_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waste_logs_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawal_rate_limits: {
        Row: {
          created_at: string
          daily_limit: number | null
          daily_used: number | null
          driver_id: string
          id: string
          is_locked: boolean | null
          last_daily_reset: string | null
          last_monthly_reset: string | null
          last_weekly_reset: string | null
          lock_reason: string | null
          locked_at: string | null
          locked_by: string | null
          monthly_limit: number | null
          monthly_used: number | null
          updated_at: string
          weekly_limit: number | null
          weekly_used: number | null
        }
        Insert: {
          created_at?: string
          daily_limit?: number | null
          daily_used?: number | null
          driver_id: string
          id?: string
          is_locked?: boolean | null
          last_daily_reset?: string | null
          last_monthly_reset?: string | null
          last_weekly_reset?: string | null
          lock_reason?: string | null
          locked_at?: string | null
          locked_by?: string | null
          monthly_limit?: number | null
          monthly_used?: number | null
          updated_at?: string
          weekly_limit?: number | null
          weekly_used?: number | null
        }
        Update: {
          created_at?: string
          daily_limit?: number | null
          daily_used?: number | null
          driver_id?: string
          id?: string
          is_locked?: boolean | null
          last_daily_reset?: string | null
          last_monthly_reset?: string | null
          last_weekly_reset?: string | null
          lock_reason?: string | null
          locked_at?: string | null
          locked_by?: string | null
          monthly_limit?: number | null
          monthly_used?: number | null
          updated_at?: string
          weekly_limit?: number | null
          weekly_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_rate_limits_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: true
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "withdrawal_rate_limits_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: true
            referencedRelation: "drivers_public"
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
          {
            foreignKeyName: "withdrawals_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      car_rentals_masked: {
        Row: {
          car_id: string | null
          created_at: string | null
          customer_id: string | null
          daily_rate: number | null
          driver_license_number: string | null
          id: string | null
          pickup_date: string | null
          pickup_location: string | null
          rating: number | null
          return_date: string | null
          return_location: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          subtotal: number | null
          total_amount: number | null
          total_days: number | null
          updated_at: string | null
        }
        Insert: {
          car_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          daily_rate?: number | null
          driver_license_number?: never
          id?: string | null
          pickup_date?: string | null
          pickup_location?: string | null
          rating?: number | null
          return_date?: string | null
          return_location?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          subtotal?: number | null
          total_amount?: number | null
          total_days?: number | null
          updated_at?: string | null
        }
        Update: {
          car_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          daily_rate?: number | null
          driver_license_number?: never
          id?: string | null
          pickup_date?: string | null
          pickup_location?: string | null
          rating?: number | null
          return_date?: string | null
          return_location?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          subtotal?: number | null
          total_amount?: number | null
          total_days?: number | null
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
          {
            foreignKeyName: "car_rentals_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "rental_cars_public"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_feedback_masked: {
        Row: {
          ambiance_rating: number | null
          comment: string | null
          created_at: string | null
          food_rating: number | null
          id: string | null
          is_public: boolean | null
          rating: number | null
          response: string | null
          restaurant_id: string | null
          sentiment: string | null
          service_rating: number | null
        }
        Insert: {
          ambiance_rating?: number | null
          comment?: string | null
          created_at?: string | null
          food_rating?: number | null
          id?: string | null
          is_public?: boolean | null
          rating?: number | null
          response?: string | null
          restaurant_id?: string | null
          sentiment?: string | null
          service_rating?: number | null
        }
        Update: {
          ambiance_rating?: number | null
          comment?: string | null
          created_at?: string | null
          food_rating?: number | null
          id?: string | null
          is_public?: boolean | null
          rating?: number | null
          response?: string | null
          restaurant_id?: string | null
          sentiment?: string | null
          service_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_feedback_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_feedback_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_feedback_public: {
        Row: {
          ambiance_rating: number | null
          comment: string | null
          created_at: string | null
          food_rating: number | null
          id: string | null
          rating: number | null
          responded_at: string | null
          response: string | null
          restaurant_id: string | null
          sentiment: string | null
          service_rating: number | null
        }
        Insert: {
          ambiance_rating?: number | null
          comment?: string | null
          created_at?: string | null
          food_rating?: number | null
          id?: string | null
          rating?: number | null
          responded_at?: string | null
          response?: string | null
          restaurant_id?: string | null
          sentiment?: string | null
          service_rating?: number | null
        }
        Update: {
          ambiance_rating?: number | null
          comment?: string | null
          created_at?: string | null
          food_rating?: number | null
          id?: string | null
          rating?: number | null
          responded_at?: string | null
          response?: string | null
          restaurant_id?: string | null
          sentiment?: string | null
          service_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_feedback_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_feedback_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_orders_masked: {
        Row: {
          created_at: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string | null
          notes: string | null
          priority: string | null
          restaurant_id: string | null
          status: string | null
          table_id: string | null
          table_number: string | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email?: never
          customer_name?: string | null
          customer_phone?: never
          id?: string | null
          notes?: string | null
          priority?: string | null
          restaurant_id?: string | null
          status?: string | null
          table_id?: string | null
          table_number?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: never
          customer_name?: string | null
          customer_phone?: never
          id?: string | null
          notes?: string | null
          priority?: string | null
          restaurant_id?: string | null
          status?: string | null
          table_id?: string | null
          table_number?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
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
      driver_earnings_summary: {
        Row: {
          created_at: string | null
          driver_id: string | null
          earning_type: string | null
          id: string | null
          net_amount: number | null
        }
        Insert: {
          created_at?: string | null
          driver_id?: string | null
          earning_type?: string | null
          id?: string | null
          net_amount?: number | null
        }
        Update: {
          created_at?: string | null
          driver_id?: string | null
          earning_type?: string | null
          id?: string | null
          net_amount?: number | null
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
            foreignKeyName: "driver_earnings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers_public: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          first_name: string | null
          id: string | null
          is_online: boolean | null
          rating: number | null
          vehicle_type: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: never
          id?: string | null
          is_online?: boolean | null
          rating?: number | null
          vehicle_type?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: never
          id?: string | null
          is_online?: boolean | null
          rating?: number | null
          vehicle_type?: string | null
        }
        Relationships: []
      }
      food_orders_masked: {
        Row: {
          created_at: string | null
          customer_id: string | null
          delivered_at: string | null
          delivery_address: string | null
          delivery_fee: number | null
          driver_id: string | null
          estimated_delivery_time: number | null
          id: string | null
          restaurant_id: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          delivered_at?: string | null
          delivery_address?: never
          delivery_fee?: number | null
          driver_id?: string | null
          estimated_delivery_time?: number | null
          id?: string | null
          restaurant_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          delivered_at?: string | null
          delivery_address?: never
          delivery_fee?: number | null
          driver_id?: string | null
          estimated_delivery_time?: number | null
          id?: string | null
          restaurant_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_amount?: number | null
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
            foreignKeyName: "food_orders_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel_bookings_masked: {
        Row: {
          booking_reference: string | null
          check_in_date: string | null
          check_out_date: string | null
          created_at: string | null
          customer_id: string | null
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          guests: number | null
          hotel_id: string | null
          id: string | null
          nights: number | null
          payment_status: string | null
          price_per_night: number | null
          rating: number | null
          room_count: number | null
          room_id: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          subtotal: number | null
          taxes_fees: number | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          booking_reference?: string | null
          check_in_date?: string | null
          check_out_date?: string | null
          created_at?: string | null
          customer_id?: string | null
          guest_email?: never
          guest_name?: never
          guest_phone?: never
          guests?: number | null
          hotel_id?: string | null
          id?: string | null
          nights?: number | null
          payment_status?: string | null
          price_per_night?: number | null
          rating?: number | null
          room_count?: number | null
          room_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          subtotal?: number | null
          taxes_fees?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          booking_reference?: string | null
          check_in_date?: string | null
          check_out_date?: string | null
          created_at?: string | null
          customer_id?: string | null
          guest_email?: never
          guest_name?: never
          guest_phone?: never
          guests?: number | null
          hotel_id?: string | null
          id?: string | null
          nights?: number | null
          payment_status?: string | null
          price_per_night?: number | null
          rating?: number | null
          room_count?: number | null
          room_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          subtotal?: number | null
          taxes_fees?: number | null
          total_amount?: number | null
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
            foreignKeyName: "hotel_bookings_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels_public"
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
      hotels_public: {
        Row: {
          address: string | null
          amenities: Json | null
          cancellation_policy: string | null
          check_in_time: string | null
          check_out_time: string | null
          city: string | null
          country: string | null
          created_at: string | null
          description: string | null
          id: string | null
          images: Json | null
          lat: number | null
          lng: number | null
          logo_url: string | null
          name: string | null
          rating: number | null
          star_rating: number | null
          status: Database["public"]["Enums"]["partner_status"] | null
          website: string | null
        }
        Insert: {
          address?: string | null
          amenities?: Json | null
          cancellation_policy?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          images?: Json | null
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          name?: string | null
          rating?: number | null
          star_rating?: number | null
          status?: Database["public"]["Enums"]["partner_status"] | null
          website?: string | null
        }
        Update: {
          address?: string | null
          amenities?: Json | null
          cancellation_policy?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          images?: Json | null
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          name?: string | null
          rating?: number | null
          star_rating?: number | null
          status?: Database["public"]["Enums"]["partner_status"] | null
          website?: string | null
        }
        Relationships: []
      }
      loyalty_members_masked: {
        Row: {
          created_at: string | null
          customer_name: string | null
          id: string | null
          join_date: string | null
          last_visit: string | null
          lifetime_points: number | null
          points_balance: number | null
          restaurant_id: string | null
          tier: string | null
        }
        Insert: {
          created_at?: string | null
          customer_name?: never
          id?: string | null
          join_date?: string | null
          last_visit?: string | null
          lifetime_points?: number | null
          points_balance?: number | null
          restaurant_id?: string | null
          tier?: string | null
        }
        Update: {
          created_at?: string | null
          customer_name?: never
          id?: string | null
          join_date?: string | null
          last_visit?: string | null
          lifetime_points?: number | null
          points_balance?: number | null
          restaurant_id?: string | null
          tier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_members_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_members_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles_public: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      rental_cars_public: {
        Row: {
          category: string | null
          daily_rate: number | null
          features: Json | null
          id: string | null
          images: Json | null
          is_available: boolean | null
          location_address: string | null
          make: string | null
          model: string | null
          rating: number | null
          year: number | null
        }
        Insert: {
          category?: string | null
          daily_rate?: number | null
          features?: Json | null
          id?: string | null
          images?: Json | null
          is_available?: boolean | null
          location_address?: string | null
          make?: string | null
          model?: string | null
          rating?: number | null
          year?: number | null
        }
        Update: {
          category?: string | null
          daily_rate?: number | null
          features?: Json | null
          id?: string | null
          images?: Json | null
          is_available?: boolean | null
          location_address?: string | null
          make?: string | null
          model?: string | null
          rating?: number | null
          year?: number | null
        }
        Relationships: []
      }
      reservations_masked: {
        Row: {
          created_at: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          duration_minutes: number | null
          id: string | null
          party_size: number | null
          reminder_sent: boolean | null
          reservation_date: string | null
          reservation_time: string | null
          restaurant_id: string | null
          source: string | null
          special_requests: string | null
          status: string | null
          table_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email?: never
          customer_name?: never
          customer_phone?: never
          duration_minutes?: number | null
          id?: string | null
          party_size?: number | null
          reminder_sent?: boolean | null
          reservation_date?: string | null
          reservation_time?: string | null
          restaurant_id?: string | null
          source?: string | null
          special_requests?: string | null
          status?: string | null
          table_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: never
          customer_name?: never
          customer_phone?: never
          duration_minutes?: number | null
          id?: string | null
          party_size?: number | null
          reminder_sent?: boolean | null
          reservation_date?: string | null
          reservation_time?: string | null
          restaurant_id?: string | null
          source?: string | null
          special_requests?: string | null
          status?: string | null
          table_id?: string | null
          updated_at?: string | null
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
            foreignKeyName: "reservations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
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
      restaurants_public: {
        Row: {
          address: string | null
          cover_image_url: string | null
          cuisine_type: string | null
          description: string | null
          id: string | null
          is_open: boolean | null
          logo_url: string | null
          name: string | null
          opening_hours: Json | null
          rating: number | null
          status: Database["public"]["Enums"]["partner_status"] | null
        }
        Insert: {
          address?: string | null
          cover_image_url?: string | null
          cuisine_type?: string | null
          description?: string | null
          id?: string | null
          is_open?: boolean | null
          logo_url?: string | null
          name?: string | null
          opening_hours?: Json | null
          rating?: number | null
          status?: Database["public"]["Enums"]["partner_status"] | null
        }
        Update: {
          address?: string | null
          cover_image_url?: string | null
          cuisine_type?: string | null
          description?: string | null
          id?: string | null
          is_open?: boolean | null
          logo_url?: string | null
          name?: string | null
          opening_hours?: Json | null
          rating?: number | null
          status?: Database["public"]["Enums"]["partner_status"] | null
        }
        Relationships: []
      }
      staff_members_masked: {
        Row: {
          created_at: string | null
          full_name: string | null
          hire_date: string | null
          id: string | null
          restaurant_id: string | null
          role: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          hire_date?: string | null
          id?: string | null
          restaurant_id?: string | null
          role?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          hire_date?: string | null
          id?: string | null
          restaurant_id?: string | null
          role?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_members_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_members_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings_public: {
        Row: {
          key: string | null
          value: Json | null
        }
        Insert: {
          key?: string | null
          value?: Json | null
        }
        Update: {
          key?: string | null
          value?: Json | null
        }
        Relationships: []
      }
      trips_masked: {
        Row: {
          completed_at: string | null
          created_at: string | null
          customer_lat: number | null
          customer_lng: number | null
          customer_name: string | null
          customer_phone: string | null
          distance_km: number | null
          driver_id: string | null
          dropoff_address: string | null
          dropoff_lat: number | null
          dropoff_lng: number | null
          duration_minutes: number | null
          fare_amount: number | null
          id: string | null
          payment_status: string | null
          pickup_address: string | null
          pickup_lat: number | null
          pickup_lng: number | null
          rating: number | null
          rider_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["trip_status"] | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          customer_lat?: never
          customer_lng?: never
          customer_name?: never
          customer_phone?: never
          distance_km?: number | null
          driver_id?: string | null
          dropoff_address?: string | null
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          duration_minutes?: number | null
          fare_amount?: number | null
          id?: string | null
          payment_status?: string | null
          pickup_address?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          rating?: number | null
          rider_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["trip_status"] | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          customer_lat?: never
          customer_lng?: never
          customer_name?: never
          customer_phone?: never
          distance_km?: number | null
          driver_id?: string | null
          dropoff_address?: string | null
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          duration_minutes?: number | null
          fare_amount?: number | null
          id?: string | null
          payment_status?: string | null
          pickup_address?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
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
          {
            foreignKeyName: "trips_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles_public: {
        Row: {
          approval_status: Database["public"]["Enums"]["approval_status"] | null
          color: string | null
          created_at: string | null
          driver_id: string | null
          fuel_type: string | null
          health_score: number | null
          id: string | null
          is_primary: boolean | null
          make: string | null
          mileage: number | null
          model: string | null
          updated_at: string | null
          year: number | null
        }
        Insert: {
          approval_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          color?: string | null
          created_at?: string | null
          driver_id?: string | null
          fuel_type?: string | null
          health_score?: number | null
          id?: string | null
          is_primary?: boolean | null
          make?: string | null
          mileage?: number | null
          model?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          approval_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          color?: string | null
          created_at?: string | null
          driver_id?: string | null
          fuel_type?: string | null
          health_score?: number | null
          id?: string | null
          is_primary?: boolean | null
          make?: string | null
          mileage?: number | null
          model?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles_safe: {
        Row: {
          color: string | null
          created_at: string | null
          driver_id: string | null
          fuel_type: string | null
          health_score: number | null
          id: string | null
          is_primary: boolean | null
          make: string | null
          model: string | null
          year: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          driver_id?: string | null
          fuel_type?: string | null
          health_score?: number | null
          id?: string | null
          is_primary?: boolean | null
          make?: string | null
          model?: string | null
          year?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          driver_id?: string | null
          fuel_type?: string | null
          health_score?: number | null
          id?: string | null
          is_primary?: boolean | null
          make?: string | null
          model?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist_masked: {
        Row: {
          check_in_time: string | null
          created_at: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string | null
          notes: string | null
          party_size: number | null
          quoted_wait_minutes: number | null
          restaurant_id: string | null
          seated_time: string | null
          status: string | null
        }
        Insert: {
          check_in_time?: string | null
          created_at?: string | null
          customer_name?: never
          customer_phone?: never
          id?: string | null
          notes?: string | null
          party_size?: number | null
          quoted_wait_minutes?: number | null
          restaurant_id?: string | null
          seated_time?: string | null
          status?: string | null
        }
        Update: {
          check_in_time?: string | null
          created_at?: string | null
          customer_name?: never
          customer_phone?: never
          id?: string | null
          notes?: string | null
          party_size?: number | null
          quoted_wait_minutes?: number | null
          restaurant_id?: string | null
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
          {
            foreignKeyName: "waitlist_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_p2p_booking_fees: {
        Args: {
          p_daily_rate: number
          p_include_insurance?: boolean
          p_total_days: number
        }
        Returns: {
          insurance_fee: number
          owner_payout: number
          platform_fee: number
          service_fee: number
          subtotal: number
          total_amount: number
        }[]
      }
      can_customer_view_driver: {
        Args: { _driver_id: string }
        Returns: boolean
      }
      can_view_driver_details: {
        Args: { _driver_id: string }
        Returns: boolean
      }
      check_expiring_documents: { Args: never; Returns: number }
      check_login_anomaly: {
        Args: {
          p_device_fingerprint: string
          p_ip_address: string
          p_user_agent: string
          p_user_id: string
        }
        Returns: Json
      }
      check_withdrawal_allowed: {
        Args: { p_amount: number; p_driver_id: string }
        Returns: Json
      }
      cleanup_expired_tokens: { Args: never; Returns: undefined }
      cleanup_old_location_history: { Args: never; Returns: undefined }
      cleanup_old_login_sessions: { Args: never; Returns: undefined }
      cleanup_old_security_events: { Args: never; Returns: undefined }
      create_available_test_orders: { Args: never; Returns: number }
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
      get_owner_profile_id: { Args: { user_uuid: string }; Returns: string }
      get_user_security_summary: {
        Args: { p_user_id: string }
        Returns: {
          active_sessions_count: number
          blocked_events: number
          failed_logins: number
          last_login: string
          successful_logins: number
          total_events: number
          trusted_devices_count: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { user_uuid: string }; Returns: boolean }
      is_chat_participant: {
        Args: { p_order_id: string; p_trip_id: string }
        Returns: boolean
      }
      is_hotel_owner: { Args: { _hotel_id: string }; Returns: boolean }
      is_rental_car_owner: { Args: { _car_id: string }; Returns: boolean }
      is_restaurant_owner: {
        Args: { p_restaurant_id: string }
        Returns: boolean
      }
      is_vehicle_owner: { Args: { p_vehicle_id: string }; Returns: boolean }
      is_verified_car_owner: { Args: { user_uuid: string }; Returns: boolean }
      is_verified_renter: { Args: { user_uuid: string }; Returns: boolean }
      log_security_event: {
        Args: {
          p_device_fingerprint?: string
          p_driver_id?: string
          p_event_data?: Json
          p_event_type: string
          p_ip_address?: string
          p_severity?: string
          p_user_agent?: string
          p_user_id?: string
        }
        Returns: string
      }
      record_withdrawal_usage: {
        Args: { p_amount: number; p_driver_id: string }
        Returns: undefined
      }
      validate_withdrawal: {
        Args: { p_amount: number; p_driver_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      approval_status: "pending" | "approved" | "rejected"
      beta_launch_state: "not_ready" | "ready_for_beta" | "beta_live" | "paused"
      booking_status:
        | "pending"
        | "confirmed"
        | "in_progress"
        | "ready_for_pickup"
        | "completed"
        | "cancelled"
        | "refunded"
      car_owner_document_type:
        | "drivers_license"
        | "vehicle_registration"
        | "insurance"
        | "title"
        | "id_card"
      car_owner_insurance_option: "platform" | "own" | "none"
      car_owner_status: "pending" | "verified" | "rejected" | "suspended"
      checkout_mode: "redirect" | "iframe"
      document_review_status: "pending" | "approved" | "rejected"
      driver_status: "pending" | "verified" | "rejected" | "suspended"
      p2p_booking_status:
        | "pending"
        | "confirmed"
        | "active"
        | "completed"
        | "cancelled"
        | "disputed"
      p2p_damage_status:
        | "reported"
        | "under_review"
        | "info_requested"
        | "insurance_claim_submitted"
        | "resolved_owner_paid"
        | "resolved_renter_charged"
        | "closed_no_action"
      p2p_dispute_status: "open" | "investigating" | "resolved" | "closed"
      p2p_dispute_type:
        | "damage"
        | "late_return"
        | "cancellation"
        | "refund"
        | "cleanliness"
        | "other"
      p2p_fuel_type:
        | "gasoline"
        | "diesel"
        | "electric"
        | "hybrid"
        | "plug_in_hybrid"
      p2p_launch_status: "draft" | "ready" | "live" | "paused"
      p2p_payment_status:
        | "pending"
        | "authorized"
        | "captured"
        | "refunded"
        | "failed"
      p2p_payout_status: "pending" | "processing" | "completed" | "failed"
      p2p_review_type:
        | "renter_to_owner"
        | "owner_to_renter"
        | "renter_to_vehicle"
      p2p_transmission_type: "automatic" | "manual"
      p2p_vehicle_category:
        | "economy"
        | "compact"
        | "midsize"
        | "fullsize"
        | "suv"
        | "luxury"
        | "minivan"
        | "truck"
      p2p_vehicle_status: "pending" | "approved" | "rejected" | "suspended"
      partner_booking_status: "pending" | "returned" | "failed" | "timeout"
      partner_status: "pending" | "active" | "suspended" | "inactive"
      renter_document_type: "license_front" | "license_back" | "selfie"
      renter_verification_status:
        | "pending"
        | "approved"
        | "rejected"
        | "suspended"
      travel_booking_status:
        | "pending"
        | "redirected"
        | "completed"
        | "failed"
        | "cancelled"
      travel_partner_type: "flights" | "hotels" | "cars"
      travel_service_type: "flights" | "hotels" | "cars"
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
      beta_launch_state: ["not_ready", "ready_for_beta", "beta_live", "paused"],
      booking_status: [
        "pending",
        "confirmed",
        "in_progress",
        "ready_for_pickup",
        "completed",
        "cancelled",
        "refunded",
      ],
      car_owner_document_type: [
        "drivers_license",
        "vehicle_registration",
        "insurance",
        "title",
        "id_card",
      ],
      car_owner_insurance_option: ["platform", "own", "none"],
      car_owner_status: ["pending", "verified", "rejected", "suspended"],
      checkout_mode: ["redirect", "iframe"],
      document_review_status: ["pending", "approved", "rejected"],
      driver_status: ["pending", "verified", "rejected", "suspended"],
      p2p_booking_status: [
        "pending",
        "confirmed",
        "active",
        "completed",
        "cancelled",
        "disputed",
      ],
      p2p_damage_status: [
        "reported",
        "under_review",
        "info_requested",
        "insurance_claim_submitted",
        "resolved_owner_paid",
        "resolved_renter_charged",
        "closed_no_action",
      ],
      p2p_dispute_status: ["open", "investigating", "resolved", "closed"],
      p2p_dispute_type: [
        "damage",
        "late_return",
        "cancellation",
        "refund",
        "cleanliness",
        "other",
      ],
      p2p_fuel_type: [
        "gasoline",
        "diesel",
        "electric",
        "hybrid",
        "plug_in_hybrid",
      ],
      p2p_launch_status: ["draft", "ready", "live", "paused"],
      p2p_payment_status: [
        "pending",
        "authorized",
        "captured",
        "refunded",
        "failed",
      ],
      p2p_payout_status: ["pending", "processing", "completed", "failed"],
      p2p_review_type: [
        "renter_to_owner",
        "owner_to_renter",
        "renter_to_vehicle",
      ],
      p2p_transmission_type: ["automatic", "manual"],
      p2p_vehicle_category: [
        "economy",
        "compact",
        "midsize",
        "fullsize",
        "suv",
        "luxury",
        "minivan",
        "truck",
      ],
      p2p_vehicle_status: ["pending", "approved", "rejected", "suspended"],
      partner_booking_status: ["pending", "returned", "failed", "timeout"],
      partner_status: ["pending", "active", "suspended", "inactive"],
      renter_document_type: ["license_front", "license_back", "selfie"],
      renter_verification_status: [
        "pending",
        "approved",
        "rejected",
        "suspended",
      ],
      travel_booking_status: [
        "pending",
        "redirected",
        "completed",
        "failed",
        "cancelled",
      ],
      travel_partner_type: ["flights", "hotels", "cars"],
      travel_service_type: ["flights", "hotels", "cars"],
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
