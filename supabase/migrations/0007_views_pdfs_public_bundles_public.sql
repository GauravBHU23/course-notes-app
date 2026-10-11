-- Public-safe views: never expose pdfs.storage_path to any client role.
create view public.bundles_public with (security_invoker = true) as
select
  b.id, b.category_id, b.slug, b.title, b.description, b.cover_image_url,
  b.price_inr, b.validity_days, b.is_active, b.created_at,
  c.slug as category_slug, c.name as category_name
from public.bundles b
join public.exam_categories c on c.id = b.category_id
where b.is_active = true and c.is_active = true;

create view public.pdfs_public with (security_invoker = true) as
select id, bundle_id, title, page_count, display_order, is_active
from public.pdfs
where is_active = true;

grant select on public.bundles_public to anon, authenticated;
grant select on public.pdfs_public to anon, authenticated;
