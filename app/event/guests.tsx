import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '@/constants/theme';
import { events } from '@/data/events';
import { getGuests, Guest, RSVPStatus } from '@/data/guests';
import { EventSectionNav } from '@/components/EventSectionNav';
import { EventContextBanner, EventPageHeader } from '@/components/EventPageHeader';
import { AppInput } from '@/components/AppInput';

const filters: { key: 'all' | RSVPStatus; label: string }[] = [
  { key: 'all', label: 'ทั้งหมด' }, { key: 'accepted', label: 'ตอบรับ' }, { key: 'pending', label: 'รอตอบรับ' }, { key: 'declined', label: 'ปฏิเสธ' },
];
const statusText: Record<RSVPStatus, string> = { accepted: 'ตอบรับแล้ว', pending: 'รอตอบรับ', declined: 'ปฏิเสธ' };

export default function GuestListScreen() {
  const { eventId } = useLocalSearchParams<{ eventId?: string }>();
  const event = events.find((item) => item.id === eventId) ?? events[0];
  const [guests, setGuests] = useState<Guest[]>(() => getGuests(event.id));
  const [filter, setFilter] = useState<'all' | RSVPStatus>('all');
  const [search, setSearch] = useState('');
  useFocusEffect(useCallback(() => setGuests(getGuests(event.id)), [event.id]));
  const visibleGuests = useMemo(() => guests.filter((guest) => (filter === 'all' || guest.rsvp === filter) && guest.name.toLocaleLowerCase('th-TH').includes(search.trim().toLocaleLowerCase('th-TH'))), [filter, guests, search]);
  const accepted = guests.filter((guest) => guest.rsvp === 'accepted').length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <EventPageHeader title="รายชื่อแขก" backLabel="กลับภาพรวมอีเวนต์" onBack={() => router.replace({ pathname: '/event/[id]', params: { id: event.id } })} />
        <EventContextBanner event={event} />
        <EventSectionNav eventId={event.id} active="guests" />
        <View style={styles.summary}><Text style={styles.summaryNumber}>{accepted}/{guests.length}</Text><Text style={styles.summaryText}>แขกตอบรับแล้ว</Text><Pressable onPress={() => router.push({ pathname: '/event/guests-new', params: { eventId: event.id } })} style={styles.addSmall}><Text style={styles.addSmallText}>＋ เพิ่มแขก</Text></Pressable></View>
        <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/event/seating', params: { eventId: event.id } })} style={styles.seatingAction}><Text style={styles.seatingActionText}>จัดที่นั่งแขก</Text><Text style={styles.seatingArrow}>›</Text></Pressable>
        <AppInput label="ค้นหาแขก" value={search} onChangeText={setSearch} placeholder="พิมพ์ชื่อแขก" autoCapitalize="none" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{filters.map((item) => <Pressable key={item.key} onPress={() => setFilter(item.key)} style={[styles.filter, filter === item.key && styles.filterActive]}><Text style={[styles.filterText, filter === item.key && styles.filterTextActive]}>{item.label}</Text></Pressable>)}</ScrollView>
        <View style={styles.list}>{visibleGuests.map((guest) => <GuestRow key={guest.id} guest={guest} onPress={() => router.push({ pathname: '/event/guests-new', params: { eventId: event.id, guestId: guest.id } })} />)}</View>
        {visibleGuests.length === 0 && <Text style={styles.empty}>{guests.length ? 'ไม่พบแขกที่ตรงกับตัวกรอง' : 'ยังไม่มีแขกในอีเวนต์นี้ เริ่มเพิ่มแขกคนแรกได้เลย'}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

function GuestRow({ guest, onPress }: { guest: Guest; onPress: () => void }) {
  return <Pressable onPress={onPress} style={styles.guest}><View style={[styles.avatar, guest.rsvp === 'accepted' ? styles.avatarGreen : guest.rsvp === 'declined' ? styles.avatarGray : styles.avatarBlue]}><Text style={styles.avatarText}>{guest.name.slice(0, 1)}</Text></View><View style={styles.details}><Text style={styles.name}>{guest.name}</Text><Text style={styles.group}>{guest.group}</Text></View><Text style={[styles.status, guest.rsvp === 'accepted' ? styles.accepted : guest.rsvp === 'declined' ? styles.declined : styles.pending]}>{statusText[guest.rsvp]}</Text><Text style={styles.chevron}>›</Text></Pressable>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: Theme.spacing.xl, paddingBottom: 40, gap: Theme.spacing.lg },
  summary: { backgroundColor: Theme.colors.primarySoft, borderRadius: 22, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryNumber: { color: Theme.colors.primary, fontSize: 20, fontWeight: '800' },
  summaryText: { color: Theme.colors.muted, fontSize: Theme.type.caption, flex: 1 },
  addSmall: { minHeight: 44, backgroundColor: Theme.colors.primary, borderRadius: 14, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  addSmallText: { color: '#FFFFFF', fontWeight: '700', fontSize: Theme.type.caption },
  seatingAction: { minHeight: 52, borderRadius: 16, backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  seatingActionText: { color: Theme.colors.text, fontSize: Theme.type.body, fontWeight: '700' },
  seatingArrow: { color: Theme.colors.primary, fontSize: 24 },
  filters: { gap: 8 },
  filter: { minHeight: 44, backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 100, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  filterActive: { backgroundColor: Theme.colors.text, borderColor: Theme.colors.text },
  filterText: { color: Theme.colors.muted, fontSize: Theme.type.label },
  filterTextActive: { color: '#FFFFFF' },
  list: { gap: 8 },
  guest: { backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 20, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 76 },
  avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  avatarGreen: { backgroundColor: Theme.colors.primary }, avatarBlue: { backgroundColor: '#7FB8E0' }, avatarGray: { backgroundColor: '#9B91A3' },
  avatarText: { color: '#FFFFFF', fontSize: Theme.type.label, fontWeight: '700' },
  details: { flex: 1, gap: 2 },
  name: { color: Theme.colors.text, fontSize: Theme.type.body, fontWeight: '700' },
  group: { color: Theme.colors.muted, fontSize: Theme.type.caption },
  status: { borderRadius: 100, paddingHorizontal: 9, paddingVertical: 5, fontSize: Theme.type.micro, fontWeight: '700' },
  accepted: { color: Theme.colors.success, backgroundColor: Theme.colors.mint }, pending: { color: Theme.colors.warningText, backgroundColor: Theme.colors.warningSoft }, declined: { color: Theme.colors.muted, backgroundColor: Theme.colors.border },
  chevron: { color: Theme.colors.muted, fontSize: 24 },
  empty: { color: Theme.colors.muted, textAlign: 'center', padding: 32, fontSize: Theme.type.body },
});
