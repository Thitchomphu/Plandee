-- Plandee data model, ownership rules, and transactional helpers.
-- Run this file in the Supabase SQL editor after reviewing it.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  occupation text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  kind text not null check (length(trim(kind)) > 0),
  event_date date not null,
  event_date_label text,
  venue text,
  budget numeric(12,2) not null default 0 check (budget >= 0),
  status text not null default 'upcoming' check (status in ('upcoming', 'completed')),
  banner_color text,
  accent_color text,
  icon text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  category text not null check (category in ('สถานที่', 'อาหาร', 'ตกแต่ง', 'อื่น ๆ')),
  due_date date,
  budget numeric(12,2) not null default 0 check (budget >= 0),
  note text,
  done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.budget_categories (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  planned numeric(12,2) not null default 0 check (planned >= 0),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, name)
);

create table if not exists public.budget_expenses (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  category_id uuid not null references public.budget_categories(id) on delete cascade,
  checklist_item_id uuid references public.checklist_items(id) on delete set null,
  name text not null check (length(trim(name)) > 0),
  amount numeric(12,2) not null check (amount > 0),
  paid boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  group_name text,
  phone text,
  email text,
  dietary text,
  rsvp text not null default 'pending' check (rsvp in ('accepted', 'pending', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.guest_tables (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  capacity integer not null check (capacity > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.guest_seating (
  guest_id uuid primary key references public.guests(id) on delete cascade,
  table_id uuid not null references public.guest_tables(id) on delete cascade,
  assigned_at timestamptz not null default now()
);

create index if not exists events_owner_id_idx on public.events(owner_id);
create index if not exists checklist_items_event_id_idx on public.checklist_items(event_id);
create index if not exists budget_categories_event_id_idx on public.budget_categories(event_id);
create index if not exists budget_expenses_event_id_idx on public.budget_expenses(event_id);
create index if not exists guests_event_id_idx on public.guests(event_id);
create index if not exists guest_tables_event_id_idx on public.guest_tables(event_id);
create index if not exists guest_seating_table_id_idx on public.guest_seating(table_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at before update on public.events for each row execute function public.set_updated_at();
drop trigger if exists checklist_items_set_updated_at on public.checklist_items;
create trigger checklist_items_set_updated_at before update on public.checklist_items for each row execute function public.set_updated_at();
drop trigger if exists budget_categories_set_updated_at on public.budget_categories;
create trigger budget_categories_set_updated_at before update on public.budget_categories for each row execute function public.set_updated_at();
drop trigger if exists budget_expenses_set_updated_at on public.budget_expenses;
create trigger budget_expenses_set_updated_at before update on public.budget_expenses for each row execute function public.set_updated_at();
drop trigger if exists guests_set_updated_at on public.guests;
create trigger guests_set_updated_at before update on public.guests for each row execute function public.set_updated_at();

create or replace function public.validate_budget_expense_links()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.budget_categories
    where id = new.category_id and event_id = new.event_id
  ) then
    raise exception 'budget category must belong to the same event';
  end if;
  if new.checklist_item_id is not null and not exists (
    select 1 from public.checklist_items
    where id = new.checklist_item_id and event_id = new.event_id
  ) then
    raise exception 'checklist item must belong to the same event';
  end if;
  return new;
end;
$$;

drop trigger if exists budget_expenses_validate_links on public.budget_expenses;
create trigger budget_expenses_validate_links
before insert or update on public.budget_expenses
for each row execute function public.validate_budget_expense_links();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, occupation)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'occupation'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_event_owner(target_event_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1 from public.events
    where id = target_event_id and owner_id = auth.uid()
  );
$$;

revoke execute on function public.is_event_owner(uuid) from public, anon;
grant execute on function public.is_event_owner(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.checklist_items enable row level security;
alter table public.budget_categories enable row level security;
alter table public.budget_expenses enable row level security;
alter table public.guests enable row level security;
alter table public.guest_tables enable row level security;
alter table public.guest_seating enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select to authenticated using (id = auth.uid());
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles for insert to authenticated with check (id = auth.uid());
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists profiles_delete_own on public.profiles;
create policy profiles_delete_own on public.profiles for delete to authenticated using (id = auth.uid());

drop policy if exists events_owner_all on public.events;
create policy events_owner_all on public.events for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists checklist_items_owner_all on public.checklist_items;
create policy checklist_items_owner_all on public.checklist_items for all to authenticated using (public.is_event_owner(event_id)) with check (public.is_event_owner(event_id));
drop policy if exists budget_categories_owner_all on public.budget_categories;
create policy budget_categories_owner_all on public.budget_categories for all to authenticated using (public.is_event_owner(event_id)) with check (public.is_event_owner(event_id));
drop policy if exists budget_expenses_owner_all on public.budget_expenses;
create policy budget_expenses_owner_all on public.budget_expenses for all to authenticated using (public.is_event_owner(event_id)) with check (public.is_event_owner(event_id));
drop policy if exists guests_owner_all on public.guests;
create policy guests_owner_all on public.guests for all to authenticated using (public.is_event_owner(event_id)) with check (public.is_event_owner(event_id));
drop policy if exists guest_tables_owner_all on public.guest_tables;
create policy guest_tables_owner_all on public.guest_tables for all to authenticated using (public.is_event_owner(event_id)) with check (public.is_event_owner(event_id));

drop policy if exists guest_seating_owner_all on public.guest_seating;
create policy guest_seating_owner_all on public.guest_seating for all to authenticated
using (
  exists (select 1 from public.guests g where g.id = guest_id and public.is_event_owner(g.event_id))
)
with check (
  exists (
    select 1
    from public.guests g
    join public.guest_tables t on t.event_id = g.event_id
    where g.id = guest_id and t.id = table_id and public.is_event_owner(g.event_id)
  )
);

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
  values (auth.uid(), p_title, p_kind, case when p_event_date ~ '^\\d{4}-\\d{2}-\\d{2}$' then p_event_date::date else current_date end, p_event_date, p_venue, greatest(coalesce(p_budget, 0), 0))
  returning * into created_event;

  for item in select value from jsonb_array_elements(coalesce(p_checklist, '[]'::jsonb)) loop
    category_name := item ->> 'category';
    insert into public.budget_categories (event_id, name, planned)
    values (created_event.id, category_name, 0)
    on conflict (event_id, name) do update set name = excluded.name
    returning id into category_id;

    insert into public.checklist_items (event_id, title, category, due_date, budget, note, done)
    values (created_event.id, item ->> 'title', category_name, case when item ->> 'dueDate' ~ '^\\d{4}-\\d{2}-\\d{2}$' then (item ->> 'dueDate')::date else null end, coalesce((item ->> 'budget')::numeric, 0), item ->> 'note', false)
    returning id into checklist_id;

    if coalesce((item ->> 'budget')::numeric, 0) > 0 then
      insert into public.budget_expenses (event_id, category_id, checklist_item_id, name, amount, paid)
      values (created_event.id, category_id, checklist_id, item ->> 'title', (item ->> 'budget')::numeric, false);
    end if;
  end loop;
  return created_event;
end;
$$;

create or replace function public.assign_guest_to_table(p_guest_id uuid, p_table_id uuid)
returns public.guest_seating
language plpgsql
security invoker
set search_path = public
as $$
declare
  guest_event_id uuid;
  table_event_id uuid;
  table_capacity integer;
  seated_count integer;
  assignment public.guest_seating;
begin
  select event_id into guest_event_id from public.guests where id = p_guest_id;
  select event_id, capacity into table_event_id, table_capacity from public.guest_tables where id = p_table_id for update;
  if guest_event_id is null or table_event_id is null or guest_event_id <> table_event_id then raise exception 'guest and table must belong to the same event'; end if;
  if not public.is_event_owner(guest_event_id) then raise exception 'not event owner'; end if;
  select count(*) into seated_count from public.guest_seating where table_id = p_table_id;
  if seated_count >= table_capacity then raise exception 'table is full'; end if;
  insert into public.guest_seating (guest_id, table_id) values (p_guest_id, p_table_id)
  on conflict (guest_id) do update set table_id = excluded.table_id, assigned_at = now()
  returning * into assignment;
  return assignment;
end;
$$;

create or replace function public.seed_demo_data()
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  demo_event_id uuid;
  venue_category_id uuid;
  food_category_id uuid;
  decor_category_id uuid;
  venue_checklist_id uuid;
  food_checklist_id uuid;
  decor_checklist_id uuid;
  table_one_id uuid;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if exists (select 1 from public.events where owner_id = auth.uid()) then return; end if;

  insert into public.events (owner_id, title, kind, event_date, venue, budget, status, banner_color, accent_color, icon)
  values (auth.uid(), 'งานแต่งงาน พลอย & เจมส์', 'งานแต่งงาน', '2026-02-14', 'โรงแรมเชอราตัน', 150000, 'upcoming', '#FFF0F3', '#E9436F', '💍')
  returning id into demo_event_id;

  insert into public.budget_categories (event_id, name, planned) values (demo_event_id, 'สถานที่', 60000) returning id into venue_category_id;
  insert into public.budget_categories (event_id, name, planned) values (demo_event_id, 'อาหาร', 42000) returning id into food_category_id;
  insert into public.budget_categories (event_id, name, planned) values (demo_event_id, 'ตกแต่ง', 45000) returning id into decor_category_id;

  insert into public.checklist_items (event_id, title, category, due_date, budget, note, done)
  values (demo_event_id, 'ยืนยันการจองโรงแรม', 'สถานที่', '2026-02-10', 60000, 'ส่งหลักฐานการชำระเงินให้โรงแรม', true)
  returning id into venue_checklist_id;
  insert into public.checklist_items (event_id, title, category, due_date, budget, note, done)
  values (demo_event_id, 'เลือกเมนูอาหารและเครื่องดื่ม', 'อาหาร', '2026-02-02', 42000, 'ยืนยันเมนูกับทีมอาหาร', true)
  returning id into food_checklist_id;
  insert into public.checklist_items (event_id, title, category, due_date, budget, note, done)
  values (demo_event_id, 'สรุปแบบดอกไม้และฉากถ่ายรูป', 'ตกแต่ง', '2026-02-09', 25000, null, false)
  returning id into decor_checklist_id;

  insert into public.budget_expenses (event_id, category_id, checklist_item_id, name, amount, paid) values
    (demo_event_id, venue_category_id, venue_checklist_id, 'ค่าจองสถานที่', 60000, true),
    (demo_event_id, food_category_id, food_checklist_id, 'ค่าอาหารและเครื่องดื่ม', 42000, true),
    (demo_event_id, decor_category_id, decor_checklist_id, 'ค่าตกแต่งสถานที่', 25000, false);

  insert into public.guests (event_id, name, group_name, phone, email, dietary, rsvp)
  values
    (demo_event_id, 'กมลวรรณ ใจดี', 'ครอบครัวฝ่ายหญิง', '0812345678', 'kamonwan@example.com', 'ไม่มี', 'accepted'),
    (demo_event_id, 'ธนพล สุขใจ', 'ครอบครัวฝ่ายชาย', '0823456789', 'thanapon@example.com', 'ไม่มี', 'accepted'),
    (demo_event_id, 'ณัฐชา แสงทอง', 'เพื่อนเจ้าสาว', '0834567890', 'natcha@example.com', 'มังสวิรัติ', 'pending');

  insert into public.guest_tables (event_id, name, capacity) values (demo_event_id, 'โต๊ะ 1 (VIP)', 10) returning id into table_one_id;
  insert into public.guest_seating (guest_id, table_id)
  select g.id, table_one_id from public.guests g where g.event_id = demo_event_id order by g.created_at limit 2;
end;
$$;

create or replace view public.event_budget_summary with (security_invoker = true) as
select
  e.id as event_id,
  e.owner_id,
  e.budget as event_budget,
  coalesce(sum(be.amount), 0)::numeric(12,2) as used,
  greatest(e.budget - coalesce(sum(be.amount), 0), 0)::numeric(12,2) as remaining,
  case when e.budget > 0 then round(coalesce(sum(be.amount), 0) / e.budget * 100) else 0 end as used_percent
from public.events e
left join public.budget_expenses be on be.event_id = e.id
group by e.id, e.owner_id, e.budget;

grant select, insert, update, delete on public.profiles, public.events, public.checklist_items, public.budget_categories, public.budget_expenses, public.guests, public.guest_tables, public.guest_seating to authenticated;
revoke all on public.profiles, public.events, public.checklist_items, public.budget_categories, public.budget_expenses, public.guests, public.guest_tables, public.guest_seating from anon;
grant select on public.event_budget_summary to authenticated;
revoke all on public.event_budget_summary from anon;
grant execute on function public.create_event_with_checklist(text, text, text, text, numeric, jsonb) to authenticated;
grant execute on function public.assign_guest_to_table(uuid, uuid) to authenticated;
grant execute on function public.seed_demo_data() to authenticated;
