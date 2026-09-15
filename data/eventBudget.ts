import { getChecklistItems } from '@/data/checklists';
import { supabase } from '@/lib/supabase';

export type BudgetExpense = { id: string; eventId: string; categoryId: string; name: string; amount: number; paid: boolean };
export type BudgetCategory = { id: string; eventId: string; name: string; planned: number; note: string; expenses: BudgetExpense[] };

let customCategories: Omit<BudgetCategory, 'expenses'>[] = [];
let categoryLimits: { eventId: string; categoryId: string; planned: number; note: string }[] = [];
let expenseStore: BudgetExpense[] = [];

export const hydrateEventBudget = async () => {
  const [{ data: categories, error: categoryError }, { data: expenses, error: expenseError }] = await Promise.all([
    supabase.from('budget_categories').select('id,event_id,name,planned,note'),
    supabase.from('budget_expenses').select('id,event_id,category_id,checklist_item_id,name,amount,paid'),
  ]);
  if (categoryError || expenseError || !categories) return false;
  categoryLimits = [];
  customCategories = [];
  (categories as unknown as { id: string; event_id: string; name: string; planned: number; note: string | null }[]).forEach((category) => {
    const checklistCategory = `checklist-${category.name}`;
    if (getChecklistItems(category.event_id).some((item) => item.category === category.name)) categoryLimits.push({ eventId: category.event_id, categoryId: checklistCategory, planned: Number(category.planned), note: category.note ?? '' });
    else customCategories.push({ id: category.id, eventId: category.event_id, name: category.name, planned: Number(category.planned), note: category.note ?? '' });
  });
  expenseStore = ((expenses ?? []) as unknown as { id: string; event_id: string; category_id: string; checklist_item_id: string | null; name: string; amount: number; paid: boolean }[]).filter((item) => !item.checklist_item_id).map((item) => ({ id: item.id, eventId: item.event_id, categoryId: item.category_id, name: item.name, amount: Number(item.amount), paid: item.paid }));
  return true;
};

export const getBudgetCategories = (eventId: string): BudgetCategory[] => {
  const checklistGroups = new Map<string, BudgetCategory>();
  getChecklistItems(eventId).forEach((item) => {
    const id = `checklist-${item.category}`;
    const current = checklistGroups.get(id) ?? { id, eventId, name: item.category, planned: 0, note: '', expenses: [] };
    current.planned += item.budget;
    current.expenses.push({ id: item.id, eventId, categoryId: id, name: item.title, amount: item.budget, paid: item.done });
    checklistGroups.set(id, current);
  });
  checklistGroups.forEach((category) => {
    const limit = categoryLimits.find((item) => item.eventId === eventId && item.categoryId === category.id);
    if (limit) { category.planned = limit.planned; category.note = limit.note; }
    category.expenses.push(...expenseStore.filter((expense) => expense.eventId === eventId && expense.categoryId === category.id));
  });
  const custom = customCategories.filter((category) => category.eventId === eventId).map((category) => ({ ...category, expenses: expenseStore.filter((expense) => expense.categoryId === category.id) }));
  return [...checklistGroups.values(), ...custom];
};

export const getBudgetCategory = (eventId: string, categoryId: string) => getBudgetCategories(eventId).find((category) => category.id === categoryId);
export const getChecklistCategoryNames = (eventId: string) => Array.from(new Set(['สถานที่', 'อาหาร', 'ตกแต่ง', 'อื่น ๆ', ...getBudgetCategories(eventId).map((category) => category.name)]));
export const setBudgetCategory = (eventId: string, categoryId: string, planned: number, note: string) => {
  const custom = customCategories.find((category) => category.eventId === eventId && category.id === categoryId);
  if (custom) { custom.planned = planned; custom.note = note; return; }
  const existing = categoryLimits.find((item) => item.eventId === eventId && item.categoryId === categoryId);
  if (existing) { existing.planned = planned; existing.note = note; } else categoryLimits = [...categoryLimits, { eventId, categoryId, planned, note }];
  if (/^[0-9a-f-]{36}$/i.test(eventId)) { const query = supabase.from('budget_categories').update({ planned, note }).eq('event_id', eventId); void (/^[0-9a-f-]{36}$/i.test(categoryId) ? query.eq('id', categoryId) : query.eq('name', categoryId.replace(/^checklist-/, ''))); }
};
export const addBudgetCategory = (category: Omit<BudgetCategory, 'id' | 'expenses'>) => { const created = { ...category, id: `budget-category-${Date.now()}` }; customCategories = [...customCategories, created]; if (/^[0-9a-f-]{36}$/i.test(category.eventId)) void supabase.from('budget_categories').insert({ event_id: category.eventId, name: category.name, planned: category.planned, note: category.note }); return created; };
export const addBudgetExpense = (expense: Omit<BudgetExpense, 'id'>) => { const created = { ...expense, id: `budget-expense-${Date.now()}` }; expenseStore = [...expenseStore, created]; if (/^[0-9a-f-]{36}$/i.test(expense.eventId)) { const isUuid = /^[0-9a-f-]{36}$/i.test(expense.categoryId); const categoryValue = isUuid ? expense.categoryId : expense.categoryId.replace(/^checklist-/, ''); void supabase.from('budget_categories').select('id').eq('event_id', expense.eventId).eq(isUuid ? 'id' : 'name', categoryValue).maybeSingle().then(({ data }) => { if (data?.id) void supabase.from('budget_expenses').insert({ event_id: expense.eventId, category_id: data.id, name: expense.name, amount: expense.amount, paid: expense.paid }); }); } return created; };
export const updateBudgetExpense = (id: string, patch: Partial<BudgetExpense>) => { expenseStore = expenseStore.map((expense) => expense.id === id ? { ...expense, ...patch } : expense); if (/^[0-9a-f-]{36}$/i.test(id)) void supabase.from('budget_expenses').update({ name: patch.name, amount: patch.amount, paid: patch.paid }).eq('id', id); };
