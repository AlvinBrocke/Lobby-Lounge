import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const USER = "user_react123";
const OTHER = "user_other";

async function setup() {
  const t = convexTest(schema, import.meta.glob("./**/*.ts"));
  const trackId = await t.run((ctx) =>
    ctx.db.insert("tracks", { name: "Blue Hour", artist: "Trio", audioUrl: "https://a/1.mp3" }),
  );
  return { t, trackId };
}

describe("trackReactions", () => {
  it("loves a track and lists it without its audio URL", async () => {
    const { t, trackId } = await setup();
    const asUser = t.withIdentity({ subject: USER });
    await asUser.mutation(api.trackReactions.set, { trackId, kind: "like" });
    const rows = await asUser.query(api.trackReactions.listMine, {});
    expect(rows).toEqual([expect.objectContaining({ trackId, kind: "like", name: "Blue Hour" })]);
    expect(rows[0]).not.toHaveProperty("audioUrl");
  });

  it("blocking a loved track replaces the love; null clears it", async () => {
    const { t, trackId } = await setup();
    const asUser = t.withIdentity({ subject: USER });
    await asUser.mutation(api.trackReactions.set, { trackId, kind: "like" });
    await asUser.mutation(api.trackReactions.set, { trackId, kind: "block" });
    expect((await asUser.query(api.trackReactions.listMine, {})).map((r) => r.kind)).toEqual(["block"]);
    await asUser.mutation(api.trackReactions.set, { trackId, kind: null });
    expect(await asUser.query(api.trackReactions.listMine, {})).toEqual([]);
  });

  it("keeps each venue's reactions separate", async () => {
    const { t, trackId } = await setup();
    await t.withIdentity({ subject: USER }).mutation(api.trackReactions.set, { trackId, kind: "block" });
    expect(await t.withIdentity({ subject: OTHER }).query(api.trackReactions.listMine, {})).toEqual([]);
  });

  it("requires sign-in", async () => {
    const { t, trackId } = await setup();
    await expect(t.mutation(api.trackReactions.set, { trackId, kind: "like" })).rejects.toThrow("Not authenticated");
  });
});
