import { cn } from "@/lib/utils";

/** Original Bobba Index mark: a pixel "B" inside an index card shape. */
export function LogoMark({ className }: { className?: string }) {
  const px: [number, number][] = [
    [0, 0], [1, 0], [2, 0],
    [0, 1], [3, 1],
    [0, 2], [1, 2], [2, 2],
    [0, 3], [3, 3],
    [0, 4], [1, 4], [2, 4],
  ];
  return (
    <svg viewBox="0 0 32 32" className={cn("h-8 w-8", className)} aria-hidden="true">
      <rect x="1" y="1" width="30" height="30" rx="8" className="fill-primary/15 stroke-primary/60" strokeWidth="1.5" />
      <g transform="translate(9 7)" className="fill-primary">
        {px.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x * 3.5} y={y * 3.5} width="3.2" height="3.2" rx="0.5" />
        ))}
      </g>
      <rect x="23" y="22" width="3" height="3" rx="0.6" className="fill-success" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="font-display text-[17px] font-semibold tracking-tight text-foreground">
        Bobba<span className="text-primary-soft"> Index</span>
      </span>
    </span>
  );
}
