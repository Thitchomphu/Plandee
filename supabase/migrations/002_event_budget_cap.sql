-- Keep category allocations within the event's overall budget, including
-- checklist estimates when a category has no explicit allocation yet.
-- The UI allows custom budget categories to be used by checklist items.
alter table public.checklist_items drop constraint if exists checklist_items_category_check;
alter table public.checklist_items drop constraint if exists checklist_items_category_not_blank;
alter table public.checklist_items add constraint checklist_items_category_not_blank check (length(trim(category)) > 0);

create or replace function public.assert_event_budget_cap(p_event_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  event_limit numeric;
  category_total numeric;
begin
  -- Serializes allocation changes for the same event across devices.
  select budget into event_limit from public.events where id = p_event_id for update;
  if event_limit is null then return; end if;

  with task_totals as (
    select category, sum(budget) as amount
    from public.checklist_items
    where event_id = p_event_id
    group by category
  ), allocations as (
    select case when c.planned > 0 then c.planned else coalesce(t.amount, 0) end as amount
    from public.budget_categories c
    left join task_totals t on t.category = c.name
    where c.event_id = p_event_id
    union all
    select t.amount
    from task_totals t
    where not exists (
      select 1 from public.budget_categories c
      where c.event_id = p_event_id and c.name = t.category
    )
  )
  select coalesce(sum(amount), 0) into category_total from allocations;

  if category_total > event_limit then
    raise exception 'งบหมวดรวม % บาท เกินงบงาน % บาท', category_total, event_limit
      using errcode = '23514';
  end if;
end;
$$;

create or replace function public.check_event_budget_cap_change()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if tg_table_name = 'checklist_items' then
    if tg_op = 'INSERT' then
      if new.budget = 0 then return null; end if;
    elsif tg_op = 'UPDATE' then
      if old.budget = 0 and new.budget = 0 then return null; end if;
    elsif tg_op = 'DELETE' then
      if old.budget = 0 then return null; end if;
    end if;
  end if;

  if tg_table_name = 'events' then
    perform public.assert_event_budget_cap(new.id);
  elsif tg_op = 'DELETE' then
    perform public.assert_event_budget_cap(old.event_id);
  else
    perform public.assert_event_budget_cap(new.event_id);
    if tg_op = 'UPDATE' and old.event_id is distinct from new.event_id then
      perform public.assert_event_budget_cap(old.event_id);
    end if;
  end if;
  return null;
end;
$$;

drop trigger if exists events_budget_cap on public.events;
create trigger events_budget_cap after update of budget on public.events
for each row execute function public.check_event_budget_cap_change();

drop trigger if exists budget_categories_cap on public.budget_categories;
create trigger budget_categories_cap after insert or update of planned, name, event_id or delete on public.budget_categories
for each row execute function public.check_event_budget_cap_change();

drop trigger if exists checklist_items_budget_cap on public.checklist_items;
create trigger checklist_items_budget_cap after insert or update of category, budget, event_id or delete on public.checklist_items
for each row execute function public.check_event_budget_cap_change();
