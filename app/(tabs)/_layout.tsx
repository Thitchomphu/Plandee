import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Fonts, Theme } from '@/constants/theme';

export default function TabLayout() {
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: Theme.colors.heroProgress, tabBarInactiveTintColor: Theme.colors.heroMuted, tabBarLabelStyle: { fontSize: 12, fontFamily: Fonts.sansMedium }, tabBarStyle: { height: 78, paddingTop: 8, borderTopWidth: 0, backgroundColor: 'transparent' }, tabBarBackground: () => <LinearGradient colors={Theme.gradients.tab} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} /> }}><Tabs.Screen name="index" options={{ title: 'หน้าหลัก', tabBarIcon: ({ color, size }) => <FontAwesome6 name="house" color={color} size={size ?? 22} solid /> }} /><Tabs.Screen name="events" options={{ title: 'งานของฉัน', tabBarIcon: ({ color, size }) => <FontAwesome6 name="calendar" color={color} size={size ?? 22} /> }} /><Tabs.Screen name="budget" options={{ title: 'งบรวม', tabBarIcon: ({ color, size }) => <FontAwesome6 name="coins" color={color} size={size ?? 22} solid /> }} /><Tabs.Screen name="profile" options={{ title: 'โปรไฟล์', tabBarIcon: ({ color, size }) => <FontAwesome6 name="user" color={color} size={size ?? 22} solid /> }} /></Tabs>;
}
