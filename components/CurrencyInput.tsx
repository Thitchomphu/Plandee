import type { ViewStyle } from 'react-native';
import { AppInput } from '@/components/AppInput';

type Props = { label: string; value: string; onChangeText: (value: string) => void; placeholder?: string; containerStyle?: ViewStyle };
const digits = (value: string) => value.replace(/[^0-9]/g, '');
export const currencyValue = (value: string) => Number(digits(value)) || 0;

export function CurrencyInput({ label, value, onChangeText, placeholder = '0', containerStyle }: Props) {
  const update = (nextValue: string) => {
    const numeric = digits(nextValue);
    onChangeText(numeric ? Number(numeric).toLocaleString('en-US') : '');
  };
  return <AppInput label={label} value={value} onChangeText={update} keyboardType="number-pad" placeholder={placeholder} containerStyle={containerStyle} />;
}
