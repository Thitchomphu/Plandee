import { supabase } from '@/lib/supabase';

export type RSVPStatus = 'accepted' | 'pending' | 'declined';
export type Guest = { id: string; eventId: string; name: string; group: string; phone: string; email: string; dietary: string; rsvp: RSVPStatus; tableId?: string };
export type GuestTable = { id: string; eventId: string; name: string; capacity: number };

let guestStore: Guest[] = [];
let tableStore: GuestTable[] = [];

export const hydrateGuests = async () => {
  const [{ data: guests, error: guestsError }, { data: tables, error: tablesError }, { data: seating, error: seatingError }] = await Promise.all([
    supabase.from('guests').select('id,event_id,name,group_name,phone,email,dietary,rsvp'),
    supabase.from('guest_tables').select('id,event_id,name,capacity'),
    supabase.from('guest_seating').select('guest_id,table_id'),
  ]);
  if (guestsError || tablesError || seatingError) return false;
  tableStore = ((tables ?? []) as unknown as { id: string; event_id: string; name: string; capacity: number }[]).map((table) => ({ id: table.id, eventId: table.event_id, name: table.name, capacity: table.capacity }));
  const assignments = new Map(((seating ?? []) as unknown as { guest_id: string; table_id: string }[]).map((item) => [item.guest_id, item.table_id]));
  guestStore = ((guests ?? []) as unknown as { id: string; event_id: string; name: string; group_name: string | null; phone: string | null; email: string | null; dietary: string | null; rsvp: RSVPStatus }[]).map((guest) => ({ id: guest.id, eventId: guest.event_id, name: guest.name, group: guest.group_name ?? '', phone: guest.phone ?? '', email: guest.email ?? '', dietary: guest.dietary ?? '', rsvp: guest.rsvp, tableId: assignments.get(guest.id) }));
  return true;
};

export const getGuests = (eventId?: string) => eventId ? guestStore.filter((guest) => guest.eventId === eventId) : guestStore;
export const getGuest = (id: string) => guestStore.find((guest) => guest.id === id);
export const addGuest = async (guest: Omit<Guest, 'id'>) => {
  const { data, error } = await supabase.from('guests').insert({ event_id: guest.eventId, name: guest.name, group_name: guest.group, phone: guest.phone, email: guest.email, dietary: guest.dietary, rsvp: guest.rsvp }).select('id').single();
  if (error) return { guest: null, error };
  const created = { ...guest, id: (data as { id: string }).id };
  guestStore = [...guestStore, created];
  return { guest: created, error: null };
};
export const updateGuest = async (id: string, patch: Partial<Guest>) => {
  const current = getGuest(id);
  if (!current) return { error: new Error('Guest not found') };
  const next = { ...current, ...patch };
  const { error } = await supabase.from('guests').update({ name: next.name, group_name: next.group, phone: next.phone, email: next.email, dietary: next.dietary, rsvp: next.rsvp }).eq('id', id);
  if (!error) guestStore = guestStore.map((guest) => guest.id === id ? next : guest);
  return { error };
};
export const getTables = (eventId?: string) => eventId ? tableStore.filter((table) => table.eventId === eventId) : tableStore;
export const getTable = (id: string) => tableStore.find((table) => table.id === id);
export const getTableGuests = (tableId: string) => guestStore.filter((guest) => guest.tableId === tableId);
export const addGuestTable = async (table: Omit<GuestTable, 'id'>) => {
  const { data, error } = await supabase.from('guest_tables').insert({ event_id: table.eventId, name: table.name, capacity: table.capacity }).select('id').single();
  if (error) return { table: null, error };
  const created = { ...table, id: (data as { id: string }).id };
  tableStore = [...tableStore, created];
  return { table: created, error: null };
};
export const assignGuestToTable = async (guestId: string, tableId: string) => {
  const table = getTable(tableId);
  if (!table || getTableGuests(tableId).length >= table.capacity) return false;
  const { error } = await supabase.rpc('assign_guest_to_table', { p_guest_id: guestId, p_table_id: tableId });
  if (error) return false;
  guestStore = guestStore.map((guest) => guest.id === guestId ? { ...guest, tableId } : guest);
  return true;
};
export const removeGuestFromTable = async (guestId: string) => {
  const { error } = await supabase.from('guest_seating').delete().eq('guest_id', guestId);
  if (!error) guestStore = guestStore.map((guest) => guest.id === guestId ? { ...guest, tableId: undefined } : guest);
  return { error };
};
