export type EventStatus = 'upcoming' | 'completed';
export type EventItem = {
  id: string; title: string; date: string; venue: string; kind: string; icon: string;
  daysLeft: number; progress: number; status: EventStatus; banner: string; accent: string;
  budget: number; guests: number; pending: number;
};

export const events: EventItem[] = [
  { id: 'wedding-ploi-james', title: 'งานแต่งงาน พลอย & เจมส์', date: '14 ก.พ. 2569', venue: 'โรงแรมเชอราม', kind: 'งานแต่ง', icon: '💍', daysLeft: 12, progress: 69, status: 'upcoming', banner: '#FFF0F3', accent: '#E9436F', budget: 150000, guests: 120, pending: 4 },
  { id: 'annual-abc', title: 'สัมมนาประจำปี บริษัท ABC', date: '10 มี.ค. 2569', venue: 'ศูนย์ประชุมฯ', kind: 'สัมมนา', icon: '💼', daysLeft: 25, progress: 35, status: 'upcoming', banner: '#E4F1FA', accent: '#3E7CA6', budget: 120000, guests: 80, pending: 7 },
  { id: 'peach-birthday', title: 'ปาร์ตี้วันเกิด น้องพีช 6 ขวบ', date: '25 มี.ค. 2569', venue: 'บ้านคุณลูกค้า', kind: 'ปาร์ตี้', icon: '🎈', daysLeft: 40, progress: 15, status: 'upcoming', banner: '#FFF0F3', accent: '#E9436F', budget: 40000, guests: 25, pending: 9 },
  { id: 'launch-complete', title: 'งานเปิดตัวสินค้าใหม่', date: '20 ม.ค. 2569', venue: 'โรงแรมใจกลางเมือง', kind: 'เปิดตัวสินค้า', icon: '🎉', daysLeft: 0, progress: 100, status: 'completed', banner: '#E9F8F3', accent: '#1F8467', budget: 90000, guests: 60, pending: 0 },
];

export const addEvent = (event: Omit<EventItem, 'id'>) => {
  const created = { ...event, id: `event-${Date.now()}` };
  events.push(created);
  return created;
};
