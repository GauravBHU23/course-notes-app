-- Used inside RLS policies to grant admins full access without a recursive
-- select on profiles triggering RLS on itself (security definer bypasses RLS).
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.increment_counter(p_key text, p_amount bigint default 1)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  new_value bigint;
begin
  insert into public.counters (key, value, updated_at)
  values (p_key, p_amount, now())
  on conflict (key) do update
    set value = public.counters.value + p_amount,
        updated_at = now()
  returning value into new_value;
  return new_value;
end;
$$;

-- Atomically bump a profile's session_version and return the new value.
-- Used by the login flow to invalidate every previously issued session cookie.
create or replace function public.bump_session_version(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_version integer;
begin
  update public.profiles
  set session_version = session_version + 1
  where id = p_user_id
  returning session_version into new_version;
  return new_version;
end;
$$;
