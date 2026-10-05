import { describe, it, expect } from "vitest";
import { TRIAL_DAYS, accessFor, trialDaysLeft } from "./billing";

const DAY = 24 * 60 * 60 * 1000;
const CREATED = Date.UTC(2026, 8, 1);

describe("accessFor", () => {
  it("denies access without a profile", () => {
    expect(accessFor(null, CREATED)).toEqual({ status: "expired", trialEndsAt: null });
  });

  it("gives paying users access with no trial end", () => {
    const profile = { plan: "basic", _creationTime: CREATED };
    expect(accessFor(profile, CREATED + 400 * DAY)).toEqual({ status: "active", trialEndsAt: null });
  });

  it("runs the trial for TRIAL_DAYS from profile creation", () => {
    const profile = { plan: "trial", _creationTime: CREATED };
    const end = CREATED + TRIAL_DAYS * DAY;
    expect(accessFor(profile, end - 1)).toEqual({ status: "trial", trialEndsAt: end });
    expect(accessFor(profile, end)).toEqual({ status: "expired", trialEndsAt: end });
  });

  it("lets trialEndsAt override the default end", () => {
    const profile = { plan: "trial", _creationTime: CREATED, trialEndsAt: CREATED + 60 * DAY };
    expect(accessFor(profile, CREATED + 45 * DAY).status).toBe("trial");
  });
});

describe("trialDaysLeft", () => {
  it("rounds partial days up and never goes negative", () => {
    const access = { status: "trial" as const, trialEndsAt: CREATED + 2 * DAY };
    expect(trialDaysLeft(access, CREATED)).toBe(2);
    expect(trialDaysLeft(access, CREATED + DAY + 1)).toBe(1);
    expect(trialDaysLeft(access, CREATED + 3 * DAY)).toBe(0);
  });
});
