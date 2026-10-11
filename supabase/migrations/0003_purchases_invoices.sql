create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  bundle_id uuid not null references public.bundles(id),
  cashfree_order_id text unique not null,
  cashfree_payment_id text,
  amount_inr integer not null,
  status text not null default 'pending' check (status in ('pending', 'success', 'failed', 'cancelled')),
  access_starts_at timestamptz,
  access_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index purchases_user_status_idx on public.purchases (user_id, status);
create index purchases_bundle_idx on public.purchases (bundle_id);
create trigger purchases_set_updated_at
  before update on public.purchases
  for each row
  execute function public.set_updated_at();

create sequence public.invoice_number_seq start 1;

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null unique references public.purchases(id) on delete cascade,
  invoice_number text unique not null,
  pdf_storage_path text,
  emailed_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.generate_invoice_number()
returns text
language sql
as $$
  select 'INV-' || extract(year from now())::text || '-' || lpad(nextval('public.invoice_number_seq')::text, 6, '0');
$$;

alter table public.purchases enable row level security;
alter table public.invoices enable row level security;
