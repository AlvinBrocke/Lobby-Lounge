import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const USER = "user_test123";
const OTHER = "user_other";

const base = {
  title: "Happy Hour",
  source: "ai" as const,
  message: "Cocktails 2-for-1 until 7pm.",
  pitch: 50,
  speed: 50,
  volumeBoost: 4,
  status: "scheduled" as const,
  days: ["Fri", "Mon"],
  occurrence: "once" as const,
  startMinute: 17 * 60,
  interruptMusic: false,
};

const setup = () => convexTest(schema, import.meta.glob("./**/*.ts"));

describe("announcements", () => {
  it("creates an announcement only its owner can see", async () => {
    const t = setup();
    await t.withIdentity({ subject: USER }).mutation(api.announcements.create, base);
    const mine = await t.withIdentity({ subject: USER }).query(api.announcements.listByUser, {});
    expect(mine).toHaveLength(1);
    expect(mine[0]).toMatchObject({ title: "Happy Hour", paused: false, days: ["Mon", "Fri"], audioUrl: null });
    expect(await t.withIdentity({ subject: OTHER }).query(api.announcements.listByUser, {})).toEqual([]);
  });

  it("rejects bad input with readable errors", async () => {
    const asUser = setup().withIdentity({ subject: USER });
    await expect(asUser.mutation(api.announcements.create, { ...base, title: "  " })).rejects.toThrow(/title/);
    await expect(asUser.mutation(api.announcements.create, { ...base, message: "" })).rejects.toThrow(/message/);
    await expect(asUser.mutation(api.announcements.create, { ...base, days: [] })).rejects.toThrow(/day/);
    await expect(asUser.mutation(api.announcements.create, { ...base, source: "upload" })).rejects.toThrow(/voiceover/);
    await expect(
      asUser.mutation(api.announcements.create, { ...base, occurrence: "multiple", endMinute: 16 * 60, everyMinutes: 30 }),
    ).rejects.toThrow(/end time/);
    await expect(
      asUser.mutation(api.announcements.create, { ...base, occurrence: "multiple", endMinute: 19 * 60, everyMinutes: 7 }),
    ).rejects.toThrow(/often/);
  });

  it("lets a draft have no days", async () => {
    const asUser = setup().withIdentity({ subject: USER });
    await asUser.mutation(api.announcements.create, { ...base, status: "draft", days: [] });
    expect(await asUser.query(api.announcements.listByUser, {})).toHaveLength(1);
  });

  it("stores a voiceover and deletes the file when switched to AI voice", async () => {
    const t = setup();
    const asUser = t.withIdentity({ subject: USER });
    const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["audio"], { type: "audio/webm" })));
    const id = await asUser.mutation(api.announcements.create, {
      ...base,
      source: "record",
      message: undefined,
      storageId,
      audioSeconds: 12,
    });
    const [saved] = await asUser.query(api.announcements.listByUser, {});
    expect(saved.message).toBeUndefined();
    expect(saved.audioUrl).toBeTruthy();

    await asUser.mutation(api.announcements.update, { id, ...base });
    expect(await t.run((ctx) => ctx.storage.getUrl(storageId))).toBeNull();
  });

  it("keeps the voiceover when an update doesn't replace it", async () => {
    const t = setup();
    const asUser = t.withIdentity({ subject: USER });
    const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["audio"])));
    const id = await asUser.mutation(api.announcements.create, { ...base, source: "upload", storageId, audioName: "a.mp3" });
    await asUser.mutation(api.announcements.update, { id, ...base, source: "upload", title: "Renamed" });
    const [saved] = await asUser.query(api.announcements.listByUser, {});
    expect(saved).toMatchObject({ title: "Renamed", storageId, audioName: "a.mp3" });
  });

  it("only the owner can pause, edit or delete", async () => {
    const t = setup();
    const id = await t.withIdentity({ subject: USER }).mutation(api.announcements.create, base);
    const asOther = t.withIdentity({ subject: OTHER });
    await expect(asOther.mutation(api.announcements.setPaused, { id, paused: true })).rejects.toThrow(/Not authorized/);
    await expect(asOther.mutation(api.announcements.update, { id, ...base })).rejects.toThrow(/Not authorized/);
    await expect(asOther.mutation(api.announcements.remove, { id })).rejects.toThrow(/Not authorized/);

    const asUser = t.withIdentity({ subject: USER });
    await asUser.mutation(api.announcements.setPaused, { id, paused: true });
    expect((await asUser.query(api.announcements.listByUser, {}))[0].paused).toBe(true);
    await asUser.mutation(api.announcements.remove, { id });
    expect(await asUser.query(api.announcements.listByUser, {})).toEqual([]);
  });
});
