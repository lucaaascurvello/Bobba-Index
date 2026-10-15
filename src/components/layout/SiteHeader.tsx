import { Link } from "@tanstack/react-router";
import { Award, Camera, Globe, Info, Menu, Users } from "lucide-react";
import { useState } from "react";

import { Logo } from "@/components/brand/Logo";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { HOTELS, type HotelId } from "@/lib/habbo/hotels";
import { useHotel } from "@/lib/habbo/hotel-context";
import { useI18n } from "@/lib/i18n";

function HotelSelect() {
  const { hotel, setHotel } = useHotel();
  const { t } = useI18n();
  return (
    <Select value={hotel} onValueChange={(v) => setHotel(v as HotelId)}>
      <SelectTrigger aria-label={t("selectHotel")} className="h-9 w-[170px] border-border bg-surface text-sm">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {HOTELS.filter((h) => h.enabled).map((h) => (
          <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  const NAV = [
    { to: "/habbos", label: t("navHabbos"), icon: Users },
    { to: "/badges", label: t("navBadges"), icon: Award },
    { to: "/fotos", label: t("navPhotos"), icon: Camera },
    { to: "/about", label: t("navAbout"), icon: Info },
  ] as const;
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link to="/habbos" aria-label={t("home")} className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
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
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface md:hidden"
            aria-label={t("openMenu")}
          >
            <Menu className="h-4 w-4" />
          </SheetTrigger>
          <SheetContent side="right" className="w-72 border-border bg-background">
            <SheetHeader>
              <SheetTitle className="text-left"><Logo /></SheetTitle>
            </SheetHeader>
            <nav className="mt-4 flex flex-col gap-1 px-4" aria-label={t("mobileMenu")}>
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
