import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const USER = "user_sched789";

describe("scheduleBlocks", () => {
  it("listByUser returns empty for new user", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const blocks = await t.query(api.scheduleBlocks.listByUser, { clerkUserId: USER });
    expect(blocks).toEqual([]);
  });

  it("create adds a block visible via listByUser", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    await t.mutation(api.scheduleBlocks.create, {
      clerkUserId: USER,
      day: "Mon",
      startHour: 9,
      duration: 2,
      title: "Morning Jazz",
    });
    const blocks = await t.query(api.scheduleBlocks.listByUser, { clerkUserId: USER });
    expect(blocks).toHaveLength(1);
    expect(blocks[0].day).toBe("Mon");
    expect(blocks[0].startHour).toBe(9);
    expect(blocks[0].title).toBe("Morning Jazz");
  });

  it("update patches provided fields only", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const id = await t.mutation(api.scheduleBlocks.create, {
      clerkUserId: USER,
      day: "Tue",
      startHour: 10,
      duration: 1,
    });
    await t.mutation(api.scheduleBlocks.update, { id, startHour: 11, title: "Late Start" });
    const blocks = await t.query(api.scheduleBlocks.listByUser, { clerkUserId: USER });
    expect(blocks[0].startHour).toBe(11);
    expect(blocks[0].title).toBe("Late Start");
    expect(blocks[0].day).toBe("Tue"); // unchanged
  });

  it("remove deletes the block", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const id = await t.mutation(api.scheduleBlocks.create, {
      clerkUserId: USER,
      day: "Wed",
      startHour: 8,
      duration: 3,
    });
    await t.mutation(api.scheduleBlocks.remove, { id });
    const blocks = await t.query(api.scheduleBlocks.listByUser, { clerkUserId: USER });
    expect(blocks).toHaveLength(0);
  });

  it("listByUser is scoped — other users' blocks are not returned", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    await t.mutation(api.scheduleBlocks.create, {
      clerkUserId: USER,
      day: "Thu",
      startHour: 12,
      duration: 1,
    });
    await t.mutation(api.scheduleBlocks.create, {
      clerkUserId: "other_user",
      day: "Thu",
      startHour: 14,
      duration: 2,
    });
    const blocks = await t.query(api.scheduleBlocks.listByUser, { clerkUserId: USER });
    expect(blocks).toHaveLength(1);
    expect(blocks[0].clerkUserId).toBe(USER);
  });
});
