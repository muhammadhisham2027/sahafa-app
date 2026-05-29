import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1a1a1a",
        tabBarInactiveTintColor: "#aaa",
        tabBarStyle: { borderTopColor: "#f0f0f0" },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Feed", tabBarIcon: ({ color }) => <TabIcon label="📰" color={color} /> }} />
      <Tabs.Screen name="subscribe" options={{ title: "Newsletter", tabBarIcon: ({ color }) => <TabIcon label="✉️" color={color} /> }} />
    </Tabs>
  );
}

function TabIcon({ label }: { label: string; color: string }) {
  return <>{label}</>;
}
