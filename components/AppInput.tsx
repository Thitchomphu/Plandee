import { StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { Fonts, Theme } from '@/constants/theme';
import { AppText as Text } from '@/components/AppText';

type Props = TextInputProps & { label: string; error?: string; containerStyle?: ViewStyle };

export function AppInput({ label, error, containerStyle, ...props }: Props) {
  return <View style={[styles.group, containerStyle]}><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} placeholderTextColor={Theme.colors.muted} {...props} style={[styles.input, props.style]} />{error ? <Text style={styles.error}>{error}</Text> : null}</View>;
}

const styles = StyleSheet.create({ group: { gap: 6 }, label: { color: Theme.colors.text, fontFamily: Fonts.sansSemiBold, fontSize: 13, fontWeight: '600' }, input: { minHeight: 54, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.radius.md, backgroundColor: Theme.colors.input, paddingHorizontal: 14, color: Theme.colors.text, fontFamily: Fonts.sans, fontSize: 16 }, error: { color: Theme.colors.primary, fontFamily: Fonts.sans, fontSize: 12 } });
