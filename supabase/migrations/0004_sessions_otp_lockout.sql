create table public.active_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  session_version integer not null,
  device_label text,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  revoked_at timestamptz,
  revoked_reason text check (revoked_reason in ('new_login', 'admin_revoked', 'logout'))
);

create index active_sessions_user_revoked_idx on public.active_sessions (user_id, revoked_at);

create table public.otp_codes (
  id uuid primary key default gen_random_uuid(),
  identifier text not null,
  channel text not null check (channel in ('email', 'sms')),
  purpose text not null check (purpose in ('login', 'signup', 'password_reset')),
  code_hash text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  attempt_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index otp_codes_lookup_idx on public.otp_codes (identifier, purpose, consumed_at);

create table public.login_attempts (
  id uuid primary key default gen_random_uuid(),
  identifier text not null,
  success boolean not null,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index login_attempts_identifier_idx on public.login_attempts (identifier, created_at desc);

create table public.pdf_access_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  pdf_id uuid not null references public.pdfs(id) on delete cascade,
  purchase_id uuid not null references public.purchases(id) on delete cascade,
  token_jti text unique not null,
  expires_at timestamptz not null,
  used_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index pdf_access_tokens_jti_idx on public.pdf_access_tokens (token_jti);

alter table public.active_sessions enable row level security;
alter table public.otp_codes enable row level security;
alter table public.login_attempts enable row level security;
alter table public.pdf_access_tokens enable row level security;
