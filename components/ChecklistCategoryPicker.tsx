import { Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { Theme } from '@/constants/theme';
const defaults = ['สถานที่', 'อาหาร', 'ตกแต่ง', 'อื่น ๆ'];
export function ChecklistCategoryPicker({ value, onChange, categories = defaults }: { value: string; onChange: (value: string) => void; categories?: string[] }) {
  return <View style={styles.group}><Text style={styles.label}>หมวดหมู่</Text><View style={styles.options}>{categories.map((category) => <Pressable key={category} accessibilityRole="radio" accessibilityState={{ checked: category === value }} onPress={() => onChange(category)} style={[styles.option, category === value && styles.active]}><Text style={[styles.optionText, category === value && styles.activeText]}>{category}</Text></Pressable>)}</View></View>;
}
const styles = StyleSheet.create({ group: { gap: 8 }, label: { color: Theme.colors.text, fontSize: Theme.type.label, fontWeight: '600' }, options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, option: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 14, borderRadius: Theme.radius.pill, backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border }, active: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary }, optionText: { color: Theme.colors.muted, fontSize: Theme.type.label }, activeText: { color: '#FFFFFF', fontWeight: '700' } });
