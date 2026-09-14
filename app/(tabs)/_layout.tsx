import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Tabs } from 'expo-router';
import { Fonts, Theme } from '@/constants/theme';

export default function TabLayout() {
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: Theme.colors.primary, tabBarInactiveTintColor: Theme.colors.muted, tabBarLabelStyle: { fontSize: 11, fontFamily: Fonts.sans }, tabBarStyle: { height: 78, paddingTop: 8, borderTopColor: Theme.colors.border, backgroundColor: Theme.colors.surface } }}><Tabs.Screen name="index" options={{ title: 'หน้าหลัก', tabBarIcon: ({ color, size }) => <FontAwesome6 name="house" color={color} size={size ?? 22} solid /> }} /><Tabs.Screen name="events" options={{ title: 'งานของฉัน', tabBarIcon: ({ color, size }) => <FontAwesome6 name="calendar" color={color} size={size ?? 22} /> }} /><Tabs.Screen name="budget" options={{ title: 'งบประมาณ', tabBarIcon: ({ color, size }) => <FontAwesome6 name="coins" color={color} size={size ?? 22} solid /> }} /><Tabs.Screen name="profile" options={{ title: 'โปรไฟล์', tabBarIcon: ({ color, size }) => <FontAwesome6 name="user" color={color} size={size ?? 22} solid /> }} /></Tabs>;
}
