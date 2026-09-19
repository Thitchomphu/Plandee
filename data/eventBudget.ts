import { getChecklistItems } from '@/data/checklists';
import { events } from '@/data/events';
import { supabase } from '@/lib/supabase';

export type BudgetExpense = { id: string; eventId: string; categoryId: string; name: string; amount: number; paid: boolean; checklistItemId?: string | null };
export type BudgetCategory = { id: string; eventId: string; name: string; planned: number; note: string; expenses: BudgetExpense[] };

export const getBudgetBreakdown = (categories: BudgetCategory[]) => {
  let spent = 0;
  let planned = 0;
  categories.forEach((category) => category.expenses.forEach((expense) => {
    // A completed checklist task is not evidence that its estimated cost was paid.
    if (!expense.id.startsWith('checklist-') && expense.paid) spent += expense.amount;
    else planned += expense.amount;
  }));
  return { spent, planned, allocated: spent + planned };
};

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
  const checklistCategoryIds = new Map<string, string>();
  (categories as unknown as { id: string; event_id: string; name: string; planned: number; note: string | null }[]).forEach((category) => {
    const checklistCategory = `checklist-${category.name}`;
    if (getChecklistItems(category.event_id).some((item) => item.category === category.name)) {
      checklistCategoryIds.set(category.id, checklistCategory);
      categoryLimits.push({ eventId: category.event_id, categoryId: checklistCategory, planned: Number(category.planned), note: category.note ?? '' });
    }
    else customCategories.push({ id: category.id, eventId: category.event_id, name: category.name, planned: Number(category.planned), note: category.note ?? '' });
  });
  expenseStore = ((expenses ?? []) as unknown as { id: string; event_id: string; category_id: string; checklist_item_id: string | null; name: string; amount: number; paid: boolean }[]).map((item) => ({ id: item.id, eventId: item.event_id, categoryId: checklistCategoryIds.get(item.category_id) ?? item.category_id, checklistItemId: item.checklist_item_id, name: item.name, amount: Number(item.amount), paid: item.paid }));
  return true;
};

export const getBudgetCategories = (eventId: string): BudgetCategory[] => {
  const checklistGroups = new Map<string, BudgetCategory>();
  getChecklistItems(eventId).forEach((item) => {
    const id = `checklist-${item.category}`;
    const current = checklistGroups.get(id) ?? { id, eventId, name: item.category, planned: 0, note: '', expenses: [] };
    current.planned += item.budget;
    const linkedExpenses = expenseStore.filter((expense) => expense.eventId === eventId && expense.checklistItemId === item.id);
    const paidExpenses = linkedExpenses.filter((expense) => expense.paid);
    if (paidExpenses.length) current.expenses.push(...paidExpenses);
    else if (item.budget > 0) current.expenses.push({ id: `checklist-${item.id}`, eventId, categoryId: id, name: item.title, amount: item.budget, paid: false, checklistItemId: item.id });
    checklistGroups.set(id, current);
  });
  checklistGroups.forEach((category) => {
    const limit = categoryLimits.find((item) => item.eventId === eventId && item.categoryId === category.id);
    const matchingCustom = customCategories.find((item) => item.eventId === eventId && item.name === category.name);
    if (limit) { category.planned = limit.planned > 0 ? limit.planned : category.planned; category.note = limit.note; }
    else if (matchingCustom) { category.planned = matchingCustom.planned > 0 ? matchingCustom.planned : category.planned; category.note = matchingCustom.note; }
    category.expenses.push(...expenseStore.filter((expense) => expense.eventId === eventId && !expense.checklistItemId && expense.categoryId === category.id));
    if (matchingCustom) category.expenses.push(...expenseStore.filter((expense) => expense.eventId === eventId && !expense.checklistItemId && expense.categoryId === matchingCustom.id));
  });
  const custom = customCategories.filter((category) => category.eventId === eventId && !checklistGroups.has(`checklist-${category.name}`)).map((category) => ({ ...category, expenses: expenseStore.filter((expense) => !expense.checklistItemId && expense.categoryId === category.id) }));
  return [...checklistGroups.values(), ...custom];
};

export const getBudgetCategory = (eventId: string, categoryId: string) => getBudgetCategories(eventId).find((category) => category.id === categoryId);
export const getCategoryBudgetTotal = (eventId: string) => getBudgetCategories(eventId).reduce((sum, category) => sum + category.planned, 0);

const overEventBudget = (eventId: string, total: number) => {
  const limit = events.find((event) => event.id === eventId)?.budget;
  return limit !== undefined && total > limit
    ? new Error(`งบหมวดรวม ${total.toLocaleString('th-TH')} บาท เกินงบอีเวนต์ ${limit.toLocaleString('th-TH')} บาท กรุณาลดวงเงินหมวดหรือเพิ่มงบอีเวนต์ก่อน`)
    : null;
};

export const checkCategoryBudgetChange = (eventId: string, categoryId: string | undefined, planned: number) =>
  overEventBudget(eventId, getCategoryBudgetTotal(eventId) - (categoryId ? (getBudgetCategory(eventId, categoryId)?.planned ?? 0) : 0) + planned);

export const checkChecklistBudgetChange = (eventId: string, next: { category: string; budget: number }, previous?: { category: string; budget: number }) => {
  const totals = new Map<string, number>();
  getChecklistItems(eventId).forEach((item) => totals.set(item.category, (totals.get(item.category) ?? 0) + item.budget));
  if (previous) totals.set(previous.category, (totals.get(previous.category) ?? 0) - previous.budget);
  totals.set(next.category, (totals.get(next.category) ?? 0) + next.budget);
  const known = getBudgetCategories(eventId);
  const names = new Set([...known.map((category) => category.name), ...totals.keys()]);
  const total = [...names].reduce((sum, name) => {
    const existing = known.find((category) => category.name === name);
    const explicit = categoryLimits.find((limit) => limit.eventId === eventId && limit.categoryId === `checklist-${name}`)?.planned
      ?? customCategories.find((category) => category.eventId === eventId && category.name === name)?.planned;
    return sum + (explicit && explicit > 0 ? explicit : existing && !existing.id.startsWith('checklist-') ? existing.planned : Math.max(0, totals.get(name) ?? 0));
  }, 0);
  return overEventBudget(eventId, total);
};

export const getExpenseOverrun = (eventId: string, categoryId: string, amount: number, expenseId?: string) => {
  const categories = getBudgetCategories(eventId);
  const previous = expenseId ? categories.flatMap((category) => category.expenses).find((expense) => expense.id === expenseId)?.amount ?? 0 : 0;
  const total = getBudgetBreakdown(categories).allocated - previous + amount;
  const eventBudget = events.find((event) => event.id === eventId)?.budget ?? 0;
  if (total <= eventBudget) return null;
  return `รายการที่คาดว่าจะใช้รวม ${total.toLocaleString('th-TH')} บาท จากงบอีเวนต์ ${eventBudget.toLocaleString('th-TH')} บาท จึงอาจเกินงบ`;
};
export const getChecklistCategoryNames = (eventId: string) => Array.from(new Set(['สถานที่', 'อาหาร', 'ตกแต่ง', 'อื่น ๆ', ...getBudgetCategories(eventId).map((category) => category.name)]));
export const setBudgetCategory = async (eventId: string, categoryId: string, planned: number, note: string) => {
  const category = getBudgetCategory(eventId, categoryId);
  if (!category) return { error: new Error('ไม่พบหมวดงบประมาณ') };
  const budgetError = checkCategoryBudgetChange(eventId, categoryId, planned);
  if (budgetError) return { error: budgetError };
  const { error } = await supabase.from('budget_categories').upsert(
    { event_id: eventId, name: category.name, planned, note },
    { onConflict: 'event_id,name' },
  );
  if (error) return { error };
  const custom = customCategories.find((item) => item.eventId === eventId && item.id === categoryId);
  if (custom) { custom.planned = planned; custom.note = note; }
  else {
    const existing = categoryLimits.find((item) => item.eventId === eventId && item.categoryId === categoryId);
    if (existing) { existing.planned = planned; existing.note = note; }
    else categoryLimits = [...categoryLimits, { eventId, categoryId, planned, note }];
  }
  return { error: null };
};

export const addBudgetCategory = async (category: Omit<BudgetCategory, 'id' | 'expenses'>) => {
  const budgetError = checkCategoryBudgetChange(category.eventId, undefined, category.planned);
  if (budgetError) return { category: null, error: budgetError };
  const { data, error } = await supabase.from('budget_categories').insert({ event_id: category.eventId, name: category.name, planned: category.planned, note: category.note }).select('id').single();
  if (error || !data) return { category: null, error: error ?? new Error('ไม่สามารถบันทึกหมวดงบประมาณได้') };
  const created = { ...category, id: data.id };
  customCategories = [...customCategories, created];
  return { category: created, error: null };
};

export const addBudgetExpense = async (expense: Omit<BudgetExpense, 'id'>) => {
  const category = getBudgetCategory(expense.eventId, expense.categoryId);
  if (!category) return { expense: null, error: new Error('ไม่พบหมวดงบประมาณ') };
  let databaseCategoryId = expense.categoryId;
  if (expense.categoryId.startsWith('checklist-')) {
    const { data, error } = await supabase.from('budget_categories').select('id').eq('event_id', expense.eventId).eq('name', category.name).maybeSingle();
    if (error) return { expense: null, error };
    if (data) databaseCategoryId = data.id;
    else {
      const created = await supabase.from('budget_categories').insert({ event_id: expense.eventId, name: category.name, planned: category.planned, note: category.note }).select('id').single();
      if (created.error || !created.data) return { expense: null, error: created.error ?? new Error('ไม่สามารถบันทึกหมวดงบประมาณได้') };
      databaseCategoryId = created.data.id;
    }
  }
  const { data, error } = await supabase.from('budget_expenses').insert({ event_id: expense.eventId, category_id: databaseCategoryId, checklist_item_id: expense.checklistItemId ?? null, name: expense.name, amount: expense.amount, paid: expense.paid }).select('id').single();
  if (error || !data) return { expense: null, error: error ?? new Error('ไม่สามารถบันทึกค่าใช้จ่ายได้') };
  const created = { ...expense, id: data.id };
  expenseStore = [...expenseStore, created];
  return { expense: created, error: null };
};

export const updateBudgetExpense = async (id: string, patch: Pick<BudgetExpense, 'name' | 'amount' | 'paid'>) => {
  const { data, error } = await supabase.from('budget_expenses').update(patch).eq('id', id).select('id').single();
  if (error || !data) return { error: error ?? new Error('ไม่พบค่าใช้จ่าย') };
  expenseStore = expenseStore.map((expense) => expense.id === id ? { ...expense, ...patch } : expense);
  return { error: null };
};

export const deleteBudgetCategory = async (eventId: string, categoryId: string) => {
  const category = getBudgetCategory(eventId, categoryId);
  if (!category) return { error: new Error('ไม่พบหมวดงบประมาณ') };
  if (categoryId.startsWith('checklist-')) return { error: new Error('หมวดจากเช็กลิสต์ไม่สามารถลบได้ ให้ลบหรือแก้ไขรายการเช็กลิสต์แทน') };
  const { error } = await supabase.from('budget_categories').delete().eq('id', categoryId);
  if (!error) {
    customCategories = customCategories.filter((item) => item.id !== categoryId);
    expenseStore = expenseStore.filter((expense) => expense.categoryId !== categoryId);
  }
  return { error };
};

export const deleteBudgetExpense = async (id: string) => {
  const { error } = await supabase.from('budget_expenses').delete().eq('id', id);
  if (!error) expenseStore = expenseStore.filter((expense) => expense.id !== id);
  return { error };
};

export const recordChecklistPayment = async (eventId: string, categoryId: string, checklistItemId: string, name: string, amount: number) => {
  const unpaid = expenseStore.find((expense) => expense.eventId === eventId && expense.checklistItemId === checklistItemId && !expense.paid);
  if (unpaid) {
    const category = getBudgetCategory(eventId, categoryId);
    if (!category) return { error: new Error('ไม่พบหมวดงบประมาณ') };
    let databaseCategoryId = categoryId;
    if (categoryId.startsWith('checklist-')) {
      const existing = await supabase.from('budget_categories').select('id').eq('event_id', eventId).eq('name', category.name).maybeSingle();
      if (existing.error) return { error: existing.error };
      if (existing.data) databaseCategoryId = existing.data.id;
      else {
        const created = await supabase.from('budget_categories').insert({ event_id: eventId, name: category.name, planned: category.planned, note: category.note }).select('id').single();
        if (created.error || !created.data) return { error: created.error ?? new Error('สร้างหมวดงบประมาณไม่สำเร็จ') };
        databaseCategoryId = created.data.id;
      }
    }
    const { error } = await supabase.from('budget_expenses').update({ category_id: databaseCategoryId, name, amount, paid: true }).eq('id', unpaid.id);
    if (!error) expenseStore = expenseStore.map((expense) => expense.id === unpaid.id ? { ...expense, categoryId, name, amount, paid: true } : expense);
    return { error };
  }
  const result = await addBudgetExpense({ eventId, categoryId, checklistItemId, name, amount, paid: true });
  return { error: result.error };
};
