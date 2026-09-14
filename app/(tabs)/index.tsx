import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProductCard } from '@/components/ProductCard';
import { AppText as Text } from '@/components/AppText';
import { Theme } from '@/constants/theme';
import { events } from '@/data/events';
import { products } from '@/data/products';

export default function HomeScreen() {
  const [cartCount, setCartCount] = useState(0);
  const upcomingEvents = events.slice(0, 2);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.greeting}>
          <View style={styles.greetingText}>
            <Text style={styles.eyebrow}>ภาพรวมของคุณ</Text>
            <Text style={styles.title}>สวัสดี คุณมิว 👋</Text>
            <Text style={styles.subtitle}>มาดูความคืบหน้าของงานกัน</Text>
          </View>
          <View style={styles.avatar}><Text style={styles.avatarText}>มิว</Text></View>
        </View>

        <View style={styles.metrics}>
          <Metric value="4" label="งานทั้งหมด" color={Theme.colors.primary} />
          <Metric value="3" label="กำลังจะถึง" color={Theme.colors.success} />
          <Metric value="฿310k" label="งบประมาณรวม" color={Theme.colors.text} />
        </View>

        <Pressable accessibilityRole="button" onPress={() => router.push('/event/new')} style={({ pressed }) => [styles.createButton, pressed && styles.pressed]}>
          <View><Text style={styles.createTitle}>เริ่มวางแผนงานใหม่</Text><Text style={styles.createSubtitle}>สร้างงานและเช็กลิสต์ของคุณ</Text></View>
          <Text style={styles.createIcon}>＋</Text>
        </Pressable>

        <View style={styles.tip}><Text style={styles.tipEmoji}>💡</Text><View style={styles.tipText}><Text style={styles.tipTitle}>เคล็ดลับวันนี้</Text><Text style={styles.tipBody}>จัดลำดับความสำคัญของงาน เพื่อให้อีเวนต์เป็นไปอย่างราบรื่น</Text></View></View>

        <SectionHeader title="งานที่ใกล้กำหนด" onSeeAll={() => router.push('/events')} />
        <View style={styles.eventList}>
          {upcomingEvents.map((event) => <Pressable key={event.id} onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })} style={({ pressed }) => [styles.eventCard, pressed && styles.pressed]}>
            <View style={[styles.eventIcon, { backgroundColor: event.banner }]}><Text style={styles.eventEmoji}>{event.icon}</Text></View>
            <View style={styles.eventInfo}><Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text><Text style={styles.eventMeta}>{event.date} · {event.status === 'completed' ? 'เสร็จแล้ว' : `อีก ${event.daysLeft} วัน`}</Text><View style={styles.progressTrack}><View style={[styles.progress, { width: `${event.progress}%`, backgroundColor: event.accent }]} /></View></View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>)}
        </View>

        <SectionHeader title="บริการสำหรับอีเวนต์" onSeeAll={() => router.push('/events')} />
        <View style={styles.grid}>{products.map((product) => <ProductCard key={product.id} product={product} onPress={() => setCartCount((count) => count + 1)} />)}</View>
      </ScrollView>
      <Pressable accessibilityRole="button" accessibilityLabel="สร้างงานใหม่" onPress={() => router.push('/event/new')} style={styles.fab}><Text style={styles.fabText}>＋</Text>{cartCount > 0 ? <View style={styles.badge}><Text style={styles.badgeText}>{cartCount}</Text></View> : null}</Pressable>
    </SafeAreaView>
  );
}

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll: () => void }) {
  return <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{title}</Text><Pressable accessibilityRole="link" onPress={onSeeAll} hitSlop={8}><Text style={styles.seeAll}>ดูทั้งหมด ›</Text></Pressable></View>;
}

function Metric({ value, label, color }: { value: string; label: string; color: string }) { return <View style={styles.metric}><Text style={[styles.metricValue, { color }]}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>; }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120, gap: 16 },
  greeting: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greetingText: { flex: 1, gap: 3 },
  eyebrow: { color: Theme.colors.primary, fontSize: 12, fontWeight: '700' },
  title: { color: Theme.colors.text, fontSize: 24, fontWeight: '800' },
  subtitle: { color: Theme.colors.muted, fontSize: 13 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: Theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontWeight: '700' },
  metrics: { flexDirection: 'row', gap: 10 },
  metric: { backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg, padding: 12, flex: 1, gap: 5, borderWidth: 1, borderColor: Theme.colors.border },
  metricValue: { fontSize: 20, fontWeight: '800' },
  metricLabel: { color: Theme.colors.muted, fontSize: 11 },
  createButton: { minHeight: 72, paddingHorizontal: 18, paddingVertical: 14, borderRadius: Theme.radius.xl, backgroundColor: Theme.colors.text, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  createTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  createSubtitle: { color: '#E8DDEB', fontSize: 12, marginTop: 4 },
  createIcon: { color: '#FFFFFF', fontSize: 30, fontWeight: '300' },
  tip: { flexDirection: 'row', gap: 12, padding: 16, backgroundColor: Theme.colors.primarySoft, borderWidth: 1, borderColor: Theme.colors.primary, borderRadius: Theme.radius.xl },
  tipEmoji: { fontSize: 24 },
  tipText: { flex: 1, gap: 4 },
  tipTitle: { color: Theme.colors.primary, fontSize: 14, fontWeight: '700' },
  tipBody: { color: Theme.colors.text, fontSize: 12, lineHeight: 18 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  sectionTitle: { color: Theme.colors.text, fontSize: 17, fontWeight: '800' },
  seeAll: { color: Theme.colors.primary, fontSize: 12, fontWeight: '700' },
  eventList: { gap: 10 },
  eventCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.radius.lg },
  eventIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  eventEmoji: { fontSize: 22 },
  eventInfo: { flex: 1, gap: 4 },
  eventTitle: { color: Theme.colors.text, fontSize: 14, fontWeight: '700' },
  eventMeta: { color: Theme.colors.muted, fontSize: 11 },
  progressTrack: { height: 5, backgroundColor: Theme.colors.border, borderRadius: 100, overflow: 'hidden', marginTop: 3 },
  progress: { height: '100%', borderRadius: 100 },
  chevron: { color: Theme.colors.muted, fontSize: 26 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  fab: { position: 'absolute', right: 22, bottom: 96, width: 58, height: 58, borderRadius: 29, backgroundColor: Theme.colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  fabText: { color: '#FFFFFF', fontSize: 28, lineHeight: 30 },
  badge: { position: 'absolute', right: -2, top: -2, minWidth: 20, height: 20, borderRadius: 10, backgroundColor: Theme.colors.warning, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: Theme.colors.text, fontSize: 11, fontWeight: '700' },
  pressed: { opacity: 0.8 },
});
