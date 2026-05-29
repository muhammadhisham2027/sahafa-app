import { useLocalSearchParams, useRouter } from "expo-router";
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView } from "react-native";
import { WebView } from "react-native-webview";

export default function ArticleScreen() {
  const { url, title } = useLocalSearchParams<{ url: string; title: string }>();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.bar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.barTitle} numberOfLines={1}>{title}</Text>
      </View>
      <WebView source={{ uri: url }} style={styles.web} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  bar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  back: { marginRight: 12 },
  backText: { fontSize: 15, color: "#1a1a1a", fontWeight: "500" },
  barTitle: { flex: 1, fontSize: 13, color: "#555" },
  web: { flex: 1 },
});
