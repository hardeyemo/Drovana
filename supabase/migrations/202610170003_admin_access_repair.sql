-- Restore the admin authorization predicate and its RLS-backed read access.
-- Admin status is always derived from the authenticated user's profiles row.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'::public.account_role
    );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

grant select on public.profiles, public.rider_profiles, public.business_profiles,
  public.deliveries, public.delivery_events, public.payments to authenticated;

alter table public.profiles enable row level security;
alter table public.rider_profiles enable row level security;
alter table public.business_profiles enable row level security;
alter table public.deliveries enable row level security;
alter table public.delivery_events enable row level security;
alter table public.payments enable row level security;

drop policy if exists "Admins read profiles" on public.profiles;
create policy "Admins read profiles" on public.profiles
  for select to authenticated using (public.is_admin());

drop policy if exists "Admins read rider applications" on public.rider_profiles;
create policy "Admins read rider applications" on public.rider_profiles
  for select to authenticated using (public.is_admin());

drop policy if exists "Admins read business applications" on public.business_profiles;
create policy "Admins read business applications" on public.business_profiles
  for select to authenticated using (public.is_admin());

drop policy if exists "Admins read all deliveries" on public.deliveries;
create policy "Admins read all deliveries" on public.deliveries
  for select to authenticated using (public.is_admin());

drop policy if exists "Admins read delivery events" on public.delivery_events;
create policy "Admins read delivery events" on public.delivery_events
  for select to authenticated using (public.is_admin());

drop policy if exists "Admins read all payments" on public.payments;
create policy "Admins read all payments" on public.payments
  for select to authenticated using (public.is_admin());

notify pgrst, 'reload schema';
