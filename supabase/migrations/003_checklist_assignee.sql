-- This is a display name only. Team invitations and access rights require
-- a separate event-membership model and RLS policies.
alter table public.checklist_items
  add column if not exists assignee_name text not null default '';
