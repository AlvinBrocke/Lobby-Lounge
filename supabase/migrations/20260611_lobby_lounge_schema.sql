-- ============================================================
-- Lobby Lounge — Core Schema
-- Apply via: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- ── user_profiles ───────────────────────────────────────────
-- One row per Clerk user. clerk_user_id is the Clerk `user.id` string.
CREATE TABLE IF NOT EXISTS public.user_profiles (
  clerk_user_id    TEXT PRIMARY KEY,
  display_name     TEXT,
  venue_name       TEXT,
  email            TEXT,
  plan             TEXT NOT NULL DEFAULT 'trial',
  genres           JSONB NOT NULL DEFAULT '[]',
  mood             TEXT,
  tempo            TEXT DEFAULT 'Medium',
  allow_explicit   BOOLEAN NOT NULL DEFAULT false,
  time_based       BOOLEAN NOT NULL DEFAULT true,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  trial_end_date   TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── channels ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.channels (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  category    TEXT,
  bpm         INTEGER,
  image_url   TEXT,
  audio_url   TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── tracks ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tracks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  artist           TEXT,
  category         TEXT,
  duration_seconds INTEGER,
  audio_url        TEXT,
  image_url        TEXT,
  bpm              INTEGER,
  energy_level     TEXT CHECK (energy_level IN ('low', 'mid', 'high')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── playlists ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.playlists (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      TEXT NOT NULL REFERENCES public.user_profiles(clerk_user_id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  cover_image  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── playlist_tracks ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.playlist_tracks (
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  track_id    UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  position    INTEGER NOT NULL DEFAULT 0,
  added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (playlist_id, track_id)
);

-- ── schedule_blocks ─────────────────────────────────────────
-- day_of_week: 0 = Monday … 6 = Sunday
CREATE TABLE IF NOT EXISTS public.schedule_blocks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      TEXT NOT NULL REFERENCES public.user_profiles(clerk_user_id) ON DELETE CASCADE,
  channel_id   UUID REFERENCES public.channels(id) ON DELETE SET NULL,
  title        TEXT NOT NULL,
  day_of_week  SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_hour   SMALLINT NOT NULL CHECK (start_hour BETWEEN 0 AND 23),
  duration     SMALLINT NOT NULL DEFAULT 1 CHECK (duration BETWEEN 1 AND 24),
  color        TEXT DEFAULT 'teal',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── updated_at trigger ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
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
-- Seed: channels
-- ============================================================
INSERT INTO public.channels (name, description, category, bpm, image_url, audio_url) VALUES
  ('Lounge & Chill',  'Smooth background vibes for lounges and waiting areas',    'Relaxing',    72,  'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&h=600&fit=crop', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'),
  ('Retail Energy',   'Upbeat pop to keep shoppers energised',                    'Upbeat',      112, 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'),
  ('Deep Focus',      'Instrumental tracks for productive work environments',     'Productivity', 84, 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=600&fit=crop', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'),
  ('Dinner Jazz',     'Elegant jazz for upscale dining experiences',              'Elegant',      74, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=600&fit=crop', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'),
  ('Morning Boost',   'Energetic tracks to kick off the morning rush',            'Energetic',   108, 'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=600&h=600&fit=crop', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'),
  ('Ambient Spa',     'Ultra-calm soundscapes for spas and wellness spaces',      'Wellness',     60, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3')
ON CONFLICT DO NOTHING;

-- ============================================================
-- Seed: tracks
-- ============================================================
INSERT INTO public.tracks (name, artist, category, duration_seconds, bpm, energy_level) VALUES
  ('Blue Bossa',          'Chet Baker Trio',      'Jazz',       262, 72,  'low'),
  ('Autumn Leaves',       'Coltrane Quartet',     'Jazz',       287, 70,  'low'),
  ('So What',             'Miles Davis',          'Jazz',       314, 80,  'mid'),
  ('Fly Me to the Moon',  'Frank Sinatra',        'Jazz',       188, 74,  'low'),
  ('Round Midnight',      'Thelonious Monk',      'Jazz',       332, 68,  'mid'),
  ('Deep Focus',          'Ambient Collective',   'Focus',      370, 84,  'low'),
  ('Morning Flow',        'Study Sessions',       'Focus',      345, 82,  'low'),
  ('Neon City',           'Synthwave Kids',       'Electronic', 295, 120, 'high'),
  ('Pulse',               'DJ Static',            'Electronic', 238, 128, 'high'),
  ('Floating',            'Ethereal Waves',       'Ambient',    432, 60,  'low'),
  ('Rain Garden',         'Nature Sounds',        'Ambient',    480, 58,  'low'),
  ('Easy Sunday',         'The Mellow Set',       'Pop',        210, 95,  'mid'),
  ('Golden Hour',         'Indie Folk',           'Pop',        235, 92,  'mid'),
  ('Moonlight Sonata',    'Beethoven',            'Classical',  322, 65,  'low'),
  ('Clair de Lune',       'Debussy',              'Classical',  290, 60,  'low')
ON CONFLICT DO NOTHING;
