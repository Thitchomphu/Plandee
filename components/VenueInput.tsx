import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { AppInput } from '@/components/AppInput';
import { AppText as Text } from '@/components/AppText';
import { Theme } from '@/constants/theme';
import { events } from '@/data/events';

export function VenueInput({ value, onChangeText }: { value: string; onChangeText: (value: string) => void }) {
  const [focused, setFocused] = useState(false);
  const suggestions = useMemo(() => {
    const query = value.trim().toLocaleLowerCase('th-TH');
    return [...new Set(events.map((event) => event.venue.trim()))]
      .filter((venue) => venue && venue !== 'ยังไม่ได้ระบุสถานที่' && (!query || venue.toLocaleLowerCase('th-TH').includes(query)) && venue !== value.trim())
      .slice(0, 5);
  }, [value]);

  return <View style={styles.group}>
    <AppInput label="สถานที่จัดอีเวนต์" value={value} onChangeText={onChangeText} onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 150)} placeholder="ค้นหาหรือพิมพ์ชื่อสถานที่" autoComplete="street-address" />
    {focused && suggestions.length ? <View style={styles.suggestions}>
      <Text style={styles.heading}>{value.trim() ? 'สถานที่ที่เคยใช้' : 'สถานที่ล่าสุดที่เคยใช้'}</Text>
      {suggestions.map((venue) => <Pressable key={venue} accessibilityRole="button" onPress={() => { onChangeText(venue); setFocused(false); }} style={styles.option}>
        <FontAwesome6 name="location-dot" size={15} color={Theme.colors.primary} solid />
        <Text style={styles.optionText} numberOfLines={2}>{venue}</Text>
      </Pressable>)}
    </View> : null}
    <Text style={styles.hint}>เลือกจากอีเวนต์ก่อนหน้า หรือพิมพ์สถานที่ใหม่ได้</Text>
  </View>;
}

const styles = StyleSheet.create({
  group: { gap: 6 },
  suggestions: { backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.radius.md, padding: 8, gap: 2 },
  heading: { color: Theme.colors.muted, fontSize: Theme.type.caption, paddingHorizontal: 8, paddingVertical: 4 },
  option: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, borderRadius: 10 },
  optionText: { flex: 1, color: Theme.colors.text, fontSize: Theme.type.body },
  hint: { color: Theme.colors.muted, fontSize: Theme.type.caption },
});
