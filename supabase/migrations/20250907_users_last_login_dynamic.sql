-- Ensure user_sessions exists and update users.last_login_at dynamically via trigger
-- Safe-guarded with IF NOT EXISTS checks to avoid conflicts on existing deployments

-- Create extension for UUID if not present
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
    CREATE EXTENSION pgcrypto;
  END IF;
END$$;

-- Create user_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_token text NOT NULL,
  expires_at timestamptz NOT NULL,
  ip_address text,
  user_agent text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz
);

-- Add last_seen_at column if table already existed earlier
ALTER TABLE IF EXISTS public.user_sessions
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

-- Ensure FK to users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_sessions_user_id_fkey'
  ) THEN
    ALTER TABLE public.user_sessions
      ADD CONSTRAINT user_sessions_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END$$;

-- Ensure unique token
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_user_sessions_token'
  ) THEN
    CREATE UNIQUE INDEX idx_user_sessions_token ON public.user_sessions(session_token);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_user_sessions_user_id'
  ) THEN
    CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_user_sessions_expires'
  ) THEN
    CREATE INDEX idx_user_sessions_expires ON public.user_sessions(expires_at);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_user_sessions_last_seen'
  ) THEN
    CREATE INDEX idx_user_sessions_last_seen ON public.user_sessions(last_seen_at);
  END IF;
END$$;

-- Trigger function: update users.last_login_at when a new session is created
CREATE OR REPLACE FUNCTION public.update_last_login_on_session()
RETURNS trigger AS $$
BEGIN
  UPDATE public.users u
    SET last_login_at = GREATEST(COALESCE(u.last_login_at, to_timestamp(0)), COALESCE(NEW.created_at, now()))
    WHERE u.id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (avoid duplicates)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_last_login_on_session'
  ) THEN
    CREATE TRIGGER trg_update_last_login_on_session
    AFTER INSERT ON public.user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_last_login_on_session();
  END IF;
END$$;

COMMENT ON FUNCTION public.update_last_login_on_session() IS 'Updates users.last_login_at whenever a session is created';
