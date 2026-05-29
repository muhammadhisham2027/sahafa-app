import { useCallback, useState } from "react";
import { View, Text, FlatList, StyleSheet, SafeAreaView } from "react-native";
import { useFocusEffect } from "expo-router";
import { getBookmarks, type Article } from "../../lib/bookmarks";
import ArticleCard from "../../components/ArticleCard";
import { useTheme } from "../../lib/theme";

// Re-export Article type for bookmarks lib
export type { Article };

export default function BookmarksScreen() {
  const t = useTheme();
  const [bookmarks, setBookmarks] = useState<Article[]>([]);

  const load = useCallback(async () => {
    const saved = await getBookmarks();
    setBookmarks(saved);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]}>
      <View style={[styles.header, { borderBottomColor: t.border }]}>
        <Text style={[styles.title, { color: t.text }]}>Bookmarks</Text>
        <Text style={[styles.subtitle, { color: t.textMuted }]}>{bookmarks.length} saved article{bookmarks.length !== 1 ? "s" : ""}</Text>
      </View>

      <FlatList
        data={bookmarks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ArticleCard article={item} onBookmarkChange={load} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔖</Text>
            <Text style={[styles.emptyText, { color: t.text }]}>No bookmarks yet</Text>
            <Text style={[styles.emptyHint, { color: t.textMuted }]}>Tap 🏷️ on any article to save it</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, borderBottomWidth: 1 },
  title: { fontSize: 26, fontWeight: "700" },
  subtitle: { fontSize: 12, marginTop: 2 },
  empty: { alignItems: "center", paddingTop: 80 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 16, fontWeight: "600", marginTop: 12 },
  emptyHint: { fontSize: 13, marginTop: 4 },
});
