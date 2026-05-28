"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MoreHorizontal, Play } from "lucide-react";
import Image from "next/image";

export interface PlaylistCardProps {
  item: {
    id: string;
    title: string;
    description: string;
    image: string;
    gradient?: string; // keeping optional for backward compatibility if needed
  };
  onClick?: () => void;
  aspectRatio?: "square" | "video";
}

export function PlaylistCard({
  item,
  onClick,
  aspectRatio = "square",
}: PlaylistCardProps) {
  return (
    <div
      className={cn(
        "group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl shadow-md bg-white dark:bg-card border border-border/50",
        aspectRatio === "square" ? "aspect-square" : "aspect-video",
      )}
      onClick={onClick}
    >
      {/* Background Gradient/Image */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-80 transition-opacity duration-300 group-hover:opacity-100",
          item.gradient || "from-gray-100 to-gray-200",
        )}
      />

      {/* Image Overlay */}
      <Image
        src={item.image}
        alt={item.title}
        fill
        className="object-cover opacity-20 group-hover:opacity-40 transition-opacity duration-500 mix-blend-overlay"
      />

      {/* Play Button (Center) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
        <div className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200">
          <Play className="w-6 h-6 text-black ml-1 fill-black" />
        </div>
      </div>

      {/* Info (Bottom) */}
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <h3 className="text-white font-bold text-lg truncate">{item.title}</h3>
        <p className="text-white/80 text-sm truncate">{item.description}</p>
      </div>

      {/* Menu Dots (Top Right) */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            // Add menu logic here
          }}
        >
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
