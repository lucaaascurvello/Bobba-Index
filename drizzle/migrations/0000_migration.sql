CREATE TABLE public.player_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel text NOT NULL,
  unique_id text NOT NULL,
  name text NOT NULL,
  figure text,
  motto text,
  friends jsonb,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX player_snapshots_lookup ON public.player_snapshots (hotel, unique_id, first_seen_at DESC);
GRANT SELECT ON public.player_snapshots TO anon, authenticated;
GRANT ALL ON public.player_snapshots TO service_role;
ALTER TABLE public.player_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Snapshots are public" ON public.player_snapshots FOR SELECT TO anon, authenticated USING (true);