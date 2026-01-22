import { createClient } from "../../utils/supabase/server";
import { cookies } from "next/headers";
import { auth } from "../../utils/auth";

async function handler(
  request,
  {
    businessName,
    email,
    country,
    businessType,
    subscriptionPlan = "trial",
    genres = [],
    mood = "",
    energyLevel = 50,
  },
) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session || !session.user?.id) {
    return { error: "Authentication required" };
  }

  if (!businessName || !country || !businessType) {
    return { error: "Business name, country, and business type are required" };
  }

  try {
    const userId = session.user.id;
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const trialEndDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const createdAt = new Date();
    const musicPreferences = {
      genres: genres,
      mood: mood,
      energyLevel: energyLevel,
    };

    const { data, error } = await supabase
      .from("profiles")
      .insert([
        {
          user_id: userId,
          business_name: businessName,
          email: email,
          country: country,
          business_type: businessType,
          subscription_plan: subscriptionPlan,
          trial_end_date: trialEndDate.toISOString(),
          created_at: createdAt.toISOString(),
          music_preferences: musicPreferences,
        },
      ])
      .select();

    if (error) {
      throw error;
    }

    const profile = data[0];

    return {
      success: true,
      profile: profile,
      message: "Profile created successfully",
    };
  } catch (error) {
    console.error("Error creating profile:", error);
    return { error: "Failed to create business profile" };
  }
}
export async function POST(request) {
  const body = await request.json();
  const result = await handler(request, body);

  if (result.error) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  return Response.json(result);
}
