import { supabase } from '@/lib/supabase';
import { ensureProfile } from '@/lib/profile';
import { hydrateChecklistItems } from '@/data/checklists';

export type EventStatus = 'upcoming' | 'completed';
export type EventItem = { id: string; title: string; date: string; venue: string; kind: string; icon: string; daysLeft: number; progress: number; status: EventStatus; banner: string; accent: string; budget: number; guests: number; pending: number };

export let events: EventItem[] = [];

type CloudEvent = { id: string; title: string; event_date: string; event_date_label: string | null; venue: string | null; kind: string; status: EventStatus; banner_color: string | null; accent_color: string | null; icon: string | null; budget: number };
const daysUntil = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);
  const target = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((target.getTime() - today.getTime()) / 86400000));
};
const displayDate = (value: string) => new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`));
const isDateValue = (value: string | null): value is string => Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));

export async function hydrateEvents() {
  const { data, error } = await supabase.from('events').select('id,title,event_date,event_date_label,venue,kind,status,banner_color,accent_color,icon,budget').order('event_date_label', { ascending: true });
  if (error) return false;
  const cloudEvents = (data ?? []) as unknown as CloudEvent[];
  if (!cloudEvents.length) { events = []; return true; }
  const eventIds = cloudEvents.map((event) => event.id);
  const [{ data: checklistRows }, { data: guestRows }] = await Promise.all([
    supabase.from('checklist_items').select('event_id,done').in('event_id', eventIds),
    supabase.from('guests').select('event_id,rsvp').in('event_id', eventIds),
  ]);
  const checklist = (checklistRows ?? []) as unknown as { event_id: string; done: boolean }[];
  const guests = (guestRows ?? []) as unknown as { event_id: string; rsvp: string }[];
  events = cloudEvents.map((event) => {
    const items = checklist.filter((item) => item.event_id === event.id);
    const eventGuests = guests.filter((guest) => guest.event_id === event.id);
    const storedLabel = event.event_date_label;
    const eventDate = isDateValue(storedLabel) ? storedLabel : event.event_date;
    return { id: event.id, title: event.title, date: isDateValue(storedLabel) ? displayDate(storedLabel) : storedLabel || displayDate(event.event_date), venue: event.venue ?? 'ยังไม่ได้ระบุสถานที่', kind: event.kind, icon: event.icon ?? '📅', daysLeft: event.status === 'completed' ? 0 : daysUntil(eventDate), progress: items.length ? Math.round((items.filter((item) => item.done).length / items.length) * 100) : 0, status: event.status, banner: event.banner_color ?? '#FFF0F3', accent: event.accent_color ?? '#E9436F', budget: Number(event.budget), guests: eventGuests.length, pending: items.filter((item) => !item.done).length };
  });
  return true;
}

export async function createEventWithChecklist(input: { title: string; kind: string; eventDate: string; venue?: string; budget: number; checklist: { title: string; category: string; dueDate?: string; budget?: number; note?: string }[] }) {
  const profileResult = await ensureProfile();
  if (profileResult.error) return { event: null, error: profileResult.error };
  const checklist = input.checklist.map((item) => ({ ...item, dueDate: /^\d{4}-\d{2}-\d{2}$/.test(item.dueDate ?? '') ? item.dueDate : null, budget: item.budget ?? 0 }));
  const { data, error } = await supabase.rpc('create_event_with_checklist', { p_title: input.title, p_kind: input.kind, p_event_date: input.eventDate, p_venue: input.venue ?? null, p_budget: input.budget, p_checklist: checklist });
  if (error) return { event: null, error };
  await hydrateChecklistItems();
  await hydrateEvents();
  return { event: events.find((event) => event.id === (data as unknown as { id: string }).id) ?? null, error: null };
}
