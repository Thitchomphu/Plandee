-- Fix date-only validation so create_event_with_checklist keeps the selected date
-- instead of falling back to current_date.
create or replace function public.create_event_with_checklist(
  p_title text,
  p_kind text,
  p_event_date text,
  p_venue text,
  p_budget numeric,
  p_checklist jsonb default '[]'::jsonb
)
returns public.events
language plpgsql
security invoker
set search_path = public
as $$
declare
  created_event public.events;
  item jsonb;
  category_id uuid;
  category_name text;
  checklist_id uuid;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;

  insert into public.events (owner_id, title, kind, event_date, event_date_label, venue, budget)
  values (
    auth.uid(), p_title, p_kind,
    case when p_event_date ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then p_event_date::date else current_date end,
    p_event_date, p_venue, greatest(coalesce(p_budget, 0), 0)
  )
  returning * into created_event;

  for item in select value from jsonb_array_elements(coalesce(p_checklist, '[]'::jsonb)) loop
    category_name := item ->> 'category';
    insert into public.budget_categories (event_id, name, planned)
    values (created_event.id, category_name, 0)
    on conflict (event_id, name) do update set name = excluded.name
    returning id into category_id;

    insert into public.checklist_items (event_id, title, category, due_date, budget, note, done)
    values (
      created_event.id, item ->> 'title', category_name,
      case when item ->> 'dueDate' ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then (item ->> 'dueDate')::date else null end,
      coalesce((item ->> 'budget')::numeric, 0), item ->> 'note', false
    )
    returning id into checklist_id;

    if coalesce((item ->> 'budget')::numeric, 0) > 0 then
      insert into public.budget_expenses (event_id, category_id, checklist_item_id, name, amount, paid)
      values (created_event.id, category_id, checklist_id, item ->> 'title', (item ->> 'budget')::numeric, false);
    end if;
  end loop;
  return created_event;
end;
$$;
