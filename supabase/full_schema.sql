-- ============================================================
-- Club Management - Full Schema Definition
-- ============================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Meditation Sessions
CREATE TABLE IF NOT EXISTS public.meditation_sessions (
  id               UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID         REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  started_at       TIMESTAMPTZ  NOT NULL,
  duration_seconds INTEGER      NOT NULL,   -- Actual meditation seconds
  target_seconds   INTEGER      NOT NULL,   -- Planned meditation seconds
  completed        BOOLEAN      DEFAULT false,
  meditation_type  TEXT,
  note             TEXT,
  created_at       TIMESTAMPTZ  DEFAULT NOW()
);

ALTER TABLE public.meditation_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can manage own sessions"
  ON public.meditation_sessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_meditation_sessions_user_started
  ON public.meditation_sessions (user_id, started_at DESC);

-- 3. Calendar Events
CREATE TABLE IF NOT EXISTS public.events (
  id           UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  title        TEXT         NOT NULL,
  description  TEXT         DEFAULT '',
  location     TEXT         DEFAULT '',
  start_at     TIMESTAMPTZ  NOT NULL,
  end_at       TIMESTAMPTZ  NOT NULL,
  all_day      BOOLEAN      DEFAULT false,
  color        TEXT         DEFAULT '#38bdf8', -- Default sky-400
  participants TEXT[],                          -- User IDs or names of participants
  created_by   UUID         REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ  DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "everyone can view events"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "authenticated users can manage events"
  ON public.events FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_events_start_at ON public.events (start_at);

-- 4. Profiles View (Helper)
CREATE OR REPLACE FUNCTION public.get_user_profiles(user_ids UUID[])
RETURNS TABLE (
  id UUID,
  name TEXT,
  avatar_url TEXT
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    u.id,
    COALESCE(
      NULLIF((u.raw_user_meta_data->>'name')::text, ''),
      NULLIF((u.raw_user_meta_data->>'display_name')::text, ''),
      split_part(COALESCE(u.email, ''), '@', 1),
      '未知用戶'
    ) AS name,
    NULLIF((u.raw_user_meta_data->>'avatar_url')::text, '') AS avatar_url
  FROM auth.users u
  WHERE u.id = ANY(user_ids);
$$;

GRANT EXECUTE ON FUNCTION public.get_user_profiles(UUID[]) TO authenticated;

-- 5. Realtime Enablement
-- Note: Ensure publication exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;
