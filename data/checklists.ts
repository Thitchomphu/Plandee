export type ChecklistCategory = 'สถานที่' | 'อาหาร' | 'ตกแต่ง' | 'อื่น ๆ';
export type ChecklistItem = { id: string; eventId: string; title: string; category: ChecklistCategory; dueDate: string; budget: number; note: string; done: boolean };

const seed: ChecklistItem[] = [
  { id: 'venue-booking', eventId: 'wedding-ploi-james', title: 'ยืนยันการจองโรงแรม', category: 'สถานที่', dueDate: '10 ก.พ. 2569', budget: 60000, note: 'ส่งหลักฐานการชำระเงินให้โรงแรม', done: true },
  { id: 'venue-layout', eventId: 'wedding-ploi-james', title: 'ส่งผังที่นั่งให้สถานที่', category: 'สถานที่', dueDate: '12 ก.พ. 2569', budget: 0, note: '', done: false },
  { id: 'food-menu', eventId: 'wedding-ploi-james', title: 'เลือกเมนูอาหารและเครื่องดื่ม', category: 'อาหาร', dueDate: '8 ก.พ. 2569', budget: 42000, note: 'ยืนยันเมนูกับทีมอาหาร', done: true },
  { id: 'food-count', eventId: 'wedding-ploi-james', title: 'ยืนยันจำนวนแขกกับทีมอาหาร', category: 'อาหาร', dueDate: '12 ก.พ. 2569', budget: 0, note: '', done: false },
  { id: 'decor-flower', eventId: 'wedding-ploi-james', title: 'สรุปแบบดอกไม้กับร้านตกแต่ง', category: 'ตกแต่ง', dueDate: '9 ก.พ. 2569', budget: 25000, note: '', done: false },
  { id: 'decor-stage', eventId: 'wedding-ploi-james', title: 'ตรวจแบบเวทีและฉากถ่ายรูป', category: 'ตกแต่ง', dueDate: '5 ก.พ. 2569', budget: 20000, note: '', done: true },
];
let checklistStore = [...seed];
export const getChecklistItems = (eventId?: string) => eventId ? checklistStore.filter((item) => item.eventId === eventId) : checklistStore;
export const getChecklistItem = (id: string) => checklistStore.find((item) => item.id === id);
export const addChecklistItem = (item: Omit<ChecklistItem, 'id'>) => { const created = { ...item, id: `checklist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }; checklistStore = [...checklistStore, created]; return created; };
export const updateChecklistItem = (id: string, patch: Partial<ChecklistItem>) => { checklistStore = checklistStore.map((item) => item.id === id ? { ...item, ...patch } : item); };
export const deleteChecklistItem = (id: string) => { checklistStore = checklistStore.filter((item) => item.id !== id); };
export const getChecklistProgress = (eventId: string) => { const items = getChecklistItems(eventId); return items.length ? Math.round((items.filter((item) => item.done).length / items.length) * 100) : 0; };
export const getChecklistBudget = (eventId: string) => getChecklistItems(eventId).reduce((sum, item) => sum + item.budget, 0);
