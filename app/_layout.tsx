import { useEffect, useRef, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { useTheme } from "../lib/theme";
import { isOnboardingDone } from "../lib/preferences";

export default function RootLayout() {
  const t = useTheme();
  const [checked, setChecked] = useState(false);
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (!fontsLoaded) return;
    isOnboardingDone().then((done) => {
      setChecked(true);
      if (!done) router.replace("/onboarding");
    });
  }, [fontsLoaded]);

  if (!fontsLoaded || !checked) return null;

  return (
    <>
      <StatusBar style={t.statusBar} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen
          name="article"
          options={{
            headerShown: true,
            headerTitle: "",
            headerBackTitle: "Back",
            presentation: "card",
            headerStyle: { backgroundColor: t.surface },
            headerTintColor: t.text,
            headerShadowVisible: false,
          }}
        />
      </Stack>
    </>
  );
}
