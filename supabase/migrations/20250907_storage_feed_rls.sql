-- Enable client-side uploads to Supabase Storage for feed images
-- Bucket: product-images (or override via SUPABASE_STORAGE_BUCKET)
-- This migration assumes the bucket exists and is public for read

-- Create storage policies for authenticated users to upload to feed folder
begin;

-- Allow authenticated users to upload into folder feed/*
create policy if not exists "Allow feed uploads"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'product-images' and (position('feed/' in path) = 1)
);

-- Allow owners to update/delete their own uploaded objects (optional)
-- If you track owner via metadata, adjust accordingly; otherwise restrict to admins via a separate role
-- Here we conservatively allow only inserts; edits/deletes continue via service role

commit;
