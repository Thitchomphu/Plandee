import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '@/components/AppText';
import { EventTabs } from '@/components/EventTabs';
import { Theme } from '@/constants/theme';
import { ChecklistItem, getChecklistItems, getChecklistProgress } from '@/data/checklists';
import { events } from '@/data/events';

const daysToDue = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return Number.POSITIVE_INFINITY;
  const [year, month, day] = value.split('-').map(Number);
  const dueDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((dueDate.getTime() - today.getTime()) / 86400000);
};
const dueMessage = (value: string) => { const days = daysToDue(value); return days === 0 ? 'ครบกำหนดวันนี้' : `ครบกำหนดใน ${days} วัน`; };

export default function EventOverviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = events.find((item) => item.id === id) ?? events[0];
  const [progress, setProgress] = useState(getChecklistProgress(event.id));
  const [pending, setPending] = useState(getChecklistItems(event.id).filter((item) => !item.done).length);
  const [upcomingTasks, setUpcomingTasks] = useState<ChecklistItem[]>([]);
  useFocusEffect(useCallback(() => {
    const items = getChecklistItems(event.id);
    setProgress(getChecklistProgress(event.id));
    setPending(items.filter((item) => !item.done).length);
    setUpcomingTasks(items.filter((item) => !item.done && daysToDue(item.dueDate) >= 0 && daysToDue(item.dueDate) <= 7).sort((left, right) => left.dueDate.localeCompare(right.dueDate)));
  }, [event.id, setPending, setProgress, setUpcomingTasks]));
  const menu = () => Alert.alert('จัดการงาน', undefined, [{ text: 'แก้ไขงาน', onPress: () => router.push('/event/new') }, { text: 'ทำเครื่องหมายว่าเสร็จแล้ว' }, { text: 'ลบงาน', style: 'destructive' }, { text: 'ยกเลิก', style: 'cancel' }]);
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}><View style={styles.header}><Pressable onPress={() => router.back()} hitSlop={8}><Text style={styles.back}>‹ งานของฉัน</Text></Pressable><Pressable accessibilityLabel="เมนูงาน" onPress={menu} hitSlop={8}><Text style={styles.more}>•••</Text></Pressable></View><View style={[styles.hero, { backgroundColor: event.banner }]}><Text style={styles.heroIcon}>{event.icon}</Text><Text style={[styles.days, { color: event.accent }]}>{event.status === 'completed' ? 'เสร็จแล้ว' : `อีก ${event.daysLeft} วัน`}</Text></View><Text style={styles.title}>{event.title}</Text><Text style={styles.meta}>{event.date} · {event.venue}</Text><EventTabs eventId={event.id} active="overview" /><Overview event={event} progress={progress} pending={pending} upcomingTasks={upcomingTasks} /></ScrollView></SafeAreaView>;
}

function Overview({ event, progress, pending, upcomingTasks }: { event: (typeof events)[number]; progress: number; pending: number; upcomingTasks: ChecklistItem[] }) { return <View style={styles.sectionGap}><View style={styles.progressCard}><View style={styles.row}><Text style={styles.cardTitle}>ความคืบหน้าของงาน</Text><Text style={styles.percent}>{progress}%</Text></View><View style={styles.track}><View style={[styles.progress, { width: `${progress}%`, backgroundColor: event.accent }]} /></View></View><View style={styles.stats}><Stat icon="📍" label="สถานที่" value={event.venue} /><Stat icon="💰" label="งบประมาณ" value={`฿${event.budget.toLocaleString()}`} /><Stat icon="👥" label="แขก" value={`${event.guests} คน`} /><Stat icon="⏳" label="งานค้าง" value={`${pending} รายการ`} /></View><Text style={styles.sectionTitle}>งานใกล้กำหนด</Text>{upcomingTasks.length ? upcomingTasks.map((task) => <Pressable key={task.id} onPress={() => router.push({ pathname: '/event/checklist-edit', params: { id: task.id } })}><Task icon="📋" title={task.title} meta={`${dueMessage(task.dueDate)} · ${task.category}`} /></Pressable>) : <Text style={styles.emptyTasks}>ไม่มีงานที่ครบกำหนดภายใน 7 วัน</Text>}</View>; }
function Stat({ icon, label, value }: { icon: string; label: string; value: string }) { return <View style={styles.stat}><Text style={styles.statIcon}>{icon}</Text><Text style={styles.statLabel}>{label}</Text><Text style={styles.statValue} numberOfLines={1}>{value}</Text></View>; }
function Task({ icon, title, meta }: { icon: string; title: string; meta: string }) { return <View style={styles.task}><Text style={styles.taskIcon}>{icon}</Text><View style={{ flex: 1 }}><Text style={styles.taskTitle}>{title}</Text><Text style={styles.taskMeta}>{meta}</Text></View><Text style={styles.chevron}>›</Text></View>; }

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: Theme.colors.background }, content: { padding: 20, paddingBottom: 40, gap: 12 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 40 }, back: { color: Theme.colors.primary, fontSize: 14, fontWeight: '600' }, more: { color: Theme.colors.text, fontSize: 18, letterSpacing: 2 }, hero: { minHeight: 126, borderRadius: 22, alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }, heroIcon: { fontSize: 42 }, days: { fontSize: 14, fontWeight: '700' }, title: { color: Theme.colors.text, fontSize: 24, fontWeight: '800', marginTop: 4 }, meta: { color: Theme.colors.muted, fontSize: 13 }, tabs: { flexDirection: 'row', gap: 8, marginTop: 8 }, tab: { minHeight: 40, paddingHorizontal: 15, borderRadius: 100, alignItems: 'center', justifyContent: 'center' }, tabActive: { backgroundColor: Theme.colors.text }, tabInactive: { backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border }, tabText: { fontSize: 12, fontWeight: '600' }, tabTextActive: { color: '#FFFFFF' }, tabTextInactive: { color: Theme.colors.muted }, sectionGap: { gap: 12 }, progressCard: { backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 18, padding: 16, gap: 12 }, row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, cardTitle: { color: Theme.colors.text, fontSize: 14, fontWeight: '700' }, percent: { color: Theme.colors.primary, fontSize: 14, fontWeight: '700' }, track: { height: 8, backgroundColor: Theme.colors.border, borderRadius: 100, overflow: 'hidden' }, progress: { height: '100%', borderRadius: 100 }, stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, stat: { width: '48%', backgroundColor: Theme.colors.surface, borderRadius: 16, padding: 12, gap: 4 }, statIcon: { fontSize: 18 }, statLabel: { color: Theme.colors.muted, fontSize: 11 }, statValue: { color: Theme.colors.text, fontSize: 13, fontWeight: '700' }, sectionTitle: { color: Theme.colors.text, fontSize: 16, fontWeight: '700', marginTop: 8 }, task: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 16, padding: 14 }, taskIcon: { fontSize: 20 }, taskTitle: { color: Theme.colors.text, fontSize: 13, fontWeight: '600' }, taskMeta: { color: Theme.colors.muted, fontSize: 11, marginTop: 3 }, chevron: { color: Theme.colors.muted, fontSize: 25 }, emptyTasks: { color: Theme.colors.muted, textAlign: 'center', padding: 18, backgroundColor: Theme.colors.surface, borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', borderColor: Theme.colors.border } });
