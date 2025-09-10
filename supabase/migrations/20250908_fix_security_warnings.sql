-- Fix Supabase security warnings
-- This migration addresses the function_search_path_mutable warnings by setting search_path explicitly
-- Also fixes materialized view access and provides guidance for auth settings

-- 1. Fix function search_path mutable warnings
-- Recreate functions with SET search_path = public;

-- increment_post_likes
DROP FUNCTION IF EXISTS public.increment_post_likes();
CREATE OR REPLACE FUNCTION public.increment_post_likes()
RETURNS TRIGGER AS $$
BEGIN
  SET search_path = public;
  UPDATE public.feed_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- decrement_post_likes
DROP FUNCTION IF EXISTS public.decrement_post_likes();
CREATE OR REPLACE FUNCTION public.decrement_post_likes()
RETURNS TRIGGER AS $$
BEGIN
  SET search_path = public;
  UPDATE public.feed_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- increment_post_comments
DROP FUNCTION IF EXISTS public.increment_post_comments();
CREATE OR REPLACE FUNCTION public.increment_post_comments()
RETURNS TRIGGER AS $$
BEGIN
  SET search_path = public;
  UPDATE public.feed_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- decrement_post_comments
DROP FUNCTION IF EXISTS public.decrement_post_comments();
CREATE OR REPLACE FUNCTION public.decrement_post_comments()
RETURNS TRIGGER AS $$
BEGIN
  SET search_path = public;
  UPDATE public.feed_posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- cleanup_expired_sessions
DROP FUNCTION IF EXISTS public.cleanup_expired_sessions();
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS VOID AS $$
BEGIN
  SET search_path = public;
  DELETE FROM public.user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- update_updated_at_whatsapp
DROP FUNCTION IF EXISTS public.update_updated_at_whatsapp();
CREATE OR REPLACE FUNCTION public.update_updated_at_whatsapp()
RETURNS TRIGGER AS $$
BEGIN
  SET search_path = public;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- reset_rate_limits
DROP FUNCTION IF EXISTS public.reset_rate_limits();
CREATE OR REPLACE FUNCTION public.reset_rate_limits()
RETURNS VOID AS $$
BEGIN
  SET search_path = public;
  UPDATE public.rate_limits SET requests = 0, reset_at = NOW() + INTERVAL '1 hour' WHERE reset_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- log_whatsapp_message
DROP FUNCTION IF EXISTS public.log_whatsapp_message();
CREATE OR REPLACE FUNCTION public.log_whatsapp_message()
RETURNS TRIGGER AS $$
BEGIN
  SET search_path = public;
  INSERT INTO public.whatsapp_logs (message, created_at) VALUES (NEW.message, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- get_active_api_key
DROP FUNCTION IF EXISTS public.get_active_api_key(UUID);
CREATE OR REPLACE FUNCTION public.get_active_api_key(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  SET search_path = public;
  RETURN (SELECT api_key FROM public.api_keys WHERE user_id = $1 AND is_active = true LIMIT 1);
END;
$$ LANGUAGE plpgsql;

-- update_last_login_on_session
DROP FUNCTION IF EXISTS public.update_last_login_on_session();
CREATE OR REPLACE FUNCTION public.update_last_login_on_session()
RETURNS TRIGGER AS $$
BEGIN
  SET search_path = public;
  NEW.last_login = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- update_updated_at_column
DROP FUNCTION IF EXISTS public.update_updated_at_column();
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  SET search_path = public;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- handle_new_user
DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  SET search_path = public;
  INSERT INTO public.user_profiles (id, created_at, updated_at) VALUES (NEW.id, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- cleanup_expired_phone_verifications
DROP FUNCTION IF EXISTS public.cleanup_expired_phone_verifications();
CREATE OR REPLACE FUNCTION public.cleanup_expired_phone_verifications()
RETURNS VOID AS $$
BEGIN
  SET search_path = public;
  DELETE FROM public.phone_verifications WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- set_updated_at
DROP FUNCTION IF EXISTS public.set_updated_at();
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  SET search_path = public;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- refresh_dashboard_analytics
DROP FUNCTION IF EXISTS public.refresh_dashboard_analytics();
CREATE OR REPLACE FUNCTION public.refresh_dashboard_analytics()
RETURNS VOID AS $$
BEGIN
  SET search_path = public;
  REFRESH MATERIALIZED VIEW public.dashboard_analytics;
END;
$$ LANGUAGE plpgsql;

-- get_dashboard_data
DROP FUNCTION IF EXISTS public.get_dashboard_data();
CREATE OR REPLACE FUNCTION public.get_dashboard_data()
RETURNS TABLE(total_orders BIGINT, total_revenue DECIMAL) AS $$
BEGIN
  SET search_path = public;
  RETURN QUERY SELECT COUNT(*) as total_orders, SUM(amount) as total_revenue FROM public.orders WHERE status = 'completed';
END;
$$ LANGUAGE plpgsql;

-- get_daily_revenue
DROP FUNCTION IF EXISTS public.get_daily_revenue(DATE);
CREATE OR REPLACE FUNCTION public.get_daily_revenue(date_param DATE)
RETURNS DECIMAL AS $$
BEGIN
  SET search_path = public;
  RETURN (SELECT COALESCE(SUM(amount), 0) FROM public.orders WHERE DATE(created_at) = date_param AND status = 'completed');
END;
$$ LANGUAGE plpgsql;

-- 2. Fix materialized view in API warning
-- Revoke select from anon and authenticated roles on dashboard_analytics
REVOKE SELECT ON public.dashboard_analytics FROM anon;
REVOKE SELECT ON public.dashboard_analytics FROM authenticated;

-- Grant select only to service_role if needed
-- GRANT SELECT ON public.dashboard_analytics TO service_role;

-- 3. Auth settings (manual steps required)
-- These cannot be fixed via SQL migration, you need to update them in Supabase Dashboard:
-- - Enable "Leaked Password Protection" in Authentication > Settings
-- - Enable additional MFA options in Authentication > Settings > Multi-Factor Authentication

-- 4. Postgres version upgrade (manual step)
-- Upgrade your Postgres version in Supabase Dashboard > Settings > Database > Postgres Version
-- Follow the upgrade guide: https://supabase.com/docs/guides/platform/upgrading
