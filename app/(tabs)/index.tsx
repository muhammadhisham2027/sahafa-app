import { useEffect, useState, useCallback, useRef } from "react";
import {
  View, Text, FlatList, TouchableOpacity, RefreshControl,
  StyleSheet, SafeAreaView, ScrollView, ActivityIndicator,
  TextInput, AppState, type AppStateStatus,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { fetchArticles, type Article, type DateFilter } from "../../lib/api";
import { getSelectedSources } from "../../lib/preferences";
import ArticleCard from "../../components/ArticleCard";
import { useTheme } from "../../lib/theme";

const REGIONS = ["All", "Global", "MENA", "Egypt", "Saudi Arabia", "Europe", "Africa", "Asia"];
const CATEGORIES = ["All", "Tech", "Startups", "Dev", "AI"];
const DATE_FILTERS: { label: string; value: DateFilter }[] = [
  { label: "All time", value: "all" },
  { label: "Today", value: "today" },
  { label: "This week", value: "week" },
  { label: "This month", value: "month" },
];

export default function FeedScreen() {
  const t = useTheme();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [region, setRegion] = useState("All");
  const [category, setCategory] = useState("All");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSources, setSelectedSources] = useState<string[] | null>(null);
  const lastActiveRef = useRef<number>(Date.now());

  // Load user's source preferences
  useEffect(() => {
    getSelectedSources().then(setSelectedSources);
  }, []);

  const load = useCallback(async (reset = false) => {
    const currentPage = reset ? 1 : page;
    if (reset) { setLoading(true); setPage(1); }
    try {
      const { articles: data, total } = await fetchArticles({
        region,
        category,
        date: dateFilter,
        sources: selectedSources ?? undefined,
        page: currentPage,
      });
      if (reset) { setArticles(data); } else { setArticles((prev) => [...prev, ...data]); }
      setHasMore((currentPage * 30) < (total ?? 0));
    } catch {
      // silent — user can pull to refresh
    }
    setLoading(false);
    setRefreshing(false);
  }, [region, category, dateFilter, page, selectedSources]);

  useEffect(() => {
    if (selectedSources !== null) load(true);
  }, [region, category, dateFilter, selectedSources]);

  // Reload selected sources when tab comes into focus (in case settings changed)
  useFocusEffect(
    useCallback(() => {
      getSelectedSources().then((sources) => {
        setSelectedSources((prev) => {
          const prevStr = JSON.stringify(prev?.sort());
          const nextStr = JSON.stringify(sources?.sort());
          return prevStr !== nextStr ? sources : prev;
        });
      });
    }, [])
  );

  // Auto-refresh when app comes to foreground after 5+ minutes away
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      if (next === "active") {
        const away = Date.now() - lastActiveRef.current;
        if (away > 5 * 60 * 1000) load(true);
      } else {
        lastActiveRef.current = Date.now();
      }
    });
    return () => sub.remove();
  }, [load]);

  const onRefresh = () => { setRefreshing(true); load(true); };
  const onEndReached = () => { if (hasMore && !loading) { setPage((p) => p + 1); load(); } };

  const filtered = search.trim()
    ? articles.filter((a) =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.source_name.toLowerCase().includes(search.toLowerCase())
      )
    : articles;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]}>
      <View style={[styles.header, { borderBottomColor: t.border }]}>
        <View>
          <Text style={[styles.logo, { color: t.text }]}>صحافة</Text>
          <Text style={[styles.subtitle, { color: t.textMuted }]}>Tech news from everywhere</Text>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: t.bgSecondary }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: t.text }]}
          placeholder="Search articles..."
          placeholderTextColor={t.placeholder}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Text style={{ color: t.textMuted, fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Region filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        {REGIONS.map((r) => (
          <TouchableOpacity key={r} onPress={() => setRegion(r)} style={[styles.chip, { backgroundColor: region === r ? t.chipActive : t.chip }]}>
            <Text style={[styles.chipText, { color: region === r ? t.chipActiveText : t.chipText }]}>{r}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity key={c} onPress={() => setCategory(c)} style={[styles.chip, { backgroundColor: category === c ? t.chipActive : t.chip }]}>
            <Text style={[styles.chipText, { color: category === c ? t.chipActiveText : t.chipText }]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Date filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        {DATE_FILTERS.map((d) => (
          <TouchableOpacity key={d.value} onPress={() => setDateFilter(d.value)} style={[styles.chip, { backgroundColor: dateFilter === d.value ? t.chipActive : t.chip }]}>
            <Text style={[styles.chipText, { color: dateFilter === d.value ? t.chipActiveText : t.chipText }]}>{d.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={t.text} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ArticleCard article={item} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.text} />}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          ListFooterComponent={hasMore && !search ? <ActivityIndicator style={{ padding: 16 }} color={t.text} /> : null}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={[styles.emptyText, { color: t.text }]}>{search ? "No results found" : "No articles yet"}</Text>
              <Text style={[styles.emptyHint, { color: t.textMuted }]}>{search ? "Try a different keyword" : "Pull to refresh"}</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, borderBottomWidth: 1 },
  logo: { fontSize: 26, fontWeight: "700" },
  subtitle: { fontSize: 12, marginTop: 1 },
  searchWrap: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginVertical: 10, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, fontSize: 14 },
  filterRow: { flexGrow: 0 },
  filterContent: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginRight: 6 },
  chipText: { fontSize: 13, fontWeight: "500" },
  empty: { alignItems: "center", paddingTop: 80 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 16, fontWeight: "600", marginTop: 12 },
  emptyHint: { fontSize: 13, marginTop: 4 },
});
