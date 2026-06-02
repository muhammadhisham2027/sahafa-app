import { Tabs } from "expo-router";
import { useTheme, fonts } from "../../lib/theme";

export default function TabLayout() {
  const t = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.text,
        tabBarInactiveTintColor: t.textMuted,
        tabBarStyle: {
          borderTopColor: t.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          backgroundColor: t.surface,
          elevation: 0,
          shadowOpacity: 0,
        },
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

import { StyleSheet } from "react-native";
