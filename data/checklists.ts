import { supabase } from '@/lib/supabase';

export type ChecklistCategory = string;
export type ChecklistItem = { id: string; eventId: string; title: string; category: ChecklistCategory; dueDate: string; budget: number; note: string; responsible: string; done: boolean };

let checklistStore: ChecklistItem[] = [];
const fieldsWithoutResponsible = 'id,event_id,title,category,due_date,budget,note,done';
const isResponsibleColumnError = (error: { code?: string; message?: string } | null) => Boolean(error && (error.code === '42703' || /responsible/i.test(error.message ?? '')));

export const hydrateChecklistItems = async () => {
  let response = await supabase.from('checklist_items').select(`${fieldsWithoutResponsible},responsible`);
  if (isResponsibleColumnError(response.error)) {
    response = await supabase.from('checklist_items').select(fieldsWithoutResponsible);
  }
  if (response.error) return false;
  checklistStore = ((response.data ?? []) as unknown as { id: string; event_id: string; title: string; category: ChecklistCategory; due_date: string | null; budget: number; note: string | null; responsible?: string | null; done: boolean }[]).map((item) => ({ id: item.id, eventId: item.event_id, title: item.title, category: item.category, dueDate: item.due_date ?? '', budget: Number(item.budget), note: item.note ?? '', responsible: item.responsible ?? '', done: item.done }));
  return true;
};

export const getChecklistItems = (eventId?: string) => eventId ? checklistStore.filter((item) => item.eventId === eventId) : checklistStore;
export const getChecklistItem = (id: string) => checklistStore.find((item) => item.id === id);

export const addChecklistItem = async (item: Omit<ChecklistItem, 'id'>) => {
  const baseValues: Record<string, unknown> = { event_id: item.eventId, title: item.title, category: item.category, due_date: item.dueDate || null, budget: item.budget, note: item.note, done: item.done };
  const values = { ...baseValues, responsible: item.responsible || null };
  let response = await supabase.from('checklist_items').insert(values).select('id').single();
  if (isResponsibleColumnError(response.error) && !item.responsible.trim()) response = await supabase.from('checklist_items').insert(baseValues).select('id').single();
  if (isResponsibleColumnError(response.error)) return { item: null, error: new Error('ฐานข้อมูลยังไม่รองรับช่องร้านหรือผู้รับผิดชอบ กรุณารัน migration 004_add_checklist_responsible.sql ก่อนบันทึก') };
  const { data, error } = response;
  if (error) return { item: null, error };
  const created = { ...item, id: (data as { id: string }).id };
  checklistStore = [...checklistStore, created];
  return { item: created, error: null };
};

export const updateChecklistItem = async (id: string, patch: Partial<ChecklistItem>) => {
  const current = getChecklistItem(id);
  if (!current) return { error: new Error('Checklist item not found') };
  const next = { ...current, ...patch };
  const baseValues: Record<string, unknown> = { title: next.title, category: next.category, due_date: next.dueDate || null, budget: next.budget, note: next.note, done: next.done };
  const values = { ...baseValues, responsible: next.responsible || null };
  let response = await supabase.from('checklist_items').update(values).eq('id', id);
  if (isResponsibleColumnError(response.error) && !next.responsible.trim()) response = await supabase.from('checklist_items').update(baseValues).eq('id', id);
  if (isResponsibleColumnError(response.error)) return { error: new Error('ฐานข้อมูลยังไม่รองรับช่องร้านหรือผู้รับผิดชอบ กรุณารัน migration 004_add_checklist_responsible.sql ก่อนบันทึก') };
  const { error } = response;
  if (!error) checklistStore = checklistStore.map((item) => item.id === id ? next : item);
  return { error };
};

export const deleteChecklistItem = async (id: string) => {
  const { error } = await supabase.from('checklist_items').delete().eq('id', id);
  if (!error) checklistStore = checklistStore.filter((item) => item.id !== id);
  return { error };
};
export const getChecklistProgress = (eventId: string) => { const items = getChecklistItems(eventId); return items.length ? Math.round((items.filter((item) => item.done).length / items.length) * 100) : 0; };
export const getChecklistBudget = (eventId: string) => getChecklistItems(eventId).reduce((sum, item) => sum + item.budget, 0);
