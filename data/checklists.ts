import { supabase } from '@/lib/supabase';
import { checkChecklistBudgetChange } from '@/data/eventBudget';
import { refreshTaskReminders } from '@/lib/taskNotifications';

export type ChecklistCategory = string;
export type ChecklistItem = { id: string; eventId: string; title: string; category: ChecklistCategory; dueDate: string; budget: number; note: string; done: boolean; assigneeName: string };

let checklistStore: ChecklistItem[] = [];
const assigneeError = (error: { message: string } | null) => error && /assignee_name/i.test(error.message)
  ? new Error('ยังไม่ได้อัปเดตฐานข้อมูลสำหรับผู้รับผิดชอบ กรุณาใช้ migration 003_checklist_assignee.sql ก่อน')
  : error;

export const hydrateChecklistItems = async () => {
  const columns = 'id,event_id,title,category,due_date,budget,note,done';
  let { data, error } = await supabase.from('checklist_items').select(`${columns},assignee_name`);
  if (error && /assignee_name/i.test(error.message)) {
    ({ data, error } = await supabase.from('checklist_items').select(columns));
  }
  if (error) return false;
  checklistStore = ((data ?? []) as unknown as { id: string; event_id: string; title: string; category: ChecklistCategory; due_date: string | null; budget: number; note: string | null; done: boolean; assignee_name?: string | null }[]).map((item) => ({ id: item.id, eventId: item.event_id, title: item.title, category: item.category, dueDate: item.due_date ?? '', budget: Number(item.budget), note: item.note ?? '', done: item.done, assigneeName: item.assignee_name ?? '' }));
  void refreshTaskReminders(checklistStore);
  return true;
};

export const getChecklistItems = (eventId?: string) => eventId ? checklistStore.filter((item) => item.eventId === eventId) : checklistStore;
export const getChecklistItem = (id: string) => checklistStore.find((item) => item.id === id);

export const addChecklistItem = async (item: Omit<ChecklistItem, 'id'>) => {
  const budgetError = item.budget > 0 ? checkChecklistBudgetChange(item.eventId, item) : null;
  if (budgetError) return { item: null, error: budgetError };
  const { data, error } = await supabase.from('checklist_items').insert({ event_id: item.eventId, title: item.title, category: item.category, due_date: item.dueDate || null, budget: item.budget, note: item.note, done: item.done, ...(item.assigneeName.trim() ? { assignee_name: item.assigneeName.trim() } : {}) }).select('id').single();
  if (error) return { item: null, error: assigneeError(error) };
  const created = { ...item, id: (data as { id: string }).id };
  checklistStore = [...checklistStore, created];
  await refreshTaskReminders(checklistStore);
  return { item: created, error: null };
};

export const updateChecklistItem = async (id: string, patch: Partial<ChecklistItem>) => {
  const current = getChecklistItem(id);
  if (!current) return { error: new Error('Checklist item not found') };
  const next = { ...current, ...patch };
  if ((next.budget !== current.budget || next.category !== current.category) && (next.budget > 0 || current.budget > 0)) {
    const budgetError = checkChecklistBudgetChange(current.eventId, next, current);
    if (budgetError) return { error: budgetError };
  }
  const { error } = await supabase.from('checklist_items').update({ title: next.title, category: next.category, due_date: next.dueDate || null, budget: next.budget, note: next.note, done: next.done, ...(next.assigneeName !== current.assigneeName ? { assignee_name: next.assigneeName.trim() } : {}) }).eq('id', id);
  if (!error) {
    checklistStore = checklistStore.map((item) => item.id === id ? next : item);
    await refreshTaskReminders(checklistStore);
  }
  return { error: assigneeError(error) };
};

export const deleteChecklistItem = async (id: string) => {
  const { error } = await supabase.from('checklist_items').delete().eq('id', id);
  if (!error) {
    checklistStore = checklistStore.filter((item) => item.id !== id);
    await refreshTaskReminders(checklistStore);
  }
  return { error };
};
export const getChecklistProgress = (eventId: string) => { const items = getChecklistItems(eventId); return items.length ? Math.round((items.filter((item) => item.done).length / items.length) * 100) : 0; };
export const getChecklistBudget = (eventId: string) => getChecklistItems(eventId).reduce((sum, item) => sum + item.budget, 0);
