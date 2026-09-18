import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Platform, Text, TextInput, TextProps } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import { Prompt_400Regular, Prompt_500Medium, Prompt_600SemiBold, Prompt_700Bold } from '@expo-google-fonts/prompt';
import { Fonts } from '@/constants/theme';
import { AppDialogHost } from '@/components/AppDialog';
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
  const [loaded] = useFonts({ Prompt_400Regular, Prompt_500Medium, Prompt_600SemiBold, Prompt_700Bold });
  const [brandReady, setBrandReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    textDefaults.defaultProps = { ...textDefaults.defaultProps, style: [{ fontFamily: Fonts.sans }, textDefaults.defaultProps?.style] };
    inputDefaults.defaultProps = { ...inputDefaults.defaultProps, style: [{ fontFamily: Fonts.sans }, inputDefaults.defaultProps?.style] };
  }, []);

  useEffect(() => {
    let active = true;
    void Image.loadAsync(require('@/assets/images/plandee-premium-mark.png')).catch(() => undefined).finally(() => { if (active) setBrandReady(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => { if (authReady && loaded && brandReady) void SplashScreen.hideAsync(); }, [authReady, loaded, brandReady]);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (active) setSession(data.session);
        if (data.session) { await ensureProfile(); await hydrateCloudData(); }
      } catch {
        // Let the screens surface their own retry state instead of blocking launch.
      } finally {
        if (active) setAuthReady(true);
      }
    })();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void (async () => {
        try {
          if (nextSession) { await ensureProfile(); await hydrateCloudData(); }
        } catch {
          // A temporary data fetch failure should not trap the user on the splash screen.
        } finally {
          if (active) {
            setSession(nextSession);
            setAuthReady(true);
          }
        }
      })();
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authReady || !loaded) return;
    if (segments[0] === '(tabs)' && !session) router.replace('/login');
  }, [authReady, loaded, router, segments, session]);

  useEffect(() => {
    if (Platform.OS === 'web' || !authReady || !session) return;
    let handledId = '';
    const openTask = (response: Notifications.NotificationResponse | null) => {
      const data = response?.notification.request.content.data;
      if (data?.kind !== 'plandee-task-due' || data.userId !== session.user.id || typeof data.taskId !== 'string') return;
      if (response?.notification.request.identifier === handledId) return;
      handledId = response?.notification.request.identifier ?? '';
      router.push({ pathname: '/event/checklist-edit', params: { id: data.taskId } });
      void Notifications.clearLastNotificationResponseAsync();
    };
    void Notifications.getLastNotificationResponseAsync().then(openTask).catch(() => undefined);
    const subscription = Notifications.addNotificationResponseReceivedListener(openTask);
    return () => subscription.remove();
  }, [authReady, router, session]);

  if (!authReady || !loaded || !brandReady) return null;
  return <SafeAreaProvider><Stack screenOptions={{ headerShown: false }} /><AppDialogHost /><StatusBar style="dark" /></SafeAreaProvider>;
}
