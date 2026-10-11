create table public.site_visits (
  id bigint generated always as identity primary key,
  visited_at timestamptz not null default now(),
  path text,
  visitor_hash text not null
);

create index site_visits_hash_idx on public.site_visits (visitor_hash, visited_at desc);

create table public.counters (
  key text primary key,
  value bigint not null default 0,
  updated_at timestamptz not null default now()
);

insert into public.counters (key, value) values ('total_visits', 0);

create table public.settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

insert into public.settings (key, value) values
  ('whatsapp_link', ''),
  ('telegram_link', ''),
  ('apk_download_link', ''),
  ('support_email', ''),
  ('support_phone', ''),
  ('announcement_banner_text', ''),
  ('announcement_banner_active', 'false');

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text,
  image_url text,
  link_url text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.site_visits enable row level security;
alter table public.counters enable row level security;
alter table public.settings enable row level security;
alter table public.banners enable row level security;
