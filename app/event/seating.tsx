import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '@/constants/theme';
import { events } from '@/data/events';
import { getTableGuests, getTables, GuestTable, removeGuestFromTable } from '@/data/guests';

export default function SeatingScreen() {
  const { eventId } = useLocalSearchParams<{ eventId?: string }>();
  const event = events.find((item) => item.id === eventId) ?? events[0];
  const [version, setVersion] = useState(0);
  useFocusEffect(useCallback(() => setVersion((value) => value + 1), []));
  const tables = getTables(event.id);
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}><Pressable onPress={() => router.back()} hitSlop={8}><Text style={styles.back}>‹ รายชื่อแขก</Text></Pressable><Text style={styles.title}>จัดที่นั่ง</Text><Text style={styles.subtitle}>{event.title} · {tables.reduce((sum, table) => sum + getTableGuests(table.id).length, 0)} คนจัดโต๊ะแล้ว</Text><View style={styles.list}>{tables.map((table) => <TableCard key={`${table.id}-${version}`} table={table} eventId={event.id} onChanged={() => setVersion((value) => value + 1)} />)}</View><Pressable onPress={() => router.push({ pathname: '/event/guests', params: { eventId: event.id } })} style={styles.outline}><Text style={styles.outlineText}>ดูรายชื่อแขกทั้งหมด</Text></Pressable></ScrollView></SafeAreaView>;
}

function TableCard({ table, eventId, onChanged }: { table: GuestTable; eventId: string; onChanged: () => void }) {
  const guests = getTableGuests(table.id);
  return <View style={styles.card}><View style={styles.cardHeader}><Text style={styles.tableName}>{table.name}</Text><Text style={styles.count}>{guests.length}/{table.capacity} คน</Text></View><View style={styles.track}><View style={[styles.progress, { width: `${Math.min((guests.length / table.capacity) * 100, 100)}%` }]} /></View><View style={styles.chips}>{guests.length ? guests.map((guest) => <View key={guest.id} style={styles.chip}><Text style={styles.chipText}>{guest.name.split(' ')[0]}</Text><Pressable hitSlop={8} onPress={() => { removeGuestFromTable(guest.id); onChanged(); }}><Text style={styles.remove}>×</Text></Pressable></View>) : <Text style={styles.emptyTable}>ยังไม่มีแขกที่โต๊ะนี้</Text>}</View><Pressable onPress={() => router.push({ pathname: '/event/seat-add', params: { eventId, tableId: table.id } })} style={styles.add}><Text style={styles.addText}>＋ เพิ่มแขกที่โต๊ะนี้</Text></Pressable></View>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: Theme.colors.background }, content: { padding: 22, paddingBottom: 40, gap: 14 }, back: { color: Theme.colors.primary, fontSize: 14, fontWeight: '600', minHeight: 36 }, title: { color: Theme.colors.text, fontSize: 25, fontWeight: '800' }, subtitle: { color: Theme.colors.muted, fontSize: 13 }, list: { gap: 12 }, card: { backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 22, padding: 18, gap: 11 }, cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, tableName: { color: Theme.colors.text, fontSize: 15, fontWeight: '700' }, count: { color: Theme.colors.muted, fontSize: 12 }, track: { height: 6, backgroundColor: Theme.colors.border, borderRadius: 100, overflow: 'hidden' }, progress: { height: '100%', backgroundColor: Theme.colors.success, borderRadius: 100 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, minHeight: 28 }, chip: { backgroundColor: '#EEE7F9', borderRadius: 100, paddingHorizontal: 11, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 }, chipText: { color: Theme.colors.text, fontSize: 11 }, remove: { color: Theme.colors.primary, fontSize: 15, lineHeight: 13 }, emptyTable: { color: Theme.colors.muted, fontSize: 12 }, add: { minHeight: 42, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }, addText: { color: Theme.colors.text, fontSize: 12, fontWeight: '600' }, outline: { minHeight: 50, borderWidth: 1, borderColor: Theme.colors.primary, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }, outlineText: { color: Theme.colors.primary, fontSize: 15, fontWeight: '700' } });
