import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const USER = "user_sched789";
const OTHER = "user_other";

describe("scheduleBlocks", () => {
  it("listByUser returns empty for new user", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const asUser = t.withIdentity({ subject: USER });
    const blocks = await asUser.query(api.scheduleBlocks.listByUser, {});
    expect(blocks).toEqual([]);
  });

  it("create adds a block visible via listByUser", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const asUser = t.withIdentity({ subject: USER });
    await asUser.mutation(api.scheduleBlocks.create, {
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
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const asUser = t.withIdentity({ subject: USER });
    const id = await asUser.mutation(api.scheduleBlocks.create, {
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
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const asUser = t.withIdentity({ subject: USER });
    const id = await asUser.mutation(api.scheduleBlocks.create, {
      day: "Wed",
      startHour: 8,
      duration: 3,
    });
    await asUser.mutation(api.scheduleBlocks.remove, { id });
    const blocks = await asUser.query(api.scheduleBlocks.listByUser, {});
    expect(blocks).toHaveLength(0);
  });

  it("listByUser is scoped — other users' blocks are not returned", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    await t.withIdentity({ subject: USER }).mutation(api.scheduleBlocks.create, {
      day: "Thu",
      startHour: 12,
      duration: 1,
    });
    await t.withIdentity({ subject: OTHER }).mutation(api.scheduleBlocks.create, {
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
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    await expect(t.query(api.scheduleBlocks.listByUser, {})).rejects.toThrow(
      /Not authenticated/,
    );
    await expect(
      t.mutation(api.scheduleBlocks.create, {
        day: "Mon",
        startHour: 9,
        duration: 1,
      }),
    ).rejects.toThrow(/Not authenticated/);

    const id = await t
      .withIdentity({ subject: USER })
      .mutation(api.scheduleBlocks.create, {
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
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const id = await t
      .withIdentity({ subject: USER })
      .mutation(api.scheduleBlocks.create, {
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
});
