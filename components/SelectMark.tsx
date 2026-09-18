import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { Theme } from '@/constants/theme';

export function SelectMark({ selected, size = 28 }: { selected: boolean; size?: number }) {
  const shape = { width: size, height: size, borderRadius: Math.round(size * 0.36) };
  return selected
    ? <LinearGradient colors={Theme.gradients.rose} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.mark, shape]}><FontAwesome6 name="check" size={size * 0.48} color="#FFFFFF" solid /></LinearGradient>
    : <View style={[styles.mark, styles.empty, shape]} />;
}

const styles = StyleSheet.create({
  mark: { alignItems: 'center', justifyContent: 'center' },
  empty: { borderWidth: 1.5, borderColor: Theme.colors.placeholder, backgroundColor: Theme.colors.surface },
});
