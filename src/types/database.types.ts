/**
 * Supabase Database Types
 *
 * To regenerate these types from your actual database schema, run:
 * npx supabase gen types typescript --project-id qzikrvjjbfyinwddmnib > src/types/database.types.ts
 *
 * Or use the Supabase CLI:
 * supabase gen types typescript --project-id qzikrvjjbfyinwddmnib --schema public
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // Example tracks table - update based on your actual schema
      tracks: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          image: string | null;
          audio_url: string | null;
          category: string | null;
          duration: number | null;
          artist: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          image?: string | null;
          audio_url?: string | null;
          category?: string | null;
          duration?: number | null;
          artist?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          image?: string | null;
          audio_url?: string | null;
          category?: string | null;
          duration?: number | null;
          artist?: string | null;
        };
      };
      // Example channels table
      channels: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          image: string | null;
          color: string | null;
          audio_url: string | null;
          category: string | null;
          description: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          image?: string | null;
          color?: string | null;
          audio_url?: string | null;
          category?: string | null;
          description?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          image?: string | null;
          color?: string | null;
          audio_url?: string | null;
          category?: string | null;
          description?: string | null;
        };
      };
      // Example playlists table
      playlists: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          user_id: string;
          description: string | null;
          is_public: boolean;
          cover_image: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          user_id: string;
          description?: string | null;
          is_public?: boolean;
          cover_image?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          user_id?: string;
          description?: string | null;
          is_public?: boolean;
          cover_image?: string | null;
        };
      };
      // Example user_profiles table
      user_profiles: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          display_name: string | null;
          avatar_url: string | null;
          plan: string;
          onboarding_completed: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          plan?: string;
          onboarding_completed?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          plan?: string;
          onboarding_completed?: boolean;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper types for easier usage
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Convenient type aliases
export type Track = Tables<"tracks">;
export type Channel = Tables<"channels">;
export type Playlist = Tables<"playlists">;
export type UserProfile = Tables<"user_profiles">;
