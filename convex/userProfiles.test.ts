import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const USER = "user_test456";

describe("userProfiles", () => {
  it("get returns null for unknown user", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const asUser = t.withIdentity({ subject: USER });
    const profile = await asUser.query(api.userProfiles.get, {});
    expect(profile).toBeNull();
  });

  it("createOrUpdate creates a new profile with defaults", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const asUser = t.withIdentity({ subject: USER });
    await asUser.mutation(api.userProfiles.createOrUpdate, {
      displayName: "Alvin",
    });
    const profile = await asUser.query(api.userProfiles.get, {});
    expect(profile?.clerkUserId).toBe(USER);
    expect(profile?.displayName).toBe("Alvin");
    expect(profile?.plan).toBe("trial");
    expect(profile?.genres).toEqual([]);
    expect(profile?.onboardingCompleted).toBe(false);
  });

  it("createOrUpdate updates an existing profile", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const asUser = t.withIdentity({ subject: USER });
    await asUser.mutation(api.userProfiles.createOrUpdate, {
      displayName: "Alvin",
      genres: ["jazz"],
    });
    await asUser.mutation(api.userProfiles.createOrUpdate, {
      venueName: "The Grand Café",
      onboardingCompleted: true,
    });
    const profile = await asUser.query(api.userProfiles.get, {});
    expect(profile?.venueName).toBe("The Grand Café");
    expect(profile?.onboardingCompleted).toBe(true);
    expect(profile?.genres).toEqual(["jazz"]); // untouched
    expect(profile?.displayName).toBe("Alvin");   // untouched
  });

  it("round-trips the business details collected during onboarding", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const asUser = t.withIdentity({ subject: USER });
    await asUser.mutation(api.userProfiles.createOrUpdate, {
      venueName: "The Grand Café",
      businessType: "Café",
      country: "US",
      region: "NY",
      locationCount: 2,
      guestDemographics: ["Young professionals", "Tourists"],
      genres: ["jazz", "lo-fi"],
      mood: "relaxed",
      onboardingCompleted: true,
    });
    const profile = await asUser.query(api.userProfiles.get, {});
    expect(profile?.businessType).toBe("Café");
    expect(profile?.country).toBe("US");
    expect(profile?.region).toBe("NY");
    expect(profile?.locationCount).toBe(2);
    expect(profile?.guestDemographics).toEqual(["Young professionals", "Tourists"]);
    expect(profile?.onboardingCompleted).toBe(true);
  });

  it("supports 'Skip for now' — completing onboarding with no details", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const asUser = t.withIdentity({ subject: USER });
    await asUser.mutation(api.userProfiles.createOrUpdate, {
      onboardingCompleted: true,
    });
    const profile = await asUser.query(api.userProfiles.get, {});
    expect(profile?.onboardingCompleted).toBe(true);
    expect(profile?.genres).toEqual([]);
    expect(profile?.businessType).toBeUndefined();
    expect(profile?.plan).toBe("trial");
  });

  it("does not create duplicate profiles for the same user", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const asUser = t.withIdentity({ subject: USER });
    await asUser.mutation(api.userProfiles.createOrUpdate, {});
    await asUser.mutation(api.userProfiles.createOrUpdate, {});
    // get uses .unique() so duplicate would throw — passing means only one row
    const profile = await asUser.query(api.userProfiles.get, {});
    expect(profile).not.toBeNull();
  });

  it("profiles are scoped to the calling identity", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    await t
      .withIdentity({ subject: USER })
      .mutation(api.userProfiles.createOrUpdate, { displayName: "Alvin" });

    const other = await t
      .withIdentity({ subject: "user_other" })
      .query(api.userProfiles.get, {});
    expect(other).toBeNull();
  });

  it("rejects unauthenticated calls", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    await expect(t.query(api.userProfiles.get, {})).rejects.toThrow(
      /Not authenticated/,
    );
    await expect(
      t.mutation(api.userProfiles.createOrUpdate, { displayName: "Nobody" }),
    ).rejects.toThrow(/Not authenticated/);
  });
});
