import '../global.css';

import ConnectionBanner from '@/components/ConnectionBanner';
import webSocketService from '@/lib/websocket/WebSocketService';
import { setNotificationHandler } from 'expo-notifications';
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SessionProvider, useSession } from "./(context)/AuthContext";
import { ChoresProvider } from "./(context)/ChoresContext";
import { FriendsProvider } from "./(context)/FriendsContext";
import { SplashScreenController } from "./splash";

setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const { session, user } = useSession();

  useEffect(() => {
    if (user) {
      webSocketService.authenticateUser(user.displayName, user._id);
    } else if (session === null) {
      webSocketService.disconnect();
    }
  }, [session, user]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SessionProvider>
        <FriendsProvider>
          <ChoresProvider>
            <SplashScreenController />
            <StatusBar style="dark" />

            <SafeAreaProvider>
              <ConnectionBanner />

              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="sign-in" options={{ headerShown: false }} />
                <Stack.Screen name="chore/[id]" options={{ headerShown: false }} />
              </Stack>
            </SafeAreaProvider>
          </ChoresProvider>
        </FriendsProvider>
      </SessionProvider>
    </GestureHandlerRootView>
  );
}
