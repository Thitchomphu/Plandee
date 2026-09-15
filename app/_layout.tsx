import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
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
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { hydrateEvents } from '@/data/events';
import { hydrateChecklistItems } from '@/data/checklists';
import { hydrateEventBudget } from '@/data/eventBudget';
import { hydrateGuests } from '@/data/guests';
import { ensureProfile } from '@/lib/profile';

const hydrateCloudData = async () => {
  await hydrateEvents();
  await hydrateChecklistItems();
  await Promise.all([hydrateEventBudget(), hydrateGuests()]);
};

void SplashScreen.preventAutoHideAsync();

const textDefaults = Text as typeof Text & { defaultProps?: TextProps };
const inputDefaults = TextInput as typeof TextInput & { defaultProps?: TextProps };

export default function RootLayout() {
  const [loaded] = useFonts({ NotoSansThai_400Regular, NotoSansThai_500Medium, NotoSansThai_600SemiBold, NotoSansThai_700Bold, Mitr_500Medium, Mitr_700Bold });
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loaded) {
      textDefaults.defaultProps = { ...textDefaults.defaultProps, style: [{ fontFamily: Fonts.sans }, textDefaults.defaultProps?.style] };
      inputDefaults.defaultProps = { ...inputDefaults.defaultProps, style: [{ fontFamily: Fonts.sans }, inputDefaults.defaultProps?.style] };
      void SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) { await ensureProfile(); await hydrateCloudData(); }
      if (active) {
        setSession(data.session);
        setAuthReady(true);
      }
    })();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void (async () => {
        if (nextSession) { await ensureProfile(); await hydrateCloudData(); }
        if (active) {
          setSession(nextSession);
          setAuthReady(true);
        }
      })();
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!loaded || !authReady) return;
    if (segments[0] === '(tabs)' && !session) router.replace('/login');
  }, [authReady, loaded, router, segments, session]);

  if (!loaded || !authReady) return null;
  return <SafeAreaProvider><Stack screenOptions={{ headerShown: false }} /><StatusBar style="dark" /></SafeAreaProvider>;
}
