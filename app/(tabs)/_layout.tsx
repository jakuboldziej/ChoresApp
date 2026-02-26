import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useChoresWebSocket } from '@/lib/websocket/useWebSocket';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect } from 'react';
import { useSession } from '../(context)/AuthContext';
import { useChores } from '../(context)/ChoresContext';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { user } = useSession();
  const { dailyResetEvent } = useChoresWebSocket();
  const { fetchData } = useChores();

  useEffect(() => {
    if (dailyResetEvent && user?._id) {
      fetchData({ userId: user._id });
    }
  }, [dailyResetEvent, fetchData, user?._id]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#e4432eff',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#25292e',
          paddingBottom: insets.bottom,
          height: 49 + insets.bottom,

        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="chores"
        options={{
          title: 'Obowiązki',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'trail-sign' : 'trail-sign-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="daily-chores"
        options={{
          title: 'Dzienne obowiązki',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'today' : 'today-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person-sharp' : 'person-outline'} color={color} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}