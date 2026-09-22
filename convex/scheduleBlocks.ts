import { mutation, query, type MutationCtx } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { assertOwner, requireUser } from "./lib/auth";

// Mirrored client-side in src/lib/schedule.ts — keep the two in sync.
const MAX_TITLE = 60;

const dayValidator = v.union(
  v.literal("Mon"),
  v.literal("Tue"),
  v.literal("Wed"),
  v.literal("Thu"),
  v.literal("Fri"),
  v.literal("Sat"),
  v.literal("Sun"),
);

function formatHour(h: number): string {
  if (h === 0 || h === 24) return "12 am";
  if (h === 12) return "12 pm";
  return h < 12 ? `${h} am` : `${h - 12} pm`;
}

interface BlockFields {
  day: string;
  startHour: number;
  duration: number;
  channelId?: Id<"channels">;
  title?: string;
}

/**
 * Validates a block as it will look after the write. Throws `ConvexError`
 * (rather than `Error`) so the message reaches the client intact — plain
 * errors are redacted to "Server Error" in production.
 */
async function validateBlock(
  ctx: MutationCtx,
  clerkUserId: string,
  block: BlockFields,
  ignoreId?: Id<"scheduleBlocks">,
) {
  const { day, startHour, duration } = block;

  if (!Number.isInteger(startHour) || startHour < 0 || startHour > 23) {
    throw new ConvexError("Start hour must be a whole hour between 0 and 23.");
  }
  if (!Number.isInteger(duration) || duration < 1) {
    throw new ConvexError("A block must last at least one hour.");
  }
  if (startHour + duration > 24) {
    throw new ConvexError("A block can't run past midnight — split it into two days.");
  }
  if (block.title !== undefined && block.title.length > MAX_TITLE) {
    throw new ConvexError(`Title must be ${MAX_TITLE} characters or fewer.`);
  }
  if (block.channelId !== undefined && !(await ctx.db.get(block.channelId))) {
    throw new ConvexError("That channel no longer exists.");
  }

  const existing = await ctx.db
    .query("scheduleBlocks")
    .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
    .collect();

  const clash = existing.find(
    (b: Doc<"scheduleBlocks">) =>
      b._id !== ignoreId &&
      b.day === day &&
      b.startHour < startHour + duration &&
      startHour < b.startHour + b.duration,
  );
  if (clash) {
    const name = clash.title ?? "another block";
    throw new ConvexError(
      `Overlaps "${name}" (${formatHour(clash.startHour)}–${formatHour(clash.startHour + clash.duration)}).`,
    );
  }
}

/** Trims the title and turns an empty one into "no title". */
function cleanTitle(title: string | undefined): string | undefined {
  const trimmed = title?.trim();
  return trimmed ? trimmed : undefined;
}

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const clerkUserId = await requireUser(ctx);
    return await ctx.db
      .query("scheduleBlocks")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .collect();
  },
});

export const create = mutation({
  args: {
    day: dayValidator,
    startHour: v.number(),
    duration: v.number(),
    channelId: v.id("channels"),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const clerkUserId = await requireUser(ctx);
    const block = { ...args, title: cleanTitle(args.title) };
    await validateBlock(ctx, clerkUserId, block);
    return await ctx.db.insert("scheduleBlocks", { ...block, clerkUserId });
  },
});

export const update = mutation({
  args: {
    id: v.id("scheduleBlocks"),
    day: v.optional(dayValidator),
    startHour: v.optional(v.number()),
    duration: v.optional(v.number()),
    channelId: v.optional(v.id("channels")),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const clerkUserId = await requireUser(ctx);
    const { id, ...fields } = args;

    const block = await ctx.db.get(id);
    assertOwner(block, clerkUserId, "Schedule block");

    const patch: Partial<BlockFields> = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined),
    );
    // An explicit empty title clears it; `undefined` in a patch removes the field.
    if (fields.title !== undefined) patch.title = cleanTitle(fields.title);

    // Validate the block as it will be after the patch, excluding itself from
    // the overlap check so moving a block within its own slot is allowed.
    await validateBlock(ctx, clerkUserId, { ...block, ...patch }, id);
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("scheduleBlocks") },
  handler: async (ctx, args) => {
    const clerkUserId = await requireUser(ctx);

    const block = await ctx.db.get(args.id);
    assertOwner(block, clerkUserId, "Schedule block");

    await ctx.db.delete(args.id);
  },
});
