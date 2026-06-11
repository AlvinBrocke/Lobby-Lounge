"use client";

import Image from "next/image";

export interface CategoryCardProps {
  title: string;
  subtitle: string;
  image: string;
}

export function CategoryCard({ title, subtitle, image }: CategoryCardProps) {
  return (
    <div className="col-span-1 h-full flex flex-col justify-end p-6 rounded-2xl relative overflow-hidden group cursor-pointer transition-all hover:shadow-md border border-border/50">
      {/* Background Image */}
      <Image
        src={image}
        alt={title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/80" />

      <div className="relative z-10">
        <h3 className="font-bold text-xl tracking-tight text-white group-hover:text-primary-foreground transition-colors shadow-black/20 drop-shadow-sm">
          {title}
        </h3>
        <p className="text-sm text-gray-200 mt-1 shadow-black/20 drop-shadow-sm">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
