import { getChecklistItems } from '@/data/checklists';

export type BudgetExpense = { id: string; eventId: string; categoryId: string; name: string; amount: number; paid: boolean };
export type BudgetCategory = { id: string; eventId: string; name: string; planned: number; note: string; expenses: BudgetExpense[] };

let customCategories: Omit<BudgetCategory, 'expenses'>[] = [];
let expenseStore: BudgetExpense[] = [];

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
    category.expenses.push(...expenseStore.filter((expense) => expense.eventId === eventId && expense.categoryId === category.id));
  });
  const custom = customCategories.filter((category) => category.eventId === eventId).map((category) => ({ ...category, expenses: expenseStore.filter((expense) => expense.categoryId === category.id) }));
  return [...checklistGroups.values(), ...custom];
};

export const getBudgetCategory = (eventId: string, categoryId: string) => getBudgetCategories(eventId).find((category) => category.id === categoryId);
export const addBudgetCategory = (category: Omit<BudgetCategory, 'id' | 'expenses'>) => {
  const created = { ...category, id: `budget-category-${Date.now()}` };
  customCategories = [...customCategories, created];
  return created;
};
export const addBudgetExpense = (expense: Omit<BudgetExpense, 'id'>) => {
  const created = { ...expense, id: `budget-expense-${Date.now()}` };
  expenseStore = [...expenseStore, created];
  return created;
};
export const updateBudgetExpense = (id: string, patch: Partial<BudgetExpense>) => {
  expenseStore = expenseStore.map((expense) => expense.id === id ? { ...expense, ...patch } : expense);
};
