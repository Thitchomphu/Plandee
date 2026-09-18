import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { Alert } from '@/components/AppDialog';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '@/constants/theme';
import { events, EventItem, hydrateEvents, setEventFavorite } from '@/data/events';
import { EventTypeIcon } from '@/components/EventTypeIcon';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const cardStyles = StyleSheet.create({
  card: { backgroundColor: Theme.colors.surface, borderRadius: 22, padding: 16, gap: 14 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  eventIcon: { width: 52, height: 52, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  cardMain: { flex: 1, gap: 3 }, kind: { color: Theme.colors.primary, fontSize: Theme.type.caption, fontWeight: '700' }, eventTitle: { color: Theme.colors.text, fontSize: 17, fontWeight: '800' },
  status: { borderRadius: 100, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: Theme.colors.primarySoft }, statusText: { color: Theme.colors.primary, fontSize: Theme.type.micro, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 7 }, meta: { color: Theme.colors.muted, fontSize: 13, flex: 1 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 }, progressTrack: { flex: 1, height: 7, borderRadius: 100, backgroundColor: Theme.colors.border, overflow: 'hidden' }, progressFill: { height: '100%', borderRadius: 100 }, progressText: { color: Theme.colors.muted, fontSize: Theme.type.caption, fontWeight: '700' },
  emptyCard: { minHeight: 250, borderRadius: 24, backgroundColor: Theme.colors.primarySoft, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 9 },
  emptyIcon: { width: 58, height: 58, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginBottom: 5 },
  emptyTitle: { color: Theme.colors.text, fontSize: 20, fontWeight: '800', textAlign: 'center' }, emptyBody: { color: Theme.colors.muted, fontSize: 14, textAlign: 'center' },
  emptyAction: { marginTop: 6, minHeight: 44, borderRadius: 14, paddingHorizontal: 16, backgroundColor: Theme.colors.primary, flexDirection: 'row', alignItems: 'center', gap: 8 }, emptyActionText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});

type Filter = 'all' | 'upcoming' | 'completed';
const isComplete = (event: EventItem) => event.status === 'completed' || event.planningComplete;
export default function EventsScreen() {
  const [filter, setFilter] = useState<Filter>('all');
  const [items, setItems] = useState<EventItem[]>(() => [...events]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const refresh = useCallback(async (isActive: () => boolean = () => true) => {
    setLoading(true);
    try {
      const loaded = await hydrateEvents();
      if (!isActive()) return;
      if (loaded) { setItems([...events]); setLoadError(false); }
      else setLoadError(true);
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
    return () => { active = false; };
  }, [refresh]));
  const filtered = filter === 'all' ? items : items.filter((event) => filter === 'completed' ? isComplete(event) : !isComplete(event));
  const toggleFavorite = async (event: EventItem) => {
    const { error } = await setEventFavorite(event.id, !event.isFavorite);
    if (!error) setItems([...events]);
    else Alert.alert('บันทึกงานโปรดไม่สำเร็จ', error.message);
  };
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={loading && items.length > 0} onRefresh={() => { void refresh(); }} tintColor={Theme.colors.primary} colors={[Theme.colors.primary]} />}>
    <View style={listStyles.heading}><View style={listStyles.headingCopy}><Text style={styles.title}>งานของฉัน</Text><Text style={listStyles.subtitle}>{items.length ? `${items.length} งานในแผนของคุณ` : 'วางแผนทุกช่วงเวลาสำคัญ'}</Text></View>{items.length ? <Pressable accessibilityRole="button" accessibilityLabel="สร้างงานใหม่" onPress={() => router.push('/event/new')} style={listStyles.create}><LinearGradient pointerEvents="none" colors={Theme.gradients.rose} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} /><FontAwesome6 name="plus" size={18} color="#FFFFFF" /></Pressable> : null}</View>
    {items.length ? <View style={listStyles.filters}><FilterButton label={`ทั้งหมด ${items.length}`} active={filter === 'all'} onPress={() => setFilter('all')} /><FilterButton label={`กำลังเตรียม ${items.filter((event) => !isComplete(event)).length}`} active={filter === 'upcoming'} onPress={() => setFilter('upcoming')} /><FilterButton label={`เสร็จแล้ว ${items.filter(isComplete).length}`} active={filter === 'completed'} onPress={() => setFilter('completed')} /></View> : null}
    {loading && !items.length ? <ActivityIndicator color={Theme.colors.primary} /> : null}
    {loadError ? <Pressable accessibilityRole="button" onPress={() => { void refresh(); }} style={styles.errorCard}><Text style={styles.errorTitle}>โหลดรายการงานไม่สำเร็จ</Text><Text style={styles.errorDetail}>แตะเพื่อลองใหม่ ตรวจสอบอินเทอร์เน็ตและการเข้าสู่ระบบ</Text></Pressable> : null}
    <View style={styles.list}>{filtered.map((event) => <EventCard key={event.id} event={event} onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })} onToggleFavorite={() => { void toggleFavorite(event); }} />)}</View>
    {!loading && !loadError && filtered.length === 0 ? <View style={cardStyles.emptyCard}><View style={cardStyles.emptyIcon}><FontAwesome6 name="calendar-days" size={24} color={Theme.colors.primary} /></View><Text style={cardStyles.emptyTitle}>{items.length ? 'ไม่มีงานในสถานะนี้' : 'ยังไม่มีอีเวนต์ของคุณ'}</Text><Text style={cardStyles.emptyBody}>{items.length ? 'ลองเลือกตัวกรองอื่นเพื่อดูงานทั้งหมด' : 'เริ่มสร้างงานแรก แล้วรวมทุกอย่างไว้ในที่เดียว'}</Text>{!items.length ? <Pressable accessibilityRole="button" onPress={() => router.push('/event/new')} style={cardStyles.emptyAction}><Text style={cardStyles.emptyActionText}>สร้างอีเวนต์แรก</Text><FontAwesome6 name="arrow-right" size={12} color="#FFFFFF" /></Pressable> : null}</View> : null}
  </ScrollView></SafeAreaView>;
}
function FilterButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) { return <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress} style={[styles.filter, listStyles.filterTouch, active ? styles.filterActive : styles.filterInactive]}><Text style={[styles.filterText, active ? styles.activeText : styles.inactiveText]}>{label}</Text></Pressable>; }
function EventCard({ event, onPress, onToggleFavorite }: { event: EventItem; onPress: () => void; onToggleFavorite: () => void }) { return <Pressable accessibilityRole="button" accessibilityLabel={`ดูงาน ${event.title}`} onPress={onPress} style={({ pressed }) => [cardStyles.card, pressed && styles.pressed]}><View style={cardStyles.cardTop}><View style={[cardStyles.eventIcon, { backgroundColor: event.banner }]}><EventTypeIcon kind={event.kind} size={22} color={event.accent} /></View><View style={cardStyles.cardMain}><Text style={cardStyles.kind}>{event.kind}</Text><Text style={cardStyles.eventTitle} numberOfLines={1}>{event.title}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={event.isFavorite ? 'นำออกจากงานโปรด' : 'ปักดาวงานนี้'} onPress={(pressEvent) => { pressEvent.stopPropagation(); onToggleFavorite(); }} style={listStyles.favorite}><FontAwesome6 name="star" size={18} color={event.isFavorite ? Theme.colors.primary : Theme.colors.muted} solid={event.isFavorite} /></Pressable><View style={[cardStyles.status, isComplete(event) && listStyles.completedStatus]}><Text style={[cardStyles.statusText, isComplete(event) && listStyles.completedText]}>{event.status === 'completed' ? 'เสร็จแล้ว' : event.planningComplete ? 'เตรียมครบ' : event.daysLeft < 0 ? `ผ่านไป ${Math.abs(event.daysLeft)} วัน` : event.daysLeft === 0 ? 'วันนี้' : `อีก ${event.daysLeft} วัน`}</Text></View></View><View style={cardStyles.metaRow}><FontAwesome6 name="calendar-days" size={12} color={Theme.colors.muted} /><Text style={cardStyles.meta} numberOfLines={1}>{event.date} · {event.venue}</Text></View><View style={cardStyles.progressRow}><View style={cardStyles.progressTrack}><View style={[cardStyles.progressFill, { width: `${Math.min(Math.max(event.progress, 0), 100)}%`, backgroundColor: event.accent }]} /></View><Text style={cardStyles.progressText}>{event.progress}%</Text></View></Pressable>; }

const listStyles = StyleSheet.create({
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 },
  headingCopy: { flex: 1, gap: 2 },
  subtitle: { color: Theme.colors.muted, fontSize: 13 },
  create: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterTouch: { minHeight: 44 },
  completedStatus: { backgroundColor: Theme.colors.mint },
  completedText: { color: Theme.colors.success },
  favorite: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
});
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background },
  content: { paddingHorizontal: Theme.spacing.xl, paddingTop: 16, paddingBottom: 112, gap: Theme.spacing.lg },
  title: { color: Theme.colors.text, fontSize: Theme.type.page, fontWeight: '800' },
  filter: { minHeight: 44, paddingHorizontal: 16, borderRadius: Theme.radius.pill, alignItems: 'center', justifyContent: 'center' },
  filterActive: { backgroundColor: Theme.colors.text },
  filterInactive: { backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border },
  filterText: { fontSize: Theme.type.label, fontWeight: '600' },
  activeText: { color: '#FFFFFF' }, inactiveText: { color: Theme.colors.muted },
  list: { gap: 12 },
  errorCard: { backgroundColor: Theme.colors.primarySoft, borderRadius: 16, padding: 16, gap: 4 },
  errorTitle: { color: Theme.colors.primary, fontSize: Theme.type.body, fontWeight: '700' },
  errorDetail: { color: Theme.colors.text, fontSize: Theme.type.caption },
  pressed: { opacity: 0.82 },
});
