-- Add avatar_url column to users for profile pictures
alter table public.users
  add column if not exists avatar_url text;

comment on column public.users.avatar_url is 'Public URL to user profile image (Supabase Storage)';
