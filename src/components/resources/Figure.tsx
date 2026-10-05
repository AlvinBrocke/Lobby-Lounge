import React from "react";
import Image from "next/image";

/*
 * Images inside blog MDX. Width/height are the source file's pixel size, so
 * next/image can reserve space (no layout shift) and serve resized variants.
 */
export function Figure({
  src,
  width,
  height,
  alt,
  caption,
}: {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
}) {
  return (
    <figure className="ll-figure">
      <Image src={src} width={width} height={height} alt={alt} sizes="(max-width: 800px) 100vw, 760px" />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

/** Several screenshots that sat side by side in the source doc. */
export function FigureRow({ children }: { children: React.ReactNode }) {
  return <div className="ll-figure-row">{children}</div>;
}
