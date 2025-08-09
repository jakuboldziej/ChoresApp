import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

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
        name="settings"
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