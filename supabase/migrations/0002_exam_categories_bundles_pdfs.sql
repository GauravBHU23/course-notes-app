create table public.exam_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  icon_url text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.bundles (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.exam_categories(id) on delete cascade,
  slug text unique not null,
  title text not null,
  description text,
  cover_image_url text,
  price_inr integer not null check (price_inr > 0),
  validity_days integer not null check (validity_days > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bundles_category_idx on public.bundles (category_id);
create trigger bundles_set_updated_at
  before update on public.bundles
  for each row
  execute function public.set_updated_at();

create table public.pdfs (
  id uuid primary key default gen_random_uuid(),
  bundle_id uuid not null references public.bundles(id) on delete cascade,
  title text not null,
  storage_path text not null,
  page_count integer,
  file_size_bytes bigint,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index pdfs_bundle_idx on public.pdfs (bundle_id);

alter table public.exam_categories enable row level security;
alter table public.bundles enable row level security;
alter table public.pdfs enable row level security;
