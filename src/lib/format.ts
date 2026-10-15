export function formatDate(iso: string | null | undefined, withTime = false): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "America/Sao_Paulo",
  });
}

export const formatNumber = (n: number) => n.toLocaleString("pt-BR");

/** Calendar difference between `iso` and `now` as years/months/days. */
export function accountAge(iso: string | null | undefined, now: Date = new Date()): { years: number; months: number; days: number } | null {
  if (!iso) return null;
  const s = new Date(iso);
  if (Number.isNaN(s.getTime()) || s > now) return null;
  let y = now.getUTCFullYear() - s.getUTCFullYear();
  let m = now.getUTCMonth() - s.getUTCMonth();
  let d = now.getUTCDate() - s.getUTCDate();
  if (d < 0) {
    m -= 1;
    d += new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0)).getUTCDate();
  }
  if (m < 0) { y -= 1; m += 12; }
  return { years: y, months: m, days: d };
}

export function formatAccountAge(iso: string | null | undefined, now?: Date): string | null {
  const a = accountAge(iso, now);
  if (!a) return null;
  const p = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
  return `${p(a.years, "ano", "anos")}, ${p(a.months, "mês", "meses")} e ${p(a.days, "dia", "dias")} de hotel`;
}

export const accountAgeDays = (iso: string | null | undefined, now: Date = new Date()) => {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? null : Math.floor((now.getTime() - t) / 86_400_000);
};
