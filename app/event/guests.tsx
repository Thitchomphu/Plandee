import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '@/constants/theme';
import { events } from '@/data/events';
import { getGuests, Guest, RSVPStatus } from '@/data/guests';

const filters: { key: 'all' | RSVPStatus; label: string }[] = [
  { key: 'all', label: 'ทั้งหมด' }, { key: 'accepted', label: 'ตอบรับ' }, { key: 'pending', label: 'รอตอบรับ' }, { key: 'declined', label: 'ปฏิเสธ' },
];
const statusText: Record<RSVPStatus, string> = { accepted: 'ตอบรับแล้ว', pending: 'รอตอบรับ', declined: 'ปฏิเสธ' };

export default function GuestListScreen() {
  const { eventId } = useLocalSearchParams<{ eventId?: string }>();
  const event = events.find((item) => item.id === eventId) ?? events[0];
  const [guests, setGuests] = useState<Guest[]>(() => getGuests(event.id));
  const [filter, setFilter] = useState<'all' | RSVPStatus>('all');
  useFocusEffect(useCallback(() => setGuests(getGuests(event.id)), [event.id]));
  const visibleGuests = useMemo(() => filter === 'all' ? guests : guests.filter((guest) => guest.rsvp === filter), [filter, guests]);
  const accepted = guests.filter((guest) => guest.rsvp === 'accepted').length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}><Pressable onPress={() => router.back()} hitSlop={8}><Text style={styles.back}>‹ กลับไปภาพรวม</Text></Pressable><Text style={styles.menu}>•••</Text></View>
        <Text style={styles.title}>รายชื่อแขก</Text><Text style={styles.subtitle}>{event.title}</Text>
        <View style={styles.summary}><Text style={styles.summaryNumber}>{accepted}/{guests.length}</Text><Text style={styles.summaryText}>แขกตอบรับแล้ว</Text><Pressable onPress={() => router.push({ pathname: '/event/guests-new', params: { eventId: event.id } })} style={styles.addSmall}><Text style={styles.addSmallText}>＋ เพิ่มแขก</Text></Pressable></View>
        <View style={styles.switchRow}><Pressable onPress={() => setFilter('all')} style={styles.seatingTab}><Text style={styles.seatingText}>👤 รายชื่อ</Text></Pressable><Pressable onPress={() => router.push({ pathname: '/event/seating', params: { eventId: event.id } })} style={styles.tab}><Text style={styles.tabText}>🪑 จัดที่นั่ง</Text></Pressable></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{filters.map((item) => <Pressable key={item.key} onPress={() => setFilter(item.key)} style={[styles.filter, filter === item.key && styles.filterActive]}><Text style={[styles.filterText, filter === item.key && styles.filterTextActive]}>{item.label}</Text></Pressable>)}</ScrollView>
        <View style={styles.list}>{visibleGuests.map((guest) => <GuestRow key={guest.id} guest={guest} onPress={() => router.push({ pathname: '/event/guests-new', params: { eventId: event.id, guestId: guest.id } })} />)}</View>
        {visibleGuests.length === 0 && <Text style={styles.empty}>ไม่พบแขกในสถานะนี้</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

function GuestRow({ guest, onPress }: { guest: Guest; onPress: () => void }) {
  return <Pressable onPress={onPress} style={styles.guest}><View style={[styles.avatar, guest.rsvp === 'accepted' ? styles.avatarGreen : guest.rsvp === 'declined' ? styles.avatarGray : styles.avatarBlue]}><Text style={styles.avatarText}>{guest.name.slice(0, 1)}</Text></View><View style={styles.details}><Text style={styles.name}>{guest.name}</Text><Text style={styles.group}>{guest.group}</Text></View><Text style={[styles.status, guest.rsvp === 'accepted' ? styles.accepted : guest.rsvp === 'declined' ? styles.declined : styles.pending]}>{statusText[guest.rsvp]}</Text><Text style={styles.chevron}>›</Text></Pressable>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background }, content: { padding: 22, paddingBottom: 40, gap: 14 }, header: { flexDirection: 'row', justifyContent: 'space-between', minHeight: 36, alignItems: 'center' }, back: { color: Theme.colors.primary, fontSize: 14, fontWeight: '600' }, menu: { color: Theme.colors.text, fontSize: 18, letterSpacing: 2 }, title: { color: Theme.colors.text, fontSize: 25, fontWeight: '800' }, subtitle: { color: Theme.colors.muted, fontSize: 13 }, summary: { backgroundColor: '#FDE3EA', borderRadius: 22, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 8 }, summaryNumber: { color: Theme.colors.primary, fontSize: 20, fontWeight: '800' }, summaryText: { color: Theme.colors.muted, fontSize: 12, flex: 1 }, addSmall: { backgroundColor: Theme.colors.primary, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 9 }, addSmallText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 }, switchRow: { flexDirection: 'row', gap: 8 }, seatingTab: { backgroundColor: Theme.colors.text, borderRadius: 100, paddingHorizontal: 16, paddingVertical: 9 }, seatingText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' }, tab: { backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 100, paddingHorizontal: 16, paddingVertical: 9 }, tabText: { color: Theme.colors.muted, fontSize: 13 }, filters: { gap: 6 }, filter: { backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 100, paddingHorizontal: 14, paddingVertical: 7 }, filterActive: { backgroundColor: Theme.colors.text, borderColor: Theme.colors.text }, filterText: { color: Theme.colors.muted, fontSize: 12 }, filterTextActive: { color: '#FFFFFF' }, list: { gap: 8 }, guest: { backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 22, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 70 }, avatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' }, avatarGreen: { backgroundColor: '#E9436F' }, avatarBlue: { backgroundColor: '#7FB8E0' }, avatarGray: { backgroundColor: '#9B91A3' }, avatarText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' }, details: { flex: 1, gap: 2 }, name: { color: Theme.colors.text, fontSize: 13, fontWeight: '700' }, group: { color: Theme.colors.muted, fontSize: 11 }, status: { borderRadius: 100, paddingHorizontal: 9, paddingVertical: 5, fontSize: 10, fontWeight: '700' }, accepted: { color: Theme.colors.success, backgroundColor: '#DFF6EE' }, pending: { color: '#966016', backgroundColor: '#FFF1DA' }, declined: { color: Theme.colors.muted, backgroundColor: '#F0E6DA' }, chevron: { color: Theme.colors.muted, fontSize: 24 }, empty: { color: Theme.colors.muted, textAlign: 'center', padding: 32 },
});
