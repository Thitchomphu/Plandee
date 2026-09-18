import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Image, Linking, Pressable, StyleSheet, View } from 'react-native';
import { Alert } from '@/components/AppDialog';
import { AppText as Text } from '@/components/AppText';
import { Theme } from '@/constants/theme';

const mapKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_STATIC_KEY;

export function EventVenueMap({ venue }: { venue: string }) {
  const [previewFailed, setPreviewFailed] = useState(false);
  const hasVenue = !!venue.trim() && venue !== 'ยังไม่ได้ระบุสถานที่';
  if (!hasVenue) return null;
  const query = encodeURIComponent(venue.trim());
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
  const previewUrl = mapKey ? `https://maps.googleapis.com/maps/api/staticmap?center=${query}&zoom=15&size=600x320&scale=2&maptype=roadmap&markers=color:0xc72b60%7C${query}&key=${encodeURIComponent(mapKey)}` : null;
  const openMap = async () => {
    try { await Linking.openURL(mapsUrl); }
    catch { Alert.alert('เปิดแผนที่ไม่ได้', 'กรุณาลองใหม่อีกครั้ง'); }
  };

  return <View style={styles.section}>
    <Text style={styles.title}>สถานที่จัดอีเวนต์</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={`เปิด ${venue} ใน Google Maps`} onPress={() => { void openMap(); }} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      {previewUrl && !previewFailed ? <Image source={{ uri: previewUrl }} style={styles.preview} resizeMode="cover" onError={() => setPreviewFailed(true)} /> : <View style={styles.placeholder}><LinearGradient pointerEvents="none" colors={Theme.gradients.soft} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} /><View style={styles.mapMark}><FontAwesome6 name="location-dot" size={24} color={Theme.colors.primary} solid /></View><Text style={styles.placeholderText}>ดูตำแหน่งจริงบน Google Maps</Text></View>}
      <View style={styles.footer}><View style={styles.pin}><FontAwesome6 name="location-dot" size={16} color={Theme.colors.primary} solid /></View><View style={styles.copy}><Text style={styles.venue} numberOfLines={2}>{venue}</Text><Text style={styles.hint}>เปิดแผนที่เพื่อตรวจสอบหมุดและเส้นทาง</Text></View><FontAwesome6 name="arrow-up-right-from-square" size={14} color={Theme.colors.primary} /></View>
    </Pressable>
  </View>;
}

const styles = StyleSheet.create({
  section: { gap: 11 }, title: { color: Theme.colors.text, fontSize: 19, fontWeight: '800' },
  card: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: Theme.colors.border, backgroundColor: Theme.colors.surface }, pressed: { opacity: 0.82 },
  preview: { width: '100%', height: 154 }, placeholder: { height: 120, alignItems: 'center', justifyContent: 'center', gap: 8, overflow: 'hidden' },
  mapMark: { width: 46, height: 46, borderRadius: 16, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }, placeholderText: { color: Theme.colors.muted, fontSize: Theme.type.caption },
  footer: { minHeight: 72, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }, pin: { width: 40, height: 40, borderRadius: 12, backgroundColor: Theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, copy: { flex: 1, gap: 2 }, venue: { color: Theme.colors.text, fontSize: Theme.type.body, fontWeight: '700' }, hint: { color: Theme.colors.muted, fontSize: Theme.type.caption },
});
