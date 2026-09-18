import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '@/constants/theme';
import { ChecklistItem, getChecklistItems, updateChecklistItem } from '@/data/checklists';
import { events } from '@/data/events';
import { EventSectionNav } from '@/components/EventSectionNav';
import { EventContextBanner, EventPageHeader } from '@/components/EventPageHeader';
import { ProgressRing } from '@/components/ProgressRing';
import { SelectMark } from '@/components/SelectMark';
import { dueStatus } from '@/data/taskDue';

export default function EventChecklistScreen() {
  const { eventId = events[0].id } = useLocalSearchParams<{ eventId?: string }>();
  const event = events.find((item) => item.id === eventId) ?? events[0];
  const [items, setItems] = useState<ChecklistItem[]>(() => getChecklistItems(event.id));
  useFocusEffect(useCallback(() => { setItems(getChecklistItems(event.id)); }, [event.id]));
  const done = items.filter((item) => item.done).length;
  const progress = items.length ? Math.round((done / items.length) * 100) : 0;
  const grouped = useMemo(() => Array.from(new Set(items.map((item) => item.category))), [items]);
  const urgentCount = items.filter((item) => dueStatus(item) !== null).length;
  const toggle = async (id: string) => {
    const item = items.find((value) => value.id === id);
    if (!item) return;
    const { error } = await updateChecklistItem(id, { done: !item.done });
    if (!error) setItems(getChecklistItems(event.id));
  };

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <EventPageHeader title="เช็กลิสต์" backLabel="กลับภาพรวมงาน" onBack={() => router.replace({ pathname: '/event/[id]', params: { id: event.id } })} />
    <EventContextBanner event={event} />
    <View style={styles.progressRow}><ProgressRing progress={progress} /><View style={styles.progressText}><Text style={styles.progressTitle}>เช็กลิสต์ {done}/{items.length} รายการเสร็จแล้ว</Text><Text style={styles.progressDescription}>เหลืออีก <Text style={styles.strong}>{items.length - done} รายการ</Text> ที่ต้องเตรียม</Text></View></View>
    {urgentCount > 0 ? <View style={styles.dueBanner}><Text style={styles.dueBannerTitle}>มี {urgentCount} งานที่ต้องติดตาม</Text><Text style={styles.dueBannerText}>นับงานที่เกินกำหนดหรือครบกำหนดภายใน 3 วัน โดยไม่นับงานที่ทำเสร็จแล้ว</Text></View> : null}
    <EventSectionNav eventId={event.id} active="checklist" />
    {!items.length ? <Text style={{ color: Theme.colors.muted, textAlign: 'center', padding: 24, fontSize: 14 }}>ยังไม่มีรายการเตรียมงาน กดปุ่มด้านล่างเพื่อเพิ่มรายการแรก</Text> : null}
    {grouped.map((category) => <View key={category} style={styles.group}><View style={styles.groupHeader}><Text style={styles.category}>{category}</Text><Text style={styles.categoryCount}>({items.filter((item) => item.category === category && item.done).length}/{items.filter((item) => item.category === category).length} เสร็จ)</Text></View>{items.filter((item) => item.category === category).sort((a, b) => (a.done ? 1 : 0) - (b.done ? 1 : 0) || (a.dueDate || '9999').localeCompare(b.dueDate || '9999')).map((item) => <ChecklistRow key={item.id} item={item} onToggle={() => toggle(item.id)} onEdit={() => router.push({ pathname: '/event/checklist-edit', params: { id: item.id } })} />)}</View>)}
  </ScrollView><Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/event/checklist-new', params: { eventId: event.id } })} style={styles.add}><Text style={styles.addText}>＋ เพิ่มรายการเช็คลิสต์</Text></Pressable></SafeAreaView>;
}

function ChecklistRow({ item, onToggle, onEdit }: { item: ChecklistItem; onToggle: () => void; onEdit: () => void }) {
  const due = dueStatus(item);
  return <View style={styles.row}>
    <Pressable accessibilityRole="checkbox" accessibilityLabel={item.title} accessibilityState={{ checked: item.done }} onPress={onToggle} style={styles.checkTouch}><SelectMark selected={item.done} /></Pressable>
    <Pressable onPress={onEdit} style={styles.itemBody}>
      <View style={styles.titleLine}><Text style={[styles.itemTitle, item.done && styles.done]}>{item.title}</Text>{due ? <Text style={[styles.duePill, due.tone === 'overdue' ? styles.overdue : styles.soon]}>{due.label}</Text> : null}</View>
      <Text style={styles.itemMeta}>{item.dueDate ? `กำหนดส่ง: ${item.dueDate}` : 'ยังไม่กำหนดวัน'}{item.budget ? ` · ฿${item.budget.toLocaleString()}` : ''}</Text>
      {item.assigneeName ? <Text style={styles.assignee}>ผู้รับผิดชอบ: {item.assigneeName}</Text> : null}
    </Pressable>
    <Pressable accessibilityRole="button" accessibilityLabel="แก้ไขรายการ" onPress={onEdit} style={styles.edit} hitSlop={6}><Text style={styles.editIcon}>✎</Text></Pressable>
  </View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background },
  content: { paddingHorizontal: Theme.spacing.xl, paddingTop: 12, paddingBottom: 100, gap: Theme.spacing.lg },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  progressText: { flex: 1, gap: 6 },
  progressTitle: { color: Theme.colors.text, fontSize: 16, fontWeight: '700' },
  progressDescription: { color: Theme.colors.muted, fontSize: Theme.type.label },
  dueBanner: { backgroundColor: Theme.colors.warningSoft, borderRadius: 16, padding: 14, gap: 3 },
  dueBannerTitle: { color: Theme.colors.warningText, fontSize: Theme.type.body, fontWeight: '700' },
  dueBannerText: { color: Theme.colors.warningText, fontSize: Theme.type.caption },
  strong: { color: Theme.colors.text, fontWeight: '700' },
  group: { gap: 8 },
  groupHeader: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: 6, paddingTop: 4 },
  category: { color: Theme.colors.text, fontSize: 17, fontWeight: '800' },
  categoryCount: { color: Theme.colors.muted, fontSize: Theme.type.caption },
  row: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 20 },
  checkTouch: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  itemBody: { flex: 1, gap: 3, justifyContent: 'center', minHeight: 44 },
  titleLine: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  itemTitle: { color: Theme.colors.text, fontSize: Theme.type.body, fontWeight: '600' },
  itemMeta: { color: Theme.colors.muted, fontSize: Theme.type.caption },
  assignee: { color: Theme.colors.muted, fontSize: Theme.type.caption },
  duePill: { overflow: 'hidden', borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3, fontSize: Theme.type.micro, fontWeight: '700' },
  overdue: { color: Theme.colors.primary, backgroundColor: Theme.colors.primarySoft },
  soon: { color: Theme.colors.warningText, backgroundColor: Theme.colors.warningSoft },
  done: { color: Theme.colors.muted, textDecorationLine: 'line-through' },
  edit: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  editIcon: { color: Theme.colors.muted, fontSize: 20 },
  add: { position: 'absolute', left: 20, right: 20, bottom: 20, minHeight: 52, borderRadius: 18, backgroundColor: Theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  addText: { color: '#FFFFFF', fontSize: Theme.type.body, fontWeight: '700' },
});
