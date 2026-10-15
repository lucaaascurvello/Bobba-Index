import { Link } from "@tanstack/react-router";
import { Award, Camera, Globe, Info, Menu, Moon, Users } from "lucide-react";
import { useState } from "react";

import { Logo } from "@/components/brand/Logo";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { HOTELS, type HotelId } from "@/lib/habbo/hotels";
import { useHotel } from "@/lib/habbo/hotel-context";

const NAV = [
  { to: "/habbos", label: "Habbos", icon: Users },
  { to: "/badges", label: "Emblemas", icon: Award },
  { to: "/fotos", label: "Fotos", icon: Camera },
  { to: "/about", label: "Sobre", icon: Info },
] as const;

function HotelSelect() {
  const { hotel, setHotel } = useHotel();
  return (
    <Select value={hotel} onValueChange={(v) => setHotel(v as HotelId)}>
      <SelectTrigger aria-label="Selecionar hotel" className="h-9 w-[170px] border-border bg-surface text-sm">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {HOTELS.map((h) => (
          <SelectItem key={h.id} value={h.id} disabled={!h.enabled}>
            {h.name}
            {!h.enabled && <span className="ml-2 text-xs text-muted-foreground">em breve</span>}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link to="/habbos" aria-label="Bobba Index — início" className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
              activeProps={{ className: "!text-foreground bg-surface" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-3 md:flex">
          <HotelSelect />
          <span
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-primary-soft"
            title="Tema escuro ativo"
            aria-label="Tema escuro ativo"
          >
            <Moon className="h-4 w-4" />
          </span>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface md:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="h-4 w-4" />
          </SheetTrigger>
          <SheetContent side="right" className="w-72 border-border bg-background">
            <SheetHeader>
              <SheetTitle className="text-left"><Logo /></SheetTitle>
            </SheetHeader>
            <nav className="mt-4 flex flex-col gap-1 px-4" aria-label="Menu móvel">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-surface hover:text-foreground"
                  activeProps={{ className: "!text-foreground bg-surface" }}
                >
                  <n.icon className="h-4 w-4" /> {n.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 px-4"><HotelSelect /></div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
