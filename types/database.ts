// Auto-generated database types for Supabase
// This file defines TypeScript types for all database tables

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          level: number
          points: number
          role: string | null
          nationality: string | null
          show_nationality: boolean
          created_at: string
        }
        Insert: {
          id: string
          username: string
          level?: number
          points?: number
          role?: string | null
          nationality?: string | null
          show_nationality?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          level?: number
          points?: number
          role?: string | null
          nationality?: string | null
          show_nationality?: boolean
          created_at?: string
        }
      }
      lighters: {
        Row: {
          id: string
          user_id: string
          name: string
          background_color: string
          language: string
          created_at: string
          is_saved: boolean
          profiles?: {
            username: string | null
            level: number
          }
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          background_color: string
          language: string
          created_at?: string
          is_saved?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          background_color?: string
          language?: string
          created_at?: string
          is_saved?: boolean
        }
      }
      posts: {
        Row: {
          id: string
          lighter_id: string
          user_id: string
          post_type: 'text' | 'song' | 'image' | 'location' | 'refuel'
          content: string | null
          content_url: string | null
          location_lat: number | null
          location_lng: number | null
          location_name: string | null
          created_at: string
          is_moderated: boolean
          moderation_status: 'pending' | 'approved' | 'rejected' | null
        }
        Insert: {
          id?: string
          lighter_id: string
          user_id: string
          post_type: 'text' | 'song' | 'image' | 'location' | 'refuel'
          content?: string | null
          content_url?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_name?: string | null
          created_at?: string
          is_moderated?: boolean
          moderation_status?: 'pending' | 'approved' | 'rejected' | null
        }
        Update: {
          id?: string
          lighter_id?: string
          user_id?: string
          post_type?: 'text' | 'song' | 'image' | 'location' | 'refuel'
          content?: string | null
          content_url?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_name?: string | null
          created_at?: string
          is_moderated?: boolean
          moderation_status?: 'pending' | 'approved' | 'rejected' | null
        }
      }
      sticker_orders: {
        Row: {
          id: string
          user_id: string
          payment_intent_id: string
          stripe_payment_intent_id: string
          printful_order_id: number | null
          quantity: number
          lighter_ids: string[]
          lighter_names: string[]
          shipping_name: string
          shipping_email: string
          shipping_address: string
          shipping_city: string
          shipping_postal_code: string
          shipping_country: string
          shipping_method: 'standard' | 'express'
          amount: number
          amount_paid: number
          currency: string
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'failed' | 'refunded' | 'returned' | 'on_hold' | 'canceled'
          tracking_number: string | null
          tracking_url: string | null
          carrier: string | null
          on_hold: boolean
          hold_reason: string | null
          failure_reason: string | null
          cancellation_reason: string | null
          created_at: string
          updated_at: string
          paid_at: string | null
          shipped_at: string | null
          delivered_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          payment_intent_id?: string
          stripe_payment_intent_id: string
          printful_order_id?: number | null
          quantity: number
          lighter_ids: string[]
          lighter_names: string[]
          shipping_name: string
          shipping_email: string
          shipping_address: string
          shipping_city: string
          shipping_postal_code: string
          shipping_country: string
          shipping_method: 'standard' | 'express'
          amount: number
          amount_paid?: number
          currency?: string
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'failed' | 'refunded' | 'returned' | 'on_hold' | 'canceled'
          tracking_number?: string | null
          tracking_url?: string | null
          carrier?: string | null
          on_hold?: boolean
          hold_reason?: string | null
          failure_reason?: string | null
          cancellation_reason?: string | null
          created_at?: string
          updated_at?: string
          paid_at?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          payment_intent_id?: string
          stripe_payment_intent_id?: string
          printful_order_id?: number | null
          quantity?: number
          lighter_ids?: string[]
          lighter_names?: string[]
          shipping_name?: string
          shipping_email?: string
          shipping_address?: string
          shipping_city?: string
          shipping_postal_code?: string
          shipping_country?: string
          shipping_method?: 'standard' | 'express'
          amount?: number
          amount_paid?: number
          currency?: string
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'failed' | 'refunded' | 'returned' | 'on_hold' | 'canceled'
          tracking_number?: string | null
          tracking_url?: string | null
          carrier?: string | null
          on_hold?: boolean
          hold_reason?: string | null
          failure_reason?: string | null
          cancellation_reason?: string | null
          created_at?: string
          updated_at?: string
          paid_at?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
        }
      }
      webhook_events: {
        Row: {
          id: string
          webhook_id: string
          source: 'stripe' | 'printful'
          event_type: string
          payload: Json
          processed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          webhook_id: string
          source: 'stripe' | 'printful'
          event_type: string
          payload: Json
          processed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          webhook_id?: string
          source?: 'stripe' | 'printful'
          event_type?: string
          payload?: Json
          processed?: boolean
          created_at?: string
        }
      }
      moderators: {
        Row: {
          id: string
          user_id: string
          permissions: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          permissions: string[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          permissions?: string[]
          created_at?: string
        }
      }
      moderation_logs: {
        Row: {
          id: string
          moderator_id: string
          action: string
          target_type: string
          target_id: string
          details: Json
          created_at: string
        }
        Insert: {
          id?: string
          moderator_id: string
          action: string
          target_type: string
          target_id: string
          details: Json
          created_at?: string
        }
        Update: {
          id?: string
          moderator_id?: string
          action?: string
          target_type?: string
          target_id?: string
          details?: Json
          created_at?: string
        }
      }
      trophies: {
        Row: {
          id: string
          user_id: string
          trophy_type: string
          trophy_data: Json
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          trophy_type: string
          trophy_data: Json
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          trophy_type?: string
          trophy_data?: Json
          earned_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
