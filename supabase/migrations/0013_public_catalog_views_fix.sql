-- Supabase's standard public-schema default grants ALL PRIVILEGES
-- (including INSERT/UPDATE/DELETE) to anon and authenticated on every
-- table, relying entirely on RLS policies to restrict actual access. The
-- bundles/pdfs tables only ever had an admin-only policy (0008), so direct
-- anon access was correctly blocked by RLS -- but the underlying grant was
-- still far broader than needed, and bundles_public/pdfs_public (0007)
-- were created with security_invoker = true, which makes a view apply the
-- *querying role's* RLS rather than the view owner's. The practical effect:
-- an anon-key client querying bundles_public got zero rows (RLS silently
-- filtered everything, since anon has no bundles SELECT policy), while the
-- website never noticed because it always reads through the service-role
-- admin client, which bypasses RLS entirely.
--
-- Fix: revoke anon/authenticated's write privileges on the raw tables
-- (admin writes go through the service-role client regardless, which
-- ignores grants) and drop security_invoker from the views so they run
-- with definer-style privileges -- safe here specifically because both
-- views already hand-pick a column list that excludes pdfs.storage_path
-- and any other sensitive column, so bypassing RLS inside the view can
-- never leak more than the view's own SELECT already decided to expose.

revoke insert, update, delete, truncate on public.bundles from anon, authenticated;
revoke insert, update, delete, truncate on public.pdfs from anon, authenticated;

-- Recreate without security_invoker (defaults to bypassing RLS, i.e.
-- definer-style). The column list is unchanged from 0007.
drop view if exists public.bundles_public;
create view public.bundles_public as
select
  b.id, b.category_id, b.slug, b.title, b.description, b.cover_image_url,
  b.price_inr, b.validity_days, b.is_active, b.created_at,
  c.slug as category_slug, c.name as category_name
from public.bundles b
join public.exam_categories c on c.id = b.category_id
where b.is_active = true and c.is_active = true;

drop view if exists public.pdfs_public;
create view public.pdfs_public as
select id, bundle_id, title, page_count, display_order, is_active
from public.pdfs
where is_active = true;

grant select on public.bundles_public to anon, authenticated;
grant select on public.pdfs_public to anon, authenticated;
