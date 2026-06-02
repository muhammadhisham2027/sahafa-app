import { Tabs } from "expo-router";
import { StyleSheet, View, useColorScheme } from "react-native";
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
        tabBarShowIcon: false,
        tabBarIcon: () => <View />,
        tabBarStyle: {
          borderTopColor: t.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          backgroundColor: dark ? "#0F0F14" : "#FFFFFF",
          elevation: 0,
          shadowOpacity: 0,
          height: 56,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: fonts.semibold,
          marginBottom: 10,
        },
      }}
    >
      <Tabs.Screen name="index"     options={{ title: "Feed" }} />
      <Tabs.Screen name="bookmarks" options={{ title: "Saved" }} />
      <Tabs.Screen name="subscribe" options={{ title: "Newsletter" }} />
      <Tabs.Screen name="settings"  options={{ title: "Sources" }} />
    </Tabs>
  );
}
