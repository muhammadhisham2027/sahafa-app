import { useEffect, useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity, RefreshControl,
  StyleSheet, SafeAreaView, ScrollView, ActivityIndicator,
} from "react-native";
import { fetchArticles, type Article } from "../../lib/api";
import ArticleCard from "../../components/ArticleCard";

const REGIONS = ["All", "Global", "MENA", "Egypt", "Saudi Arabia", "Europe", "Africa", "Asia"];
const CATEGORIES = ["All", "Tech", "Startups", "Dev", "AI"];

export default function FeedScreen() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [region, setRegion] = useState("All");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const load = useCallback(async (reset = false) => {
    const currentPage = reset ? 1 : page;
    if (reset) { setLoading(true); setPage(1); }

    const { articles: data, total } = await fetchArticles({ region, category, page: currentPage });

    if (reset) {
      setArticles(data);
    } else {
      setArticles((prev) => [...prev, ...data]);
    }
    setHasMore((currentPage * 30) < total);
    setLoading(false);
    setRefreshing(false);
  }, [region, category, page]);

  useEffect(() => { load(true); }, [region, category]);

  const onRefresh = () => { setRefreshing(true); load(true); };
  const onEndReached = () => { if (hasMore && !loading) { setPage((p) => p + 1); load(); } };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>صحافة</Text>
        <Text style={styles.subtitle}>Tech news from everywhere</Text>
      </View>

      {/* Region filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        {REGIONS.map((r) => (
          <TouchableOpacity key={r} onPress={() => setRegion(r)} style={[styles.chip, region === r && styles.chipActive]}>
            <Text style={[styles.chipText, region === r && styles.chipTextActive]}>{r}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity key={c} onPress={() => setCategory(c)} style={[styles.chip, category === c && styles.chipActive]}>
            <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#1a1a1a" />
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ArticleCard article={item} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          ListFooterComponent={hasMore ? <ActivityIndicator style={{ padding: 16 }} color="#1a1a1a" /> : null}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>No articles yet</Text>
              <Text style={styles.emptyHint}>Pull to refresh or change filters</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  logo: { fontSize: 26, fontWeight: "700", color: "#1a1a1a" },
  subtitle: { fontSize: 12, color: "#999", marginTop: 1 },
  filterRow: { flexGrow: 0, marginTop: 8 },
  filterContent: { paddingHorizontal: 16, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: "#f3f3f3", marginRight: 6 },
  chipActive: { backgroundColor: "#1a1a1a" },
  chipText: { fontSize: 13, color: "#555", fontWeight: "500" },
  chipTextActive: { color: "#fff" },
  empty: { alignItems: "center", paddingTop: 80 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 16, fontWeight: "600", color: "#1a1a1a", marginTop: 12 },
  emptyHint: { fontSize: 13, color: "#aaa", marginTop: 4 },
});
