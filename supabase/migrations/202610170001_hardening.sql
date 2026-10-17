-- Keep payment ownership aligned with the delivery owner and prevent cancelling
-- deliveries while a payment could still settle. Apply after the initial migration.

alter table public.deliveries
  add constraint deliveries_id_customer_id_key unique (id, customer_id);

alter table public.payments
  add constraint payments_delivery_owner_fkey
  foreign key (delivery_id, customer_id)
  references public.deliveries (id, customer_id)
  on delete restrict;

create or replace function public.record_delivery_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.delivery_events (delivery_id, actor_id, status)
  values (new.id, new.customer_id, new.status);
  return new;
end;
$$;

create trigger deliveries_record_request
  after insert on public.deliveries
  for each row execute procedure public.record_delivery_request();

revoke all on function public.record_delivery_request() from public, anon, authenticated;

create or replace function public.cancel_delivery(p_delivery_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.deliveries d
  set status = 'cancelled', cancelled_at = now(), updated_at = now()
  where d.id = p_delivery_id
    and d.customer_id = auth.uid()
    and d.rider_id is null
    and d.status = 'requested'
    and not exists (
      select 1 from public.payments p
      where p.delivery_id = d.id and p.status in ('pending', 'success')
    );

  if not found then
    raise exception 'This delivery can no longer be cancelled';
  end if;

  insert into public.delivery_events (delivery_id, actor_id, status)
  values (p_delivery_id, auth.uid(), 'cancelled');
end;
$$;
