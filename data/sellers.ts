import { getBudgetCategories } from '@/data/eventBudget';

export type SellerStatus = 'กำลังเจรจา' | 'ยังไม่เริ่ม' | 'จ่ายมัดจำแล้ว';
export type Seller = {
  id: string;
  eventId: string;
  name: string;
  category: string;
  price: number;
  paid: number;
  status: SellerStatus;
  phone: string;
  email: string;
  note: string;
  checklistIds: string[];
  expenseIds: string[];
};

const contactByCategory: Record<string, { phone: string; email: string }> = {
  สถานที่: { phone: 'ยังไม่มีข้อมูลโทรศัพท์', email: 'ยังไม่มีข้อมูลอีเมล' },
  อาหาร: { phone: 'ยังไม่มีข้อมูลโทรศัพท์', email: 'ยังไม่มีข้อมูลอีเมล' },
  ตกแต่ง: { phone: 'ยังไม่มีข้อมูลโทรศัพท์', email: 'ยังไม่มีข้อมูลอีเมล' },
  'อื่น ๆ': { phone: 'ยังไม่มีข้อมูลโทรศัพท์', email: 'ยังไม่มีข้อมูลอีเมล' },
};

export const getSellers = (eventId: string): Seller[] => getBudgetCategories(eventId).map((category) => {
  const paid = category.expenses.filter((expense) => expense.paid).reduce((sum, expense) => sum + expense.amount, 0);
  const hasPaid = paid > 0;
  const hasBudget = category.planned > 0 || category.expenses.length > 0;
  const contact = contactByCategory[category.name] ?? contactByCategory['อื่น ๆ'];
  return {
    id: `seller-${category.id}`,
    eventId,
    name: `seller ${category.name}`,
    category: category.name,
    price: category.planned,
    paid,
    status: hasPaid ? 'จ่ายมัดจำแล้ว' : hasBudget ? 'กำลังเจรจา' : 'ยังไม่เริ่ม',
    phone: contact.phone,
    email: contact.email,
    note: category.note || 'ยังไม่มีหมายเหตุสำหรับ seller นี้',
    checklistIds: category.expenses.filter((expense) => expense.id.startsWith('venue-') || expense.id.startsWith('food-') || expense.id.startsWith('decor-') || expense.id.startsWith('checklist-')).map((expense) => expense.id),
    expenseIds: category.expenses.filter((expense) => expense.id.startsWith('budget-expense-')).map((expense) => expense.id),
  };
});

export const getSeller = (eventId: string, sellerId: string) => getSellers(eventId).find((seller) => seller.id === sellerId);
