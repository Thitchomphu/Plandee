import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText as Text } from '@/components/AppText';
import { Fonts, Theme } from '@/constants/theme';

type Props = { title: string; onPress: () => void; variant?: 'primary' | 'outline' | 'ghost'; style?: ViewStyle; disabled?: boolean };

export function AppButton({ title, onPress, variant = 'primary', style, disabled = false }: Props) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.base, styles[variant], disabled && styles.disabled, pressed && styles.pressed, style]}>
    {variant === 'primary' ? <LinearGradient pointerEvents="none" colors={Theme.gradients.rose} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient} /> : null}
    <Text style={[styles.label, variant !== 'primary' && styles.outlineLabel]}>{title}</Text>
  </Pressable>;
}

const styles = StyleSheet.create({
  base: { minHeight: 52, borderRadius: Theme.radius.lg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, overflow: 'hidden' },
  gradient: { ...StyleSheet.absoluteFill },
  primary: { backgroundColor: Theme.colors.primary }, outline: { backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border }, ghost: { backgroundColor: 'transparent', minHeight: 44 },
  label: { color: '#FFFFFF', fontFamily: Fonts.display, fontSize: 16, fontWeight: '600' }, outlineLabel: { color: Theme.colors.text }, disabled: { opacity: 0.55 }, pressed: { opacity: 0.78 },
});
