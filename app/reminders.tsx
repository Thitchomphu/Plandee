import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '@/components/AppText';
import { EventPageHeader } from '@/components/EventPageHeader';
import { Theme } from '@/constants/theme';
import { getChecklistItems, hydrateChecklistItems, type ChecklistItem } from '@/data/checklists';
import { events, hydrateEvents, type EventItem } from '@/data/events';
import { dueStatus, urgentTasks } from '@/data/taskDue';

export default function RemindersScreen() {
  const [items, setItems] = useState<ChecklistItem[]>(() => urgentTasks(getChecklistItems()));
  const [eventItems, setEventItems] = useState<EventItem[]>(() => [...events]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const refresh = useCallback(async (isActive: () => boolean = () => true) => {
    setLoading(true);
    try {
      const [eventsLoaded, checklistLoaded] = await Promise.all([hydrateEvents(), hydrateChecklistItems()]);
      if (!isActive()) return;
      if (eventsLoaded && checklistLoaded) {
        setEventItems([...events]);
        setItems(urgentTasks(getChecklistItems()));
        setError(false);
      } else setError(true);
    } catch { if (isActive()) setError(true); }
    finally { if (isActive()) setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { let active = true; void refresh(() => active); return () => { active = false; }; }, [refresh]));
  const visible = items.filter((task) => eventItems.some((event) => event.id === task.eventId));
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}>
    <EventPageHeader title="งานใกล้ครบกำหนด" backLabel="กลับหน้าแรก" onBack={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} />
    <Text style={styles.intro}>รวมเช็กลิสต์ที่ยังไม่เสร็จ ซึ่งเลยกำหนดหรือครบกำหนดภายใน 3 วัน</Text>
    <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/profile')} style={styles.settings}><FontAwesome6 name="bell" size={15} color={Theme.colors.primary} /><Text style={styles.settingsText}>ตั้งค่าการแจ้งเตือนบนเครื่อง</Text><FontAwesome6 name="arrow-right" size={13} color={Theme.colors.primary} /></Pressable>
    {loading && !visible.length ? <ActivityIndicator color={Theme.colors.primary} /> : null}
    {error ? <Pressable accessibilityRole="button" onPress={() => { void refresh(); }} style={styles.error}><Text style={styles.errorText}>โหลดรายการไม่สำเร็จ แตะเพื่อลองใหม่</Text></Pressable> : null}
    {!loading && !error && !visible.length ? <View style={styles.empty}><FontAwesome6 name="circle-check" size={32} color={Theme.colors.success} /><Text style={styles.emptyTitle}>ไม่มีงานที่ต้องเร่งตอนนี้</Text><Text style={styles.intro}>งานที่ใกล้ครบกำหนดจะปรากฏที่นี่</Text></View> : null}
    {visible.map((task) => { const due = dueStatus(task); const event = eventItems.find((item) => item.id === task.eventId); return <Pressable key={task.id} accessibilityRole="button" onPress={() => router.push({ pathname: '/event/checklist-edit', params: { id: task.id } })} style={styles.card}><View style={styles.cardTop}><Text style={styles.taskTitle} numberOfLines={2}>{task.title}</Text><Text style={[styles.due, due?.tone === 'overdue' && styles.overdue]}>{due?.label}</Text></View><Text style={styles.meta}>{event?.title ?? 'อีเวนต์'}{task.assigneeName ? ` · ${task.assigneeName}` : ''}</Text><Text style={styles.link}>ดูและแก้ไขงาน →</Text></Pressable>; })}
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 48, gap: 14 },
  intro: { color: Theme.colors.muted, fontSize: Theme.type.caption, lineHeight: 22 },
  settings: { minHeight: 50, borderRadius: 16, backgroundColor: Theme.colors.primarySoft, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14 },
  settingsText: { color: Theme.colors.primary, fontSize: Theme.type.label, fontWeight: '700', flex: 1 },
  card: { padding: 16, borderRadius: 20, backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, gap: 7 },
  cardTop: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' }, taskTitle: { flex: 1, color: Theme.colors.text, fontSize: Theme.type.body, fontWeight: '700' },
  due: { color: Theme.colors.warningText, backgroundColor: Theme.colors.warningSoft, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 10, overflow: 'hidden', fontSize: Theme.type.micro, fontWeight: '700' },
  overdue: { color: Theme.colors.primary, backgroundColor: Theme.colors.primarySoft },
  meta: { color: Theme.colors.muted, fontSize: Theme.type.caption }, link: { color: Theme.colors.primary, fontSize: Theme.type.caption, fontWeight: '700' },
  empty: { padding: 28, alignItems: 'center', gap: 10, backgroundColor: Theme.colors.surface, borderRadius: 22 }, emptyTitle: { color: Theme.colors.text, fontSize: Theme.type.section, fontWeight: '700' },
  error: { padding: 16, borderRadius: 16, backgroundColor: Theme.colors.primarySoft }, errorText: { color: Theme.colors.primary, fontSize: Theme.type.caption },
});
