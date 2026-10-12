-- Google OAuth sign-in populates raw_user_meta_data with Google's own keys
-- (full_name is never set; Google uses `name`, falling back to given_name +
-- family_name, or the email's local part) instead of our own signup route's
-- `full_name` key. Widen the trigger so an OAuth-created profile never ends
-- up with an empty name.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  resolved_name text;
begin
  resolved_name := coalesce(
    nullif(new.raw_user_meta_data->>'full_name', ''),
    nullif(new.raw_user_meta_data->>'name', ''),
    nullif(
      trim(concat(new.raw_user_meta_data->>'given_name', ' ', new.raw_user_meta_data->>'family_name')),
      ''
    ),
    split_part(new.email, '@', 1)
  );

  insert into public.profiles (id, full_name, email, mobile)
  values (
    new.id,
    resolved_name,
    new.email,
    new.raw_user_meta_data->>'mobile'
  );
  return new;
end;
$$;
