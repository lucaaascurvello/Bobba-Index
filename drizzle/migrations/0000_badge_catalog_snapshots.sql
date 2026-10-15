CREATE TABLE public.badge_catalog_snapshots (
  hotel text PRIMARY KEY,
  items jsonb NOT NULL,
  fetched_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.badge_catalog_snapshots TO service_role;
ALTER TABLE public.badge_catalog_snapshots ENABLE ROW LEVEL SECURITY;