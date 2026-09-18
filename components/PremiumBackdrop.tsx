import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

export function PremiumBackdrop() {
  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    <LinearGradient colors={['#211323', '#341B31', '#251627']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
    <View style={styles.topGlow} />
    <View style={styles.bottomGlow} />
    <View style={styles.topRing} />
    <View style={styles.topRingInner} />
    <View style={styles.bottomRing} />
    <View style={styles.bottomRingInner} />
    <View style={styles.sideLine} />
  </View>;
}

const styles = StyleSheet.create({
  topGlow: { position: 'absolute', width: 360, height: 360, borderRadius: 180, top: -215, right: -140, backgroundColor: '#9E3B70', opacity: 0.2 },
  bottomGlow: { position: 'absolute', width: 340, height: 340, borderRadius: 170, bottom: -175, left: -185, backgroundColor: '#A83A73', opacity: 0.18 },
  topRing: { position: 'absolute', width: 430, height: 430, borderRadius: 215, borderWidth: 1, borderColor: 'rgba(243,116,164,0.38)', top: -250, right: -165 },
  topRingInner: { position: 'absolute', width: 330, height: 330, borderRadius: 165, borderWidth: 1, borderColor: 'rgba(243,116,164,0.2)', top: -184, right: -123 },
  bottomRing: { position: 'absolute', width: 430, height: 430, borderRadius: 215, borderWidth: 1, borderColor: 'rgba(243,116,164,0.38)', bottom: -235, left: -220 },
  bottomRingInner: { position: 'absolute', width: 325, height: 325, borderRadius: 163, borderWidth: 1, borderColor: 'rgba(243,116,164,0.22)', bottom: -170, left: -165 },
  sideLine: { position: 'absolute', width: 1, height: 50, backgroundColor: 'rgba(255,189,213,0.4)', right: 35, bottom: 130 },
});
