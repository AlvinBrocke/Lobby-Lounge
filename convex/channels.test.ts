import { convexTest } from "convex-test";
import { describe, it, expect, beforeEach } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

describe("channels", () => {
  it("list returns empty array initially", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const channels = await t.query(api.channels.list);
    expect(channels).toEqual([]);
  });

  it("create inserts a channel and list returns it", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    await t.mutation(api.channels.create, {
      name: "Dinner Jazz",
      category: "Elegant",
      bpm: 74,
    });
    const channels = await t.query(api.channels.list);
    expect(channels).toHaveLength(1);
    expect(channels[0].name).toBe("Dinner Jazz");
    expect(channels[0].category).toBe("Elegant");
    expect(channels[0].bpm).toBe(74);
  });

  it("get returns the channel by id", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const id = await t.mutation(api.channels.create, { name: "Lounge & Chill" });
    const channel = await t.query(api.channels.get, { id });
    expect(channel?.name).toBe("Lounge & Chill");
  });

  it("update patches only the provided fields", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const id = await t.mutation(api.channels.create, { name: "Old Name", bpm: 80 });
    await t.mutation(api.channels.update, { id, name: "New Name" });
    const channel = await t.query(api.channels.get, { id });
    expect(channel?.name).toBe("New Name");
    expect(channel?.bpm).toBe(80); // unchanged
  });

  it("remove deletes the channel", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const id = await t.mutation(api.channels.create, { name: "To Delete" });
    await t.mutation(api.channels.remove, { id });
    const channel = await t.query(api.channels.get, { id });
    expect(channel).toBeNull();
  });

  it("seed populates 8 channels", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const result = await t.mutation(api.channels.seed);
    expect(result).toBe("seeded");
    const channels = await t.query(api.channels.list);
    expect(channels).toHaveLength(8);
  });

  it("seed is idempotent — calling twice does not duplicate", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    await t.mutation(api.channels.seed);
    const result = await t.mutation(api.channels.seed);
    expect(result).toBe("already seeded");
    const channels = await t.query(api.channels.list);
    expect(channels).toHaveLength(8);
  });
});
