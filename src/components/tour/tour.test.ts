import { describe, it, expect, beforeEach } from "vitest";
import { TOUR_STEPS, useTour, visibleSteps } from "./tour";

beforeEach(() => useTour.getState().stop());

describe("visibleSteps", () => {
  it("shows every step to owners and admins", () => {
    expect(visibleSteps(false)).toEqual(TOUR_STEPS);
  });

  it("drops admin-only steps for curators", () => {
    const ids = visibleSteps(true).map((s) => s.id);
    expect(ids).not.toContain("settings");
    expect(ids).toHaveLength(TOUR_STEPS.length - 1);
  });
});

describe("useTour", () => {
  it("starts at the first step and can't go back past it", () => {
    useTour.getState().start();
    useTour.getState().back();
    expect(useTour.getState()).toMatchObject({ active: true, index: 0 });
  });

  it("restarts from the beginning after stopping mid-way", () => {
    const tour = useTour.getState();
    tour.start();
    tour.next();
    tour.next();
    tour.stop();
    tour.start();
    expect(useTour.getState().index).toBe(0);
  });
});
