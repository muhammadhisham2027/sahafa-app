import { useCallback, useState } from "react";
import { View, Text, FlatList, StyleSheet, SafeAreaView } from "react-native";
import { useFocusEffect } from "expo-router";
import { getBookmarks, type Article } from "../../lib/bookmarks";
import ArticleCard from "../../components/ArticleCard";
import { useTheme, fonts } from "../../lib/theme";

export type { Article };

export default function BookmarksScreen() {
  const t = useTheme();
  const [bookmarks, setBookmarks] = useState<Article[]>([]);

  const load = useCallback(async () => {
    setBookmarks(await getBookmarks());
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]}>
      <View style={[styles.header, { borderBottomColor: t.border, backgroundColor: t.surface }]}>
        <Text style={[styles.title, { color: t.text, fontFamily: fonts.bold }]}>Saved</Text>
        <Text style={[styles.count, { color: t.textMuted, fontFamily: fonts.regular }]}>
          {bookmarks.length} article{bookmarks.length !== 1 ? "s" : ""}
        </Text>
      </View>

      <FlatList
        data={bookmarks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ArticleCard article={item} onBookmarkChange={load} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyTitle, { color: t.text, fontFamily: fonts.semibold }]}>No saved articles</Text>
            <Text style={[styles.emptyHint, { color: t.textMuted, fontFamily: fonts.regular }]}>
              Tap 🏷️ on any article to save it for later
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  title: { fontSize: 22 },
  count: { fontSize: 13 },
  empty: { alignItems: "center", paddingTop: 80, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 16, marginBottom: 6 },
  emptyHint: { fontSize: 13, textAlign: "center", lineHeight: 19 },
});
