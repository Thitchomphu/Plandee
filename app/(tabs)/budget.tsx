import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '@/constants/theme';
import { events } from '@/data/events';
import { getBudgetCategories } from '@/data/eventBudget';

const money = (value: number) => `฿${value.toLocaleString('en-US')}`;

export default function BudgetScreen() {
  const [version, setVersion] = useState(0);
  useFocusEffect(useCallback(() => { setVersion((value) => value + 1); }, []));
  void version;
  const summaries = events.map((event) => {
    const categories = getBudgetCategories(event.id);
    const used = categories.reduce((sum, category) => sum + category.expenses.reduce((total, expense) => total + expense.amount, 0), 0);
    return { event, used, categoryCount: categories.length };
  });
  const totalBudget = summaries.reduce((sum, item) => sum + item.event.budget, 0);
  const totalUsed = summaries.reduce((sum, item) => sum + item.used, 0);
  const percent = totalBudget ? Math.round((totalUsed / totalBudget) * 100) : 0;

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.title}>งบประมาณรวม</Text>
    <View style={styles.highlight}><Text style={styles.highlightLabel}>งบประมาณของงานทั้งหมด</Text><View style={styles.amountRow}><Text style={styles.amount}>{money(totalUsed)}</Text><Text style={styles.limit}> / {money(totalBudget)}</Text></View><View style={styles.track}><View style={[styles.progress, { width: `${Math.min(percent, 100)}%` }]} /></View><Text style={styles.usage}>ใช้ไปแล้ว {percent}% · เหลือ {money(Math.max(totalBudget - totalUsed, 0))}</Text></View>
    <Text style={styles.sectionTitle}>งานทั้งหมด</Text>
    {summaries.length ? summaries.map(({ event, used, categoryCount }) => <Pressable key={event.id} onPress={() => router.push({ pathname: '/event/budget', params: { eventId: event.id } })} style={styles.card}><View style={styles.row}><View style={styles.icon}><Text style={styles.iconText}>฿</Text></View><View style={styles.main}><Text style={styles.eventTitle}>{event.title}</Text><Text style={styles.meta}>{categoryCount} หมวดงบประมาณ</Text></View><Text style={styles.eventAmount}>{money(used)} / {money(event.budget)}</Text></View><View style={styles.track}><View style={[styles.progress, { width: `${Math.min(event.budget ? (used / event.budget) * 100 : 0, 100)}%` }]} /></View></Pressable>) : <Text style={styles.empty}>ยังไม่มีงาน</Text>}
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: Theme.colors.background }, content: { padding: 20, paddingBottom: 112, gap: 16 }, title: { color: Theme.colors.text, fontSize: 24, fontWeight: '800' }, highlight: { backgroundColor: Theme.colors.primarySoft, borderWidth: 1, borderColor: Theme.colors.primary, borderRadius: 22, padding: 20, gap: 12 }, highlightLabel: { color: Theme.colors.primary, textAlign: 'center', fontSize: 14, fontWeight: '700' }, amountRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center' }, amount: { color: Theme.colors.text, fontSize: 28, fontWeight: '800' }, limit: { color: Theme.colors.muted, fontSize: 14 }, track: { height: 7, backgroundColor: Theme.colors.border, borderRadius: 100, overflow: 'hidden' }, progress: { height: '100%', backgroundColor: Theme.colors.primary, borderRadius: 100 }, usage: { color: Theme.colors.muted, fontSize: 12, textAlign: 'center' }, sectionTitle: { color: Theme.colors.text, fontSize: 16, fontWeight: '700' }, card: { backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 20, padding: 16, gap: 12 }, row: { flexDirection: 'row', alignItems: 'center', gap: 12 }, icon: { width: 44, height: 44, borderRadius: 22, backgroundColor: Theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, iconText: { color: Theme.colors.primary, fontSize: 20, fontWeight: '800' }, main: { flex: 1, gap: 4 }, eventTitle: { color: Theme.colors.text, fontSize: 15, fontWeight: '700' }, meta: { color: Theme.colors.muted, fontSize: 12 }, eventAmount: { color: Theme.colors.text, fontSize: 12, fontWeight: '700' }, empty: { color: Theme.colors.muted, textAlign: 'center', padding: 20 } });
