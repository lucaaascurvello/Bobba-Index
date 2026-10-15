import { createFileRoute } from "@tanstack/react-router";

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

const SOURCES = [
  ["Busca de jogador", "/api/public/users?name={nick}", "Nick exato, sem diferenciar maiúsculas."],
  ["Perfil completo", "/api/public/users/{id}/profile", "Emblemas, grupos, quartos. Indisponível em perfis privados."],
  ["Avatar", "/habbo-imaging/avatarimage", "Imagem oficial gerada pelo hotel."],
  ["Emblemas (imagens)", "images.habbo.com/c_images/album1584", "Imagens GIF dos emblemas."],
  ["Catálogo de emblemas", "/gamedata/external_flash_texts/1", "Nomes e descrições públicos do jogo."],
];

function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="font-pixel text-xs uppercase text-primary-soft">Sobre</p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">O universo Habbo, indexado.</h1>
      <div className="mt-6 space-y-4 text-muted-foreground">
        <p>O Bobba Index é uma ferramenta independente para pesquisar jogadores, perfis públicos e emblemas do Habbo Hotel, usando apenas informações que o próprio hotel disponibiliza publicamente.</p>
        <p className="rounded-xl border border-border bg-card p-4 text-sm">
          <strong className="text-foreground">Sem afiliação oficial.</strong> Este projeto não é oficial, afiliado, patrocinado ou aprovado pela Sulake Oy ou pelo Habbo Hotel. Habbo® é marca registrada da Sulake.
        </p>
        <p>Não pedimos senhas, não armazenamos dados pessoais e não fazemos varredura de nomes. Cada consulta é feita sob demanda quando você pesquisa.</p>
      </div>

      <h2 className="mt-12 font-display text-xl font-semibold text-foreground">Fontes de dados</h2>
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

      <h2 className="mt-12 font-display text-xl font-semibold text-foreground">Limitações</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
        <li>A API pública não oferece busca parcial nem listagem de jogadores — só o nick exato.</li>
        <li>Perfis privados mostram apenas avatar, missão e dados básicos.</li>
        <li>No momento só o Habbo Brasil está habilitado; outros hotéis virão depois de validados.</li>
        <li>O catálogo de emblemas não informa raridade, categorias ou data de lançamento.</li>
      </ul>
    </div>
  );
}
