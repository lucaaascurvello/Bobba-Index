import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          Bobba Index é um projeto independente, sem afiliação com a Sulake ou o Habbo Hotel. Habbo® é marca da Sulake Oy.
        </p>
        <Link to="/about" className="shrink-0 hover:text-foreground">Sobre o projeto</Link>
      </div>
    </footer>
  );
}
