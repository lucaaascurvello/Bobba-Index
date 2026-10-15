import { ImageOff, UserRound } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

interface Props {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  eager?: boolean;
  fallback?: "avatar" | "image";
}

/** Pixel-perfect remote image with a graceful fallback when the Habbo CDN fails. */
export function HabboImage({ src, alt, className, width, height, eager, fallback = "image" }: Props) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  if (failed) {
    const Icon = fallback === "avatar" ? UserRound : ImageOff;
    return (
      <span role="img" aria-label={`${alt} (imagem indisponível)`} className={cn("flex items-center justify-center text-muted-foreground/60", className)} style={{ width, height }}>
        <Icon className="h-1/3 w-1/3 min-h-4 min-w-4" />
      </span>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      referrerPolicy="no-referrer"
      ref={(el) => { if (el?.complete && el.naturalWidth > 0 && !loaded) setLoaded(true); }}
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
      className={cn("pixelated transition-[opacity,transform] duration-500 ease-out", loaded ? "opacity-100" : "opacity-0", className)}
    />
  );
}
