import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState, type ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '@/components/AppText';
import { EventPageHeader } from '@/components/EventPageHeader';
import { EventScheduleCalendar } from '@/components/EventScheduleCalendar';
import { EventVenueMap } from '@/components/EventVenueMap';
import { EventTypeIcon } from '@/components/EventTypeIcon';
import { Theme } from '@/constants/theme';
import { getChecklistItems, getChecklistProgress, type ChecklistItem } from '@/data/checklists';
import { events, type EventItem } from '@/data/events';

type IconName = ComponentProps<typeof FontAwesome6>['name'];
const money = (value: number) => `฿${new Intl.NumberFormat('th-TH', { notation: 'compact', maximumFractionDigits: 1 }).format(value)}`;

export default function EventOverviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = events.find((item) => item.id === id);
  const eventId = event?.id ?? '';
  const [progress, setProgress] = useState(() => getChecklistProgress(eventId));
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => getChecklistItems(eventId));
  const pendingCount = checklist.filter((item) => !item.done).length;

  useFocusEffect(useCallback(() => {
    setProgress(getChecklistProgress(eventId));
    setChecklist(getChecklistItems(eventId));
  }, [eventId]));

  if (!event) return <SafeAreaView style={styles.safe}><View style={styles.missing}><Text style={styles.missingTitle}>ไม่พบอีเวนต์นี้</Text><Pressable accessibilityRole="button" onPress={() => router.replace('/events')} style={styles.missingButton}><Text style={styles.missingButtonText}>กลับไปงานของฉัน</Text></Pressable></View></SafeAreaView>;

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <EventPageHeader title="ภาพรวมงาน" backLabel="ย้อนกลับ" onBack={() => router.canGoBack() ? router.back() : router.replace('/events')} />

    <EventIdentity event={event} />

    <View style={styles.section}><View style={styles.sectionHeading}><Text style={styles.sectionTitle}>จัดการงานนี้</Text><Text style={styles.sectionHint}>เปิดดูรายละเอียดแต่ละด้าน</Text></View>
      <View style={styles.summaryGrid}>
        <SummaryCard icon="list-check" label="เช็กลิสต์" value={`${progress}% เตรียมแล้ว`} detail={`${pendingCount} รายการค้าง`} color={Theme.colors.primary} background={Theme.colors.primarySoft} onPress={() => router.replace({ pathname: '/event/checklist', params: { eventId: event.id } })} />
        <SummaryCard icon="users" label="รายชื่อแขก" value={`${event.guests} คน`} color={Theme.colors.lavenderText} background={Theme.colors.lavender} onPress={() => router.replace({ pathname: '/event/guests', params: { eventId: event.id } })} />
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={`ดูงบงาน ${money(event.budget)}`} onPress={() => router.replace({ pathname: '/event/budget', params: { eventId: event.id } })} style={({ pressed }) => [styles.budgetLink, pressed && styles.pressed]}>
        <View style={styles.budgetIcon}><FontAwesome6 name="coins" size={18} color={Theme.colors.success} solid /></View>
        <View style={styles.budgetCopy}><Text style={styles.budgetTitle}>งบงาน</Text><Text style={styles.budgetValue}>{money(event.budget)} ที่ตั้งไว้</Text></View>
        <FontAwesome6 name="arrow-right" size={14} color={Theme.colors.success} />
      </Pressable>
    </View>
    <EventScheduleCalendar eventDate={event.eventDate} items={checklist} />
    <EventVenueMap venue={event.venue} />
  </ScrollView></SafeAreaView>;
}

function EventIdentity({ event }: { event: EventItem }) {
  const today = new Date();
  const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const status = event.status === 'completed' ? 'เสร็จแล้ว' : event.eventDate < localDate ? 'เลยวันงานแล้ว' : event.daysLeft === 0 ? 'วันนี้' : `อีก ${event.daysLeft} วัน`;
  return <View style={styles.identity}>
    <View style={styles.identityTop}><View style={styles.identityIcon}><EventTypeIcon kind={event.kind} size={23} color={event.accent} /></View><View style={styles.identityCopy}><Text style={styles.identityKind}>{event.kind}</Text><Text style={styles.identityTitle}>{event.title}</Text></View></View>
    <View style={styles.identityMeta}><FontAwesome6 name="calendar-days" size={13} color={Theme.colors.muted} /><Text style={styles.identityMetaText}>{event.date}</Text><View style={styles.statusPill}><Text style={styles.statusText}>{status}</Text></View></View>
    <View style={styles.identityMeta}><FontAwesome6 name="location-dot" size={13} color={Theme.colors.muted} solid /><Text style={styles.identityMetaText} numberOfLines={1}>{event.venue}</Text></View>
  </View>;
}

function SummaryCard({ icon, label, value, detail, color, background, onPress }: { icon: IconName; label: string; value: string; detail?: string; color: string; background: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`${label} ${value}${detail ? ` ${detail}` : ''}`} onPress={onPress} style={({ pressed }) => [styles.summaryCard, { backgroundColor: background }, pressed && styles.pressed]}><FontAwesome6 name={icon} size={17} color={color} solid /><Text style={styles.summaryLabel}>{label}</Text><Text style={[styles.summaryValue, { color }]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>{detail ? <Text style={styles.summaryDetail}>{detail}</Text> : null}</Pressable>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background }, content: { paddingHorizontal: Theme.spacing.xl, paddingTop: 12, paddingBottom: 48, gap: Theme.spacing.xl }, pressed: { opacity: 0.82 },
  identity: { borderRadius: 22, backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, padding: 18, gap: 12 },
  identityTop: { flexDirection: 'row', alignItems: 'center', gap: 12 }, identityIcon: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.primarySoft }, identityCopy: { flex: 1, gap: 2 },
  identityKind: { color: Theme.colors.primary, fontSize: Theme.type.micro, fontWeight: '700' }, identityTitle: { color: Theme.colors.text, fontSize: 22, lineHeight: 30, fontWeight: '800' },
  identityMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 }, identityMetaText: { color: Theme.colors.muted, fontSize: Theme.type.caption, flexShrink: 1 },
  statusPill: { borderRadius: 100, backgroundColor: Theme.colors.primarySoft, paddingHorizontal: 10, paddingVertical: 5, marginLeft: 'auto' }, statusText: { color: Theme.colors.primary, fontSize: Theme.type.micro, fontWeight: '700' },
  section: { gap: 12 }, sectionHeading: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }, sectionTitle: { color: Theme.colors.text, fontSize: 19, fontWeight: '800' }, sectionHint: { color: Theme.colors.muted, fontSize: Theme.type.caption },
  summaryGrid: { flexDirection: 'row', gap: 10 }, summaryCard: { flex: 1, minWidth: 0, minHeight: 118, borderRadius: 20, padding: 15, gap: 6, justifyContent: 'space-between' }, summaryLabel: { color: Theme.colors.muted, fontSize: Theme.type.caption }, summaryValue: { fontSize: 18, fontWeight: '800' }, summaryDetail: { color: Theme.colors.muted, fontSize: Theme.type.caption },
  budgetLink: { minHeight: 74, borderRadius: 18, backgroundColor: Theme.colors.mint, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  budgetIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  budgetCopy: { flex: 1, gap: 2 }, budgetTitle: { color: Theme.colors.text, fontSize: Theme.type.body, fontWeight: '700' }, budgetValue: { color: Theme.colors.success, fontSize: Theme.type.caption },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18, padding: 24 }, missingTitle: { color: Theme.colors.text, fontSize: 20, fontWeight: '700' }, missingButton: { backgroundColor: Theme.colors.primary, minHeight: 48, borderRadius: 14, paddingHorizontal: 18, justifyContent: 'center' }, missingButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
