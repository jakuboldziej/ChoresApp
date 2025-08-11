import { setNotificationHandler } from 'expo-notifications';
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";
import { SessionProvider } from "./(context)/AuthContext";
import { ChoresProvider } from "./(context)/ChoresContext";
import { SplashScreenController } from "./splash";

setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SessionProvider>
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
      </SessionProvider>
    </GestureHandlerRootView>
  );
}
