-- Drovna marketplace foundation for Supabase PostgreSQL.
-- Apply with: supabase db push

create extension if not exists pgcrypto;

create type public.account_role as enum ('customer', 'rider', 'business', 'admin');
create type public.rider_review_status as enum ('pending', 'approved', 'rejected', 'suspended');
create type public.business_review_status as enum ('pending', 'approved', 'rejected', 'suspended');
create type public.delivery_category as enum ('food', 'grocery', 'parcel', 'product');
create type public.delivery_status as enum (
  'requested', 'searching_rider', 'accepted', 'picked_up', 'in_transit', 'delivered', 'cancelled'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  phone text,
  role public.account_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rider_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  review_status public.rider_review_status not null default 'pending',
  vehicle_type text,
  vehicle_registration text,
  is_available boolean not null default false,
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.business_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  business_name text not null,
  category text not null,
  address text not null,
  phone text not null,
  review_status public.business_review_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.saved_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  label text not null check (char_length(label) between 1 and 60),
  address text not null check (char_length(address) between 5 and 300),
  area text not null default 'Ilorin',
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  created_at timestamptz not null default now()
);

create table public.deliveries (
  id uuid primary key default gen_random_uuid(),
  tracking_code text not null unique default upper('SD-' || substr(encode(gen_random_bytes(5), 'hex'), 1, 8)),
  customer_id uuid not null references public.profiles (id),
  rider_id uuid references public.profiles (id),
  business_id uuid references public.business_profiles (user_id),
  category public.delivery_category not null,
  pickup_address text not null,
  pickup_lat double precision,
  pickup_lng double precision,
  dropoff_address text not null,
  dropoff_lat double precision,
  dropoff_lng double precision,
  customer_phone text not null,
  item_notes text,
  distance_meters integer,
  estimated_fee_kobo integer not null check (
    estimated_fee_kobo >= case category
      when 'food' then 70000 when 'grocery' then 80000 when 'parcel' then 65000 when 'product' then 80000 end
  ),
  final_fee_kobo integer check (final_fee_kobo is null or final_fee_kobo >= 0),
  status public.delivery_status not null default 'requested',
  requested_at timestamptz not null default now(),
  accepted_at timestamptz,
  picked_up_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index deliveries_customer_recent_idx on public.deliveries (customer_id, created_at desc);
create index deliveries_rider_recent_idx on public.deliveries (rider_id, created_at desc);
create index deliveries_open_jobs_idx on public.deliveries (status, requested_at) where rider_id is null;

create table public.delivery_events (
  id bigint generated always as identity primary key,
  delivery_id uuid not null references public.deliveries (id) on delete cascade,
  actor_id uuid references public.profiles (id),
  status public.delivery_status not null,
  note text,
  created_at timestamptz not null default now()
);

create index delivery_events_delivery_time_idx on public.delivery_events (delivery_id, created_at);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  delivery_id uuid not null references public.deliveries (id) on delete restrict,
  customer_id uuid not null references public.profiles (id),
  provider text not null default 'paystack' check (provider = 'paystack'),
  provider_reference text not null unique,
  amount_kobo integer not null check (amount_kobo > 0),
  currency text not null default 'NGN' check (currency = 'NGN'),
  status text not null default 'pending' check (status in ('pending', 'success', 'failed', 'refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index payments_customer_recent_idx on public.payments (customer_id, created_at desc);
create unique index payments_one_live_per_delivery_idx on public.payments (delivery_id) where status in ('pending', 'success');

-- Create a customer profile on signup. Role remains customer; rider approval is
-- an admin operation and cannot be self-assigned through the client.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.prevent_self_role_change()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
    and coalesce(auth.role(), '') <> 'service_role'
    and current_user not in ('postgres', 'supabase_admin')
    and not public.is_admin() then
    raise exception 'Profile role changes require trusted server access';
  end if;
  return new;
end;
$$;

create trigger profiles_role_guard
  before update on public.profiles
  for each row execute procedure public.prevent_self_role_change();

alter table public.profiles enable row level security;
alter table public.rider_profiles enable row level security;
alter table public.business_profiles enable row level security;
alter table public.saved_addresses enable row level security;
alter table public.deliveries enable row level security;
alter table public.delivery_events enable row level security;
alter table public.payments enable row level security;

create policy "Users read their own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy "Admins read profiles" on public.profiles
  for select to authenticated using (public.is_admin());
create policy "Users update their own contact details" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create policy "Riders read their own rider profile" on public.rider_profiles
  for select to authenticated using (auth.uid() = user_id);
create policy "Admins read rider applications" on public.rider_profiles
  for select to authenticated using (public.is_admin());
create policy "Users apply to ride" on public.rider_profiles
  for insert to authenticated with check (
    auth.uid() = user_id and review_status = 'pending' and is_available = false
  );

create policy "Applicants read own business profile" on public.business_profiles
  for select to authenticated using (auth.uid() = user_id or public.is_admin());
create policy "Users apply for a business account" on public.business_profiles
  for insert to authenticated with check (auth.uid() = user_id and review_status = 'pending');

create policy "Users manage own saved addresses" on public.saved_addresses
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Customers read their deliveries" on public.deliveries
  for select to authenticated using (auth.uid() = customer_id or auth.uid() = rider_id);
create policy "Businesses read their deliveries" on public.deliveries
  for select to authenticated using (business_id = auth.uid() and exists (select 1 from public.business_profiles b where b.user_id = auth.uid() and b.review_status = 'approved'));
create policy "Customers create delivery requests" on public.deliveries
  for insert to authenticated with check (
    auth.uid() = customer_id and rider_id is null and status = 'requested'
    and (business_id is null or (business_id = auth.uid() and exists (
      select 1 from public.business_profiles b where b.user_id = auth.uid() and b.review_status = 'approved'
    )))
  );
create policy "Admins read all deliveries" on public.deliveries
  for select to authenticated using (public.is_admin());

create policy "Participants read delivery events" on public.delivery_events
  for select to authenticated using (
    exists (
      select 1 from public.deliveries d
      where d.id = delivery_id and (d.customer_id = auth.uid() or d.rider_id = auth.uid())
    )
  );

create policy "Customers read own payments" on public.payments
  for select to authenticated using (auth.uid() = customer_id);
create policy "Admins read all payments" on public.payments
  for select to authenticated using (public.is_admin());

create policy "Approved riders manage own availability" on public.rider_profiles
  for update to authenticated using (auth.uid() = user_id and review_status = 'approved')
  with check (auth.uid() = user_id and review_status = 'approved');

create or replace function public.cancel_delivery(p_delivery_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.deliveries set status = 'cancelled', cancelled_at = now(), updated_at = now()
    where id = p_delivery_id and customer_id = auth.uid() and rider_id is null and status = 'requested';
  if not found then raise exception 'This delivery can no longer be cancelled'; end if;
  insert into public.delivery_events (delivery_id, actor_id, status) values (p_delivery_id, auth.uid(), 'cancelled');
end;
$$;

create or replace function public.submit_rider_application(p_vehicle_type text, p_vehicle_registration text)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  insert into public.rider_profiles (user_id, vehicle_type, vehicle_registration)
  values (auth.uid(), left(trim(p_vehicle_type), 40), left(trim(p_vehicle_registration), 30));
end;
$$;

create or replace function public.submit_business_application(p_name text, p_category text, p_address text, p_phone text)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  insert into public.business_profiles (user_id, business_name, category, address, phone)
  values (auth.uid(), left(trim(p_name), 120), left(trim(p_category), 60), left(trim(p_address), 300), left(trim(p_phone), 24));
end;
$$;

create or replace function public.admin_review_application(p_user_id uuid, p_kind text, p_decision text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Administrator access required'; end if;
  if p_decision not in ('approved', 'rejected', 'suspended') then raise exception 'Invalid review decision'; end if;
  if p_kind = 'rider' then
    update public.rider_profiles set review_status = p_decision::public.rider_review_status,
      approved_at = case when p_decision = 'approved' then now() else null end
    where user_id = p_user_id;
    if not found then raise exception 'Rider application not found'; end if;
    update public.profiles set role = case when p_decision = 'approved' then 'rider'::public.account_role else 'customer'::public.account_role end where id = p_user_id;
  elsif p_kind = 'business' then
    update public.business_profiles set review_status = p_decision::public.business_review_status where user_id = p_user_id;
    if not found then raise exception 'Business application not found'; end if;
    update public.profiles set role = case when p_decision = 'approved' then 'business'::public.account_role else 'customer'::public.account_role end where id = p_user_id;
  else raise exception 'Invalid application type'; end if;
end;
$$;

create or replace function public.rider_open_jobs()
returns table (id uuid, tracking_code text, category public.delivery_category, pickup_address text, dropoff_address text, distance_meters integer, estimated_fee_kobo integer, requested_at timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.rider_profiles where user_id = auth.uid() and review_status = 'approved' and is_available) then
    raise exception 'Approved rider must be online';
  end if;
  return query select d.id, d.tracking_code, d.category, d.pickup_address, d.dropoff_address, d.distance_meters, d.estimated_fee_kobo, d.requested_at
    from public.deliveries d
    where d.rider_id is null and d.status = 'requested'
      and exists (select 1 from public.payments p where p.delivery_id = d.id and p.status = 'success')
    order by d.requested_at limit 50;
end;
$$;

create or replace function public.rider_accept_delivery(p_delivery_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare affected integer;
begin
  if not exists (select 1 from public.rider_profiles where user_id = auth.uid() and review_status = 'approved' and is_available) then
    raise exception 'Approved rider must be online';
  end if;
  update public.deliveries set rider_id = auth.uid(), status = 'accepted', accepted_at = now(), updated_at = now()
    where id = p_delivery_id and rider_id is null and status = 'requested'
      and exists (select 1 from public.payments p where p.delivery_id = p_delivery_id and p.status = 'success');
  get diagnostics affected = row_count;
  if affected = 0 then raise exception 'Delivery is no longer available'; end if;
  insert into public.delivery_events (delivery_id, actor_id, status) values (p_delivery_id, auth.uid(), 'accepted');
end;
$$;

create or replace function public.rider_update_delivery(p_delivery_id uuid, p_status public.delivery_status)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_status not in ('picked_up', 'in_transit', 'delivered') then raise exception 'Invalid delivery status'; end if;
  update public.deliveries set status = p_status, updated_at = now(),
    picked_up_at = case when p_status = 'picked_up' then now() else picked_up_at end,
    delivered_at = case when p_status = 'delivered' then now() else delivered_at end
    where id = p_delivery_id and rider_id = auth.uid() and status = case p_status when 'picked_up' then 'accepted'::public.delivery_status when 'in_transit' then 'picked_up'::public.delivery_status else 'in_transit'::public.delivery_status end;
  if not found then raise exception 'Delivery is not assigned to you or status transition is invalid'; end if;
  insert into public.delivery_events (delivery_id, actor_id, status) values (p_delivery_id, auth.uid(), p_status);
end;
$$;

create or replace function public.admin_overview()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Administrator access required'; end if;
  return jsonb_build_object(
    'deliveries_today', (select count(*) from public.deliveries where requested_at >= date_trunc('day', now())),
    'open_deliveries', (select count(*) from public.deliveries where status in ('requested', 'searching_rider')),
    'rider_applications', (select count(*) from public.rider_profiles where review_status = 'pending'),
    'business_applications', (select count(*) from public.business_profiles where review_status = 'pending'),
    'paid_kobo_today', (select coalesce(sum(amount_kobo), 0) from public.payments where status = 'success' and created_at >= date_trunc('day', now()))
  );
end;
$$;

grant execute on function public.submit_rider_application(text, text) to authenticated;
grant execute on function public.submit_business_application(text, text, text, text) to authenticated;
grant execute on function public.admin_review_application(uuid, text, text) to authenticated;
grant execute on function public.rider_open_jobs() to authenticated;
grant execute on function public.rider_accept_delivery(uuid) to authenticated;
grant execute on function public.rider_update_delivery(uuid, public.delivery_status) to authenticated;
grant execute on function public.admin_overview() to authenticated;
grant execute on function public.cancel_delivery(uuid) to authenticated;

revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.admin_review_application(uuid, text, text) from public, anon;
revoke execute on function public.rider_open_jobs() from public, anon;
revoke execute on function public.rider_accept_delivery(uuid) from public, anon;
revoke execute on function public.rider_update_delivery(uuid, public.delivery_status) from public, anon;
revoke execute on function public.admin_overview() from public, anon;
revoke execute on function public.cancel_delivery(uuid) from public, anon;
revoke execute on function public.submit_rider_application(text, text) from public, anon;
revoke execute on function public.submit_business_application(text, text, text, text) from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Rider assignment and status transitions should be performed through trusted
-- server logic (Edge Function or server route using the service role key).
