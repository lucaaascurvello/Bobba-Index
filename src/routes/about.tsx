import { createFileRoute } from "@tanstack/react-router";

import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Sobre — Bobba Index" },
      { name: "description", content: "O Bobba Index é uma ferramenta independente para explorar dados públicos do Habbo Hotel." },
      { property: "og:title", content: "Sobre o Bobba Index" },
      { property: "og:description", content: "Ferramenta independente, sem afiliação com a Sulake ou o Habbo Hotel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useI18n();
  const SOURCES = [
    [t("src1"), "/api/public/users?name={nick}", t("src1n")],
    [t("src2"), "/api/public/users/{id}/profile", t("src2n")],
    [t("src3"), "/habbo-imaging/avatarimage", t("src3n")],
    [t("src4"), "images.habbo.com/c_images/album1584", t("src4n")],
    [t("src5"), "/gamedata/external_flash_texts/1", t("src5n")],
  ];
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="font-pixel text-xs uppercase text-primary-soft">{t("aboutLabel")}</p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">{t("aboutTitle")}</h1>
      <div className="mt-6 space-y-4 text-muted-foreground">
        <p>{t("aboutP1")}</p>
        <p className="rounded-xl border border-border bg-card p-4 text-sm">
          <strong className="text-foreground">{t("aboutNoAff")}</strong> {t("aboutNoAffText")}
        </p>
        <p>{t("aboutP2")}</p>
      </div>

      <h2 className="mt-12 font-display text-xl font-semibold text-foreground">{t("aboutSources")}</h2>
      <div className="mt-4 overflow-hidden rounded-xl border border-border">
        {SOURCES.map(([name, path, note]) => (
          <div key={name} className="grid gap-1 border-b border-border bg-card p-4 last:border-0 sm:grid-cols-[180px_1fr]">
            <p className="text-sm font-medium text-foreground">{name}</p>
            <div>
              <code className="break-all text-xs text-primary-soft">{path}</code>
              <p className="mt-1 text-xs text-muted-foreground">{note}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-12 font-display text-xl font-semibold text-foreground">{t("aboutLimits")}</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
        <li>{t("lim1")}</li>
        <li>{t("lim2")}</li>
        <li>{t("lim3")}</li>
        <li>{t("lim4")}</li>
      </ul>
    </div>
  );
}
