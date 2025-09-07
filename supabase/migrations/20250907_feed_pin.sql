-- Add pinned flag to feed posts and helpful indexes
do $$ begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'feed_posts' and column_name = 'is_pinned'
  ) then
    alter table public.feed_posts add column is_pinned boolean not null default false;
  end if;
end $$;

-- Index to prioritize pinned posts in ordering
create index if not exists idx_feed_posts_pinned_created on public.feed_posts (is_pinned desc, created_at desc);
