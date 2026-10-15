import { Link } from "@tanstack/react-router";

import { useI18n } from "@/lib/i18n";

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="mt-24 border-t border-border/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>{t("footerText")}</p>
        <Link to="/about" className="shrink-0 hover:text-foreground">{t("footerAbout")}</Link>
      </div>
    </footer>
  );
}
