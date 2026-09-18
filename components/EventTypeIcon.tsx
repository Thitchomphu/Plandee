import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

export function EventTypeIcon({ kind, size = 24, color = '#FFFFFF' }: { kind: string; size?: number; color?: string }) {
  const name = kind.includes('แต่ง') ? 'heart' : kind.includes('เกิด') ? 'gift' : kind.includes('สัมมนา') ? 'briefcase' : kind.includes('เปิดตัว') ? 'star' : 'calendar-days';
  return <FontAwesome6 name={name} size={size} color={color} solid />;
}
