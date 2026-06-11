"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Clock,
  Download,
  Heart,
  MoreHorizontal,
  Play,
  Share2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: {
    title: string;
    description: string;
    image: string;
    gradient: string;
  } | null;
}

// Mock Tracks Data
const mockTracks = [
  {
    id: 1,
    title: "Midnight City",
    artist: "M83",
    album: "Hurry Up, We're Dreaming",
    duration: "4:03",
  },
  {
    id: 2,
    title: "Safe and Sound",
    artist: "Capital Cities",
    album: "In a Tidal Wave of Mystery",
    duration: "3:13",
  },
  {
    id: 3,
    title: "Electric Feel",
    artist: "MGMT",
    album: "Oracular Spectacular",
    duration: "3:49",
  },
  {
    id: 4,
    title: "Walking On A Dream",
    artist: "Empire of the Sun",
    album: "Walking on a Dream",
    duration: "3:18",
  },
  {
    id: 5,
    title: "Waves",
    artist: "Mr. Probz",
    album: "Waves",
    duration: "2:54",
  },
  {
    id: 6,
    title: "Stolen Dance",
    artist: "Milky Chance",
    album: "Sadnecessary",
    duration: "5:13",
  },
  {
    id: 7,
    title: "Riptide",
    artist: "Vance Joy",
    album: "God Loves You When You're Dancing",
    duration: "3:24",
  },
  {
    id: 8,
    title: "Take Me to Church",
    artist: "Hozier",
    album: "Hozier",
    duration: "4:02",
  },
  {
    id: 9,
    title: "Ophelia",
    artist: "The Lumineers",
    album: "Cleopatra",
    duration: "2:40",
  },
  {
    id: 10,
    title: "Renegades",
    artist: "X Ambassadors",
    album: "VHS",
    duration: "3:14",
  },
];

export function PlaylistModal({
  isOpen,
  onClose,
  playlist,
}: PlaylistModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      setTimeout(() => setIsVisible(false), 300); // Wait for animation
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-all duration-300",
        isOpen
          ? "bg-black/60 backdrop-blur-sm"
          : "bg-black/0 backdrop-blur-none pointer-events-none",
      )}
    >
      <div
        className={cn(
          "bg-white dark:bg-[#121212] w-full max-w-4xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col transform transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          isOpen
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-8 opacity-0 scale-95",
        )}
      >
        {/* Header / Cover Art Overlay */}
        <div
          className={cn(
            "relative h-64 md:h-80 flex-shrink-0 bg-gradient-to-br",
            playlist?.gradient || "from-gray-500 to-gray-700",
          )}
        >
          <div className="absolute inset-0 bg-black/20" />

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-full z-10"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </Button>

          <div className="absolute bottom-0 left-0 right-0 p-8 flex items-end space-x-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <div className="w-40 h-40 md:w-52 md:h-52 rounded-2xl shadow-2xl overflow-hidden border border-white/10 flex-shrink-0 relative">
              <Image
                src={playlist?.image || ""}
                alt={playlist?.title || ""}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 mb-2">
              <span className="text-xs md:text-sm font-bold text-white/80 uppercase tracking-widest mb-1 block">
                Playlist
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-2 truncate shadow-black/20 drop-shadow-lg">
                {playlist?.title}
              </h2>
              <p className="text-white/70 text-sm md:text-base line-clamp-2 max-w-xl">
                {playlist?.description}
              </p>

              <div className="flex items-center space-x-2 mt-4 text-xs font-semibold text-white/60">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={20}
                  height={20}
                  className="w-5 h-5 rounded-full bg-white/10"
                />
                <span>Lobby Lounge</span>
                <span>•</span>
                <span>1,234 likes</span>
                <span>•</span>
                <span>3h 45min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between px-8 py-4 bg-background border-b border-border/40">
          <div className="flex items-center space-x-4">
            <Button
              size="icon"
              className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:scale-105 transition-transform"
            >
              <Play className="w-6 h-6 ml-1 fill-current" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
            >
              <Heart className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
            >
              <Download className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
            >
              <MoreHorizontal className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Tracks List */}
        <div className="flex-1 overflow-hidden bg-background">
          <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 px-8 py-2 text-sm font-semibold text-muted-foreground border-b border-border/40 sticky top-0 bg-background z-10">
            <div className="w-8 text-center">#</div>
            <div>Title</div>
            <div className="hidden md:block">Album</div>
            <div className="pr-4">
              <Clock className="w-4 h-4 ml-auto" />
            </div>
          </div>

          <ScrollArea className="h-full">
            <div className="px-4 py-2 pb-8">
              {mockTracks.map((track, i) => (
                <div
                  key={track.id}
                  className="group grid grid-cols-[auto_1fr_1fr_auto] gap-4 px-4 py-3 rounded-lg hover:bg-accent/50 transition-colors items-center cursor-pointer"
                >
                  <div className="w-8 text-center text-muted-foreground font-mono group-hover:text-foreground">
                    <span className="group-hover:hidden">{i + 1}</span>
                    <Play className="w-3 h-3 mx-auto hidden group-hover:block fill-current" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-foreground truncate">
                      {track.title}
                    </div>
                    <div className="text-xs text-muted-foreground truncate group-hover:text-foreground/70">
                      {track.artist}
                    </div>
                  </div>
                  <div className="hidden md:block text-sm text-muted-foreground truncate">
                    {track.album}
                  </div>
                  <div className="text-sm text-muted-foreground font-mono pr-4 text-right">
                    {track.duration}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
