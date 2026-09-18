import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '@/constants/theme';
import { events, hydrateEvents, type EventItem } from '@/data/events';
import { BudgetCategory, getBudgetBreakdown, getBudgetCategories, hydrateEventBudget } from '@/data/eventBudget';
import { hydrateChecklistItems } from '@/data/checklists';
import { EventSectionNav } from '@/components/EventSectionNav';
import { EventPageHeader } from '@/components/EventPageHeader';

const money = (value: number) => `฿${value.toLocaleString('en-US')}`;

export default function EventBudgetScreen() {
  const { eventId, from } = useLocalSearchParams<{ eventId?: string; from?: string }>();
  const findEvent = useCallback(() => events.find((item) => item.id === eventId) ?? (!eventId ? events[0] : undefined), [eventId]);
  const [event, setEvent] = useState<EventItem | null>(() => findEvent() ?? null);
  const [categories, setCategories] = useState<BudgetCategory[]>(() => event ? getBudgetCategories(event.id) : []);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const refresh = useCallback(async (isActive: () => boolean = () => true) => {
    setLoading(true);
    try {
      const [eventsLoaded, checklistLoaded] = await Promise.all([hydrateEvents(), hydrateChecklistItems()]);
      const budgetLoaded = checklistLoaded && await hydrateEventBudget();
      if (!isActive()) return;
      if (eventsLoaded && checklistLoaded && budgetLoaded) {
        const nextEvent = findEvent() ?? null;
        setEvent(nextEvent);
        setCategories(nextEvent ? getBudgetCategories(nextEvent.id) : []);
        setLoadError(false);
      } else setLoadError(true);
    } catch {
      if (isActive()) setLoadError(true);
    } finally {
      if (isActive()) setLoading(false);
    }
  }, [findEvent]);
  useFocusEffect(useCallback(() => {
    let active = true;
    const currentEvent = findEvent() ?? null;
    setEvent(currentEvent);
    setCategories(currentEvent ? getBudgetCategories(currentEvent.id) : []);
    void refresh(() => active);
    return () => { active = false; };
  }, [findEvent, refresh]));
  const { spent, planned, allocated } = useMemo(() => getBudgetBreakdown(categories), [categories]);
  const categoryBudgetTotal = useMemo(() => categories.reduce((sum, category) => sum + category.planned, 0), [categories]);
  const remaining = (event?.budget ?? 0) - allocated;
  const spentWidth = event?.budget ? Math.min((spent / event.budget) * 100, 100) : 0;
  const plannedWidth = event?.budget ? Math.min((planned / event.budget) * 100, 100 - spentWidth) : 0;

  if (!event) return <SafeAreaView style={styles.safe}><View style={feedbackStyles.center}>{loading ? <ActivityIndicator color={Theme.colors.primary} /> : <Text style={styles.empty}>{loadError ? 'โหลดงบประมาณไม่สำเร็จ' : 'ไม่พบอีเวนต์นี้'}</Text>}<Pressable accessibilityRole="button" onPress={() => { void refresh(); }}><Text style={feedbackStyles.retry}>ลองอีกครั้ง</Text></Pressable></View></SafeAreaView>;

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    {loadError ? <Pressable accessibilityRole="button" onPress={() => { void refresh(); }} style={feedbackStyles.error}><Text style={feedbackStyles.errorText}>โหลดงบประมาณล่าสุดไม่สำเร็จ แตะเพื่อลองใหม่</Text></Pressable> : null}
    <EventPageHeader title="งบอีเวนต์" backLabel={from === 'budget-tab' ? 'กลับงบประมาณรวม' : 'กลับภาพรวมอีเวนต์'} onBack={() => from === 'budget-tab' ? router.back() : router.replace({ pathname: '/event/[id]', params: { id: event.id } })} />
    <View style={styles.eventContext}><Text style={styles.eventName} numberOfLines={1}>{event.title}</Text><Text style={styles.eventDate}>{event.date}</Text></View>
    <LinearGradient colors={Theme.gradients.budget} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={dashboardStyles.card}>
      <Text style={dashboardStyles.eyebrow}>ภาพรวมงบประมาณ</Text>
      <Text style={dashboardStyles.label}>{remaining < 0 ? 'รายการเกินงบอีเวนต์' : remaining === 0 ? 'จัดสรรครบแล้ว' : 'ยอดคงเหลือ'}</Text>
      <Text style={dashboardStyles.amount} numberOfLines={1} adjustsFontSizeToFit>{money(Math.abs(remaining))}</Text>
      <Text style={dashboardStyles.caption}>จากงบทั้งหมด {money(event.budget)}</Text>
      <Text style={dashboardStyles.caption}>จัดสรรให้หมวดแล้ว {money(categoryBudgetTotal)} · ยังไม่จัดสรร {money(Math.max(event.budget - categoryBudgetTotal, 0))}</Text>
      <View accessible accessibilityLabel={`ใช้ไปแล้ว ${money(spent)} วางไว้หรือยังไม่จ่าย ${money(planned)} ยอดคงเหลือ ${money(Math.max(remaining, 0))}`} style={dashboardStyles.track}>
        <View style={[dashboardStyles.spentSegment, { width: `${spentWidth}%` }]} />
        <View style={[dashboardStyles.plannedSegment, { width: `${plannedWidth}%` }]} />
      </View>
      <View style={dashboardStyles.legend}><View style={[dashboardStyles.dot, dashboardStyles.spentDot]} /><Text style={dashboardStyles.legendLabel}>ใช้ไปแล้ว</Text><Text style={dashboardStyles.legendValue}>{money(spent)}</Text></View>
      <View style={dashboardStyles.legend}><View style={[dashboardStyles.dot, dashboardStyles.plannedDot]} /><Text style={dashboardStyles.legendLabel}>วางไว้ / ยังไม่จ่าย</Text><Text style={dashboardStyles.legendValue}>{money(planned)}</Text></View>
      <Text style={dashboardStyles.explanation}>“ใช้ไปแล้ว” นับเฉพาะรายการค่าใช้จ่ายที่ระบุว่าจ่ายแล้ว</Text>
    </LinearGradient>
    {categoryBudgetTotal > event.budget ? <View style={feedbackStyles.error}><Text style={feedbackStyles.errorText}>งบหมวดรวมเกินงบอีเวนต์ {money(categoryBudgetTotal - event.budget)} กรุณาปรับวงเงินแต่ละหมวด</Text></View> : null}
    <EventSectionNav eventId={event.id} active="budget" />
    <View style={styles.sectionHeader}><View><Text style={styles.section}>งบประมาณตามหมวด</Text><Text style={styles.sectionHint}>แตะหมวดเพื่อดูหรือแก้ไขรายการ</Text></View></View>
    {categories.length ? categories.map((category) => <CategoryCard key={category.id} category={category} eventId={event.id} />) : <Text style={styles.empty}>ยังไม่มีหมวดงบประมาณ</Text>}
    <Pressable onPress={() => router.push({ pathname: '/event/budget-category-new', params: { eventId: event.id } })} style={styles.add}><Text style={styles.addText}>＋ เพิ่มหมวดงบประมาณ</Text></Pressable>
  </ScrollView></SafeAreaView>;
}

function CategoryCard({ category, eventId }: { category: BudgetCategory; eventId: string }) {
  const { allocated } = getBudgetBreakdown([category]);
  const remaining = category.planned - allocated;
  const detailParams = { eventId, categoryId: category.id };
  return <Pressable accessibilityRole="button" accessibilityLabel={`ดูหมวดงบประมาณ ${category.name}`} onPress={() => router.push({ pathname: '/event/budget-category', params: detailParams })} style={categoryCardStyles.card}>
    <View style={categoryCardStyles.header}><Text style={categoryCardStyles.name} numberOfLines={1}>{category.name}</Text><Text style={categoryCardStyles.chevron}>›</Text></View>
    <View style={categoryCardStyles.balanceRow}><Text style={[categoryCardStyles.balance, remaining < 0 && categoryCardStyles.overBudget]} numberOfLines={1} adjustsFontSizeToFit>{money(Math.abs(remaining))}</Text><Text style={[categoryCardStyles.balanceLabel, remaining < 0 && categoryCardStyles.overBudget]}>{remaining < 0 ? 'เกินงบ' : remaining === 0 ? 'ใช้วงเงินครบแล้ว' : 'วงเงินคงเหลือ'}</Text></View>
    <Text style={categoryCardStyles.caption}>รายการรวม {money(allocated)} จากงบ {money(category.planned)}</Text>
    <View style={categoryCardStyles.track}><View style={[categoryCardStyles.progress, { width: `${Math.min(Math.max((allocated / Math.max(category.planned, 1)) * 100, 0), 100)}%` }]} /></View>
  </Pressable>;
}

const feedbackStyles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  retry: { color: Theme.colors.primary, fontSize: 14, fontWeight: '700', padding: 12 },
  error: { backgroundColor: Theme.colors.primarySoft, borderRadius: 14, padding: 14 },
  errorText: { color: Theme.colors.primary, fontSize: 13, fontWeight: '600' },
});

const dashboardStyles = StyleSheet.create({
  card: { borderRadius: 24, padding: 20, gap: 8, overflow: 'hidden' },
  eyebrow: { color: '#FBEAF2', fontSize: Theme.type.caption, fontWeight: '600' },
  label: { color: '#FBEAF2', fontSize: 14, marginTop: 4 },
  amount: { color: '#FFFFFF', fontSize: 31, lineHeight: 42, fontWeight: '700' },
  caption: { color: '#FBEAF2', fontSize: Theme.type.caption, marginBottom: 6 },
  track: { height: 12, backgroundColor: 'rgba(255,255,255,0.31)', borderRadius: 100, overflow: 'hidden', flexDirection: 'row', marginBottom: 6 },
  spentSegment: { height: '100%', backgroundColor: '#FF9FBE' },
  plannedSegment: { height: '100%', backgroundColor: '#D5B5DF' },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  spentDot: { backgroundColor: '#FF9FBE' },
  plannedDot: { backgroundColor: '#D5B5DF' },
  legendLabel: { flex: 1, color: '#FBEAF2', fontSize: Theme.type.caption },
  legendValue: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  explanation: { color: '#F3DFE9', fontSize: Theme.type.caption, lineHeight: 19, marginTop: 4 },
});

const categoryCardStyles = StyleSheet.create({
  card: { backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 20, padding: 16, gap: 7 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  name: { flex: 1, color: Theme.colors.text, fontSize: 16, fontWeight: '700' },
  chevron: { color: Theme.colors.muted, fontSize: 25, lineHeight: 25 },
  balanceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  balance: { color: Theme.colors.text, fontSize: 22, fontWeight: '700', flexShrink: 1 },
  balanceLabel: { color: Theme.colors.success, fontSize: Theme.type.caption, fontWeight: '600' },
  overBudget: { color: Theme.colors.primary },
  caption: { color: Theme.colors.muted, fontSize: Theme.type.caption },
  track: { height: 6, backgroundColor: Theme.colors.border, borderRadius: 100, overflow: 'hidden', marginTop: 3 },
  progress: { height: '100%', backgroundColor: Theme.colors.primary, borderRadius: 100 },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background },
  content: { paddingHorizontal: Theme.spacing.xl, paddingTop: 12, paddingBottom: 40, gap: Theme.spacing.lg },
  eventContext: { gap: 3, paddingHorizontal: 2 },
  eventName: { color: Theme.colors.text, fontSize: 21, fontWeight: '700' },
  eventDate: { color: Theme.colors.muted, fontSize: Theme.type.caption },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  section: { color: Theme.colors.text, fontSize: 17, fontWeight: '800' },
  sectionHint: { color: Theme.colors.muted, fontSize: Theme.type.caption, marginTop: 4 },
  empty: { color: Theme.colors.muted, textAlign: 'center', padding: 20 },
  add: { minHeight: 52, backgroundColor: Theme.colors.primary, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  addText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
