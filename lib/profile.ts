import { supabase } from '@/lib/supabase';

export const userDisplayName = (user: { email?: string | null; user_metadata?: Record<string, unknown> }) => {
  const metadata = user.user_metadata ?? {};
  const name = metadata.display_name ?? metadata.full_name ?? metadata.name;
  return typeof name === 'string' && name.trim() ? name.trim() : user.email?.split('@')[0] ?? 'ผู้ใช้ใหม่';
};

export async function ensureProfile() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return { error: userError ?? new Error('No authenticated user') };
  const user = userData.user;
  return supabase.from('profiles').upsert({ id: user.id, display_name: userDisplayName(user) }, { onConflict: 'id', ignoreDuplicates: true });
}
