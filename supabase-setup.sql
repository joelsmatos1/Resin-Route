-- Execute once in the SQL Editor of your own Supabase project.
begin;
create table if not exists public.resin_route_plans (
  user_id uuid primary key references auth.users(id) on delete cascade,
  document jsonb not null check (jsonb_typeof(document) = 'object' and document ? 'tasks'),
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now(),
  constraint plan_size_limit check (octet_length(document::text) <= 2000000)
);
alter table public.resin_route_plans enable row level security;
revoke all on public.resin_route_plans from anon;
grant select, insert, update on public.resin_route_plans to authenticated;
drop policy if exists own_plan_read on public.resin_route_plans;
create policy own_plan_read on public.resin_route_plans for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists own_plan_insert on public.resin_route_plans;
create policy own_plan_insert on public.resin_route_plans for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists own_plan_update on public.resin_route_plans;
create policy own_plan_update on public.resin_route_plans for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Compare-and-swap: a stale tab/device cannot silently overwrite a newer plan.
create or replace function public.save_resin_route_plan(p_document jsonb, p_revision bigint)
returns setof public.resin_route_plans
language plpgsql security invoker set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_revision is null then
    return query insert into public.resin_route_plans(user_id, document)
      values (auth.uid(), p_document) on conflict (user_id) do nothing returning *;
  else
    return query update public.resin_route_plans
      set document = p_document, revision = revision + 1, updated_at = now()
      where user_id = auth.uid() and revision = p_revision returning *;
  end if;
end;
$$;
revoke all on function public.save_resin_route_plan(jsonb, bigint) from public, anon;
grant execute on function public.save_resin_route_plan(jsonb, bigint) to authenticated;
commit;
