export type RSVPStatus = 'accepted' | 'pending' | 'declined';

export type Guest = {
  id: string;
  eventId: string;
  name: string;
  group: string;
  phone: string;
  email: string;
  dietary: string;
  rsvp: RSVPStatus;
  tableId?: string;
};

export type GuestTable = {
  id: string;
  eventId: string;
  name: string;
  capacity: number;
};

const initialGuests: Guest[] = [
  { id: 'guest-1', eventId: 'wedding-ploi-james', name: 'กมลวรรณ ใจดี', group: 'ครอบครัวฝ่ายหญิง', phone: '0812345678', email: 'kamonwan@example.com', dietary: 'ไม่มี', rsvp: 'accepted', tableId: 'table-1' },
  { id: 'guest-2', eventId: 'wedding-ploi-james', name: 'ธนพล สุขใจ', group: 'ครอบครัวฝ่ายชาย', phone: '0823456789', email: 'thanapon@example.com', dietary: 'ไม่มี', rsvp: 'accepted', tableId: 'table-1' },
  { id: 'guest-3', eventId: 'wedding-ploi-james', name: 'ณัฐชา แสงทอง', group: 'เพื่อนเจ้าสาว', phone: '0834567890', email: 'natcha@example.com', dietary: 'มังสวิรัติ', rsvp: 'pending' },
  { id: 'guest-4', eventId: 'wedding-ploi-james', name: 'ภาคิน รุ่งเรือง', group: 'เพื่อนเจ้าบ่าว', phone: '0845678901', email: 'phakin@example.com', dietary: 'ไม่มี', rsvp: 'accepted', tableId: 'table-2' },
  { id: 'guest-5', eventId: 'wedding-ploi-james', name: 'สุภาวดี แก้วใส', group: 'เพื่อนร่วมงาน', phone: '0856789012', email: 'supawadee@example.com', dietary: 'แพ้อาหารทะเล', rsvp: 'declined' },
  { id: 'guest-6', eventId: 'wedding-ploi-james', name: 'วรพล มีสุข', group: 'เพื่อนร่วมงาน', phone: '0867890123', email: 'worapon@example.com', dietary: 'ไม่มี', rsvp: 'pending' },
];

const initialTables: GuestTable[] = [
  { id: 'table-1', eventId: 'wedding-ploi-james', name: 'โต๊ะ 1 (VIP)', capacity: 10 },
  { id: 'table-2', eventId: 'wedding-ploi-james', name: 'โต๊ะ 2 (ครอบครัว)', capacity: 10 },
  { id: 'table-3', eventId: 'wedding-ploi-james', name: 'โต๊ะ 3 (เพื่อน)', capacity: 10 },
];

let guestStore = [...initialGuests];

export const getGuests = (eventId?: string) => eventId ? guestStore.filter((guest) => guest.eventId === eventId) : guestStore;
export const getGuest = (id: string) => guestStore.find((guest) => guest.id === id);
export const addGuest = (guest: Omit<Guest, 'id'>) => {
  const created = { ...guest, id: `guest-${Date.now()}` };
  guestStore = [...guestStore, created];
  return created;
};
export const updateGuest = (id: string, patch: Partial<Guest>) => {
  guestStore = guestStore.map((guest) => guest.id === id ? { ...guest, ...patch } : guest);
};
export const getTables = (eventId?: string) => eventId ? initialTables.filter((table) => table.eventId === eventId) : initialTables;
export const getTable = (id: string) => initialTables.find((table) => table.id === id);
export const getTableGuests = (tableId: string) => guestStore.filter((guest) => guest.tableId === tableId);
export const assignGuestToTable = (guestId: string, tableId: string) => {
  const table = getTable(tableId);
  if (!table || getTableGuests(tableId).length >= table.capacity) return false;
  guestStore = guestStore.map((guest) => guest.id === guestId ? { ...guest, tableId } : guest);
  return true;
};
export const removeGuestFromTable = (guestId: string) => updateGuest(guestId, { tableId: undefined });
