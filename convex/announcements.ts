import { mutation, query, type MutationCtx } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { assertOwner, requireUser } from "./lib/auth";

// Mirrored client-side in src/lib/announcements.ts — keep the two in sync.
const MAX_TITLE = 60;
const MAX_MESSAGE = 300;
const MAX_AUDIO_SECONDS = 45;
const MAX_AUDIO_BYTES = 10 * 1024 * 1024;
const EVERY_MINUTES = [15, 30, 60];
const VOLUME_BOOSTS = [0, 2, 4, 6];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const fields = {
  title: v.string(),
  source: v.union(v.literal("ai"), v.literal("record"), v.literal("upload")),
  message: v.optional(v.string()),
  // Omitted on update = keep the current voiceover.
  storageId: v.optional(v.id("_storage")),
  audioName: v.optional(v.string()),
  audioSeconds: v.optional(v.number()),
  voiceName: v.optional(v.string()),
  pitch: v.number(),
  speed: v.number(),
  volumeBoost: v.number(),
  status: v.union(v.literal("scheduled"), v.literal("draft")),
  days: v.array(v.string()),
  occurrence: v.union(v.literal("once"), v.literal("multiple")),
  startMinute: v.number(),
  endMinute: v.optional(v.number()),
  everyMinutes: v.optional(v.number()),
  interruptMusic: v.boolean(),
};

type Fields = {
  title: string;
  source: "ai" | "record" | "upload";
  message?: string;
  storageId?: Id<"_storage">;
  audioName?: string;
  audioSeconds?: number;
  voiceName?: string;
  pitch: number;
  speed: number;
  volumeBoost: number;
  status: "scheduled" | "draft";
  days: string[];
  occurrence: "once" | "multiple";
  startMinute: number;
  endMinute?: number;
  everyMinutes?: number;
  interruptMusic: boolean;
};

const isMinute = (m: number) => Number.isInteger(m) && m >= 0 && m < 24 * 60;

/**
 * Cleans and validates an announcement as it will be stored. Throws
 * `ConvexError` so the message reaches the client intact (plain errors are
 * redacted to "Server Error" in production).
 */
async function clean(ctx: MutationCtx, a: Fields): Promise<Fields> {
  const title = a.title.trim();
  if (!title) throw new ConvexError("Give the announcement a title.");
  if (title.length > MAX_TITLE) throw new ConvexError(`Title must be ${MAX_TITLE} characters or fewer.`);

  const out: Fields = { ...a, title, days: DAYS.filter((d) => a.days.includes(d)) };

  if (a.source === "ai") {
    const message = a.message?.trim() ?? "";
    if (!message) throw new ConvexError("Write the message to announce.");
    if (message.length > MAX_MESSAGE) throw new ConvexError(`Messages must be ${MAX_MESSAGE} characters or fewer.`);
    out.message = message;
    // A script needs no audio file; drop any left over from an earlier version.
    out.storageId = undefined;
    out.audioName = undefined;
    out.audioSeconds = undefined;
  } else {
    if (!a.storageId) throw new ConvexError("Add a voiceover before saving.");
    // `_storage` is a system table: it has each file's size and content type.
    const file = await ctx.db.system.get(a.storageId);
    if (!file) throw new ConvexError("That voiceover upload has expired. Add it again.");
    if (file.size > MAX_AUDIO_BYTES) throw new ConvexError("The audio file must be smaller than 10 MB.");
    if (a.audioSeconds !== undefined && a.audioSeconds > MAX_AUDIO_SECONDS + 1) {
      throw new ConvexError(`Keep voiceovers to ${MAX_AUDIO_SECONDS} seconds or less.`);
    }
    out.message = undefined;
    out.voiceName = undefined;
  }

  if (![a.pitch, a.speed].every((n) => Number.isInteger(n) && n >= 0 && n <= 100)) {
    throw new ConvexError("Pitch and speed must be between 0 and 100.");
  }
  if (!VOLUME_BOOSTS.includes(a.volumeBoost)) throw new ConvexError("Pick a volume from the list.");
  if (!isMinute(a.startMinute)) throw new ConvexError("Pick a valid start time.");

  if (a.occurrence === "multiple") {
    if (a.endMinute === undefined || !isMinute(a.endMinute) || a.endMinute <= a.startMinute) {
      throw new ConvexError("The end time must be after the start time.");
    }
    if (a.everyMinutes === undefined || !EVERY_MINUTES.includes(a.everyMinutes)) {
      throw new ConvexError("Pick how often it repeats.");
    }
  } else {
    out.endMinute = undefined;
    out.everyMinutes = undefined;
  }

  if (a.status === "scheduled" && out.days.length === 0) {
    throw new ConvexError("Pick at least one day.");
  }
  return out;
}

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const clerkUserId = await requireUser(ctx);
    const rows = await ctx.db
      .query("announcements")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .order("desc")
      .collect();
    return await Promise.all(
      rows.map(async (a) => ({
        ...a,
        audioUrl: a.storageId ? await ctx.storage.getUrl(a.storageId) : null,
      })),
    );
  },
});

/** Step one of a voiceover upload: a short-lived URL the browser POSTs the file to. */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: fields,
  handler: async (ctx, args) => {
    const clerkUserId = await requireUser(ctx);
    const announcement = await clean(ctx, args);
    return await ctx.db.insert("announcements", { ...announcement, clerkUserId, paused: false });
  },
});

export const update = mutation({
  args: { id: v.id("announcements"), ...fields },
  handler: async (ctx, { id, ...args }) => {
    const clerkUserId = await requireUser(ctx);
    const existing = await ctx.db.get(id);
    assertOwner(existing, clerkUserId, "Announcement");

    // Keep the current voiceover unless a new one was uploaded.
    const storageId = args.storageId ?? existing.storageId;
    const announcement = await clean(ctx, {
      ...args,
      storageId,
      audioName: args.storageId ? args.audioName : existing.audioName,
      audioSeconds: args.storageId ? args.audioSeconds : existing.audioSeconds,
    });
    await ctx.db.replace(id, { ...announcement, clerkUserId, paused: existing.paused });

    // The old file is orphaned once replaced (or once switched to AI voice).
    if (existing.storageId && existing.storageId !== announcement.storageId) {
      await ctx.storage.delete(existing.storageId);
    }
  },
});

export const setPaused = mutation({
  args: { id: v.id("announcements"), paused: v.boolean() },
  handler: async (ctx, { id, paused }) => {
    const clerkUserId = await requireUser(ctx);
    const existing = await ctx.db.get(id);
    assertOwner(existing, clerkUserId, "Announcement");
    await ctx.db.patch(id, { paused });
  },
});

export const remove = mutation({
  args: { id: v.id("announcements") },
  handler: async (ctx, { id }) => {
    const clerkUserId = await requireUser(ctx);
    const existing = await ctx.db.get(id);
    assertOwner(existing, clerkUserId, "Announcement");
    await ctx.db.delete(id);
    if (existing.storageId) await ctx.storage.delete(existing.storageId);
  },
});
