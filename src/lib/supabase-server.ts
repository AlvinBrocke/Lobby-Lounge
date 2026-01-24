/**
 * Supabase Server-Side Data Access Layer
 *
 * Use these functions in Server Components, Server Actions, and Route Handlers
 */

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import type {
  Track,
  Channel,
  Playlist,
  UserProfile,
} from "@/types/database.types";

// Helper to get server supabase client
function getServerClient() {
  return createClient(cookies());
}

// ===================
// TRACKS (Server)
// ===================

export async function getTracksServer(limit = 50) {
  const supabase = getServerClient();
  const { data, error } = await supabase
    .from("tracks")
    .select("*")
    .limit(limit)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Track[];
}

export async function getTrackByIdServer(id: string) {
  const supabase = getServerClient();
  const { data, error } = await supabase
    .from("tracks")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Track;
}

// ===================
// CHANNELS (Server)
// ===================

export async function getChannelsServer(limit = 50) {
  const supabase = getServerClient();
  const { data, error } = await supabase
    .from("channels")
    .select("*")
    .limit(limit)
    .order("name", { ascending: true });

  if (error) throw error;
  return data as Channel[];
}

// ===================
// PLAYLISTS (Server)
// ===================

export async function getUserPlaylistsServer(userId: string) {
  const supabase = getServerClient();
  const { data, error } = await supabase
    .from("playlists")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Playlist[];
}

// ===================
// USER PROFILES (Server)
// ===================

export async function getUserProfileServer(userId: string) {
  const supabase = getServerClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data as UserProfile | null;
}

// ===================
// AUTH (Server)
// ===================

export async function getCurrentUserServer() {
  const supabase = getServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  return user;
}

export async function getSessionServer() {
  const supabase = getServerClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw error;
  return session;
}
