import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const USER = "user_test456";

describe("userProfiles", () => {
  it("get returns null for unknown user", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const profile = await t.query(api.userProfiles.get, { clerkUserId: USER });
    expect(profile).toBeNull();
  });

  it("createOrUpdate creates a new profile with defaults", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    await t.mutation(api.userProfiles.createOrUpdate, {
      clerkUserId: USER,
      displayName: "Alvin",
    });
    const profile = await t.query(api.userProfiles.get, { clerkUserId: USER });
    expect(profile?.displayName).toBe("Alvin");
    expect(profile?.plan).toBe("trial");
    expect(profile?.genres).toEqual([]);
    expect(profile?.onboardingCompleted).toBe(false);
  });

  it("createOrUpdate updates an existing profile", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    await t.mutation(api.userProfiles.createOrUpdate, {
      clerkUserId: USER,
      displayName: "Alvin",
      genres: ["jazz"],
    });
    await t.mutation(api.userProfiles.createOrUpdate, {
      clerkUserId: USER,
      venueName: "The Grand Café",
      onboardingCompleted: true,
    });
    const profile = await t.query(api.userProfiles.get, { clerkUserId: USER });
    expect(profile?.venueName).toBe("The Grand Café");
    expect(profile?.onboardingCompleted).toBe(true);
    expect(profile?.genres).toEqual(["jazz"]); // untouched
    expect(profile?.displayName).toBe("Alvin");   // untouched
  });

  it("does not create duplicate profiles for the same user", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    await t.mutation(api.userProfiles.createOrUpdate, { clerkUserId: USER });
    await t.mutation(api.userProfiles.createOrUpdate, { clerkUserId: USER });
    // get uses .unique() so duplicate would throw — passing means only one row
    const profile = await t.query(api.userProfiles.get, { clerkUserId: USER });
    expect(profile).not.toBeNull();
  });
});
