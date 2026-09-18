import type { ChecklistItem } from '@/data/checklists';

export const localDateKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const daysUntilDue = (dueDate: string, now = new Date()) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return null;
  const due = new Date(`${dueDate}T00:00:00`);
  if (Number.isNaN(due.getTime()) || localDateKey(due) !== dueDate) return null;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((due.getTime() - today.getTime()) / 86400000);
};

export const dueStatus = (item: Pick<ChecklistItem, 'dueDate' | 'done'>, now = new Date()) => {
  if (item.done) return null;
  const days = daysUntilDue(item.dueDate, now);
  if (days === null) return null;
  if (days < 0) return { days, label: `เลยกำหนด ${Math.abs(days)} วัน`, tone: 'overdue' as const };
  if (days === 0) return { days, label: 'ครบกำหนดวันนี้', tone: 'today' as const };
  if (days <= 3) return { days, label: `อีก ${days} วัน`, tone: 'soon' as const };
  return null;
};

export const urgentTasks = (items: ChecklistItem[], now = new Date()) =>
  items.filter((item) => dueStatus(item, now) !== null)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
