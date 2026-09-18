import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { Theme } from '@/constants/theme';
import type { ChecklistItem } from '@/data/checklists';

const isoDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const isIsoDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);
const weekdays = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'];

export function EventScheduleCalendar({ eventDate, items }: { eventDate: string; items: ChecklistItem[] }) {
  const initial = isIsoDate(eventDate) ? new Date(`${eventDate}T00:00:00`) : new Date();
  const [month, setMonth] = useState(() => new Date(initial.getFullYear(), initial.getMonth(), 1));
  const [selected, setSelected] = useState(() => isIsoDate(eventDate) ? eventDate : isoDate(initial));
  const datedItems = useMemo(() => items.filter((item) => isIsoDate(item.dueDate)), [items]);
  const firstWeekday = (month.getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = [...Array<null>(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
  const selectedItems = datedItems.filter((item) => item.dueDate === selected);
  const changeMonth = (offset: number) => {
    const next = new Date(month.getFullYear(), month.getMonth() + offset, 1);
    setMonth(next);
    const prefix = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;
    setSelected(eventDate.startsWith(prefix) ? eventDate : datedItems.find((item) => item.dueDate.startsWith(prefix))?.dueDate ?? isoDate(next));
  };

  return <View style={styles.card}>
    <View style={styles.heading}><View><Text style={styles.title}>ปฏิทินเตรียมงาน</Text><Text style={styles.hint}>วันจัดอีเวนต์และกำหนดส่งของเช็กลิสต์</Text></View><FontAwesome6 name="calendar-days" size={19} color={Theme.colors.primary} /></View>
    <View style={styles.monthRow}>
      <Pressable accessibilityRole="button" accessibilityLabel="เดือนก่อน" onPress={() => changeMonth(-1)} style={styles.monthButton}><FontAwesome6 name="chevron-left" size={13} color={Theme.colors.text} /></Pressable>
      <Text style={styles.monthTitle}>{new Intl.DateTimeFormat('th-TH', { month: 'long', year: 'numeric' }).format(month)}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="เดือนถัดไป" onPress={() => changeMonth(1)} style={styles.monthButton}><FontAwesome6 name="chevron-right" size={13} color={Theme.colors.text} /></Pressable>
    </View>
    <View style={styles.grid}>
      {weekdays.map((day) => <Text key={day} style={styles.weekday}>{day}</Text>)}
      {cells.map((day, index) => {
        if (!day) return <View key={`blank-${index}`} style={styles.dayCell} />;
        const date = isoDate(new Date(month.getFullYear(), month.getMonth(), day));
        const isSelected = date === selected;
        const isEventDay = date === eventDate;
        const hasTasks = datedItems.some((item) => item.dueDate === date);
        return <Pressable key={date} accessibilityRole="button" accessibilityLabel={`${day} ${new Intl.DateTimeFormat('th-TH', { month: 'long', year: 'numeric' }).format(month)}${isEventDay ? ' วันจัดอีเวนต์' : ''}${hasTasks ? ' มีรายการเตรียมงาน' : ''}`} onPress={() => setSelected(date)} style={[styles.dayCell, isSelected && styles.selectedCell]}>
          <Text style={[styles.dayNumber, isSelected && styles.selectedNumber, isEventDay && !isSelected && styles.eventNumber]}>{day}</Text>
          {(isEventDay || hasTasks) ? <View style={[styles.dot, { backgroundColor: isSelected ? '#FFFFFF' : isEventDay ? Theme.colors.primary : Theme.colors.lavenderText }]} /> : null}
        </Pressable>;
      })}
    </View>
    <View style={styles.agenda}>
      <Text style={styles.agendaDate}>{new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${selected}T00:00:00`))}</Text>
      {selected === eventDate ? <Text style={styles.eventItem}>วันจัดอีเวนต์</Text> : null}
      {selectedItems.map((item) => <View key={item.id} style={styles.agendaItem}><View style={[styles.agendaDot, item.done && styles.agendaDone]} /><Text style={[styles.agendaText, item.done && styles.doneText]} numberOfLines={2}>{item.title}</Text></View>)}
      {selected !== eventDate && !selectedItems.length ? <Text style={styles.empty}>ไม่มีรายการที่กำหนดส่งวันนี้</Text> : null}
    </View>
  </View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: Theme.colors.surface, borderRadius: 22, borderWidth: 1, borderColor: Theme.colors.border, padding: Theme.spacing.lg, gap: Theme.spacing.lg },
  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, title: { color: Theme.colors.text, fontSize: Theme.type.section, fontWeight: '800' }, hint: { color: Theme.colors.muted, fontSize: Theme.type.caption },
  monthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, monthButton: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.input }, monthTitle: { color: Theme.colors.text, fontSize: Theme.type.body, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' }, weekday: { width: '14.2857%', textAlign: 'center', color: Theme.colors.muted, fontSize: Theme.type.caption, marginBottom: 5 },
  dayCell: { width: '14.2857%', height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }, selectedCell: { backgroundColor: Theme.colors.primary }, dayNumber: { color: Theme.colors.text, fontSize: Theme.type.label, fontWeight: '600' }, selectedNumber: { color: '#FFFFFF' }, eventNumber: { color: Theme.colors.primary, fontWeight: '800' }, dot: { width: 4, height: 4, borderRadius: 2, marginTop: 1 },
  agenda: { borderTopWidth: 1, borderTopColor: Theme.colors.border, paddingTop: 12, gap: 8 }, agendaDate: { color: Theme.colors.text, fontSize: Theme.type.label, fontWeight: '700' }, eventItem: { color: Theme.colors.primary, fontSize: Theme.type.label, fontWeight: '700' }, agendaItem: { flexDirection: 'row', alignItems: 'center', gap: 8 }, agendaDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Theme.colors.lavenderText }, agendaDone: { backgroundColor: Theme.colors.success }, agendaText: { color: Theme.colors.text, fontSize: Theme.type.label, flex: 1 }, doneText: { color: Theme.colors.muted, textDecorationLine: 'line-through' }, empty: { color: Theme.colors.muted, fontSize: Theme.type.caption },
});
