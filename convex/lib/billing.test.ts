import { describe, it, expect } from "vitest";
import { TRIAL_DAYS, accessFor, checkoutTrialEnd, trialDaysLeft, trialEndFor } from "./billing";

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

describe("checkoutTrialEnd", () => {
  const profile = { plan: "trial", _creationTime: CREATED };
  const end = CREATED + TRIAL_DAYS * DAY;

  it("carries the rest of the free trial into the Stripe subscription", () => {
    expect(checkoutTrialEnd(profile, CREATED + DAY)).toBe(Math.floor(end / 1000));
  });

  it("honours an extended trial", () => {
    const extended = { ...profile, trialEndsAt: end + 10 * DAY };
    expect(trialEndFor(extended)).toBe(end + 10 * DAY);
    expect(checkoutTrialEnd(extended, end)).toBe(Math.floor((end + 10 * DAY) / 1000));
  });

  it("bills immediately inside Stripe's 48-hour minimum or after the trial", () => {
    expect(checkoutTrialEnd(profile, end - 2 * DAY)).toBeNull();
    expect(checkoutTrialEnd(profile, end - DAY)).toBeNull();
    expect(checkoutTrialEnd(profile, end + DAY)).toBeNull();
  });

  it("still keeps the trial with comfortably more than 48 hours left", () => {
    expect(checkoutTrialEnd(profile, end - 3 * DAY)).toBe(Math.floor(end / 1000));
  });
});
