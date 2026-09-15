-- Allow checklist items to use the budget categories created by each event owner.
alter table public.checklist_items
  drop constraint if exists checklist_items_category_check;
