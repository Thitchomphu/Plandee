import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BudgetCategory, getBudgetBreakdown, getBudgetCategory } from '@/data/eventBudget';
import { Theme } from '@/constants/theme';
import { EventPageHeader } from '@/components/EventPageHeader';

const money = (value: number) => `฿${value.toLocaleString('en-US')}`;

export default function BudgetCategoryScreen() {
  const { eventId = '', categoryId = '' } = useLocalSearchParams<{ eventId?: string; categoryId?: string }>();
  const [category, setCategory] = useState<BudgetCategory | undefined>(() => getBudgetCategory(eventId, categoryId));
  useFocusEffect(useCallback(() => setCategory(getBudgetCategory(eventId, categoryId)), [eventId, categoryId]));
  if (!category) return <SafeAreaView style={styles.safe}><Text style={styles.empty}>ไม่พบหมวดงบประมาณ</Text></SafeAreaView>;

  const { spent, planned, allocated } = getBudgetBreakdown([category]);
  const remaining = category.planned - allocated;
  const detailParams = { eventId, categoryId };

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}>
    <EventPageHeader title="หมวดงบงาน" backLabel="กลับงบงาน" onBack={() => router.canGoBack() ? router.back() : router.replace({ pathname: '/event/budget', params: { eventId } })} />
    <View style={styles.titleRow}><Text style={styles.title} numberOfLines={2}>{category.name}</Text><Pressable accessibilityRole="button" accessibilityLabel={`แก้งบหมวด ${category.name}`} onPress={() => router.push({ pathname: '/event/budget-category-new', params: detailParams })} style={styles.editButton}><Text style={styles.editText}>แก้ไข</Text></Pressable></View>
    <View style={styles.summary}>
      <Text style={styles.summaryLabel}>{remaining < 0 ? 'เกินงบ' : remaining === 0 ? 'ใช้วงเงินครบแล้ว' : 'วงเงินคงเหลือ'}</Text>
      <Text style={[styles.summaryAmount, remaining < 0 && styles.overBudget]} numberOfLines={1} adjustsFontSizeToFit>{money(Math.abs(remaining))}</Text>
      <Text style={styles.summaryCaption}>ใช้ไปแล้ว {money(spent)} · วางไว้ {money(planned)} · งบ {money(category.planned)}</Text>
    </View>
    <Text style={styles.section}>รายการย่อย</Text>
    {category.expenses.length ? category.expenses.map((expense) => {
      const estimate = expense.id.startsWith('checklist-');
      const fromChecklist = !!expense.checklistItemId || estimate;
      return <Pressable key={expense.id} accessibilityRole="button" accessibilityHint={estimate ? 'แตะเพื่อบันทึกยอดจ่ายจริง' : 'แตะเพื่อแก้ไขค่าใช้จ่าย'} onPress={estimate && expense.checklistItemId ? () => router.push({ pathname: '/event/budget-expense-new', params: { ...detailParams, checklistItemId: expense.checklistItemId! } }) : () => router.push({ pathname: '/event/budget-expense-new', params: { ...detailParams, expenseId: expense.id } })} style={styles.expense}>
        <View style={styles.expenseText}><Text style={styles.name}>{expense.name}</Text><Text style={styles.amountSmall}>{money(expense.amount)}{fromChecklist ? ' · จากเช็กลิสต์' : ''}</Text>{estimate ? <Text style={styles.estimateHint}>แตะเพื่อบันทึกยอดจ่ายจริง</Text> : null}</View>
        <Text style={[styles.status, estimate ? styles.estimate : expense.paid ? styles.paid : styles.unpaid]}>{estimate ? 'ประมาณการ' : expense.paid ? 'จ่ายแล้ว' : 'ยังไม่จ่าย'}</Text>
      </Pressable>;
    }) : <Text style={styles.empty}>ยังไม่มีรายการย่อยในหมวดนี้</Text>}
    <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/event/budget-expense-new', params: detailParams })} style={styles.add}><Text style={styles.addText}>＋ เพิ่มค่าใช้จ่าย</Text></Pressable>
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: 20, paddingBottom: 40, gap: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { flex: 1, color: Theme.colors.text, fontSize: 24, fontWeight: '700' },
  editButton: { minHeight: 44, borderRadius: 13, backgroundColor: Theme.colors.primarySoft, paddingHorizontal: 15, alignItems: 'center', justifyContent: 'center' },
  editText: { color: Theme.colors.primary, fontSize: 14, fontWeight: '700' },
  summary: { backgroundColor: Theme.colors.primarySoft, borderRadius: 20, padding: 18, gap: 8 },
  summaryLabel: { color: Theme.colors.muted, fontSize: Theme.type.caption },
  summaryAmount: { color: Theme.colors.text, fontSize: 27, fontWeight: '700' },
  overBudget: { color: Theme.colors.primary },
  summaryCaption: { color: Theme.colors.muted, fontSize: Theme.type.caption },
  section: { color: Theme.colors.text, fontSize: Theme.type.section, fontWeight: '700' },
  expense: { minHeight: 72, backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  expenseText: { flex: 1, gap: 4 },
  name: { color: Theme.colors.text, fontSize: Theme.type.body, fontWeight: '600' },
  amountSmall: { color: Theme.colors.muted, fontSize: Theme.type.caption },
  estimateHint: { color: Theme.colors.primary, fontSize: Theme.type.caption, fontWeight: '600' },
  status: { borderRadius: 100, paddingHorizontal: 10, paddingVertical: 5, fontSize: Theme.type.micro, fontWeight: '700' },
  paid: { color: Theme.colors.success, backgroundColor: Theme.colors.mint },
  unpaid: { color: Theme.colors.warningText, backgroundColor: Theme.colors.warningSoft },
  estimate: { color: Theme.colors.lavenderText, backgroundColor: Theme.colors.lavender },
  add: { minHeight: 52, backgroundColor: Theme.colors.primary, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  addText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  empty: { color: Theme.colors.muted, textAlign: 'center', padding: 30 },
});
