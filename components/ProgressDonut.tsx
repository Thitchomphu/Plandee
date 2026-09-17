import Svg, { Circle } from 'react-native-svg';
import { AppText as Text } from '@/components/AppText';
import { Theme } from '@/constants/theme';

type Props = { value: number; size?: number; strokeWidth?: number; color?: string; label?: string };

export function ProgressDonut({ value, size = 86, strokeWidth = 8, color = Theme.colors.primary, label = 'เสร็จแล้ว' }: Props) {
  const progress = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  return <>
    <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle cx={size / 2} cy={size / 2} r={radius} stroke={Theme.colors.border} strokeWidth={strokeWidth} fill="none" />
      <Circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={circumference * (1 - progress / 100)} />
    </Svg>
    <Text style={{ position: 'absolute', color: Theme.colors.text, fontSize: 17, fontWeight: '800' }}>{progress}%</Text>
    <Text style={{ position: 'absolute', marginTop: 30, color: Theme.colors.muted, fontSize: 9 }}>{label}</Text>
  </>;
}
