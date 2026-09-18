import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { AppText as Text } from '@/components/AppText';
import { Fonts } from '@/constants/theme';

export function AuthBrand({ subtitle }: { subtitle: string }) {
  return <View style={styles.header}>
    <Image source={require('@/assets/images/plandee-premium-mark.png')} style={styles.mark} contentFit="contain" cachePolicy="memory-disk" transition={0} accessibilityLabel="โลโก้ Plandee" />
    <Text style={styles.brand}>PLANDEE</Text>
    <Text style={styles.subtitle}>{subtitle}</Text>
  </View>;
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: 7, paddingVertical: 10 },
  mark: { width: 116, height: 116, marginBottom: 6 },
  brand: { color: '#FFE5EF', fontFamily: Fonts.sansMedium, fontSize: 29, letterSpacing: 8, paddingLeft: 8 },
  subtitle: { color: '#D9B9C8', fontFamily: Fonts.sans, fontSize: 14, textAlign: 'center' },
});
