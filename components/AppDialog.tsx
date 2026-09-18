import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Alert as NativeAlert, Modal, Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { Theme } from '@/constants/theme';

type Button = { text?: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' };
type Dialog = { title: string; message?: string; buttons: Button[] };
let present: ((dialog: Dialog) => void) | null = null;

export const Alert = {
  alert(title: string, message?: string, buttons?: Button[]) {
    const next = { title, message, buttons: buttons?.length ? buttons : [{ text: 'ตกลง' }] };
    if (present) present(next);
    else NativeAlert.alert(title, message, buttons);
  },
};

export function AppDialogHost() {
  const [dialog, setDialog] = useState<Dialog | null>(null);
  useEffect(() => { present = setDialog; return () => { present = null; }; }, []);
  const choose = (button: Button) => { setDialog(null); button.onPress?.(); };
  return <Modal transparent visible={!!dialog} animationType="fade" onRequestClose={() => setDialog(null)} statusBarTranslucent>
    <View style={styles.scrim}><View style={styles.card}>
      <LinearGradient colors={Theme.gradients.soft} style={styles.top}><Text style={styles.title}>{dialog?.title}</Text>{dialog?.message ? <Text style={styles.message}>{dialog.message}</Text> : null}</LinearGradient>
      <View style={styles.actions}>{dialog?.buttons.map((button, index) => <Pressable key={`${button.text}-${index}`} accessibilityRole="button" onPress={() => choose(button)} style={[styles.action, button.style === 'cancel' && styles.cancelAction, button.style === 'destructive' && styles.destructiveAction]}><Text style={[styles.actionText, button.style === 'cancel' && styles.cancelText]}>{button.text ?? 'ตกลง'}</Text></Pressable>)}</View>
    </View></View>
  </Modal>;
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(30,18,35,0.57)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 380, borderRadius: 24, overflow: 'hidden', backgroundColor: Theme.colors.surface },
  top: { padding: 22, gap: 8 }, title: { color: Theme.colors.text, fontSize: 20, fontWeight: '800' }, message: { color: Theme.colors.muted, fontSize: Theme.type.body, lineHeight: 25 },
  actions: { padding: 16, gap: 8 }, action: { minHeight: 48, borderRadius: 14, backgroundColor: Theme.colors.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  cancelAction: { backgroundColor: Theme.colors.input }, destructiveAction: { backgroundColor: '#A42B55' },
  actionText: { color: '#FFFFFF', fontSize: Theme.type.label, fontWeight: '700' }, cancelText: { color: Theme.colors.text },
});
