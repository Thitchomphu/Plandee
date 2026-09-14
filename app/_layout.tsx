import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Text, TextInput, TextProps } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import {
  NotoSansThai_400Regular,
  NotoSansThai_500Medium,
  NotoSansThai_600SemiBold,
  NotoSansThai_700Bold,
} from '@expo-google-fonts/noto-sans-thai';
import { Mitr_500Medium, Mitr_700Bold } from '@expo-google-fonts/mitr';
import { Fonts } from '@/constants/theme';

void SplashScreen.preventAutoHideAsync();

const textDefaults = Text as typeof Text & { defaultProps?: TextProps };
const inputDefaults = TextInput as typeof TextInput & { defaultProps?: TextProps };

export default function RootLayout() {
  const [loaded] = useFonts({ NotoSansThai_400Regular, NotoSansThai_500Medium, NotoSansThai_600SemiBold, NotoSansThai_700Bold, Mitr_500Medium, Mitr_700Bold });

  useEffect(() => {
    if (loaded) {
      textDefaults.defaultProps = { ...textDefaults.defaultProps, style: [{ fontFamily: Fonts.sans }, textDefaults.defaultProps?.style] };
      inputDefaults.defaultProps = { ...inputDefaults.defaultProps, style: [{ fontFamily: Fonts.sans }, inputDefaults.defaultProps?.style] };
      void SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;
  return <SafeAreaProvider><Stack screenOptions={{ headerShown: false }} /><StatusBar style="dark" /></SafeAreaProvider>;
}
