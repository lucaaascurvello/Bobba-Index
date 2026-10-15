import { Link } from "@tanstack/react-router";
import { Github, UserRound } from "lucide-react";

import { useI18n } from "@/lib/i18n";

const REPO_URL = "https://github.com/lucaaascurvello/Bobba-Index";

const pill =
  "lift inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground";

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="mt-8 border-t border-border/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="max-w-xl text-sm leading-relaxed text-foreground/75">{t("footerText")}</p>
        <div className="flex flex-wrap items-center gap-2.5">
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className={pill}>
            <Github className="size-4 text-primary-soft" aria-hidden="true" />
            {t("footerGithub")}
          </a>
          <Link to="/about" hash="desenvolvedor" className={pill}>
            <UserRound className="size-4 text-primary-soft" aria-hidden="true" />
            {t("footerDev")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
