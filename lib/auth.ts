import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export async function signInWithPassword(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email: email.trim(), password });
}

export async function signUpWithPassword(email: string, password: string) {
  return supabase.auth.signUp({ email: email.trim(), password });
}

export async function signInWithGoogle() {
  const redirectTo = Linking.createURL('auth/callback');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });

  if (error) return { data: null, error };
  if (!data?.url) return { data: null, error: new Error('Google login URL was not returned') };

  const browserResult = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (browserResult.type !== 'success' || !browserResult.url) {
    return { data: null, error: new Error('Google login was cancelled') };
  }

  const params = new URL(browserResult.url).hash.replace(/^#/, '').split('&').reduce<Record<string, string>>((values, pair) => {
    const [key, value = ''] = pair.split('=');
    if (key) values[key] = decodeURIComponent(value);
    return values;
  }, {});
  if (!params.access_token || !params.refresh_token) {
    return { data: null, error: new Error('Google login did not return a session') };
  }

  const sessionResult = await supabase.auth.setSession({ access_token: params.access_token, refresh_token: params.refresh_token });
  return sessionResult;
}

export async function getCurrentSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
