-- Repair missing customer profiles while keeping every write scoped to the
-- authenticated user's own ID. Existing account roles are never overwritten.

grant select, insert, update on public.profiles to authenticated;
revoke all on public.profiles from anon, public;

drop policy if exists "Users create own customer profile" on public.profiles;
create policy "Users create own customer profile" on public.profiles
  for insert to authenticated
  with check (auth.uid() = id and role = 'customer');

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

insert into public.profiles (id, full_name, phone)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', ''),
  nullif(u.raw_user_meta_data ->> 'phone', '')
from auth.users as u
on conflict (id) do nothing;

notify pgrst, 'reload schema';
