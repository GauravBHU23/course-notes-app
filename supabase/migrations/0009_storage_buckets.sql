insert into storage.buckets (id, name, public)
values
  ('pdfs-private', 'pdfs-private', false),
  ('invoices-private', 'invoices-private', false),
  ('public-assets', 'public-assets', true)
on conflict (id) do nothing;

-- pdfs-private and invoices-private: service-role only (no storage.objects
-- policy for anon/authenticated at all means they are fully inaccessible to
-- those roles; all reads go through API routes using the service-role client).

-- public-assets: anyone can read; only admins can write.
create policy public_assets_read on storage.objects
  for select using (bucket_id = 'public-assets');

create policy public_assets_admin_write on storage.objects
  for insert with check (bucket_id = 'public-assets' and public.is_admin());

create policy public_assets_admin_update on storage.objects
  for update using (bucket_id = 'public-assets' and public.is_admin());

create policy public_assets_admin_delete on storage.objects
  for delete using (bucket_id = 'public-assets' and public.is_admin());
