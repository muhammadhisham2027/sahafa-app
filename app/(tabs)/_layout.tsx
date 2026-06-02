import { Tabs } from "expo-router";
import { StyleSheet, useColorScheme } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme, fonts } from "../../lib/theme";

export default function TabLayout() {
  const t = useTheme();
  const dark = useColorScheme() === "dark";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.text,
        tabBarInactiveTintColor: t.textMuted,
        tabBarStyle: {
          position: "absolute",
          borderTopColor: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
          borderTopWidth: StyleSheet.hairlineWidth,
          backgroundColor: "transparent",
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint={dark ? "dark" : "light"}
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: fonts.semibold,
          marginBottom: 2,
        },
        tabBarShowIcon: false,
      }}
    >
      <Tabs.Screen name="index"     options={{ title: "Feed" }} />
      <Tabs.Screen name="bookmarks" options={{ title: "Saved" }} />
      <Tabs.Screen name="subscribe" options={{ title: "Newsletter" }} />
      <Tabs.Screen name="settings"  options={{ title: "Sources" }} />
    </Tabs>
  );
}
