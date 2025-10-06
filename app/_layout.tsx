import '../global.css';

import { setNotificationHandler } from 'expo-notifications';
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SessionProvider } from "./(context)/AuthContext";
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
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SessionProvider>
        <FriendsProvider>
          <ChoresProvider>
            <SplashScreenController />
            <StatusBar style="auto" />

            <SafeAreaProvider>
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
