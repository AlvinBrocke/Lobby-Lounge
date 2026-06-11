/**
 * Supabase Data Access Layer
 *
 * Centralized functions for interacting with Supabase
 * Use these in your components, server actions, and API routes
 */

import { createClient } from "@/utils/supabase/client";
import type {
  Database,
  Track,
  Channel,
  Playlist,
  UserProfile,
} from "@/types/database.types";

// ===================
// TRACKS
// ===================

export async function getTracks(limit = 50) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tracks")
    .select("*")
    .limit(limit)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Track[];
}

export async function getTrackById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tracks")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Track;
}

export async function getTracksByCategory(category: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tracks")
    .select("*")
    .eq("category", category);

  if (error) throw error;
  return data as Track[];
}

// ===================
// CHANNELS
// ===================

export async function getChannels(limit = 50) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("channels")
    .select("*")
    .limit(limit)
    .order("name", { ascending: true });

  if (error) throw error;
  return data as Channel[];
}

export async function getChannelById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("channels")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Channel;
}

// ===================
// PLAYLISTS
// ===================

export async function getUserPlaylists(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("playlists")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Playlist[];
}

export async function createPlaylist(playlist: {
  name: string;
  user_id: string;
  description?: string;
  is_public?: boolean;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("playlists")
    .insert(playlist)
    .select()
    .single();

  if (error) throw error;
  return data as Playlist;
}

export async function updatePlaylist(
  id: string,
  updates: Partial<Omit<Playlist, "id" | "created_at" | "user_id">>,
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("playlists")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Playlist;
}

export async function deletePlaylist(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("playlists").delete().eq("id", id);

  if (error) throw error;
  return true;
}

// ===================
// USER PROFILES
// ===================

export async function getUserProfile(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows found
  return data as UserProfile | null;
}

export async function createUserProfile(profile: {
  user_id: string;
  display_name?: string;
  avatar_url?: string;
  plan?: string;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .insert(profile)
    .select()
    .single();

  if (error) throw error;
  return data as UserProfile;
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, "id" | "created_at" | "user_id">>,
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .update(updates)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data as UserProfile;
}

// ===================
// AUTH HELPERS
// ===================

export async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  return user;
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) throw error;
  return true;
}

// ===================
// REALTIME SUBSCRIPTIONS
// ===================

export function subscribeToTracks(callback: (payload: any) => void) {
  const supabase = createClient();
  return supabase
    .channel("tracks-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "tracks" },
      callback,
    )
    .subscribe();
}

export function subscribeToChannels(callback: (payload: any) => void) {
  const supabase = createClient();
  return supabase
    .channel("channels-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "channels" },
      callback,
    )
    .subscribe();
}
