-- Feed feature tables and triggers

-- Posts table
create table if not exists public.feed_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null default 'post' check (type in ('post','review','announcement')),
  product_id uuid null references public.products(id) on delete set null,
  title text not null,
  content text not null,
  rating int null check (rating between 1 and 5),
  image_url text null,
  likes_count int not null default 0,
  comments_count int not null default 0,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Likes table
create table if not exists public.feed_post_likes (
  post_id uuid not null references public.feed_posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- Comments table (supports threaded replies via parent_comment_id)
create table if not exists public.feed_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.feed_posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  parent_comment_id uuid null references public.feed_comments(id) on delete cascade,
  content text not null,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Notifications table (simple)
create table if not exists public.feed_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade, -- recipient
  actor_id uuid not null references public.users(id) on delete cascade, -- who triggered
  post_id uuid not null references public.feed_posts(id) on delete cascade,
  comment_id uuid null references public.feed_comments(id) on delete set null,
  type text not null check (type in ('reply_post','reply_comment')),
  read_at timestamptz null,
  created_at timestamptz not null default now()
);

-- Updated at trigger reuse
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

-- Attach updated_at triggers
create trigger trg_feed_posts_updated before update on public.feed_posts
for each row execute function public.set_updated_at();

create trigger trg_feed_comments_updated before update on public.feed_comments
for each row execute function public.set_updated_at();

-- Likes count maintenance
create or replace function public.increment_post_likes()
returns trigger as $$
begin
  update public.feed_posts set likes_count = likes_count + 1 where id = new.post_id;
  return new;
end; $$ language plpgsql;

create or replace function public.decrement_post_likes()
returns trigger as $$
begin
  update public.feed_posts set likes_count = greatest(likes_count - 1, 0) where id = old.post_id;
  return old;
end; $$ language plpgsql;

create trigger trg_feed_likes_insert after insert on public.feed_post_likes
for each row execute function public.increment_post_likes();

create trigger trg_feed_likes_delete after delete on public.feed_post_likes
for each row execute function public.decrement_post_likes();

-- Comments count maintenance
create or replace function public.increment_post_comments()
returns trigger as $$
begin
  update public.feed_posts set comments_count = comments_count + 1 where id = new.post_id;
  return new;
end; $$ language plpgsql;

create or replace function public.decrement_post_comments()
returns trigger as $$
begin
  update public.feed_posts set comments_count = greatest(comments_count - 1, 0) where id = old.post_id;
  return old;
end; $$ language plpgsql;

create trigger trg_feed_comments_insert after insert on public.feed_comments
for each row execute function public.increment_post_comments();

-- On hard delete of comments, decrement; API may soft-delete, so also handle explicit hard delete
create trigger trg_feed_comments_delete after delete on public.feed_comments
for each row execute function public.decrement_post_comments();

-- Indexes
create index if not exists idx_feed_posts_created on public.feed_posts (created_at desc);
create index if not exists idx_feed_posts_user on public.feed_posts (user_id);
create index if not exists idx_feed_comments_post on public.feed_comments (post_id, created_at);

-- RLS
alter table public.feed_posts enable row level security;
alter table public.feed_post_likes enable row level security;
alter table public.feed_comments enable row level security;
alter table public.feed_notifications enable row level security;

-- Policies: allow public read
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='feed_posts' and policyname='feed_posts_read_all'
  ) then
    create policy feed_posts_read_all on public.feed_posts for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='feed_comments' and policyname='feed_comments_read_all'
  ) then
    create policy feed_comments_read_all on public.feed_comments for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='feed_post_likes' and policyname='feed_post_likes_read_all'
  ) then
    create policy feed_post_likes_read_all on public.feed_post_likes for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='feed_notifications' and policyname='feed_notifications_read_own'
  ) then
    create policy feed_notifications_read_own on public.feed_notifications for select using (true);
  end if;
end $$;
