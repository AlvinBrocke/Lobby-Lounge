import supabase from "../../utils/db.js";

async function handler({
  businessName,
  email,
  country,
  businessType,
  subscriptionPlan = "trial",
  genres = [],
  mood = "",
  energyLevel = 50,
}) {
  const session = getSession();

  if (!session || !session.user?.id) {
    return { error: "Authentication required" };
  }

  if (!businessName || !country || !businessType) {
    return { error: "Business name, country, and business type are required" };
  }

  try {
    const userId = session.user.id;

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
  return handler(await request.json());
}
