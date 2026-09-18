import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { Theme } from '@/constants/theme';

const SEGMENTS = 36;
const SIZE = 94;
const CENTER = SIZE / 2;
const RADIUS = 39;

export function ProgressRing({ progress }: { progress: number }) {
  const safeProgress = Math.min(100, Math.max(0, progress));
  const filled = Math.round((safeProgress / 100) * SEGMENTS);
  return <View accessibilityLabel={`เช็กลิสต์เสร็จแล้ว ${safeProgress}%`} style={styles.ring}>
    {Array.from({ length: SEGMENTS }, (_, index) => {
      const angle = (index / SEGMENTS) * Math.PI * 2;
      return <View key={index} style={[styles.segment, {
        left: CENTER + Math.sin(angle) * RADIUS - 2,
        top: CENTER - Math.cos(angle) * RADIUS - 5,
        backgroundColor: index < filled ? Theme.colors.primary : Theme.colors.border,
        transform: [{ rotate: `${index * 360 / SEGMENTS}deg` }],
      }]} />;
    })}
    <Text style={styles.value}>{safeProgress}%</Text>
    <Text style={styles.caption}>เสร็จแล้ว</Text>
  </View>;
}

const styles = StyleSheet.create({
  ring: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  segment: { position: 'absolute', width: 4, height: 10, borderRadius: 2 },
  value: { color: Theme.colors.text, fontSize: 18, fontWeight: '800', marginTop: 7 },
  caption: { color: Theme.colors.muted, fontSize: Theme.type.micro },
});
