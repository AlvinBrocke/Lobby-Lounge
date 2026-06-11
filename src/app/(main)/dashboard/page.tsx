"use client";

import { cn } from "@/lib/utils";
import { Clock, Music, Plus, Zap } from "lucide-react";
import { useEffect, useState } from "react";

/* ── Data ─────────────────────────────────────────────── */
const CHANNELS = [
  {
    id: "lounge",
    name: "Lounge & Chill",
    cat: "Relaxing",
    bpm: "72 BPM",
    img: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&h=600&fit=crop",
  },
  {
    id: "retail",
    name: "Retail Energy",
    cat: "Upbeat",
    bpm: "112 BPM",
    img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop",
  },
  {
    id: "focus",
    name: "Deep Focus",
    cat: "Productivity",
    bpm: "84 BPM",
    img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=600&fit=crop",
  },
  {
    id: "dinner",
    name: "Dinner Jazz",
    cat: "Elegant",
    bpm: "74 BPM",
    img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=600&fit=crop",
  },
  {
    id: "morning",
    name: "Morning Boost",
    cat: "Energetic",
    bpm: "108 BPM",
    img: "https://images.unsplash.com/photo-1498804103079-a6351b050096?w=600&h=600&fit=crop",
  },
  {
    id: "ambient",
    name: "Ambient Spa",
    cat: "Wellness",
    bpm: "60 BPM",
    img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop",
  },
];

const SCHEDULE = [
  { name: "Morning Boost", time: "8:00 AM", status: "done" as const },
  { name: "Lunch Rush Pop", time: "12:00 PM", status: "done" as const },
  { name: "Afternoon Chill", time: "3:00 PM", status: "now" as const },
  { name: "Evening Jazz", time: "7:00 PM", status: "upcoming" as const },
  { name: "Night Ambient", time: "10:00 PM", status: "upcoming" as const },
];

const TRACKS = [
  { num: 1, name: "Blue Bossa", artist: "Chet Baker Trio", energy: "low" as const, dur: "4:22" },
  { num: 2, name: "Autumn Leaves", artist: "Coltrane Quartet", energy: "low" as const, dur: "4:47" },
  { num: 3, name: "So What", artist: "Miles Davis", energy: "mid" as const, dur: "5:14" },
  { num: 4, name: "Fly Me to the Moon", artist: "Frank Sinatra", energy: "low" as const, dur: "3:08" },
  { num: 5, name: "Round Midnight", artist: "Thelonious Monk", energy: "mid" as const, dur: "5:32" },
];

type Channel = (typeof CHANNELS)[0];

/* ── Sub-components ───────────────────────────────────── */

function EqBars({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const heights =
    size === "sm"
      ? [8, 13, 10, 8, 13, 10]
      : size === "lg"
        ? [9, 15, 11, 19, 13, 17]
        : [9, 14, 11, 17, 13, 16];
  return (
    <div className="flex gap-[2.5px] items-end">
      {heights.map((h, i) => (
        <span
          key={i}
          className="eq-bar w-[2.5px]"
          style={{ height: h }}
        />
      ))}
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex-1 flex items-center gap-3.5 px-[18px] py-3.5 bg-card border border-border rounded-xl">
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
        {icon}
      </div>
      <div>
        <div
          className="font-bold text-[19px] leading-[1.1] text-foreground"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {value}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
      </div>
    </div>
  );
}

function HeroSection({ channel }: { channel: Channel }) {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-border">
      {/* Blurred background */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-110"
        style={{
          backgroundImage: `url('${channel.img}')`,
          filter: "blur(24px) saturate(1.4)",
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(13,30,68,0.93)] via-[rgba(10,20,40,0.96)] to-[rgba(8,30,28,0.93)]" />

      <div className="relative z-10 flex items-center gap-7 px-8 py-7 min-h-[162px]">
        {/* Album art */}
        <div className="relative w-[110px] h-[110px] rounded-xl overflow-hidden shrink-0 border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={channel.img.replace("w=600&h=600", "w=300&h=300")}
            alt={channel.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" style={{ background: 'rgba(0,0,0,0.22)' }} />
          <div className="absolute bottom-[7px] left-[7px]">
            <EqBars size="lg" />
          </div>
        </div>

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="hero-pip w-[7px] h-[7px] rounded-full bg-primary shrink-0" />
            <span className="text-[10px] font-bold tracking-[0.14em] text-primary uppercase">
              Now Playing
            </span>
          </div>
          <div
            className="text-[27px] font-bold text-white mb-1 tracking-tight leading-tight"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Evening Lounge Jazz
          </div>
          <div className="text-[13px] text-white/54 mb-3.5">
            Lobby &amp; Lounge · Signature Mix
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-[11px] font-semibold text-white/72 bg-white/10 border border-white/14 px-2.5 py-1 rounded-full">
              72 BPM
            </span>
            <span className="text-[11px] font-semibold text-white/72 bg-white/10 border border-white/14 px-2.5 py-1 rounded-full">
              F Major
            </span>
            <span className="text-[11px] font-semibold text-blue-300 bg-blue-400/18 border border-blue-400/25 px-2.5 py-1 rounded-full">
              Low Energy
            </span>
          </div>
        </div>

        {/* Channel stats */}
        <div className="shrink-0 flex flex-col gap-3.5 items-end">
          <div className="text-right">
            <div className="text-[9px] font-bold tracking-[0.12em] text-white/40 uppercase mb-1">
              Active Channel
            </div>
            <div
              className="text-[17px] font-bold text-primary"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              {channel.name}
            </div>
          </div>
          <div className="w-full h-px bg-white/8" />
          <div className="flex gap-7">
            <div className="text-center">
              <div
                className="text-[22px] font-bold text-white leading-none"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                128
              </div>
              <div className="text-[11px] text-white/44 mt-1">Tracks</div>
            </div>
            <div className="text-center">
              <div
                className="text-[22px] font-bold text-white leading-none"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                2h 15m
              </div>
              <div className="text-[11px] text-white/44 mt-1">Queued</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChannelTile({
  channel,
  active,
  onClick,
}: {
  channel: Channel;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative aspect-square rounded-xl overflow-hidden block transition-transform duration-200 hover:scale-[1.04]",
        active ? "outline outline-2 outline-primary outline-offset-2" : "",
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={channel.img}
        alt={channel.name}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      {/* Scrim */}
      <div
        className={cn(
          "absolute inset-0 bg-black/[0.52] transition-opacity duration-200",
          active ? "!opacity-30" : "group-hover:opacity-[0.28]",
        )}
      />
      {/* Category tag */}
      <div className="absolute top-[9px] left-[9px] text-[8px] font-bold tracking-[0.12em] text-white/60 uppercase">
        {channel.cat.toUpperCase()}
      </div>
      {/* EQ (active) or Play (hover) */}
      {active ? (
        <div className="absolute top-[9px] right-[9px] flex gap-[2.5px] items-end h-5">
          <EqBars size="sm" />
        </div>
      ) : (
        <div className="absolute top-[9px] right-[9px] w-[26px] h-[26px] rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-[#04201d]">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
      )}
      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 px-[9px] pb-[9px] pt-5 bg-gradient-to-t from-black/72 to-transparent">
        <div className="text-[11px] font-bold text-white leading-tight">
          {channel.name}
        </div>
        <div className="text-[9px] text-white/55 mt-0.5">{channel.bpm}</div>
      </div>
    </button>
  );
}

function ScheduleRow({
  item,
}: {
  item: (typeof SCHEDULE)[0];
}) {
  const isNow = item.status === "now";
  const isDone = item.status === "done";
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-2.5 py-[9px] rounded-lg border",
        isNow
          ? "bg-primary/7 border-primary/14"
          : "border-transparent",
        isDone ? "opacity-45" : "",
      )}
    >
      <span
        className={cn(
          "w-[9px] h-[9px] rounded-full shrink-0",
          isNow
            ? "bg-primary live-dot"
            : isDone
              ? "bg-muted-foreground"
              : "bg-border",
        )}
        style={
          isNow
            ? { boxShadow: "0 0 0 4px rgba(78,205,196,0.18)" }
            : undefined
        }
      />
      <div className="flex-1">
        <div
          className={cn(
            "text-[13px] font-semibold",
            isNow ? "text-primary" : isDone ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {item.name}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">{item.time}</div>
      </div>
      {isNow && (
        <span className="text-[9px] font-bold tracking-[0.1em] text-primary bg-primary/14 px-2 py-0.5 rounded-full shrink-0">
          NOW
        </span>
      )}
    </div>
  );
}

function TrackRow({ track }: { track: (typeof TRACKS)[0] }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="flex items-center gap-3 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-secondary transition-colors"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="font-mono text-[11px] text-muted-foreground w-[18px] text-center shrink-0 flex items-center justify-center">
        {hovered ? (
          <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor" className="text-primary">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        ) : (
          track.num
        )}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-foreground truncate">
          {track.name}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5 truncate">
          {track.artist}
        </div>
      </div>
      <span
        className={cn(
          "text-[9px] font-bold tracking-[0.1em] px-2 py-[3px] rounded-full shrink-0",
          track.energy === "low"
            ? "text-blue-400 bg-blue-400/12"
            : "text-emerald-400 bg-emerald-400/12",
        )}
      >
        {track.energy === "low" ? "LOW" : "MID"}
      </span>
      <span className="font-mono text-[11px] text-muted-foreground min-w-[32px] text-right">
        {track.dur}
      </span>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────── */
export default function Dashboard() {
  const [activeChannel, setActiveChannel] = useState(CHANNELS[0]);

  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      <div className="flex gap-3.5">
        <StatCard
          icon={<Clock className="w-[15px] h-[15px]" />}
          value="6h 42m"
          label="Playing today"
        />
        <StatCard
          icon={<Music className="w-[15px] h-[15px]" />}
          value="247"
          label="Tracks served"
        />
        <StatCard
          icon={<Zap className="w-[15px] h-[15px]" />}
          value="Low / Chill"
          label="Current energy"
        />
      </div>

      {/* Hero */}
      <HeroSection channel={activeChannel} />

      {/* Channels */}
      <section className="flex flex-col gap-3.5">
        <div className="flex items-start justify-between">
          <div>
            <h2
              className="text-[17px] font-bold text-foreground tracking-tight"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Your Channels
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tap to switch atmosphere instantly
            </p>
          </div>
          <button className="text-[13px] font-semibold text-primary bg-transparent">
            Browse all →
          </button>
        </div>
        <div className="grid grid-cols-6 gap-3">
          {CHANNELS.map((ch) => (
            <ChannelTile
              key={ch.id}
              channel={ch}
              active={ch.id === activeChannel.id}
              onClick={() => setActiveChannel(ch)}
            />
          ))}
        </div>
      </section>

      {/* Schedule + Recently Played */}
      <div className="grid grid-cols-[1fr_1.4fr] gap-4">
        {/* Schedule */}
        <div className="bg-card border border-border rounded-2xl p-[22px] flex flex-col gap-[18px]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3
                className="text-[17px] font-bold text-foreground tracking-tight"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Today&apos;s Schedule
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Automatic atmosphere changes
              </p>
            </div>
            <button className="flex items-center gap-1 bg-primary text-[#04201d] rounded-lg px-2.5 py-[7px] text-[11px] font-bold shrink-0 hover:opacity-90 transition-opacity">
              <Plus className="w-3 h-3" />
              Add
            </button>
          </div>
          <div className="flex flex-col gap-0.5">
            {SCHEDULE.map((item) => (
              <ScheduleRow key={item.name} item={item} />
            ))}
          </div>
        </div>

        {/* Recently Played */}
        <div className="bg-card border border-border rounded-2xl p-[22px] flex flex-col gap-[18px]">
          <div>
            <h3
              className="text-[17px] font-bold text-foreground tracking-tight"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Recently Played
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Last 5 tracks
            </p>
          </div>
          <div className="flex flex-col gap-0.5">
            {TRACKS.map((track) => (
              <TrackRow key={track.num} track={track} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
