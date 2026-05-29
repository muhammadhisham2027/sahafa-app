import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../lib/theme";

export default function RootLayout() {
  const t = useTheme();
  return (
    <>
      <StatusBar style={t.statusBar} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.bg } }}>
        <Stack.Screen name="(tabs)" />
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
