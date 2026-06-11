-- Apply via: Supabase Dashboard → SQL Editor → paste and run

-- ============================================================
-- Lobby Lounge — Core Schema
-- ============================================================
--
-- RLS NOTE:
--   Row Level Security is intentionally DISABLED on all tables for
--   simplicity during early development. When you are ready to enable it:
--     1. Run: ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;
--     2. Create policies that compare clerk_user_id to the JWT sub claim, e.g.:
--          CREATE POLICY "owner_only" ON public.user_profiles
--            USING (clerk_user_id = auth.jwt() ->> 'sub');
--     3. Ensure your Supabase client sends the Clerk session JWT as the
--        Authorization header so auth.jwt() is populated.
--
-- ============================================================


-- ── user_profiles ───────────────────────────────────────────
-- One row per Clerk user. clerk_user_id is the Clerk `user.id` string (e.g. "user_xxx").
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id        TEXT UNIQUE NOT NULL,
  display_name         TEXT,
  venue_name           TEXT,
  plan                 TEXT DEFAULT 'trial',
  genres               TEXT[] DEFAULT '{}',
  mood                 TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);


-- ── channels ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.channels (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  category    TEXT,  -- e.g. 'Relaxing', 'Upbeat', 'Elegant', 'Productivity', 'Wellness', 'Energetic'
  bpm         INTEGER,
  cover_image TEXT,  -- URL
  audio_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);


-- ── tracks ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tracks (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  artist      TEXT,
  category    TEXT,
  duration    INTEGER,  -- seconds
  energy      TEXT,     -- 'low', 'mid', 'high'
  audio_url   TEXT,
  cover_image TEXT,
  channel_id  UUID REFERENCES public.channels(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);


-- ── playlists ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.playlists (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  cover_image   TEXT,
  is_public     BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);


-- ── playlist_tracks ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.playlist_tracks (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE,
  track_id    UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
  position    INTEGER NOT NULL DEFAULT 0,
  added_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE (playlist_id, track_id)
);


-- ── schedule_blocks ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.schedule_blocks (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL,
  day           TEXT NOT NULL,  -- 'Mon','Tue','Wed','Thu','Fri','Sat','Sun'
  start_hour    INTEGER NOT NULL,  -- 0-23
  duration      INTEGER NOT NULL DEFAULT 1,  -- hours
  channel_id    UUID REFERENCES public.channels(id) ON DELETE SET NULL,
  title         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);


-- ── updated_at triggers ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_playlists_updated_at
  BEFORE UPDATE ON public.playlists
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- Seed: channels (8 rows)
-- ============================================================
INSERT INTO public.channels (name, description, category, bpm, cover_image) VALUES
  ('Lounge & Chill',
   'Smooth background vibes for lounges and waiting areas',
   'Relaxing', 72,
   'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&h=600&fit=crop'),

  ('Retail Energy',
   'Upbeat pop to keep shoppers energised',
   'Upbeat', 112,
   'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop'),

  ('Deep Focus',
   'Instrumental tracks for productive work environments',
   'Productivity', 84,
   'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=600&fit=crop'),

  ('Dinner Jazz',
   'Elegant jazz for upscale dining experiences',
   'Elegant', 74,
   'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=600&fit=crop'),

  ('Morning Boost',
   'Energetic tracks to kick off the morning rush',
   'Energetic', 108,
   'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=600&h=600&fit=crop'),

  ('Ambient Spa',
   'Ultra-calm soundscapes for spas and wellness spaces',
   'Wellness', 60,
   'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop'),

  ('Sunday Brunch',
   'Laid-back acoustic grooves perfect for weekend brunch',
   'Relaxing', 80,
   'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=600&fit=crop'),

  ('Late Night Vibes',
   'Smooth upbeat rhythms to keep the night going',
   'Upbeat', 96,
   'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&h=600&fit=crop')

ON CONFLICT DO NOTHING;


-- ============================================================
-- Seed: tracks (10 rows, spread across categories)
-- ============================================================
INSERT INTO public.tracks (name, artist, category, duration, energy) VALUES
  -- Jazz (4)
  ('Blue Bossa',         'Chet Baker Trio',    'Jazz',       262, 'low'),
  ('Autumn Leaves',      'Coltrane Quartet',   'Jazz',       287, 'low'),
  ('So What',            'Miles Davis',        'Jazz',       314, 'mid'),
  ('Fly Me to the Moon', 'Frank Sinatra',      'Jazz',       188, 'low'),

  -- Ambient (2)
  ('Floating',           'Ethereal Waves',     'Ambient',    432, 'low'),
  ('Rain Garden',        'Nature Sounds',      'Ambient',    480, 'low'),

  -- Focus (2)
  ('Deep Focus Flow',    'Ambient Collective', 'Focus',      370, 'low'),
  ('Morning Flow',       'Study Sessions',     'Focus',      345, 'low'),

  -- Electronic (1)
  ('Neon City',          'Synthwave Kids',     'Electronic', 295, 'high'),

  -- Pop (1)
  ('Golden Hour',        'Indie Folk',         'Pop',        235, 'mid')

ON CONFLICT DO NOTHING;
