import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { Theme } from '@/constants/theme';
import type { EventItem } from '@/data/events';

export function EventPageHeader({ title, onBack, backLabel }: { title: string; onBack: () => void; backLabel: string }) {
  return <View style={styles.header}>
    <Pressable accessibilityRole="button" accessibilityLabel={backLabel} onPress={onBack} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
      <FontAwesome6 name="arrow-left" size={17} color={Theme.colors.text} />
    </Pressable>
    <Text style={styles.title} numberOfLines={1}>{title}</Text>
    <View style={styles.spacer} />
  </View>;
}

export function EventContextBanner({ event }: { event: EventItem }) {
  return <View style={styles.banner}>
    <LinearGradient pointerEvents="none" colors={Theme.gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
    <View pointerEvents="none" style={styles.circle} />
    <Text style={styles.eyebrow}>กำลังจัดการอีเวนต์</Text>
    <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
    <Text style={styles.eventMeta} numberOfLines={1}>{event.date} · {event.venue}</Text>
  </View>;
}

const styles = StyleSheet.create({
  header: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 44, height: 44, borderRadius: 14, backgroundColor: Theme.colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Theme.colors.border },
  title: { flex: 1, textAlign: 'center', color: Theme.colors.text, fontSize: 17, fontWeight: '700' },
  spacer: { width: 44 },
  pressed: { opacity: 0.75 },
  banner: { minHeight: 112, borderRadius: 22, paddingHorizontal: 18, paddingVertical: 15, justifyContent: 'center', gap: 2, overflow: 'hidden', backgroundColor: Theme.colors.hero },
  circle: { position: 'absolute', width: 135, height: 135, right: -34, top: -48, borderRadius: 68, backgroundColor: Theme.colors.heroAccent, opacity: 0.55 },
  eyebrow: { color: Theme.colors.heroProgress, fontSize: Theme.type.micro, fontWeight: '700' },
  eventTitle: { color: '#FFFFFF', fontSize: 19, fontWeight: '800' },
  eventMeta: { color: Theme.colors.heroMuted, fontSize: Theme.type.caption },
});
