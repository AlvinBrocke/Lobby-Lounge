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

    // For now, we'll simulate database operations
    // In a real implementation, you would use your database connection

    const profileData = {
      id: Math.floor(Math.random() * 1000),
      userId: userId,
      businessName: businessName,
      email: email,
      country: country,
      businessType: businessType,
      subscriptionPlan: subscriptionPlan,
      trialEndDate: new Date(
        Date.now() + 14 * 24 * 60 * 60 * 1000
      ).toISOString(),
      createdAt: new Date().toISOString(),
      musicPreferences: {
        genres: genres,
        mood: mood,
        energyLevel: energyLevel,
      },
    };

    return {
      success: true,
      profile: profileData,
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