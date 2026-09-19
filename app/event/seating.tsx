import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '@/constants/theme';
import { EventPageHeader } from '@/components/EventPageHeader';
import { events } from '@/data/events';
import { getTableGuests, getTables, GuestTable, removeGuestFromTable } from '@/data/guests';

export default function SeatingScreen() {
  const { eventId } = useLocalSearchParams<{ eventId?: string }>();
  const event = events.find((item) => item.id === eventId) ?? events[0];
  const [version, setVersion] = useState(0);
  useFocusEffect(useCallback(() => setVersion((value) => value + 1), []));
  const tables = getTables(event.id);
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}><EventPageHeader title="จัดที่นั่ง" backLabel="กลับรายชื่อแขก" onBack={() => router.back()} /><Text style={styles.subtitle}>{event.title} · {tables.reduce((sum, table) => sum + getTableGuests(table.id).length, 0)} คนจัดโต๊ะแล้ว</Text><Pressable onPress={() => router.push({ pathname: '/event/table-new', params: { eventId: event.id } })} style={styles.createTable}><Text style={styles.createTableText}>＋ เพิ่มโต๊ะและกำหนดจำนวนที่นั่ง</Text></Pressable><View style={styles.list}>{tables.map((table) => <TableCard key={`${table.id}-${version}`} table={table} eventId={event.id} onChanged={() => setVersion((value) => value + 1)} />)}{tables.length === 0 ? <Text style={styles.empty}>ยังไม่มีโต๊ะ เริ่มเพิ่มโต๊ะเพื่อจัดที่นั่งแขก</Text> : null}</View></ScrollView></SafeAreaView>;
}

function TableCard({ table, eventId, onChanged }: { table: GuestTable; eventId: string; onChanged: () => void }) {
  const guests = getTableGuests(table.id);
  return <View style={styles.card}><View style={styles.cardHeader}><Text style={styles.tableName}>{table.name}</Text><Text style={styles.count}>{guests.length}/{table.capacity} คน</Text><Pressable onPress={() => router.push({ pathname: '/event/table-new', params: { eventId, tableId: table.id } })}><Text style={styles.edit}>แก้ไข</Text></Pressable></View><View style={styles.track}><View style={[styles.progress, { width: `${Math.min((guests.length / table.capacity) * 100, 100)}%` }]} /></View><View style={styles.chips}>{guests.length ? guests.map((guest) => <View key={guest.id} style={styles.chip}><Text style={styles.chipText}>{guest.name.split(' ')[0]}</Text><Pressable accessibilityRole="button" accessibilityLabel={`นำ ${guest.name} ออกจาก ${table.name}`} hitSlop={6} style={styles.removeButton} onPress={async () => { const { error } = await removeGuestFromTable(guest.id); if (!error) onChanged(); }}><Text style={styles.remove}>×</Text></Pressable></View>) : <Text style={styles.emptyTable}>ยังไม่มีแขกที่โต๊ะนี้</Text>}</View><Pressable onPress={() => router.push({ pathname: '/event/seat-add', params: { eventId, tableId: table.id } })} style={styles.add}><Text style={styles.addText}>＋ เพิ่มแขกที่โต๊ะนี้</Text></Pressable></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: Theme.spacing.xl, paddingBottom: 40, gap: Theme.spacing.lg },
  subtitle: { color: Theme.colors.muted, fontSize: Theme.type.label },
  createTable: { minHeight: 52, borderRadius: 16, backgroundColor: Theme.colors.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  createTableText: { color: '#FFFFFF', fontSize: Theme.type.body, fontWeight: '700', textAlign: 'center' },
  list: { gap: 12 },
  card: { backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 22, padding: 18, gap: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  tableName: { color: Theme.colors.text, fontSize: 17, fontWeight: '700', flex: 1 }, edit: { color: Theme.colors.primary, fontSize: Theme.type.caption, fontWeight: '700' },
  count: { color: Theme.colors.muted, fontSize: Theme.type.caption },
  track: { height: 7, backgroundColor: Theme.colors.border, borderRadius: 100, overflow: 'hidden' },
  progress: { height: '100%', backgroundColor: Theme.colors.success, borderRadius: 100 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, minHeight: 32 },
  chip: { backgroundColor: Theme.colors.lavender, borderRadius: 100, paddingLeft: 12, paddingRight: 4, minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 4 },
  chipText: { color: Theme.colors.text, fontSize: Theme.type.caption },
  removeButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  remove: { color: Theme.colors.primary, fontSize: 20 },
  emptyTable: { color: Theme.colors.muted, fontSize: Theme.type.caption },
  add: { minHeight: 44, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  addText: { color: Theme.colors.text, fontSize: Theme.type.label, fontWeight: '600' },
  empty: { color: Theme.colors.muted, textAlign: 'center', padding: 20, fontSize: Theme.type.body },
});
