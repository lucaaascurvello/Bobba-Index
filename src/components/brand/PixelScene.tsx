/** Decorative isometric pixel tiles — purely ornamental, no data. */
export function PixelScene() {
  const tiles: [number, number, string][] = [];
  for (let x = 0; x < 6; x++)
    for (let y = 0; y < 6; y++) {
      const tone = (x + y) % 2 === 0 ? "fill-card" : "fill-surface";
      tiles.push([x, y, tone]);
    }
  const iso = (x: number, y: number) => [(x - y) * 24 + 160, (x + y) * 12 + 20] as const;
  return (
    <svg viewBox="0 0 320 180" className="h-auto w-full max-w-sm" aria-hidden="true">
      {tiles.map(([x, y, tone]) => {
        const [cx, cy] = iso(x, y);
        return (
          <polygon
            key={`${x}-${y}`}
            points={`${cx},${cy} ${cx + 24},${cy + 12} ${cx},${cy + 24} ${cx - 24},${cy + 12}`}
            className={`${tone} stroke-border`}
            strokeWidth="1"
          />
        );
      })}
      {/* cube */}
      {(() => {
        const [cx, cy] = iso(2, 2);
        const h = 26;
        return (
          <g>
            <polygon points={`${cx},${cy - h} ${cx + 24},${cy + 12 - h} ${cx},${cy + 24 - h} ${cx - 24},${cy + 12 - h}`} className="fill-primary-soft" />
            <polygon points={`${cx - 24},${cy + 12 - h} ${cx},${cy + 24 - h} ${cx},${cy + 24} ${cx - 24},${cy + 12}`} className="fill-primary" />
            <polygon points={`${cx + 24},${cy + 12 - h} ${cx},${cy + 24 - h} ${cx},${cy + 24} ${cx + 24},${cy + 12}`} className="fill-primary/70" />
          </g>
        );
      })()}
      {(() => {
        const [cx, cy] = iso(4, 1);
        return <rect x={cx - 4} y={cy + 2} width="8" height="8" className="fill-success animate-pulse" />;
      })()}
    </svg>
  );
}
