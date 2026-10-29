import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import { api, internal } from "./_generated/api";
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

  it("createOrUpdate records the owner's email, never a staff member's", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    await t.withIdentity({ subject: USER, email: "owner@venue.test" }).mutation(api.userProfiles.createOrUpdate, {});
    const staff = t.withIdentity({ subject: "user_staff", venue_owner: USER, email: "staff@venue.test" });
    await staff.mutation(api.userProfiles.createOrUpdate, { mood: "chill" });
    expect((await staff.query(api.userProfiles.get, {}))?.email).toBe("owner@venue.test");
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

  it("round-trips the audience and playback choices from onboarding", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const asUser = t.withIdentity({ subject: USER });
    await asUser.mutation(api.userProfiles.createOrUpdate, {
      audienceGender: "mixed",
      ageGroups: ["gen-z", "millennials"],
      guestDemographics: ["Trendy", "Luxury"],
      tempo: "high",
      sound: { defaultVolume: 80, fadeSeconds: 0, followSchedule: true },
      onboardingCompleted: true,
    });
    const profile = await asUser.query(api.userProfiles.get, {});
    expect(profile?.audienceGender).toBe("mixed");
    expect(profile?.ageGroups).toEqual(["gen-z", "millennials"]);
    expect(profile?.guestDemographics).toEqual(["Trendy", "Luxury"]);
    expect(profile?.tempo).toBe("high");
    expect(profile?.sound?.defaultVolume).toBe(80);
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

  it("setPlan changes the plan of an existing profile", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const asUser = t.withIdentity({ subject: USER });
    await asUser.mutation(api.userProfiles.createOrUpdate, {});
    await t.mutation(internal.userProfiles.setPlan, { clerkUserId: USER, plan: "basic" });
    expect((await asUser.query(api.userProfiles.get, {}))?.plan).toBe("basic");
  });

  it("extendTrial sets trialEndsAt the given number of days out", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const asUser = t.withIdentity({ subject: USER });
    await asUser.mutation(api.userProfiles.createOrUpdate, {});
    const before = Date.now();
    await t.mutation(internal.userProfiles.extendTrial, { clerkUserId: USER, days: 7 });
    const profile = await asUser.query(api.userProfiles.get, {});
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    expect(profile?.trialEndsAt).toBeGreaterThanOrEqual(before + sevenDays);
    expect(profile?.trialEndsAt).toBeLessThanOrEqual(Date.now() + sevenDays);
  });

  it("billing admin mutations reject unknown users", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    await expect(
      t.mutation(internal.userProfiles.setPlan, { clerkUserId: "user_nobody", plan: "basic" }),
    ).rejects.toThrow("No profile");
    await expect(
      t.mutation(internal.userProfiles.extendTrial, { clerkUserId: "user_nobody" }),
    ).rejects.toThrow("No profile");
  });
});

describe("saveBrand", () => {
  async function setup() {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const asUser = t.withIdentity({ subject: USER });
    await asUser.mutation(api.userProfiles.createOrUpdate, { venueName: "Old Name" });
    const upload = (type: string, bytes = 10) =>
      t.run((ctx) => ctx.storage.store(new Blob([new Uint8Array(bytes)], { type })));
    return { t, asUser, upload };
  }

  it("saves name, location, colour and logo, and returns a logo URL", async () => {
    const { asUser, upload } = await setup();
    const logo = await upload("image/png");
    await asUser.mutation(api.userProfiles.saveBrand, {
      venueName: "  Purple Spoon ",
      country: "US",
      region: "NC",
      brandColor: "purple",
      logo,
    });
    const profile = await asUser.query(api.userProfiles.get, {});
    expect(profile).toMatchObject({ venueName: "Purple Spoon", country: "US", region: "NC", brandColor: "purple" });
    expect(profile?.logoUrl).toEqual(expect.any(String));
  });

  it("rejects colours outside the list, including prototype keys", async () => {
    const { asUser } = await setup();
    for (const brandColor of ["#ff0000", "toString"]) {
      await expect(asUser.mutation(api.userProfiles.saveBrand, { venueName: "X", brandColor })).rejects.toThrow(
        "Pick a colour",
      );
    }
  });

  it("rejects logos over 2 MB", async () => {
    const { asUser, upload } = await setup();
    const huge = await upload("image/png", 2 * 1024 * 1024 + 1);
    await expect(
      asUser.mutation(api.userProfiles.saveBrand, { venueName: "X", brandColor: "teal", logo: huge }),
    ).rejects.toThrow("smaller than 2 MB");
  });

  it("deletes the old logo file when it's replaced or removed", async () => {
    const { t, asUser, upload } = await setup();
    const first = await upload("image/png");
    await asUser.mutation(api.userProfiles.saveBrand, { venueName: "X", brandColor: "teal", logo: first });
    const second = await upload("image/jpeg");
    await asUser.mutation(api.userProfiles.saveBrand, { venueName: "X", brandColor: "teal", logo: second });
    expect(await t.run((ctx) => ctx.db.system.get(first))).toBeNull();
    await asUser.mutation(api.userProfiles.saveBrand, { venueName: "X", brandColor: "teal", logo: null });
    expect(await t.run((ctx) => ctx.db.system.get(second))).toBeNull();
    expect((await asUser.query(api.userProfiles.get, {}))?.logoUrl).toBeNull();
  });
});

describe("preferences", () => {
  it("saves tempo and sound settings", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const asUser = t.withIdentity({ subject: USER });
    await asUser.mutation(api.userProfiles.createOrUpdate, { genres: ["jazz"] });
    const sound = { defaultVolume: 70, fadeSeconds: 6, followSchedule: false };
    await asUser.mutation(api.userProfiles.createOrUpdate, { tempo: "low", sound });
    expect(await asUser.query(api.userProfiles.get, {})).toMatchObject({ genres: ["jazz"], tempo: "low", sound });
  });

  it("rejects out-of-range sound settings", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const asUser = t.withIdentity({ subject: USER });
    const save = (sound: { defaultVolume: number; fadeSeconds: number; followSchedule: boolean }) =>
      asUser.mutation(api.userProfiles.createOrUpdate, { sound });
    await expect(save({ defaultVolume: 140, fadeSeconds: 0, followSchedule: true })).rejects.toThrow("Default volume");
    await expect(save({ defaultVolume: 50, fadeSeconds: 7, followSchedule: true })).rejects.toThrow("fade length");
  });
});
