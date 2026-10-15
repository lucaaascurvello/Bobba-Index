import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Check, Github, Globe2, GraduationCap, Linkedin, Monitor, Search, ShieldCheck, UserRound } from "lucide-react";

import lucasPhoto from "@/assets/lucas-curvello.webp.asset.json";
import qrPix from "@/assets/cafezinho-qr.png.asset.json";
import { useI18n } from "@/lib/i18n";

const PIX_CODE = "00020101021126580014br.gov.bcb.pix013602f1c965-4f88-4396-a8ca-8bab9e280f0f5204000053039865802BR5921LUCAS W C DE CARVALHO6007PALHOCA62070503***6304591A";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Sobre — Bobba Index" },
      { name: "description", content: "Entenda como o Bobba Index pesquisa jogadores em nove hotéis Habbo, respeita a privacidade e organiza dados públicos em um projeto independente de estudo." },
      { property: "og:title", content: "Sobre o Bobba Index" },
      { property: "og:description", content: "Como funciona a busca por hotel, quais dados são públicos e por que o Bobba Index é um projeto independente de estudo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const copyPix = () => {
    navigator.clipboard?.writeText(PIX_CODE).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  };
  const SOURCES = [
    [t("src1"), "/api/public/users?name={nick}", t("src1n")],
    [t("src2"), "/api/public/users/{id}/profile", t("src2n")],
    [t("src3"), "/habbo-imaging/avatarimage", t("src3n")],
    [t("src4"), "images.habbo.com/c_images/album1584", t("src4n")],
    [t("src5"), "/gamedata/external_flash_texts/1", t("src5n")],
  ];
  const steps = [
    { icon: Globe2, title: t("aboutStep1Title"), text: t("aboutStep1") },
    { icon: Search, title: t("aboutStep2Title"), text: t("aboutStep2") },
    { icon: UserRound, title: t("aboutStep3Title"), text: t("aboutStep3") },
  ];
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="font-pixel text-xs uppercase text-primary-soft">{t("aboutLabel")}</p>
      <h1 className="mt-3 font-display text-4xl font-semibold text-foreground sm:text-5xl">Bobba Index</h1>
      <p className="mt-3 font-display text-xl text-primary-soft">{t("aboutTitle")}</p>
      <p className="mt-6 max-w-3xl leading-relaxed text-muted-foreground">{t("aboutP1")}</p>

      <section className="mt-10 border-t border-border pt-8">
        <div className="flex items-center gap-3">
          <GraduationCap className="size-5 shrink-0 text-primary-soft" aria-hidden="true" />
          <h2 className="font-display text-xl font-semibold">{t("aboutPurpose")}</h2>
        </div>
        <p className="mt-4 leading-relaxed text-muted-foreground">{t("aboutCommunity")}</p>
        <p className="mt-5 border-l-2 border-primary/50 pl-4 text-sm leading-relaxed text-muted-foreground">
          <strong className="text-foreground">{t("aboutNoAff")}</strong> {t("aboutNoAffText")}
        </p>
      </section>

      <section className="mt-10 border-t border-border pt-8">
        <h2 className="font-display text-xl font-semibold">{t("aboutHow")}</h2>
        <ol className="mt-5 divide-y divide-border">
          {steps.map(({ icon: Icon, title, text }, index) => (
            <li key={title} className="grid grid-cols-[36px_1fr] gap-4 py-5 sm:grid-cols-[44px_1fr] sm:gap-6">
              <div className="flex flex-col items-center gap-2 text-primary-soft">
                <span className="font-pixel text-xs">0{index + 1}</span>
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-display font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-8 border-t border-border pt-8">
        <div className="flex items-center gap-3">
          <Globe2 className="size-5 shrink-0 text-primary-soft" aria-hidden="true" />
          <h2 className="font-display text-xl font-semibold">{t("aboutHotels")}</h2>
        </div>
        <p className="mt-4 leading-relaxed text-muted-foreground">{t("aboutHotelsText")}</p>
      </section>

      <section className="mt-10 border-t border-border pt-8">
        <div className="flex items-center gap-3">
          <ShieldCheck className="size-5 shrink-0 text-primary-soft" aria-hidden="true" />
          <h2 className="font-display text-xl font-semibold">{t("aboutPrivacy")}</h2>
        </div>
        <p className="mt-4 leading-relaxed text-muted-foreground">{t("aboutPrivacyText")}</p>
      </section>

      <section className="mt-10 border-t border-border pt-8">
        <div className="flex items-center gap-3">
          <Monitor className="size-5 shrink-0 text-primary-soft" aria-hidden="true" />
          <h2 className="font-display text-xl font-semibold">{t("aboutLocal")}</h2>
        </div>
        <p className="mt-4 leading-relaxed text-muted-foreground">{t("aboutLocalText")}</p>
      </section>

      <details className="mt-10 border-y border-border py-5">
        <summary className="cursor-pointer font-display font-semibold text-foreground transition-colors hover:text-primary-soft focus-visible:outline-primary">{t("aboutSources")}</summary>
        <div className="mt-4 divide-y divide-border">
          {SOURCES.map(([name, path, note]) => (
            <div key={name} className="grid gap-2 py-4 sm:grid-cols-[180px_1fr]">
              <p className="text-sm font-medium text-foreground">{name}</p>
              <div>
                <code className="break-all text-xs text-primary-soft">{path}</code>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{note}</p>
              </div>
            </div>
          ))}
        </div>
      </details>

      <h2 className="mt-8 font-display text-xl font-semibold text-foreground">{t("aboutLimits")}</h2>
      <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground">
        <li>{t("lim1")}</li>
        <li>{t("lim2")}</li>
        <li>{t("lim3")}</li>
        <li>{t("lim4")}</li>
      </ul>
    </div>
  );
}
