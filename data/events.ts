import { supabase } from '@/lib/supabase';
import { ensureProfile } from '@/lib/profile';
import { hydrateChecklistItems } from '@/data/checklists';
import { Theme } from '@/constants/theme';

export type EventStatus = 'upcoming' | 'completed';
export type EventItem = { id: string; title: string; date: string; eventDate: string; venue: string; kind: string; icon: string; daysLeft: number; progress: number; planningComplete: boolean; status: EventStatus; isFavorite: boolean; banner: string; accent: string; budget: number; guests: number; pending: number };

export let events: EventItem[] = [];

type CloudEvent = { id: string; title: string; event_date: string; event_date_label: string | null; venue: string | null; kind: string; status: EventStatus; is_favorite?: boolean; banner_color: string | null; accent_color: string | null; icon: string | null; budget: number };
const daysUntil = (date: string) => { const today = new Date(); return Math.round((new Date(`${date}T00:00:00`).getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / 86400000); };
const displayDate = (value: string) => new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`));

export async function hydrateEvents() {
  const columns = 'id,title,event_date,event_date_label,venue,kind,status,banner_color,accent_color,icon,budget';
  let result = await supabase.from('events').select(`${columns},is_favorite`).order('event_date', { ascending: true });
  if (result.error && /is_favorite/i.test(result.error.message)) result = await supabase.from('events').select(columns).order('event_date', { ascending: true }) as typeof result;
  const { data, error } = result;
  if (error) return false;
  const cloudEvents = (data ?? []) as unknown as CloudEvent[];
  if (!cloudEvents.length) { events = []; return true; }
  const eventIds = cloudEvents.map((event) => event.id);
  const [{ data: checklistRows, error: checklistError }, { data: guestRows, error: guestError }] = await Promise.all([
    supabase.from('checklist_items').select('event_id,done').in('event_id', eventIds),
    supabase.from('guests').select('event_id,rsvp').in('event_id', eventIds),
  ]);
  if (checklistError || guestError) return false;
  const checklist = (checklistRows ?? []) as unknown as { event_id: string; done: boolean }[];
  const guests = (guestRows ?? []) as unknown as { event_id: string; rsvp: string }[];
  events = cloudEvents.map((event) => {
    const items = checklist.filter((item) => item.event_id === event.id);
    const eventGuests = guests.filter((guest) => guest.event_id === event.id);
    const storedLabel = event.event_date_label;
    return { id: event.id, title: event.title, date: storedLabel && !/^\d{4}-\d{2}-\d{2}$/.test(storedLabel) ? storedLabel : displayDate(event.event_date), eventDate: event.event_date, venue: event.venue ?? 'ยังไม่ได้ระบุสถานที่', kind: event.kind, icon: event.icon ?? '📅', daysLeft: daysUntil(event.event_date), progress: items.length ? Math.round((items.filter((item) => item.done).length / items.length) * 100) : 0, planningComplete: items.length > 0 && items.every((item) => item.done), status: event.status, isFavorite: event.is_favorite ?? false, banner: event.banner_color ?? Theme.colors.primarySoft, accent: event.accent_color ?? Theme.colors.primary, budget: Number(event.budget), guests: eventGuests.length, pending: items.filter((item) => !item.done).length };
  });
  return true;
}

export async function createEventWithChecklist(input: { title: string; kind: string; eventDate: string; venue?: string; budget: number; checklist: { title: string; category: string; dueDate?: string; budget?: number; note?: string }[] }) {
  const profileResult = await ensureProfile();
  if (profileResult.error) return { event: null, error: profileResult.error, saved: false };
  const checklist = input.checklist.map((item) => ({ ...item, dueDate: /^\d{4}-\d{2}-\d{2}$/.test(item.dueDate ?? '') ? item.dueDate : null, budget: item.budget ?? 0 }));
  const { data, error } = await supabase.rpc('create_event_with_checklist', { p_title: input.title, p_kind: input.kind, p_event_date: input.eventDate, p_venue: input.venue ?? null, p_budget: input.budget, p_checklist: checklist });
  if (error) return { event: null, error, saved: false };
  try {
    await hydrateChecklistItems();
    await hydrateEvents();
  } catch {
    return { event: null, error: null, saved: true };
  }
  return { event: events.find((event) => event.id === (data as unknown as { id: string } | null)?.id) ?? null, error: null, saved: true };
}

export async function setEventFavorite(id: string, isFavorite: boolean) {
  const { error } = await supabase.from('events').update({ is_favorite: isFavorite }).eq('id', id);
  if (!error) events = events.map((event) => event.id === id ? { ...event, isFavorite } : event);
  return { error: error && /is_favorite/i.test(error.message) ? new Error('กรุณาเพิ่มคอลัมน์งานโปรดด้วย migration 004_event_favorite.sql ก่อน') : error };
}
