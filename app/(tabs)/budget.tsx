import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '@/constants/theme';
import { events, hydrateEvents, type EventItem } from '@/data/events';
import { hydrateChecklistItems } from '@/data/checklists';
import { getBudgetBreakdown, getBudgetCategories, hydrateEventBudget } from '@/data/eventBudget';

const money = (value: number) => `฿${value.toLocaleString('en-US')}`;
type BudgetSummary = { event: EventItem; allocated: number };

const getSummaries = (): BudgetSummary[] => events.map((event) => {
  const categories = getBudgetCategories(event.id);
  return { event, allocated: getBudgetBreakdown(categories).allocated };
});

export default function BudgetScreen() {
  const [summaries, setSummaries] = useState<BudgetSummary[]>(getSummaries);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const refresh = useCallback(async (isActive: () => boolean = () => true) => {
    setLoading(true);
    try {
      const [eventsLoaded, checklistLoaded] = await Promise.all([hydrateEvents(), hydrateChecklistItems()]);
      const budgetLoaded = checklistLoaded && await hydrateEventBudget();
      if (!isActive()) return;
      if (eventsLoaded && checklistLoaded && budgetLoaded) {
        setSummaries(getSummaries());
        setLoadError(false);
      } else setLoadError(true);
    } catch {
      if (isActive()) setLoadError(true);
    } finally {
      if (isActive()) setLoading(false);
    }
  }, []);
  useFocusEffect(useCallback(() => {
    let active = true;
    setSummaries(getSummaries());
    void refresh(() => active);
    return () => { active = false; };
  }, [refresh]));
  const totalBudget = summaries.reduce((sum, item) => sum + item.event.budget, 0);
  const totalAllocated = summaries.reduce((sum, item) => sum + item.allocated, 0);
  const percent = totalBudget ? Math.round((totalAllocated / totalBudget) * 100) : 0;
  const remaining = totalBudget - totalAllocated;

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={loading && summaries.length > 0} onRefresh={() => { void refresh(); }} tintColor={Theme.colors.primary} colors={[Theme.colors.primary]} />}>
    <Text style={styles.title}>งบประมาณรวม</Text>
    {loadError ? <Pressable accessibilityRole="button" onPress={() => { void refresh(); }} style={errorStyles.card}><Text style={errorStyles.title}>โหลดงบประมาณไม่สำเร็จ</Text><Text style={errorStyles.detail}>แตะเพื่อลองใหม่ หรือเช็กการเชื่อมต่ออินเทอร์เน็ต</Text></Pressable> : null}
    {loading && !summaries.length ? <ActivityIndicator color={Theme.colors.primary} /> : null}
    {summaries.length ? <LinearGradient colors={Theme.gradients.budget} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={summaryStyles.card}>
      <Text style={summaryStyles.eyebrow}>ภาพรวมงบประมาณ</Text>
      <Text style={summaryStyles.label}>{remaining < 0 ? 'เกินงบ' : remaining === 0 ? 'จัดสรรครบแล้ว' : 'ยอดคงเหลือ'}</Text>
      <Text style={summaryStyles.amount} numberOfLines={1} adjustsFontSizeToFit>{money(Math.abs(remaining))}</Text>
      <Text style={summaryStyles.caption}>ใช้แล้วและวางไว้ {money(totalAllocated)} จากงบ {money(totalBudget)}</Text>
      <View style={summaryStyles.track}><View style={[summaryStyles.progress, { width: `${Math.min(Math.max(percent, 0), 100)}%` }]} /></View>
    </LinearGradient> : null}
    {summaries.length ? <Text style={styles.sectionTitle}>งบประมาณแยกตามอีเวนต์</Text> : null}
    {summaries.length ? summaries.map(({ event, allocated }) => {
      const eventRemaining = event.budget - allocated;
      return <Pressable key={event.id} accessibilityRole="button" accessibilityLabel={`ดูงบประมาณอีเวนต์ ${event.title}`} onPress={() => router.push({ pathname: '/event/budget', params: { eventId: event.id, from: 'budget-tab' } })} style={budgetCardStyles.card}>
        <View style={budgetCardStyles.header}><Text style={budgetCardStyles.eventTitle} numberOfLines={1}>{event.title}</Text><FontAwesome6 name="chevron-right" size={13} color={Theme.colors.muted} /></View>
        <View style={budgetCardStyles.amountRow}><Text style={[budgetCardStyles.amount, eventRemaining < 0 && budgetCardStyles.overBudget]} numberOfLines={1} adjustsFontSizeToFit>{money(Math.abs(eventRemaining))}</Text><Text style={[budgetCardStyles.balanceLabel, eventRemaining < 0 && budgetCardStyles.overBudget]}>{eventRemaining < 0 ? 'รายการเกินงบ' : eventRemaining === 0 ? 'จัดสรรครบแล้ว' : 'ยอดคงเหลือ'}</Text></View>
        <Text style={budgetCardStyles.caption}>ใช้แล้วและวางไว้ {money(allocated)} จากงบ {money(event.budget)}</Text>
        <View style={styles.track}><View style={[styles.progress, { width: `${Math.min(event.budget ? (allocated / event.budget) * 100 : 0, 100)}%` }]} /></View>
      </Pressable>;
    }) : !loading && !loadError ? <View style={budgetCardStyles.empty}><FontAwesome6 name="wallet" size={24} color={Theme.colors.primary} solid /><Text style={budgetCardStyles.emptyTitle}>ยังไม่มีงบประมาณของอีเวนต์</Text><Text style={budgetCardStyles.emptyBody}>สร้างอีเวนต์แรกเพื่อเริ่มวางแผนค่าใช้จ่าย</Text><Pressable accessibilityRole="button" onPress={() => router.push('/event/new')} style={budgetCardStyles.emptyAction}><Text style={budgetCardStyles.emptyActionText}>สร้างอีเวนต์</Text></Pressable></View> : null}
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: 20, paddingBottom: 112, gap: 16 },
  title: { color: Theme.colors.text, fontSize: 24, fontWeight: '800' },
  sectionTitle: { color: Theme.colors.text, fontSize: Theme.type.section, fontWeight: '700' },
  track: { height: 6, backgroundColor: Theme.colors.border, borderRadius: 100, overflow: 'hidden', marginTop: 3 },
  progress: { height: '100%', backgroundColor: Theme.colors.primary, borderRadius: 100 },
});

const errorStyles = StyleSheet.create({
  card: { backgroundColor: Theme.colors.primarySoft, borderRadius: 16, padding: 16, gap: 4 },
  title: { color: Theme.colors.primary, fontSize: 15, fontWeight: '700' },
  detail: { color: Theme.colors.text, fontSize: 13 },
});

const summaryStyles = StyleSheet.create({
  card: { borderRadius: 24, padding: 20, gap: 8, overflow: 'hidden' },
  eyebrow: { color: '#FBEAF2', fontSize: 14, fontWeight: '600' },
  label: { color: '#FBEAF2', fontSize: 13, marginTop: 5 },
  caption: { color: '#FBEAF2', fontSize: 13, marginBottom: 4 },
  amount: { color: '#FFFFFF', fontSize: 29, lineHeight: 38, fontWeight: '800' },
  track: { height: 8, backgroundColor: 'rgba(255,255,255,0.24)', borderRadius: 100, overflow: 'hidden' },
  progress: { height: '100%', backgroundColor: '#FFFFFF', borderRadius: 100 },
});

const budgetCardStyles = StyleSheet.create({
  card: { backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 20, padding: 16, gap: 7 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  eventTitle: { flex: 1, color: Theme.colors.text, fontSize: 16, fontWeight: '700' },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  amount: { color: Theme.colors.text, fontSize: 22, fontWeight: '700', flexShrink: 1 },
  balanceLabel: { color: Theme.colors.success, fontSize: 13, fontWeight: '600' },
  overBudget: { color: Theme.colors.primary },
  caption: { color: Theme.colors.muted, fontSize: Theme.type.caption },
  empty: { minHeight: 220, borderRadius: 22, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Theme.colors.primarySoft },
  emptyTitle: { color: Theme.colors.text, fontSize: 18, fontWeight: '700' },
  emptyBody: { color: Theme.colors.muted, fontSize: 13, textAlign: 'center' },
  emptyAction: { minHeight: 44, marginTop: 8, backgroundColor: Theme.colors.primary, borderRadius: 14, paddingHorizontal: 18, justifyContent: 'center' },
  emptyActionText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
