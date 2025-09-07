-- Performance indexes for feed lists and likes lookups
-- Index to filter fast by is_deleted and order by created_at
create index if not exists idx_feed_posts_is_deleted_created on public.feed_posts (is_deleted, created_at desc);

-- Composite index to support likes lookup by user and post list
create index if not exists idx_feed_post_likes_user_post on public.feed_post_likes (user_id, post_id);

-- Support filtering by type and ordering by created_at
create index if not exists idx_feed_posts_is_deleted_type_created on public.feed_posts (is_deleted, type, created_at desc);

-- Support pin-first ordering queries
create index if not exists idx_feed_posts_is_deleted_pin_created on public.feed_posts (is_deleted, is_pinned, created_at desc);

-- Speed up listing comments per post
create index if not exists idx_feed_comments_post_deleted_created on public.feed_comments (post_id, is_deleted, created_at);
