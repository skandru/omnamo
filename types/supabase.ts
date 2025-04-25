// types/supabase.ts

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
      users: {
        Row: {
          id: string
          username: string | null
          first_name: string
          last_name: string
          email: string
          phone_number: string | null
          gotram_id: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          username?: string | null
          first_name: string
          last_name: string
          email: string
          phone_number?: string | null
          gotram_id?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          username?: string | null
          first_name?: string
          last_name?: string
          email?: string
          phone_number?: string | null
          gotram_id?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_gotram_id_fkey"
            columns: ["gotram_id"]
            referencedRelation: "gotrams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      gotrams: {
        Row: {
          id: string
          gotranamalu: string
          nakshtram: string
          rasi: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          gotranamalu: string
          nakshtram: string
          rasi: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          gotranamalu?: string
          nakshtram?: string
          rasi?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          id: string
          name: string
          event_date: string
          location: string
          image_url: string | null
          description: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          name: string
          event_date: string
          location: string
          image_url?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          event_date?: string
          location?: string
          image_url?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      attendees: {
        Row: {
          id: string
          event_id: string
          user_id: string
          number_of_family_members: number
          additional_notes: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          number_of_family_members?: number
          additional_notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          number_of_family_members?: number
          additional_notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendees_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendees_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendees_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendees_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      payments: {
        Row: {
          id: string
          event_id: string
          user_id: string
          payment_date: string
          payment_method: string
          amount: number
          status: string
          provider: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          payment_date?: string
          payment_method: string
          amount: number
          status: string
          provider?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          payment_date?: string
          payment_method?: string
          amount?: number
          status?: string
          provider?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}