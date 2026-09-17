import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { Theme } from '@/constants/theme';

type Tab = 'overview' | 'checklist' | 'guests' | 'sellers';
type Props = { eventId: string; active: Tab };

const tabs: { key: Tab; label: string; pathname: '/event/[id]' | '/event/checklist' | '/event/guests' | '/event/sellers' }[] = [
  { key: 'overview', label: 'ภาพรวม', pathname: '/event/[id]' },
  { key: 'checklist', label: 'เช็กลิสต์', pathname: '/event/checklist' },
  { key: 'guests', label: 'แขก', pathname: '/event/guests' },
  { key: 'sellers', label: 'seller', pathname: '/event/sellers' },
];

export function EventTabs({ eventId, active }: Props) {
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
    {tabs.map((tab) => <Pressable key={tab.key} accessibilityRole="tab" accessibilityState={{ selected: active === tab.key }} onPress={() => active !== tab.key && router.replace({ pathname: tab.pathname, params: tab.key === 'overview' ? { id: eventId } : { eventId } } as never)} style={[styles.tab, active === tab.key ? styles.active : styles.inactive]}><Text style={[styles.text, active === tab.key ? styles.activeText : styles.inactiveText]}>{tab.label}</Text></Pressable>)}
  </ScrollView>;
}

const styles = StyleSheet.create({ tabs: { gap: 8, paddingVertical: 4 }, tab: { minHeight: 44, paddingHorizontal: 17, borderRadius: 100, justifyContent: 'center', alignItems: 'center' }, active: { backgroundColor: Theme.colors.text }, inactive: { backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border }, text: { fontSize: 14, fontWeight: '700' }, activeText: { color: '#FFFFFF' }, inactiveText: { color: Theme.colors.muted } });
