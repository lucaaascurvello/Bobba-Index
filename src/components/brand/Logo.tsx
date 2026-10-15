import { cn } from "@/lib/utils";

/** Exact classic Bobba skull supplied by the user; one SVG unit per pixel. */
export function LogoMark({ className, glow = false }: { className?: string; glow?: boolean }) {
  const rows = [
    "..#####..",
    ".#.....#.",
    "#.......#",
    "#.##.##.#",
    "#.##.##.#",
    "#.......#",
    ".#.#.#.#.",
    ".#.#.#.#.",
    "..#####..",
  ];
  return (
    <svg viewBox="0 0 9 9" width="36" height="36" shapeRendering="crispEdges" className={cn("h-9 w-9 shrink-0 fill-primary-soft", glow && "logo-glow", className)} aria-hidden="true">
      {rows.flatMap((row, y) => [...row].flatMap((pixel, x) =>
        pixel === "#" ? [<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />] : [],
      ))}
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark glow />
      <span className="font-display text-[17px] font-semibold text-foreground">
        Bobba<span className="text-primary-soft"> Index</span>
      </span>
    </span>
  );
}
