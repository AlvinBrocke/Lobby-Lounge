import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const USER = "user_owner1";
const OTHER = "user_other";

async function setup() {
  const t = convexTest(schema, import.meta.glob("./**/*.ts"));
  const playlistId = await t.run((ctx) =>
    ctx.db.insert("playlists", { name: "Lounge", curated: true, isPublic: true }),
  );
  return { t, playlistId };
}

describe("activity", () => {
  it("logs a schedule change for the owner", async () => {
    const { t, playlistId } = await setup();
    const asUser = t.withIdentity({ subject: USER, name: "Alex" });
    await asUser.mutation(api.scheduleBlocks.create, { playlistId, day: "Mon", startHour: 9, duration: 2 });
    const rows = await asUser.query(api.activity.listRecent, {});
    expect(rows[0].summary).toBe('Scheduled "Lounge" on Mon at 9 am');
    expect(rows[0].actorName).toBe("Alex");
  });

  it("files staff actions under the owner but names the staff member", async () => {
    const { t, playlistId } = await setup();
    const asStaff = t.withIdentity({ subject: "user_staff", name: "Sam", venue_owner: USER });
    await asStaff.mutation(api.scheduleBlocks.create, { playlistId, day: "Tue", startHour: 10, duration: 1 });
    const rows = await t.withIdentity({ subject: USER }).query(api.activity.listRecent, {});
    expect(rows[0].clerkUserId).toBe(USER);
    expect(rows[0].actorId).toBe("user_staff");
    expect(rows[0].actorName).toBe("Sam");
  });

  it("falls back to the email, then 'Someone', for the actor's name", async () => {
    const { t, playlistId } = await setup();
    await t
      .withIdentity({ subject: USER, email: "a@venue.test" })
      .mutation(api.scheduleBlocks.create, { playlistId, day: "Mon", startHour: 9, duration: 1 });
    await t.withIdentity({ subject: USER }).mutation(api.scheduleBlocks.create, { playlistId, day: "Tue", startHour: 9, duration: 1 });
    const rows = await t.withIdentity({ subject: USER }).query(api.activity.listRecent, {});
    expect(rows.map((r) => r.actorName)).toEqual(["Someone", "a@venue.test"]);
  });

  it("logs moves and removals with the block's label", async () => {
    const { t, playlistId } = await setup();
    const asUser = t.withIdentity({ subject: USER });
    const id = await asUser.mutation(api.scheduleBlocks.create, {
      playlistId, day: "Mon", startHour: 9, duration: 2, title: "Morning Jazz",
    });
    await asUser.mutation(api.scheduleBlocks.update, { id, day: "Tue", startHour: 13 });
    await asUser.mutation(api.scheduleBlocks.remove, { id });
    const rows = await asUser.query(api.activity.listRecent, {});
    expect(rows.map((r) => r.summary)).toEqual([
      'Removed "Morning Jazz" from Tue',
      'Updated "Morning Jazz" on Tue at 1 pm',
      'Scheduled "Morning Jazz" on Mon at 9 am',
    ]);
  });

  it("logs playlist changes", async () => {
    const { t } = await setup();
    const asUser = t.withIdentity({ subject: USER });
    const id = await asUser.mutation(api.playlists.create, { name: "Brunch" });
    await asUser.mutation(api.playlists.update, { id, name: "Sunday Brunch" });
    await asUser.mutation(api.playlists.remove, { id });
    const rows = await asUser.query(api.activity.listRecent, {});
    expect(rows.map((r) => r.summary)).toEqual([
      'Deleted playlist "Sunday Brunch"',
      'Updated playlist "Sunday Brunch"',
      'Created playlist "Brunch"',
    ]);
  });

  it("does not log a write that failed", async () => {
    const { t, playlistId } = await setup();
    const asUser = t.withIdentity({ subject: USER });
    await asUser.mutation(api.scheduleBlocks.create, { playlistId, day: "Mon", startHour: 9, duration: 2 });
    await expect(
      asUser.mutation(api.scheduleBlocks.create, { playlistId, day: "Mon", startHour: 10, duration: 1 }),
    ).rejects.toThrow();
    expect(await asUser.query(api.activity.listRecent, {})).toHaveLength(1);
  });

  it("never shows another venue's activity", async () => {
    const { t, playlistId } = await setup();
    await t.withIdentity({ subject: USER }).mutation(api.scheduleBlocks.create, { playlistId, day: "Mon", startHour: 9, duration: 2 });
    expect(await t.withIdentity({ subject: OTHER }).query(api.activity.listRecent, {})).toEqual([]);
  });

  it("returns at most 50, newest first", async () => {
    const { t } = await setup();
    await t.run(async (ctx) => {
      for (let i = 0; i < 55; i++) {
        await ctx.db.insert("activity", { clerkUserId: USER, actorId: USER, actorName: "Alex", summary: `#${i}` });
      }
    });
    const rows = await t.withIdentity({ subject: USER }).query(api.activity.listRecent, {});
    expect(rows).toHaveLength(50);
    expect(rows[0].summary).toBe("#54");
  });
});
