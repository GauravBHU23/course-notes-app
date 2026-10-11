create table public.contact_queries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  user_id uuid references public.profiles(id) on delete set null,
  status text not null default 'open' check (status in ('open', 'resolved')),
  emailed_to_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create index contact_queries_status_idx on public.contact_queries (status, created_at desc);

alter table public.contact_queries enable row level security;

-- Only admins can read queries; writes happen via the service-role client
-- from the contact form's API route (anyone can submit, logged in or not).
create policy contact_queries_admin_read on public.contact_queries
  for select using (public.is_admin());

create policy contact_queries_admin_update on public.contact_queries
  for update using (public.is_admin()) with check (public.is_admin());
