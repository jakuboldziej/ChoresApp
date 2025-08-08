import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";
import { SessionProvider } from "./(context)/AuthContext";
import { ChoresProvider } from "./(context)/ChoresContext";
import { SplashScreenController } from "./splash";

export default function RootLayout() {
  return (
    <SessionProvider>
      <ChoresProvider>
        <SplashScreenController />
        <StatusBar style="auto" />

        <SafeAreaProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="sign-in" options={{ headerShown: false }} />
          </Stack>
        </SafeAreaProvider>
      </ChoresProvider>
    </SessionProvider>
  );
}
