-- profiles: user can see/update own row; admin sees/updates everyone.
create policy profiles_select_own on public.profiles
  for select using (id = auth.uid() or public.is_admin());

create policy profiles_update_own on public.profiles
  for update using (id = auth.uid() or public.is_admin());

-- Only service-role (which bypasses RLS entirely) inserts profiles via the
-- handle_new_user trigger, so no insert policy is needed for other roles.

-- exam_categories / bundles / pdfs: raw tables are service-role + admin only.
-- Public clients must go through bundles_public / pdfs_public views instead.
create policy exam_categories_admin_all on public.exam_categories
  for all using (public.is_admin()) with check (public.is_admin());

create policy exam_categories_read_active on public.exam_categories
  for select using (is_active = true);

create policy bundles_admin_all on public.bundles
  for all using (public.is_admin()) with check (public.is_admin());

create policy pdfs_admin_all on public.pdfs
  for all using (public.is_admin()) with check (public.is_admin());

-- purchases: user sees own purchases; admin sees all; writes are service-role only
-- (the Cashfree webhook and order-create routes use the service-role client).
create policy purchases_select_own on public.purchases
  for select using (user_id = auth.uid() or public.is_admin());

create policy purchases_admin_write on public.purchases
  for all using (public.is_admin()) with check (public.is_admin());

-- invoices: user sees invoices for their own purchases; admin sees all.
create policy invoices_select_own on public.invoices
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.purchases p
      where p.id = invoices.purchase_id and p.user_id = auth.uid()
    )
  );

create policy invoices_admin_write on public.invoices
  for all using (public.is_admin()) with check (public.is_admin());

-- active_sessions, otp_codes, login_attempts, pdf_access_tokens:
-- zero anon/authenticated access. Service-role bypasses RLS for all server logic.
-- Admin dashboard reads these through API routes using the service-role client,
-- not direct client-side Supabase queries, so no authenticated-role policy exists.
create policy active_sessions_admin_read on public.active_sessions
  for select using (public.is_admin());

create policy login_attempts_admin_read on public.login_attempts
  for select using (public.is_admin());

-- settings / banners: public can read; only admin can write.
create policy settings_public_read on public.settings
  for select using (true);

create policy settings_admin_write on public.settings
  for all using (public.is_admin()) with check (public.is_admin());

create policy banners_public_read on public.banners
  for select using (is_active = true);

create policy banners_admin_write on public.banners
  for all using (public.is_admin()) with check (public.is_admin());

-- site_visits / counters: no direct client access at all; proxied via API routes
-- using the service-role client only. Admin can still read for the stats dashboard.
create policy counters_admin_read on public.counters
  for select using (public.is_admin());

create policy site_visits_admin_read on public.site_visits
  for select using (public.is_admin());
