import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "@/lib/auth/AuthContext";
import { SplashScreenController } from "@/lib/auth/SplashScreenController";

export default function RootLayout() {
  return (
    <AuthProvider>
      <SplashScreenController />
      <StatusBar style="auto" />
      <RootNavigator />
    </AuthProvider>
  );
}

function RootNavigator() {
  const { profile } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!profile}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="bundle/[slug]" options={{ headerShown: true, title: "" }} />
      </Stack.Protected>

      <Stack.Protected guard={!profile}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}
