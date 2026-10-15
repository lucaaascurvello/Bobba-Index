import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/habbos" });
  },
  head: () => ({
    meta: [
      { title: "Bobba Index — O universo Habbo, indexado." },
      { name: "description", content: "Pesquise jogadores e emblemas do Habbo Brasil." },
      { property: "og:title", content: "Bobba Index" },
      { property: "og:description", content: "O universo Habbo, indexado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});
