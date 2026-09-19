-- Keep the database column name aligned with the app's responsible field.
alter table public.checklist_items
  add column if not exists responsible text not null default '';

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'checklist_items' and column_name = 'assignee_name'
  ) then
    update public.checklist_items
    set responsible = assignee_name
    where coalesce(responsible, '') = '' and coalesce(assignee_name, '') <> '';
  end if;
end;
$$;
