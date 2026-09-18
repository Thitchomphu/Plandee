import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { Fonts, Theme } from '@/constants/theme';

type Props = TextInputProps & { label: string; error?: string; containerStyle?: ViewStyle; tone?: 'light' | 'dark' };

export function AppInput({ label, error, containerStyle, tone = 'light', ...props }: Props) {
  const [visible, setVisible] = useState(false);
  const dark = tone === 'dark';
  return <View style={[styles.group, containerStyle]}>
    <Text style={[styles.label, dark && styles.darkLabel]}>{label}</Text>
    <View style={[styles.field, dark && styles.darkField, error && styles.fieldError]}>
      <TextInput accessibilityLabel={label} placeholderTextColor={dark ? '#B89BAB' : Theme.colors.muted} {...props} secureTextEntry={props.secureTextEntry && !visible} style={[styles.input, dark && styles.darkInput, props.style]} />
      {props.secureTextEntry ? <Pressable accessibilityRole="button" accessibilityLabel={visible ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'} onPress={() => setVisible(!visible)} style={styles.visibility}><Text style={[styles.visibilityText, dark && styles.darkVisibilityText]}>{visible ? 'ซ่อน' : 'แสดง'}</Text></Pressable> : null}
    </View>
    {error ? <Text accessibilityRole="alert" style={[styles.error, dark && styles.darkError]}>{error}</Text> : null}
  </View>;
}

const styles = StyleSheet.create({ group: { gap: 6 }, label: { color: Theme.colors.text, fontFamily: Fonts.sansSemiBold, fontSize: 14, fontWeight: '600' }, darkLabel: { color: '#F8DFE9' }, field: { minHeight: 52, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.radius.md, backgroundColor: Theme.colors.input }, darkField: { backgroundColor: 'rgba(255,255,255,0.055)', borderColor: 'rgba(255,222,236,0.24)' }, fieldError: { borderColor: Theme.colors.primary }, input: { flex: 1, minHeight: 50, paddingHorizontal: 14, color: Theme.colors.text, fontFamily: Fonts.sans, fontSize: 16 }, darkInput: { color: '#FFFFFF' }, visibility: { minWidth: 56, minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingRight: 8 }, visibilityText: { color: Theme.colors.primary, fontFamily: Fonts.sansSemiBold, fontSize: 13 }, darkVisibilityText: { color: '#FF9FC3' }, error: { color: Theme.colors.primary, fontFamily: Fonts.sans, fontSize: 13 }, darkError: { color: '#FFB6C8' } });
