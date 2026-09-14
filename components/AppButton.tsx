import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Fonts, Theme } from '@/constants/theme';
import { AppText as Text } from '@/components/AppText';

type Props = { title: string; onPress: () => void; variant?: 'primary' | 'outline' | 'ghost'; style?: ViewStyle };

export function AppButton({ title, onPress, variant = 'primary', style }: Props) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.base, styles[variant], pressed && styles.pressed, style]}><Text style={[styles.label, variant === 'outline' && styles.outlineLabel]}>{title}</Text></Pressable>;
}

const styles = StyleSheet.create({
  base: { minHeight: 54, borderRadius: Theme.radius.lg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  primary: { backgroundColor: Theme.colors.primary }, outline: { backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: '#DDDDDD' }, ghost: { backgroundColor: 'transparent', minHeight: 44 },
  label: { color: '#FFFFFF', fontFamily: Fonts.display, fontSize: 16, fontWeight: '600' }, outlineLabel: { color: Theme.colors.text }, pressed: { opacity: 0.78 },
});
