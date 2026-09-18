import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState, type ComponentProps } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '@/components/AppText';
import { Alert } from '@/components/AppDialog';
import { EventTypeIcon } from '@/components/EventTypeIcon';
import { Theme } from '@/constants/theme';
import { getChecklistItems, getChecklistProgress, hydrateChecklistItems, type ChecklistItem } from '@/data/checklists';
import { dueStatus, urgentTasks } from '@/data/taskDue';
import { events, hydrateEvents, setEventFavorite, type EventItem } from '@/data/events';
import { userDisplayName } from '@/lib/profile';
import { supabase } from '@/lib/supabase';

type IconName = ComponentProps<typeof FontAwesome6>['name'];
const money = (value: number) => `฿${new Intl.NumberFormat('th-TH', { notation: 'compact', maximumFractionDigits: 1 }).format(value)}`;
const dueLabel = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value)
  ? new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short' }).format(new Date(`${value}T00:00:00`))
  : 'ไม่กำหนดวัน';
const localToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export default function HomeScreen() {
  const [displayName, setDisplayName] = useState('ผู้ใช้ใหม่');
  const [items, setItems] = useState<EventItem[]>(() => [...events]);
  const [loading, setLoading] = useState(events.length === 0);
  const [loadError, setLoadError] = useState(false);
  const refresh = useCallback(async (isActive: () => boolean = () => true) => {
    setLoading(true);
    try {
      const [eventsLoaded, checklistLoaded] = await Promise.all([hydrateEvents(), hydrateChecklistItems()]);
      if (!isActive()) return;
      if (eventsLoaded) setItems([...events]);
      setLoadError(!eventsLoaded || !checklistLoaded);
    } catch {
      if (isActive()) setLoadError(true);
    } finally {
      if (isActive()) setLoading(false);
    }
  }, []);
  useFocusEffect(useCallback(() => {
    let active = true;
    setItems([...events]);
    void refresh(() => active);
    void (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return;
      const { data } = await supabase.from('profiles').select('display_name').eq('id', user.id).maybeSingle();
      if (active) setDisplayName((data as { display_name?: string | null } | null)?.display_name ?? userDisplayName(user));
    })();
    return () => { active = false; };
  }, [refresh]));

  const today = localToday();
  const nextEvent = items.filter((event) => event.status === 'upcoming' && event.eventDate >= today)
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate))[0];
  const favoriteEvent = items.filter((event) => event.isFavorite).sort((a, b) => a.eventDate.localeCompare(b.eventDate))[0];
  const featuredEvent = favoriteEvent ?? nextEvent ?? [...items].sort((a, b) => b.eventDate.localeCompare(a.eventDate))[0];
  const toggleFavorite = async (event: EventItem) => {
    const { error } = await setEventFavorite(event.id, !event.isFavorite);
    if (!error) setItems([...events]);
    else Alert.alert('บันทึกงานโปรดไม่สำเร็จ', error.message);
  };
  const otherEvents = items.filter((event) => event.id !== featuredEvent?.id).slice(0, 2);
  const allUrgent = urgentTasks(getChecklistItems().filter((task) => items.some((event) => event.id === task.eventId)));
  const urgent = allUrgent.slice(0, 5);
  const urgentIds = new Set(urgent.map((task) => task.id));
  const nextEventPending = nextEvent ? getChecklistItems(nextEvent.id).filter((item) => !item.done) : [];
  const nextTasks = nextEventPending.filter((task) => !urgentIds.has(task.id))
    .sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999')).slice(0, 2);
  const pendingCount = items.reduce((sum, event) => sum + getChecklistItems(event.id).filter((item) => !item.done).length, 0);
  const totalBudget = items.reduce((sum, event) => sum + event.budget, 0);

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={loading && items.length > 0} onRefresh={() => { void refresh(); }} tintColor={Theme.colors.primary} colors={[Theme.colors.primary]} />}>
    <View style={styles.header}>
      <View style={styles.headerCopy}><Text style={styles.eyebrow}>ภาพรวมวันนี้</Text><Text style={styles.greeting} numberOfLines={1}>สวัสดี คุณ{displayName}</Text><Text style={styles.subtitle}>ทุกงานสำคัญ เริ่มต้นจากแผนที่ดี</Text></View>
      <Pressable accessibilityRole="button" accessibilityLabel="ดูงานใกล้ครบกำหนด" onPress={() => router.push('/reminders')} style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}><FontAwesome6 name="bell" size={18} color={Theme.colors.primary} /></Pressable>
      {items.length ? <Pressable accessibilityRole="button" accessibilityLabel="สร้างงานใหม่" onPress={() => router.push('/event/new')} style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}><FontAwesome6 name="plus" size={18} color={Theme.colors.primary} /></Pressable> : null}
    </View>

    {loadError ? <Pressable accessibilityRole="button" onPress={() => { void refresh(); }} style={styles.errorCard}><Text style={styles.errorTitle}>โหลดข้อมูลหน้าแรกไม่สำเร็จ</Text><Text style={styles.errorDetail}>แตะเพื่อลองใหม่ หรือเช็กการเชื่อมต่ออินเทอร์เน็ต</Text></Pressable> : null}
    {loading && !items.length ? <ActivityIndicator color={Theme.colors.primary} /> : null}
    {featuredEvent ? <FeaturedEvent event={featuredEvent} progress={getChecklistProgress(featuredEvent.id)} isNext={featuredEvent.id === nextEvent?.id} today={today} onToggleFavorite={() => { void toggleFavorite(featuredEvent); }} /> : !loading && !loadError ? <EmptyHero /> : null}

    {urgent.length ? <View style={styles.section}>
      <SectionHeader title={`งานใกล้ครบกำหนด · ${allUrgent.length}`} onPress={() => router.push('/reminders')} />
      <Text style={styles.summaryHint}>รวมงานที่เกินกำหนดและครบกำหนดภายใน 3 วันจากทุกอีเวนต์{allUrgent.length > 5 ? ' · แสดง 5 รายการแรก' : ''}</Text>
      <View style={styles.taskList}>{urgent.map((task) => <UrgentTaskRow key={task.id} task={task} eventTitle={items.find((event) => event.id === task.eventId)?.title ?? ''} />)}</View>
    </View> : null}

    {!items.length && !loading && !loadError ? <View style={styles.section}><Text style={styles.sectionTitle}>เริ่มต้นใน 3 ขั้นตอน</Text><View style={styles.starterCard}>
      <StarterStep number="01" icon="calendar-days" title="สร้างอีเวนต์" detail="กำหนดวัน สถานที่ และงบ" />
      <StarterStep number="02" icon="list-check" title="เตรียมเช็กลิสต์" detail="แบ่งงานใหญ่ให้เป็นขั้นตอน" />
      <StarterStep number="03" icon="users" title="จัดการแขก" detail="ติดตามคำตอบและจัดที่นั่ง" />
    </View></View> : null}

    {nextEvent ? <View style={styles.section}>
      <Text style={styles.sectionTitle}>สิ่งที่ต้องทำต่อ · {nextEvent.title}</Text>
      {nextTasks.length ? <View style={styles.taskList}>{nextTasks.map((task) => <TaskRow key={task.id} task={task} eventId={nextEvent.id} />)}</View>
        : <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/event/checklist', params: { eventId: nextEvent.id } })} style={styles.allDone}><View style={styles.allDoneIcon}><FontAwesome6 name={nextEventPending.length ? 'clock' : 'check'} size={18} color={Theme.colors.success} /></View><View style={styles.flex}><Text style={styles.allDoneTitle}>{nextEventPending.length ? 'งานที่ต้องติดตามอยู่ด้านบน' : 'รายการเตรียมงานครบแล้ว'}</Text><Text style={styles.allDoneText}>{nextEventPending.length ? 'เปิดเช็กลิสต์เพื่อดูทุกงานของอีเวนต์นี้' : 'เปิดเช็กลิสต์เพื่อเพิ่มรายการใหม่'}</Text></View><FontAwesome6 name="arrow-right" size={14} color={Theme.colors.success} /></Pressable>}
    </View> : null}

    {items.length ? <View style={styles.section}><View><Text style={styles.sectionTitle}>สรุปทุกอีเวนต์</Text><Text style={styles.summaryHint}>นับรวมอีเวนต์และรายการเตรียมงานทั้งหมดของคุณ</Text></View><View style={styles.stats}>
      <Stat icon="calendar-days" value={`${items.length} อีเวนต์`} label="ที่สร้างไว้" background={Theme.colors.primarySoft} color={Theme.colors.primary} />
      <Stat icon="list-check" value={`${pendingCount} รายการ`} label="เช็กลิสต์ที่ยังไม่เสร็จ" background={Theme.colors.lavender} color={Theme.colors.lavenderText} />
      <Stat icon="coins" value={money(totalBudget)} label="งบที่ตั้งไว้รวม" background={Theme.colors.mint} color={Theme.colors.success} />
    </View></View> : null}

    {otherEvents.length ? <View style={styles.section}><SectionHeader title="งานอื่นของคุณ" onPress={() => router.push('/events')} /><View style={styles.otherList}>{otherEvents.map((event) => <CompactEvent key={event.id} event={event} />)}</View></View> : null}
  </ScrollView></SafeAreaView>;
}

function FeaturedEvent({ event, progress, isNext, today, onToggleFavorite }: { event: EventItem; progress: number; isNext: boolean; today: string; onToggleFavorite: () => void }) {
  const countdown = event.status === 'completed' ? 'เสร็จแล้ว' : event.eventDate < today ? `ผ่านไป ${Math.abs(event.daysLeft)} วัน` : event.daysLeft === 0 ? 'วันนี้' : `อีก ${event.daysLeft} วัน`;
  return <Pressable accessibilityRole="button" accessibilityLabel={`ดูงาน ${event.title}`} onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })} style={({ pressed }) => [styles.hero, pressed && styles.pressed]}>
    <LinearGradient pointerEvents="none" colors={Theme.gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
    <View pointerEvents="none" style={styles.heroCircleLarge} /><View pointerEvents="none" style={styles.heroCircleSmall} />
    <View style={styles.heroTop}><View style={styles.heroEyebrow}><FontAwesome6 name="star" size={12} color={Theme.colors.heroProgress} solid /><Text style={styles.heroEyebrowText}>{event.isFavorite ? 'งานโปรดของคุณ' : isNext ? 'งานที่ใกล้ถึง' : 'งานล่าสุด'}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={event.isFavorite ? 'นำออกจากงานโปรด' : 'เพิ่มเป็นงานโปรด'} onPress={(pressEvent) => { pressEvent.stopPropagation(); onToggleFavorite(); }} hitSlop={10} style={styles.favoriteButton}><FontAwesome6 name="star" size={18} color={event.isFavorite ? '#FFD07A' : '#FFFFFF'} solid={event.isFavorite} /></Pressable><View style={styles.countdown}><Text style={styles.countdownText}>{countdown}</Text></View></View>
    <View style={styles.heroMain}><View style={styles.heroIcon}><EventTypeIcon kind={event.kind} size={26} /></View><Text style={styles.heroTitle} numberOfLines={2}>{event.title}</Text><View style={styles.heroMeta}><FontAwesome6 name="calendar-days" size={13} color={Theme.colors.heroMuted} /><Text style={styles.heroMetaText}>{event.date}</Text><Text style={styles.heroDot}>·</Text><Text style={styles.heroMetaText} numberOfLines={1}>{event.venue}</Text></View></View>
    <View style={styles.heroBottom}><View style={styles.progressLabels}><Text style={styles.progressCaption}>ความคืบหน้า</Text><Text style={styles.progressPercent}>{progress}%</Text></View><View style={styles.heroTrack}><View style={[styles.heroProgress, { width: `${progress}%` }]} /></View><View style={styles.heroAction}><Text style={styles.heroActionText}>ดูรายละเอียดงาน</Text><FontAwesome6 name="arrow-right" size={14} color="#FFFFFF" /></View></View>
  </Pressable>;
}

function EmptyHero() {
  return <View style={styles.emptyHero}><LinearGradient pointerEvents="none" colors={Theme.gradients.soft} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} /><View pointerEvents="none" style={styles.emptyCircle} /><View style={styles.emptyArt}><FontAwesome6 name="calendar-days" size={32} color={Theme.colors.primary} /></View><Text style={styles.emptyTitle}>เริ่มเรื่องราวดี ๆ ด้วยแผนแรก</Text><Text style={styles.emptyDescription}>สร้างอีเวนต์ แล้วจัดการเช็กลิสต์ แขก และงบประมาณได้ในที่เดียว</Text><Pressable accessibilityRole="button" onPress={() => router.push('/event/new')} style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}><FontAwesome6 name="plus" size={14} color="#FFFFFF" /><Text style={styles.emptyButtonText}>สร้างอีเวนต์แรก</Text></Pressable></View>;
}

function StarterStep({ number, icon, title, detail }: { number: string; icon: IconName; title: string; detail: string }) {
  return <View style={styles.starterStep}><View style={styles.starterIcon}><FontAwesome6 name={icon} size={16} color={Theme.colors.primary} solid /></View><View style={styles.flex}><Text style={styles.starterTitle}>{title}</Text><Text style={styles.starterDetail}>{detail}</Text></View><Text style={styles.starterNumber}>{number}</Text></View>;
}

function SectionHeader({ title, onPress }: { title: string; onPress: () => void }) {
  return <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{title}</Text><Pressable accessibilityRole="button" onPress={onPress} style={styles.seeAllButton}><Text style={styles.seeAll}>ดูทั้งหมด</Text><FontAwesome6 name="arrow-right" size={11} color={Theme.colors.primary} /></Pressable></View>;
}

function TaskRow({ task, eventId }: { task: ChecklistItem; eventId: string }) {
  return <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/event/checklist', params: { eventId } })} style={({ pressed }) => [styles.task, pressed && styles.pressed]}><View style={styles.taskMarker}><View style={styles.taskMarkerInner} /></View><View style={styles.flex}><Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text><Text style={styles.taskMeta}>{task.assigneeName ? `ผู้รับผิดชอบ: ${task.assigneeName}` : task.category}</Text></View><View style={styles.taskDate}><FontAwesome6 name="clock" size={11} color={Theme.colors.muted} /><Text style={styles.taskDateText}>{dueLabel(task.dueDate)}</Text></View></Pressable>;
}

function UrgentTaskRow({ task, eventTitle }: { task: ChecklistItem; eventTitle: string }) {
  const due = dueStatus(task);
  return <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/event/checklist-edit', params: { id: task.id } })} style={styles.urgentTask}>
    <View style={styles.flex}><Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text><Text style={styles.taskMeta} numberOfLines={1}>{eventTitle}{task.assigneeName ? ` · ${task.assigneeName}` : ''}</Text></View>
    {due ? <Text style={[styles.urgentPill, due.tone === 'overdue' && styles.urgentOverdue]}>{due.label}</Text> : null}
  </Pressable>;
}

function Stat({ icon, value, label, background, color }: { icon: IconName; value: string; label: string; background: string; color: string }) {
  return <View style={[styles.stat, { backgroundColor: background }]}><FontAwesome6 name={icon} size={16} color={color} solid /><Text style={[styles.statValue, { color }]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text><Text style={styles.statLabel} numberOfLines={2}>{label}</Text></View>;
}

function CompactEvent({ event }: { event: EventItem }) {
  return <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })} style={({ pressed }) => [styles.otherCard, pressed && styles.pressed]}><View style={[styles.otherIcon, { backgroundColor: event.banner }]}><EventTypeIcon kind={event.kind} size={18} color={event.accent} /></View><View style={styles.flex}><Text style={styles.otherTitle} numberOfLines={1}>{event.title}</Text><Text style={styles.otherMeta}>{event.date} · {event.status === 'completed' ? 'เสร็จแล้ว' : event.daysLeft < 0 ? `ผ่านไป ${Math.abs(event.daysLeft)} วัน` : event.daysLeft === 0 ? 'วันนี้' : `อีก ${event.daysLeft} วัน`}</Text></View><FontAwesome6 name="arrow-right" size={14} color={Theme.colors.muted} /></Pressable>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background },
  content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 112, gap: 26 },
  flex: { flex: 1 }, pressed: { opacity: 0.84 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 }, headerCopy: { flex: 1, gap: 2 },
  eyebrow: { color: Theme.colors.primary, fontSize: 13, fontWeight: '700' }, greeting: { color: Theme.colors.text, fontSize: 27, fontWeight: '800', lineHeight: 37 }, subtitle: { color: Theme.colors.muted, fontSize: 14 },
  headerAction: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.primarySoft },
  errorCard: { borderRadius: 16, backgroundColor: Theme.colors.primarySoft, padding: 16, gap: 4 },
  errorTitle: { color: Theme.colors.primary, fontSize: 15, fontWeight: '700' },
  errorDetail: { color: Theme.colors.text, fontSize: 13 },
  hero: { backgroundColor: Theme.colors.hero, borderRadius: 28, padding: 22, minHeight: 292, overflow: 'hidden', justifyContent: 'space-between' },
  heroCircleLarge: { position: 'absolute', width: 210, height: 210, right: -54, top: -64, borderRadius: 105, backgroundColor: Theme.colors.heroAccent, opacity: 0.5 },
  heroCircleSmall: { position: 'absolute', width: 130, height: 130, right: -35, top: 85, borderRadius: 65, borderWidth: 1, borderColor: Theme.colors.heroStroke, opacity: 0.55 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }, heroEyebrow: { flexDirection: 'row', alignItems: 'center', gap: 7 }, heroEyebrowText: { color: Theme.colors.heroMuted, fontSize: 13, fontWeight: '600' },
  favoriteButton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', marginLeft: 'auto' },
  countdown: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 100, backgroundColor: Theme.colors.primary }, countdownText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  heroMain: { gap: 8, paddingVertical: 18 }, heroIcon: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.heroAccent, marginBottom: 2 },
  heroTitle: { color: '#FFFFFF', fontSize: 27, fontWeight: '800', lineHeight: 35 }, heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 7 }, heroMetaText: { color: Theme.colors.heroMuted, fontSize: 13, flexShrink: 1 }, heroDot: { color: Theme.colors.heroMuted },
  heroBottom: { gap: 8 }, progressLabels: { flexDirection: 'row', justifyContent: 'space-between' }, progressCaption: { color: Theme.colors.heroMuted, fontSize: 12 }, progressPercent: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  heroTrack: { height: 8, borderRadius: 10, backgroundColor: Theme.colors.heroTrack, overflow: 'hidden' }, heroProgress: { height: '100%', borderRadius: 10, backgroundColor: Theme.colors.heroProgress },
  featureReason: { color: Theme.colors.heroMuted, fontSize: 12 },
  heroAction: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 7 }, heroActionText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  emptyHero: { minHeight: 270, padding: 24, borderRadius: 28, backgroundColor: Theme.colors.primarySoft, overflow: 'hidden', alignItems: 'flex-start', justifyContent: 'center', gap: 9 },
  emptyCircle: { position: 'absolute', width: 210, height: 210, right: -75, top: -70, borderRadius: 105, backgroundColor: '#F7D4E0' },
  emptyArt: { width: 58, height: 58, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { color: Theme.colors.text, fontSize: 23, fontWeight: '800', lineHeight: 31 }, emptyDescription: { color: Theme.colors.muted, fontSize: 15, lineHeight: 24, maxWidth: 300 },
  emptyButton: { backgroundColor: Theme.colors.primary, borderRadius: 14, paddingHorizontal: 16, minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }, emptyButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  starterCard: { backgroundColor: Theme.colors.surface, borderRadius: 20, paddingHorizontal: 16 }, starterStep: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: Theme.colors.border }, starterIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: Theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, starterTitle: { color: Theme.colors.text, fontSize: Theme.type.body, fontWeight: '700' }, starterDetail: { color: Theme.colors.muted, fontSize: Theme.type.caption }, starterNumber: { color: '#C9BAC8', fontSize: 20, fontWeight: '800' },
  section: { gap: 12 }, sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, sectionTitle: { color: Theme.colors.text, fontSize: 19, fontWeight: '800' }, summaryHint: { color: Theme.colors.muted, fontSize: Theme.type.caption, marginTop: 4 },
  seeAllButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6 }, seeAll: { color: Theme.colors.primary, fontSize: 13, fontWeight: '700' },
  taskList: { gap: 9 }, task: { minHeight: 70, borderRadius: 18, backgroundColor: Theme.colors.surface, flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 15 },
  taskMarker: { width: 26, height: 26, borderRadius: 9, borderWidth: 1.5, borderColor: Theme.colors.primary, alignItems: 'center', justifyContent: 'center' }, taskMarkerInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: Theme.colors.primarySoft },
  taskTitle: { color: Theme.colors.text, fontSize: Theme.type.body, fontWeight: '700' }, taskMeta: { color: Theme.colors.muted, fontSize: Theme.type.caption }, taskDate: { flexDirection: 'row', alignItems: 'center', gap: 5 }, taskDateText: { color: Theme.colors.muted, fontSize: Theme.type.caption },
  urgentTask: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  urgentPill: { color: Theme.colors.warningText, backgroundColor: Theme.colors.warningSoft, fontSize: Theme.type.micro, fontWeight: '700', borderRadius: 100, paddingHorizontal: 9, paddingVertical: 5, overflow: 'hidden' },
  urgentOverdue: { color: Theme.colors.primary, backgroundColor: Theme.colors.primarySoft },
  allDone: { minHeight: 76, paddingHorizontal: 15, borderRadius: 18, backgroundColor: Theme.colors.mint, flexDirection: 'row', alignItems: 'center', gap: 12 }, allDoneIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }, allDoneTitle: { color: Theme.colors.text, fontSize: Theme.type.body, fontWeight: '700' }, allDoneText: { color: Theme.colors.muted, fontSize: Theme.type.caption },
  stats: { flexDirection: 'row', gap: 9 }, stat: { flex: 1, minWidth: 0, borderRadius: 18, padding: 12, minHeight: 126, gap: 5 }, statValue: { fontSize: 18, fontWeight: '800' }, statLabel: { color: Theme.colors.muted, fontSize: Theme.type.caption, lineHeight: 18 },
  otherList: { gap: 9 }, otherCard: { minHeight: 76, borderRadius: 18, backgroundColor: Theme.colors.surface, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }, otherIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, otherTitle: { color: Theme.colors.text, fontSize: Theme.type.body, fontWeight: '700' }, otherMeta: { color: Theme.colors.muted, fontSize: Theme.type.caption },
});
