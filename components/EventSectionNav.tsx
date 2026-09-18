import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRef } from 'react';
import { AppText as Text } from '@/components/AppText';
import { Theme } from '@/constants/theme';

type Section = 'checklist' | 'guests' | 'budget';

const sections: { key: Section; label: string }[] = [
  { key: 'checklist', label: 'เช็กลิสต์' },
  { key: 'guests', label: 'แขก' },
  { key: 'budget', label: 'งบอีเวนต์' },
];

export function EventSectionNav({ eventId, active }: { eventId: string; active: Section }) {
  const scrollRef = useRef<ScrollView>(null);
  const activeX = useRef(0);
  const navigate = (section: Section) => {
    if (section === active) return;
    if (section === 'checklist') router.replace({ pathname: '/event/checklist', params: { eventId } });
    else if (section === 'guests') router.replace({ pathname: '/event/guests', params: { eventId } });
    else if (section === 'budget') router.replace({ pathname: '/event/budget', params: { eventId } });
  };

  return <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} onContentSizeChange={() => scrollRef.current?.scrollTo({ x: Math.max(0, activeX.current - 20), animated: false })} accessibilityRole="tablist">
    {sections.map((section) => <Pressable
      key={section.key}
      accessibilityRole="tab"
      accessibilityState={{ selected: section.key === active }}
      onPress={() => navigate(section.key)}
      onLayout={(event) => { if (section.key === active) activeX.current = event.nativeEvent.layout.x; }}
      style={[styles.tab, section.key === active ? styles.active : styles.inactive]}
    ><Text style={[styles.label, section.key === active ? styles.activeLabel : styles.inactiveLabel]}>{section.label}</Text></Pressable>)}
  </ScrollView>;
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: 2 },
  tab: { minHeight: 44, paddingHorizontal: 16, borderRadius: 100, alignItems: 'center', justifyContent: 'center' },
  active: { backgroundColor: Theme.colors.primary },
  inactive: { backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border },
  label: { fontSize: 14, fontWeight: '600' },
  activeLabel: { color: '#FFFFFF' },
  inactiveLabel: { color: Theme.colors.muted },
});
