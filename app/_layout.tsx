import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useTheme } from "../lib/theme";
import { isOnboardingDone } from "../lib/preferences";

export default function RootLayout() {
  const t = useTheme();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    isOnboardingDone().then((done) => {
      setChecked(true);
      if (!done) router.replace("/onboarding");
    });
  }, []);

  if (!checked) return null;

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
            headerStyle: { backgroundColor: t.bg },
            headerTintColor: t.text,
          }}
        />
      </Stack>
    </>
  );
}
