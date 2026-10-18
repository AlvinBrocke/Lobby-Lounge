import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const OWNER = "user_owner";
const STAFF = "user_staff";

// `venue_owner` is the claim the "convex" JWT template adds when the active
// Clerk organization is a venue (see requireUser in convex/lib/auth.ts).
describe("venue staff", () => {
  it("act on the owner's playlists, schedule and profile", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const asOwner = t.withIdentity({ subject: OWNER });
    const asStaff = t.withIdentity({ subject: STAFF, venue_owner: OWNER });
    await asOwner.mutation(api.userProfiles.createOrUpdate, { venueName: "Purple Spoon" });
    await asOwner.mutation(api.playlists.create, { name: "Brunch", isPublic: false });

    expect((await asStaff.query(api.userProfiles.get, {}))?.venueName).toBe("Purple Spoon");
    const [playlist] = await asStaff.query(api.playlists.listByUser, {});
    expect(playlist).toMatchObject({ name: "Brunch", clerkUserId: OWNER });

    await asStaff.mutation(api.playlists.update, { id: playlist._id, name: "Late brunch" });
    await asStaff.mutation(api.scheduleBlocks.create, { day: "Mon", startHour: 9, duration: 2, playlistId: playlist._id });
    expect(await asOwner.query(api.playlists.listByUser, {})).toEqual([expect.objectContaining({ name: "Late brunch" })]);
    expect(await asOwner.query(api.scheduleBlocks.listByUser, {})).toHaveLength(1);
  });

  it("fall back to their own data without a venue claim", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    await t.withIdentity({ subject: OWNER }).mutation(api.playlists.create, { name: "Brunch", isPublic: false });
    for (const venue_owner of [undefined, ""]) {
      expect(await t.withIdentity({ subject: STAFF, venue_owner }).query(api.playlists.listByUser, {})).toEqual([]);
    }
  });
});
