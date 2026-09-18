alter table public.events add column if not exists is_favorite boolean not null default false;
