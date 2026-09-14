export type Expense = { id: string; name: string; category: string; amount: number; paid: boolean };
export const initialExpenses: Expense[] = [
  { id: 'venue', name: 'ค่าจองสถานที่', category: 'สถานที่', amount: 60000, paid: true },
  { id: 'food', name: 'ค่าอาหารและเครื่องดื่ม', category: 'อาหาร', amount: 40000, paid: true },
  { id: 'decor', name: 'ค่าตกแต่งสถานที่', category: 'ตกแต่ง', amount: 25000, paid: false },
  { id: 'photo', name: 'ค่าช่างภาพ', category: 'ภาพและวิดีโอ', amount: 20000, paid: true },
];
export const BUDGET_LIMIT = 310000;

let expenseStore = [...initialExpenses];
export const getExpenses = () => expenseStore;
export const addExpense = (expense: Expense) => { expenseStore = [...expenseStore, expense]; };
export const updateExpense = (id: string, patch: Partial<Expense>) => { expenseStore = expenseStore.map((item) => item.id === id ? { ...item, ...patch } : item); };
