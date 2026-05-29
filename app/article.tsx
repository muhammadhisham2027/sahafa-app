import { useLocalSearchParams, useRouter } from "expo-router";
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView, Share } from "react-native";
import { WebView } from "react-native-webview";
import { useTheme } from "../lib/theme";

export default function ArticleScreen() {
  const { url, title } = useLocalSearchParams<{ url: string; title: string }>();
  const router = useRouter();
  const t = useTheme();

  const shareArticle = async () => {
    await Share.share({ title, url, message: `${title}\n${url}` });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]}>
      <View style={[styles.bar, { borderBottomColor: t.border, backgroundColor: t.bg }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={[styles.backText, { color: t.text }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.barTitle, { color: t.textSecondary }]} numberOfLines={1}>{title}</Text>
        <TouchableOpacity onPress={shareArticle} style={styles.share}>
          <Text style={[styles.shareText, { color: t.text }]}>↗</Text>
        </TouchableOpacity>
      </View>
      <WebView source={{ uri: url }} style={styles.web} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  back: { marginRight: 12 },
  backText: { fontSize: 15, fontWeight: "500" },
  barTitle: { flex: 1, fontSize: 13 },
  share: { marginLeft: 12 },
  shareText: { fontSize: 18, fontWeight: "600" },
  web: { flex: 1 },
});
