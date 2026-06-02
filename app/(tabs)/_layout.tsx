import { Tabs } from "expo-router";
import { useTheme } from "../../lib/theme";

export default function TabLayout() {
  const t = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.text,
        tabBarInactiveTintColor: t.textMuted,
        tabBarStyle: { borderTopColor: t.border, backgroundColor: t.bg },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen name="index"     options={{ title: "Feed",       tabBarIcon: ({ color }) => <TabIcon label="📰" color={color} /> }} />
      <Tabs.Screen name="bookmarks" options={{ title: "Bookmarks",  tabBarIcon: ({ color }) => <TabIcon label="🔖" color={color} /> }} />
      <Tabs.Screen name="subscribe" options={{ title: "Newsletter", tabBarIcon: ({ color }) => <TabIcon label="✉️" color={color} /> }} />
      <Tabs.Screen name="settings"  options={{ title: "Sources",    tabBarIcon: ({ color }) => <TabIcon label="⚙️" color={color} /> }} />
    </Tabs>
  );
}

function TabIcon({ label }: { label: string; color: string }) {
  return <>{label}</>;
}
