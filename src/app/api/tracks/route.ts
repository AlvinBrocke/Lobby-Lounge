/**
 * Example API Route for Tracks
 *
 * GET /api/tracks - Get all tracks
 * POST /api/tracks - Create a new track (requires auth)
 */

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(cookies());
    const { searchParams } = new URL(request.url);

    const limit = parseInt(searchParams.get("limit") || "50");
    const category = searchParams.get("category");

    let query = supabase
      .from("tracks")
      .select("*")
      .limit(limit)
      .order("created_at", { ascending: false });

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(cookies());

    // Check if user is authenticated
    // const {
    //   data: { user },
    //   error: authError,
    // } = await supabase.auth.getUser();

    // if (authError || !user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const body = await request.json();
    const { name, image, audio_url, category, duration, artist } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Track name is required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("tracks")
      .insert({
        name,
        image,
        audio_url,
        category,
        duration,
        artist,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
