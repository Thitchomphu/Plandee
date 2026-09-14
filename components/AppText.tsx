import { StyleSheet, Text as NativeText, TextProps, TextStyle } from 'react-native';

import { Fonts } from '@/constants/theme';

const fontFamilyForWeight = (weight: TextStyle['fontWeight']) => {
  if (weight === 'bold') return Fonts.sansBold;

  const numericWeight = typeof weight === 'number' ? weight : Number(weight ?? 400);
  if (numericWeight >= 700) return Fonts.sansBold;
  if (numericWeight >= 600) return Fonts.sansSemiBold;
  if (numericWeight >= 500) return Fonts.sansMedium;
  return Fonts.sans;
};

const readableFontSize = (fontSize?: number) => {
  if (fontSize === undefined || fontSize >= 22) return fontSize;
  if (fontSize <= 10) return 12;
  if (fontSize === 11) return 13;
  if (fontSize === 12) return 14;
  if (fontSize === 13) return 15;
  if (fontSize <= 15) return 16;
  return fontSize + 1;
};

export function AppText({ style, ...props }: TextProps) {
  const flattenedStyle = StyleSheet.flatten(style) as TextStyle | undefined;
  const fontFamily = flattenedStyle?.fontFamily ?? fontFamilyForWeight(flattenedStyle?.fontWeight);
  const fontSize = readableFontSize(flattenedStyle?.fontSize);
  const sizeIncrease = fontSize && flattenedStyle?.fontSize ? fontSize - flattenedStyle.fontSize : 0;
  const readableStyle: TextStyle = { fontFamily, fontWeight: 'normal' };

  if (fontSize !== undefined) readableStyle.fontSize = fontSize;
  if (flattenedStyle?.lineHeight !== undefined) {
    readableStyle.lineHeight = flattenedStyle.lineHeight + sizeIncrease;
  }

  return <NativeText {...props} style={[style, readableStyle]} />;
}
