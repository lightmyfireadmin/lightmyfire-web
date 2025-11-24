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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      lighter_contributions: {
        Row: {
          last_post_at: string
          lighter_id: string
          user_id: string
        }
        Insert: {
          last_post_at?: string
          lighter_id: string
          user_id: string
        }
        Update: {
          last_post_at?: string
          lighter_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lighter_contributions_lighter_id_fkey"
            columns: ["lighter_id"]
            isOneToOne: false
            referencedRelation: "lighters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lighter_contributions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lighters: {
        Row: {
          background_color: string | null
          created_at: string
          custom_background_url: string | null
          id: string
          is_retired: boolean
          name: string
          pin_code: string
          post_count: number
          saver_id: string
          show_saver_username: boolean
          sticker_design_version: number | null
          sticker_language: string | null
          times_refueled: number
          total_distance: number | null
          total_refills: number | null
          updated_at: string | null
        }
        Insert: {
          background_color?: string | null
          created_at?: string
          custom_background_url?: string | null
          id?: string
          is_retired?: boolean
          name: string
          pin_code: string
          post_count?: number
          saver_id: string
          show_saver_username?: boolean
          sticker_design_version?: number | null
          sticker_language?: string | null
          times_refueled?: number
          total_distance?: number | null
          total_refills?: number | null
          updated_at?: string | null
        }
        Update: {
          background_color?: string | null
          created_at?: string
          custom_background_url?: string | null
          id?: string
          is_retired?: boolean
          name?: string
          pin_code?: string
          post_count?: number
          saver_id?: string
          show_saver_username?: boolean
          sticker_design_version?: number | null
          sticker_language?: string | null
          times_refueled?: number
          total_distance?: number | null
          total_refills?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lighters_saver_id_fkey"
            columns: ["saver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string
          post_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id?: number
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "detailed_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_logs: {
        Row: {
          categories: Json
          category_scores: Json
          content_hash: string
          content_length: number | null
          content_type: string
          created_at: string | null
          decision: string
          flagged: boolean
          id: string
          severity: string
          user_id: string
        }
        Insert: {
          categories?: Json
          category_scores?: Json
          content_hash: string
          content_length?: number | null
          content_type: string
          created_at?: string | null
          decision: string
          flagged?: boolean
          id?: string
          severity: string
          user_id: string
        }
        Update: {
          categories?: Json
          category_scores?: Json
          content_hash?: string
          content_length?: number | null
          content_type?: string
          created_at?: string | null
          decision?: string
          flagged?: boolean
          id?: string
          severity?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderation_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_queue: {
        Row: {
          action_taken: string | null
          categories: Json
          content: string
          content_type: string
          content_url: string | null
          created_at: string | null
          flagged: boolean
          id: string
          lighter_id: string | null
          post_id: number | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          scores: Json
          severity: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_taken?: string | null
          categories?: Json
          content: string
          content_type?: string
          content_url?: string | null
          created_at?: string | null
          flagged?: boolean
          id?: string
          lighter_id?: string | null
          post_id?: number | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          scores?: Json
          severity?: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_taken?: string | null
          categories?: Json
          content?: string
          content_type?: string
          content_url?: string | null
          created_at?: string | null
          flagged?: boolean
          id?: string
          lighter_id?: string | null
          post_id?: number | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          scores?: Json
          severity?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderation_queue_lighter_id_fkey"
            columns: ["lighter_id"]
            isOneToOne: false
            referencedRelation: "lighters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_queue_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "detailed_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_queue_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      moderator_actions: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          moderator_id: string
          notes: string | null
          reason: string | null
          target_id: string
          target_type: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          moderator_id: string
          notes?: string | null
          reason?: string | null
          target_id: string
          target_type: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          moderator_id?: string
          notes?: string | null
          reason?: string | null
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderator_actions_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount_cents: number
          completed_at: string | null
          created_at: string | null
          currency: string
          design_snapshot: Json
          id: string
          lighter_id: string | null
          notes: string | null
          pack_size: number
          payment_status: string
          refund_amount_cents: number | null
          refund_status: string | null
          refunded_at: string | null
          shipped_at: string | null
          shipping_address: string | null
          shipping_city: string | null
          shipping_country: string | null
          shipping_email: string | null
          shipping_name: string | null
          shipping_postal_code: string | null
          status: string
          stripe_customer_email: string
          stripe_payment_intent_id: string
          tracking_number: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string
          design_snapshot?: Json
          id?: string
          lighter_id?: string | null
          notes?: string | null
          pack_size: number
          payment_status?: string
          refund_amount_cents?: number | null
          refund_status?: string | null
          refunded_at?: string | null
          shipped_at?: string | null
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_country?: string | null
          shipping_email?: string | null
          shipping_name?: string | null
          shipping_postal_code?: string | null
          status?: string
          stripe_customer_email: string
          stripe_payment_intent_id: string
          tracking_number?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string
          design_snapshot?: Json
          id?: string
          lighter_id?: string | null
          notes?: string | null
          pack_size?: number
          payment_status?: string
          refund_amount_cents?: number | null
          refund_status?: string | null
          refunded_at?: string | null
          shipped_at?: string | null
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_country?: string | null
          shipping_email?: string | null
          shipping_name?: string | null
          shipping_postal_code?: string | null
          status?: string
          stripe_customer_email?: string
          stripe_payment_intent_id?: string
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_lighter_id_fkey"
            columns: ["lighter_id"]
            isOneToOne: false
            referencedRelation: "lighters"
            referencedColumns: ["id"]
          },
        ]
      }
      post_flags: {
        Row: {
          created_at: string
          post_id: number
          reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: number
          reason?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: number
          reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_flags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "detailed_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_flags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_flags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content_text: string | null
          content_url: string | null
          created_at: string
          flagged_count: number
          id: number
          is_anonymous: boolean
          is_creation: boolean
          is_find_location: boolean
          is_flagged: boolean | null
          is_pinned: boolean
          is_public: boolean
          lighter_id: string
          location_lat: number | null
          location_lng: number | null
          location_name: string | null
          post_type: string
          requires_review: boolean
          title: string | null
          user_id: string
        }
        Insert: {
          content_text?: string | null
          content_url?: string | null
          created_at?: string
          flagged_count?: number
          id?: number
          is_anonymous?: boolean
          is_creation?: boolean
          is_find_location?: boolean
          is_flagged?: boolean | null
          is_pinned?: boolean
          is_public?: boolean
          lighter_id: string
          location_lat?: number | null
          location_lng?: number | null
          location_name?: string | null
          post_type: string
          requires_review?: boolean
          title?: string | null
          user_id: string
        }
        Update: {
          content_text?: string | null
          content_url?: string | null
          created_at?: string
          flagged_count?: number
          id?: number
          is_anonymous?: boolean
          is_creation?: boolean
          is_find_location?: boolean
          is_flagged?: boolean | null
          is_pinned?: boolean
          is_public?: boolean
          lighter_id?: string
          location_lat?: number | null
          location_lng?: number | null
          location_name?: string | null
          post_type?: string
          requires_review?: boolean
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_lighter_id_fkey"
            columns: ["lighter_id"]
            isOneToOne: false
            referencedRelation: "lighters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          level: number
          nationality: string | null
          points: number
          role: string | null
          show_nationality: boolean | null
          username: string
          welcome_email_sent: boolean
        }
        Insert: {
          created_at?: string
          id: string
          level?: number
          nationality?: string | null
          points?: number
          role?: string | null
          show_nationality?: boolean | null
          username: string
          welcome_email_sent?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          level?: number
          nationality?: string | null
          points?: number
          role?: string | null
          show_nationality?: boolean | null
          username?: string
          welcome_email_sent?: boolean
        }
        Relationships: []
      }
      sticker_orders: {
        Row: {
          amount_paid: number
          cancellation_reason: string | null
          carrier: string | null
          created_at: string | null
          currency: string | null
          customer_email_sent: boolean | null
          delivered_at: string | null
          failure_reason: string | null
          fulfillment_email_sent: boolean | null
          hold_reason: string | null
          id: string
          lighter_ids: string[]
          lighter_names: string[] | null
          on_hold: boolean | null
          paid_at: string | null
          payment_error_code: string | null
          payment_error_message: string | null
          payment_error_type: string | null
          payment_failed: boolean | null
          payment_intent_id: string
          printful_order_id: number | null
          quantity: number
          shipped_at: string | null
          shipping_address: string
          shipping_city: string
          shipping_country: string
          shipping_email: string
          shipping_name: string
          shipping_postal_code: string
          status: string | null
          sticker_file_size: number | null
          sticker_file_url: string | null
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_paid: number
          cancellation_reason?: string | null
          carrier?: string | null
          created_at?: string | null
          currency?: string | null
          customer_email_sent?: boolean | null
          delivered_at?: string | null
          failure_reason?: string | null
          fulfillment_email_sent?: boolean | null
          hold_reason?: string | null
          id?: string
          lighter_ids?: string[]
          lighter_names?: string[] | null
          on_hold?: boolean | null
          paid_at?: string | null
          payment_error_code?: string | null
          payment_error_message?: string | null
          payment_error_type?: string | null
          payment_failed?: boolean | null
          payment_intent_id: string
          printful_order_id?: number | null
          quantity: number
          shipped_at?: string | null
          shipping_address: string
          shipping_city: string
          shipping_country: string
          shipping_email: string
          shipping_name: string
          shipping_postal_code: string
          status?: string | null
          sticker_file_size?: number | null
          sticker_file_url?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_paid?: number
          cancellation_reason?: string | null
          carrier?: string | null
          created_at?: string | null
          currency?: string | null
          customer_email_sent?: boolean | null
          delivered_at?: string | null
          failure_reason?: string | null
          fulfillment_email_sent?: boolean | null
          hold_reason?: string | null
          id?: string
          lighter_ids?: string[]
          lighter_names?: string[] | null
          on_hold?: boolean | null
          paid_at?: string | null
          payment_error_code?: string | null
          payment_error_message?: string | null
          payment_error_type?: string | null
          payment_failed?: boolean | null
          payment_intent_id?: string
          printful_order_id?: number | null
          quantity?: number
          shipped_at?: string | null
          shipping_address?: string
          shipping_city?: string
          shipping_country?: string
          shipping_email?: string
          shipping_name?: string
          shipping_postal_code?: string
          status?: string | null
          sticker_file_size?: number | null
          sticker_file_url?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      trophies: {
        Row: {
          description: string
          icon_name: string | null
          id: number
          name: string
        }
        Insert: {
          description: string
          icon_name?: string | null
          id: number
          name: string
        }
        Update: {
          description?: string
          icon_name?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      user_trophies: {
        Row: {
          earned_at: string
          trophy_id: number
          user_id: string
        }
        Insert: {
          earned_at?: string
          trophy_id: number
          user_id: string
        }
        Update: {
          earned_at?: string
          trophy_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_trophies_trophy_id_fkey"
            columns: ["trophy_id"]
            isOneToOne: false
            referencedRelation: "trophies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_trophies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          payload: Json | null
          processed_at: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id: string
          payload?: Json | null
          processed_at?: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json | null
          processed_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      detailed_posts: {
        Row: {
          content_text: string | null
          content_url: string | null
          created_at: string | null
          flagged_count: number | null
          id: number | null
          is_anonymous: boolean | null
          is_creation: boolean | null
          is_find_location: boolean | null
          is_flagged: boolean | null
          is_pinned: boolean | null
          is_public: boolean | null
          lighter_id: string | null
          lighter_name: string | null
          likes_count: number | null
          location_lat: number | null
          location_lng: number | null
          location_name: string | null
          nationality: string | null
          post_type: string | null
          requires_review: boolean | null
          role: string | null
          show_nationality: boolean | null
          title: string | null
          user_has_liked: boolean | null
          user_id: string | null
          username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_lighter_id_fkey"
            columns: ["lighter_id"]
            isOneToOne: false
            referencedRelation: "lighters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admin_get_all_orders: {
        Args: Record<string, never>
        Returns: {
          amount_cents: number
          created_at: string
          currency: string
          id: string
          lighter_id: string
          notes: string
          pack_size: number
          payment_status: string
          refund_amount_cents: number
          refund_status: string
          refunded_at: string
          shipped_at: string
          shipping_address: string
          shipping_city: string
          shipping_country: string
          shipping_email: string
          shipping_name: string
          shipping_postal_code: string
          status: string
          stripe_customer_email: string
          stripe_payment_intent_id: string
          tracking_number: string
          updated_at: string
          user_email: string
          user_id: string
        }[]
      }
      admin_get_moderators: {
        Args: Record<string, never>
        Returns: {
          created_at: string
          email: string
          role: string
          user_id: string
          username: string
        }[]
      }
      admin_get_stats: {
        Args: Record<string, never>
        Returns: {
          total_users: number
          total_lighters: number
          active_lighters: number
          total_orders: number
          total_revenue_cents: number
          pending_orders: number
          total_stickers_generated: number
        }[]
      }
      admin_grant_moderator: { Args: { p_user_email: string }; Returns: Json }
      admin_revoke_moderator: { Args: { p_user_id: string }; Returns: Json }
      admin_search_users_by_email: {
        Args: { search_query: string }
        Returns: {
          email: string
          id: string
          username: string
        }[]
      }
      approve_post: { Args: { post_id: number }; Returns: undefined }
      auto_grant_trophies: {
        Args: { user_id_param: string }
        Returns: {
          granted_trophy_id: number
          newly_granted: boolean
        }[]
      }
      backfill_all_trophies: { Args: Record<string, never>; Returns: string }
      calculate_distance: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      check_user_trophy_eligibility: {
        Args: { user_id_param: string }
        Returns: {
          is_earned: boolean
          is_eligible: boolean
          trophy_id: number
          trophy_name: string
        }[]
      }
      create_bulk_lighters: {
        Args: { p_lighter_data: Json; p_user_id: string }
        Returns: {
          background_color: string
          lighter_id: string
          lighter_name: string
          pin_code: string
          sticker_language: string
        }[]
      }
      create_new_lighter: {
        Args: {
          background_url: string
          lighter_name: string
          show_username: boolean
        }
        Returns: string
      }
      create_new_post: {
        Args: {
          p_content_text?: string
          p_content_url?: string
          p_is_anonymous?: boolean
          p_is_creation?: boolean
          p_is_find_location?: boolean
          p_is_public?: boolean
          p_lighter_id: string
          p_location_lat?: number
          p_location_lng?: number
          p_location_name?: string
          p_post_type: string
          p_requires_review?: boolean
          p_title?: string
        }
        Returns: Json
      }
      create_order_from_payment:
        | {
            Args: {
              p_amount_cents: number
              p_currency?: string
              p_lighter_id: string
              p_pack_size: number
              p_stripe_customer_email: string
              p_stripe_payment_intent_id: string
              p_user_id: string
            }
            Returns: string
          }
        | {
            Args: {
              p_amount_cents: number
              p_currency: string
              p_design_snapshot?: Json
              p_lighter_id?: string
              p_pack_size: number
              p_stripe_customer_email: string
              p_stripe_payment_intent_id: string
              p_user_id: string
            }
            Returns: string
          }
      create_order_with_shipping: {
        Args: {
          p_amount_cents: number
          p_currency: string
          p_design_snapshot: Json
          p_pack_size: number
          p_shipping_address: string
          p_shipping_city: string
          p_shipping_country: string
          p_shipping_email: string
          p_shipping_name: string
          p_shipping_postal_code: string
          p_stripe_customer_email: string
          p_stripe_payment_intent_id: string
          p_user_id: string
        }
        Returns: string
      }
      delete_post_by_moderator: {
        Args: { post_id_to_delete: number }
        Returns: undefined
      }
      flag_post: { Args: { post_to_flag_id: number }; Returns: undefined }
      generate_random_pin: { Args: Record<string, never>; Returns: string }
      get_community_stats: { Args: Record<string, never>; Returns: Json }
      get_lighter_id_from_pin: {
        Args: { pin_to_check: string }
        Returns: string
      }
      get_moderation_queue_data: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_severity?: string
          p_status?: string
        }
        Returns: {
          categories: Json
          content: string
          content_type: string
          content_url: string
          created_ago: string
          created_at: string
          flagged: boolean
          id: string
          lighter_id: string
          post_id: string
          review_notes: string
          severity: string
          status: string
          user_email: string
          user_id: string
        }[]
      }
      get_moderation_stats: {
        Args: { p_time_period?: unknown }
        Returns: {
          approved_count: number
          avg_review_time_hours: number
          high_severity: number
          low_severity: number
          medium_severity: number
          most_common_category: string
          pending_review: number
          rejected_count: number
          total_flagged: number
        }[]
      }
      get_my_role: { Args: Record<string, never>; Returns: string }
      get_my_stats: { Args: Record<string, never>; Returns: Json }
      get_order_analytics: {
        Args: { p_time_period?: unknown }
        Returns: {
          avg_order_value: number
          completed_orders: number
          completion_rate: number
          failed_orders: number
          most_popular_pack_size: number
          total_orders: number
          total_revenue: number
        }[]
      }
      get_orders_data: {
        Args: { p_limit?: number; p_offset?: number; p_status?: string }
        Returns: {
          amount_cents: number
          created_ago: string
          created_at: string
          currency: string
          id: string
          lighter_id: string
          lighter_name: string
          pack_size: number
          payment_status: string
          shipped_at: string
          status: string
          stripe_payment_intent_id: string
          tracking_number: string
          user_email: string
          user_id: string
        }[]
      }
      get_random_public_posts: {
        Args: { limit_count: number }
        Returns: {
          content_text: string
          content_url: string
          created_at: string
          flagged_count: number
          id: number
          is_anonymous: boolean
          is_creation: boolean
          is_find_location: boolean
          is_flagged: boolean
          is_pinned: boolean
          is_public: boolean
          lighter_id: string
          like_count: number
          location_lat: number
          location_lng: number
          location_name: string
          nationality: string
          post_type: string
          show_nationality: boolean
          title: string
          user_has_liked: boolean
          user_id: string
          username: string
        }[]
      }
      grant_trophy: {
        Args: { trophy_to_grant_id: number; user_to_grant_id: string }
        Returns: undefined
      }
      is_admin: { Args: Record<string, never>; Returns: boolean }
      is_moderator_or_admin: { Args: Record<string, never>; Returns: boolean }
      log_moderation_result:
        | {
            Args: {
              p_categories: Json
              p_category_scores: Json
              p_content: string
              p_content_type: string
              p_content_url: string
              p_flagged: boolean
              p_lighter_id: string
              p_post_id: string
              p_severity: string
              p_user_id: string
            }
            Returns: string
          }
        | {
            Args: {
              p_categories?: Json
              p_content: string
              p_content_type: string
              p_content_url?: string
              p_flagged?: boolean
              p_lighter_id?: string
              p_post_id?: number
              p_scores?: Json
              p_severity?: string
              p_user_id: string
            }
            Returns: string
          }
      log_moderator_action: {
        Args: {
          p_action_type: string
          p_notes?: string
          p_reason?: string
          p_target_id: string
          p_target_type: string
        }
        Returns: string
      }
      reinstate_post: {
        Args: { post_id_to_reinstate: number }
        Returns: undefined
      }
      reject_post: { Args: { post_id: number }; Returns: undefined }
      toggle_flag: { Args: { post_to_flag_id: number }; Returns: undefined }
      toggle_like: { Args: { post_to_like_id: number }; Returns: undefined }
      unflag_post: { Args: { post_to_unflag_id: number }; Returns: undefined }
      update_order_payment_succeeded: {
        Args: { p_payment_intent_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
