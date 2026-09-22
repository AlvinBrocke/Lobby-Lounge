import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const USER = "user_sched789";
const OTHER = "user_other";

/** Fresh test backend with one channel to schedule. */
async function setup() {
  const t = convexTest(schema, import.meta.glob("./**/*.ts"));
  const channelId = await t.run((ctx) => ctx.db.insert("channels", { name: "Lounge" }));
  return { t, channelId };
}

describe("scheduleBlocks", () => {
  it("listByUser returns empty for new user", async () => {
    const { t } = await setup();
    const asUser = t.withIdentity({ subject: USER });
    const blocks = await asUser.query(api.scheduleBlocks.listByUser, {});
    expect(blocks).toEqual([]);
  });

  it("create adds a block visible via listByUser", async () => {
    const { t, channelId } = await setup();
    const asUser = t.withIdentity({ subject: USER });
    await asUser.mutation(api.scheduleBlocks.create, {
      channelId,
      day: "Mon",
      startHour: 9,
      duration: 2,
      title: "Morning Jazz",
    });
    const blocks = await asUser.query(api.scheduleBlocks.listByUser, {});
    expect(blocks).toHaveLength(1);
    expect(blocks[0].clerkUserId).toBe(USER);
    expect(blocks[0].day).toBe("Mon");
    expect(blocks[0].startHour).toBe(9);
    expect(blocks[0].title).toBe("Morning Jazz");
  });

  it("update patches provided fields only", async () => {
    const { t, channelId } = await setup();
    const asUser = t.withIdentity({ subject: USER });
    const id = await asUser.mutation(api.scheduleBlocks.create, {
      channelId,
      day: "Tue",
      startHour: 10,
      duration: 1,
    });
    await asUser.mutation(api.scheduleBlocks.update, {
      id,
      startHour: 11,
      title: "Late Start",
    });
    const blocks = await asUser.query(api.scheduleBlocks.listByUser, {});
    expect(blocks[0].startHour).toBe(11);
    expect(blocks[0].title).toBe("Late Start");
    expect(blocks[0].day).toBe("Tue"); // unchanged
  });

  it("remove deletes the block", async () => {
    const { t, channelId } = await setup();
    const asUser = t.withIdentity({ subject: USER });
    const id = await asUser.mutation(api.scheduleBlocks.create, {
      channelId,
      day: "Wed",
      startHour: 8,
      duration: 3,
    });
    await asUser.mutation(api.scheduleBlocks.remove, { id });
    const blocks = await asUser.query(api.scheduleBlocks.listByUser, {});
    expect(blocks).toHaveLength(0);
  });

  it("listByUser is scoped — other users' blocks are not returned", async () => {
    const { t, channelId } = await setup();
    await t.withIdentity({ subject: USER }).mutation(api.scheduleBlocks.create, {
      channelId,
      day: "Thu",
      startHour: 12,
      duration: 1,
    });
    await t.withIdentity({ subject: OTHER }).mutation(api.scheduleBlocks.create, {
      channelId,
      day: "Thu",
      startHour: 14,
      duration: 2,
    });
    const blocks = await t
      .withIdentity({ subject: USER })
      .query(api.scheduleBlocks.listByUser, {});
    expect(blocks).toHaveLength(1);
    expect(blocks[0].clerkUserId).toBe(USER);
  });

  it("rejects unauthenticated calls", async () => {
    const { t, channelId } = await setup();
    await expect(t.query(api.scheduleBlocks.listByUser, {})).rejects.toThrow(
      /Not authenticated/,
    );
    await expect(
      t.mutation(api.scheduleBlocks.create, {
      channelId,
        day: "Mon",
        startHour: 9,
        duration: 1,
      }),
    ).rejects.toThrow(/Not authenticated/);

    const id = await t
      .withIdentity({ subject: USER })
      .mutation(api.scheduleBlocks.create, {
      channelId,
        day: "Mon",
        startHour: 9,
        duration: 1,
      });
    await expect(
      t.mutation(api.scheduleBlocks.update, { id, startHour: 10 }),
    ).rejects.toThrow(/Not authenticated/);
    await expect(t.mutation(api.scheduleBlocks.remove, { id })).rejects.toThrow(
      /Not authenticated/,
    );
  });

  it("another user cannot update or remove someone else's block", async () => {
    const { t, channelId } = await setup();
    const id = await t
      .withIdentity({ subject: USER })
      .mutation(api.scheduleBlocks.create, {
      channelId,
        day: "Fri",
        startHour: 18,
        duration: 4,
        title: "Happy Hour",
      });

    const asOther = t.withIdentity({ subject: OTHER });
    await expect(
      asOther.mutation(api.scheduleBlocks.update, { id, title: "Hijacked" }),
    ).rejects.toThrow(/Not authorized/);
    await expect(
      asOther.mutation(api.scheduleBlocks.remove, { id }),
    ).rejects.toThrow(/Not authorized/);

    // Untouched
    const blocks = await t
      .withIdentity({ subject: USER })
      .query(api.scheduleBlocks.listByUser, {});
    expect(blocks).toHaveLength(1);
    expect(blocks[0].title).toBe("Happy Hour");
  });

  describe("validation", () => {
    it("rejects out-of-range hours and durations", async () => {
      const { t, channelId } = await setup();
      const asUser = t.withIdentity({ subject: USER });
      const base = { channelId, day: "Mon" as const };
      await expect(
        asUser.mutation(api.scheduleBlocks.create, { ...base, startHour: 24, duration: 1 }),
      ).rejects.toThrow(/between 0 and 23/);
      await expect(
        asUser.mutation(api.scheduleBlocks.create, { ...base, startHour: 9.5, duration: 1 }),
      ).rejects.toThrow(/between 0 and 23/);
      await expect(
        asUser.mutation(api.scheduleBlocks.create, { ...base, startHour: 9, duration: 0 }),
      ).rejects.toThrow(/at least one hour/);
    });

    it("rejects blocks that run past midnight", async () => {
      const { t, channelId } = await setup();
      await expect(
        t.withIdentity({ subject: USER }).mutation(api.scheduleBlocks.create, {
          channelId,
          day: "Sat",
          startHour: 22,
          duration: 3,
        }),
      ).rejects.toThrow(/past midnight/);
    });

    it("rejects an unknown day", async () => {
      const { t, channelId } = await setup();
      await expect(
        t.withIdentity({ subject: USER }).mutation(api.scheduleBlocks.create, {
          channelId,
          // @ts-expect-error — deliberately invalid
          day: "Funday",
          startHour: 9,
          duration: 1,
        }),
      ).rejects.toThrow();
    });

    it("rejects a channel that no longer exists", async () => {
      const { t, channelId } = await setup();
      await t.run((ctx) => ctx.db.delete(channelId));
      await expect(
        t.withIdentity({ subject: USER }).mutation(api.scheduleBlocks.create, {
          channelId,
          day: "Mon",
          startHour: 9,
          duration: 1,
        }),
      ).rejects.toThrow(/no longer exists/);
    });

    it("rejects overlapping blocks on create but allows adjacent ones", async () => {
      const { t, channelId } = await setup();
      const asUser = t.withIdentity({ subject: USER });
      await asUser.mutation(api.scheduleBlocks.create, {
        channelId,
        day: "Tue",
        startHour: 12,
        duration: 2,
        title: "Lunch",
      });
      await expect(
        asUser.mutation(api.scheduleBlocks.create, {
          channelId,
          day: "Tue",
          startHour: 13,
          duration: 2,
        }),
      ).rejects.toThrow(/Overlaps "Lunch"/);

      // Touching edges (12–14 then 14–16) and other days are fine.
      await asUser.mutation(api.scheduleBlocks.create, {
        channelId,
        day: "Tue",
        startHour: 14,
        duration: 2,
      });
      await asUser.mutation(api.scheduleBlocks.create, {
        channelId,
        day: "Wed",
        startHour: 12,
        duration: 2,
      });
      expect(await asUser.query(api.scheduleBlocks.listByUser, {})).toHaveLength(3);
    });

    it("does not count another user's blocks as overlaps", async () => {
      const { t, channelId } = await setup();
      const block = { channelId, day: "Thu" as const, startHour: 9, duration: 3 };
      await t.withIdentity({ subject: OTHER }).mutation(api.scheduleBlocks.create, block);
      await t.withIdentity({ subject: USER }).mutation(api.scheduleBlocks.create, block);
    });

    it("rejects overlapping blocks on update, but not with itself", async () => {
      const { t, channelId } = await setup();
      const asUser = t.withIdentity({ subject: USER });
      const morning = await asUser.mutation(api.scheduleBlocks.create, {
        channelId,
        day: "Fri",
        startHour: 8,
        duration: 3,
      });
      await asUser.mutation(api.scheduleBlocks.create, {
        channelId,
        day: "Fri",
        startHour: 12,
        duration: 2,
      });

      // Growing within its own slot and into the free hour is fine.
      await asUser.mutation(api.scheduleBlocks.update, { id: morning, startHour: 9 });
      await asUser.mutation(api.scheduleBlocks.update, { id: morning, duration: 3 });

      await expect(
        asUser.mutation(api.scheduleBlocks.update, { id: morning, duration: 4 }),
      ).rejects.toThrow(/Overlaps/);
    });

    it("trims titles and clears empty ones", async () => {
      const { t, channelId } = await setup();
      const asUser = t.withIdentity({ subject: USER });
      const id = await asUser.mutation(api.scheduleBlocks.create, {
        channelId,
        day: "Sun",
        startHour: 10,
        duration: 2,
        title: "  Brunch  ",
      });
      expect((await asUser.query(api.scheduleBlocks.listByUser, {}))[0].title).toBe("Brunch");

      await asUser.mutation(api.scheduleBlocks.update, { id, title: "   " });
      expect((await asUser.query(api.scheduleBlocks.listByUser, {}))[0].title).toBeUndefined();
    });
  });
});
