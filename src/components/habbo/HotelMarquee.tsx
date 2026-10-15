import brFlag from "@/assets/flag-br.svg.asset.json";
import usFlag from "@/assets/flag-us.svg.asset.json";
import esFlag from "@/assets/flag-es.svg.asset.json";
import deFlag from "@/assets/flag-de.svg.asset.json";
import frFlag from "@/assets/flag-fr.svg.asset.json";
import itFlag from "@/assets/flag-it.svg.asset.json";
import nlFlag from "@/assets/flag-nl.svg.asset.json";
import fiFlag from "@/assets/flag-fi.svg.asset.json";
import trFlag from "@/assets/flag-tr.svg.asset.json";
import { HOTELS } from "@/lib/habbo/hotels";

const FLAGS: Record<string, string> = {
  br: brFlag.url,
  com: usFlag.url,
  es: esFlag.url,
  de: deFlag.url,
  fr: frFlag.url,
  it: itFlag.url,
  nl: nlFlag.url,
  fi: fiFlag.url,
  tr: trFlag.url,
};

function Track({ hidden }: { hidden?: boolean }) {
  return (
    <ul aria-hidden={hidden} className="flex shrink-0 items-center gap-3 pr-3">
      {HOTELS.map((h) => (
        <li
          key={h.id}
          className="lift flex items-center gap-2.5 rounded-full border border-border bg-card py-2 pl-3 pr-4 shadow-sm"
        >
          <img src={FLAGS[h.id]} alt="" width={24} height={24} className="h-6 w-6 rounded-full border border-border object-cover" loading="lazy" />
          <span className="whitespace-nowrap font-display text-sm font-medium text-foreground/90">{h.name}</span>
        </li>
      ))}
    </ul>
  );
}

/** Infinite, auto-scrolling strip of the hotels Bobba Index searches. */
export function HotelMarquee() {
  return (
    <div
      role="list"
      aria-label="Hotéis Habbo pesquisados pelo Bobba Index"
      className="group relative mt-10 overflow-hidden py-1 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
    >
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
        <Track />
        <Track hidden />
      </div>
    </div>
  );
}
