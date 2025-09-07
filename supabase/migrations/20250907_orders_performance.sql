-- Enable pg_trgm for fast ILIKE searches
create extension if not exists pg_trgm with schema public;

-- Ordering and filtering indexes
create index if not exists idx_orders_created_at_desc on public.orders (created_at desc);
create index if not exists idx_orders_status_created_at on public.orders (status, created_at desc);
create index if not exists idx_orders_order_type_created_at on public.orders (order_type, created_at desc);
create index if not exists idx_orders_status_order_type_created on public.orders (status, order_type, created_at desc);

-- Trigram indexes for search filters (case-insensitive)
create index if not exists idx_orders_cust_name_trgm on public.orders using gin (lower(customer_name) gin_trgm_ops);
create index if not exists idx_orders_cust_email_trgm on public.orders using gin (lower(customer_email) gin_trgm_ops);
create index if not exists idx_orders_cust_phone_trgm on public.orders using gin (lower(customer_phone) gin_trgm_ops);
-- Also allow partial id search via text cast
create index if not exists idx_orders_id_trgm on public.orders using gin ((id::text) gin_trgm_ops);
