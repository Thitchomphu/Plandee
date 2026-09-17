import { getChecklistItems } from '@/data/checklists';

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

export const getSellers = (eventId: string): Seller[] => {
  const grouped = new Map<string, ReturnType<typeof getChecklistItems>>();
  getChecklistItems(eventId).filter((item) => item.responsible.trim()).forEach((item) => {
    const name = item.responsible.trim();
    grouped.set(name, [...(grouped.get(name) ?? []), item]);
  });

  return Array.from(grouped, ([name, items]) => {
    const price = items.reduce((sum, item) => sum + item.budget, 0);
    const completed = items.filter((item) => item.done).length;
    return {
      id: `seller-${eventId}-${encodeURIComponent(name)}`,
      eventId,
      name,
      category: Array.from(new Set(items.map((item) => item.category))).join(', '),
      price,
      paid: 0,
      status: completed === items.length ? 'จ่ายมัดจำแล้ว' : price > 0 ? 'กำลังเจรจา' : 'ยังไม่เริ่ม',
      phone: 'ยังไม่มีข้อมูลโทรศัพท์',
      email: 'ยังไม่มีข้อมูลอีเมล',
      note: items.map((item) => item.note).filter(Boolean).join('\n') || 'เชื่อมโยงจากรายการเช็กลิสต์',
      checklistIds: items.map((item) => item.id),
      expenseIds: [],
    };
  });
};

export const getSeller = (eventId: string, sellerId: string) => getSellers(eventId).find((seller) => seller.id === sellerId);
