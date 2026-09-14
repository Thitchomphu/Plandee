import { Pressable, StyleSheet, View } from 'react-native';
import { Product } from '@/data/products';
import { Fonts, Theme } from '@/constants/theme';
import { AppText as Text } from '@/components/AppText';

export function ProductCard({ product, onPress }: { product: Product; onPress?: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}><View style={[styles.art, { backgroundColor: product.color }]}><Text style={styles.artText}>✦</Text></View><View style={styles.body}><Text style={styles.category}>{product.category}</Text><Text style={styles.name} numberOfLines={1}>{product.name}</Text><Text style={styles.price}>{product.price}</Text></View></Pressable>;
}

const styles = StyleSheet.create({ card: { backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg, overflow: 'hidden', flex: 1, minWidth: 0, shadowColor: '#2B2233', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 }, art: { height: 82, alignItems: 'center', justifyContent: 'center' }, artText: { color: '#FFFFFF', fontSize: 30 }, body: { padding: 12, gap: 3 }, category: { color: Theme.colors.muted, fontFamily: Fonts.sans, fontSize: 11 }, name: { color: Theme.colors.text, fontFamily: Fonts.display, fontSize: 13, fontWeight: '600' }, price: { color: Theme.colors.primary, fontFamily: Fonts.sansSemiBold, fontSize: 12, fontWeight: '700' }, pressed: { opacity: 0.8 } });
