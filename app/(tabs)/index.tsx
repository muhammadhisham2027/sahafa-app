import { useEffect, useState, useCallback, useRef } from "react";
import {
  View, Text, FlatList, TouchableOpacity, RefreshControl,
  StyleSheet, SafeAreaView, ScrollView, TextInput,
  AppState, type AppStateStatus,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { fetchArticles, type Article, type DateFilter } from "../../lib/api";
import { getSelectedSources } from "../../lib/preferences";
import { saveCache, loadCache, cacheAgeMinutes } from "../../lib/offline";
import { setupNotifications } from "../../lib/notifications";
import ArticleCard from "../../components/ArticleCard";
import TrendingSection from "../../components/TrendingSection";
import { SkeletonFeed } from "../../components/Skeleton";
import { useTheme, fonts } from "../../lib/theme";

const REGIONS = ["All", "Global", "MENA", "Egypt", "Saudi Arabia", "Europe", "Africa", "Asia"];
const CATEGORIES = ["All", "Tech", "Startups", "Dev", "AI"];
const DATE_FILTERS: { label: string; value: DateFilter }[] = [
  { label: "All time", value: "all" },
  { label: "Today", value: "today" },
  { label: "This week", value: "week" },
  { label: "This month", value: "month" },
];

function FilterRow({ items, active, onSelect }: { items: string[]; active: string; onSelect: (v: string) => void }) {
  const t = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterRow}
      contentContainerStyle={styles.filterContent}
    >
      {items.map((item) => {
        const isActive = active === item;
        return (
          <TouchableOpacity
            key={item}
            onPress={() => onSelect(item)}
            style={[styles.chip, { backgroundColor: isActive ? t.chipActive : t.chip }]}
          >
            <Text style={[styles.chipText, { color: isActive ? t.chipActiveText : t.chipText, fontFamily: fonts.medium }]}>
              {item}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

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
  const [offline, setOffline] = useState(false);
  const [cacheAge, setCacheAge] = useState(0);
  const lastActiveRef = useRef<number>(Date.now());
  const notifSetupRef = useRef(false);

  useEffect(() => {
    if (!notifSetupRef.current) {
      notifSetupRef.current = true;
      setupNotifications();
    }
  }, []);

  useEffect(() => {
    getSelectedSources().then(setSelectedSources);
  }, []);

  const load = useCallback(async (reset = false) => {
    const currentPage = reset ? 1 : page;
    if (reset) { setLoading(true); setPage(1); }
    try {
      const { articles: data, total } = await fetchArticles({
        region, category, date: dateFilter,
        sources: selectedSources ?? undefined,
        page: currentPage,
      });
      if (reset) {
        setArticles(data);
        setOffline(false);
        if (data.length > 0) saveCache(data, total ?? 0);
      } else {
        setArticles((prev) => [...prev, ...data]);
      }
      setHasMore((currentPage * 30) < (total ?? 0));
    } catch {
      if (reset) {
        const cached = await loadCache();
        if (cached) {
          setArticles(cached.articles);
          setHasMore(false);
          setOffline(true);
          setCacheAge(cacheAgeMinutes(cached.timestamp));
        }
      }
    }
    setLoading(false);
    setRefreshing(false);
  }, [region, category, dateFilter, page, selectedSources]);

  useEffect(() => {
    if (selectedSources !== null) load(true);
  }, [region, category, dateFilter, selectedSources]);

  useFocusEffect(
    useCallback(() => {
      getSelectedSources().then((sources) => {
        setSelectedSources((prev) => {
          const a = JSON.stringify(prev?.slice().sort());
          const b = JSON.stringify(sources?.slice().sort());
          return a !== b ? sources : prev;
        });
      });
    }, [])
  );

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      if (next === "active") {
        if (Date.now() - lastActiveRef.current > 5 * 60 * 1000) load(true);
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
        a.source_name.toLowerCase().includes(search.toLowerCase()))
    : articles;

  const showTrending = !search && region === "All" && category === "All" && dateFilter === "all";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: t.border, backgroundColor: t.surface }]}>
        <Text style={[styles.logo, { color: t.text, fontFamily: fonts.bold }]}>صحافة</Text>
        <Text style={[styles.logoSub, { color: t.textMuted, fontFamily: fonts.regular }]}>Sahafa</Text>
      </View>

      {/* Offline banner */}
      {offline && (
        <View style={styles.offlineBanner}>
          <Text style={[styles.offlineText, { fontFamily: fonts.medium }]}>
            Offline · cached {cacheAge < 60 ? `${cacheAge}m` : `${Math.floor(cacheAge / 60)}h`} ago
          </Text>
        </View>
      )}

      {/* Search */}
      <View style={[styles.searchRow, { borderBottomColor: t.border, backgroundColor: t.surface }]}>
        <View style={[styles.searchWrap, { backgroundColor: t.bgSecondary }]}>
          <Text style={[styles.searchIcon, { color: t.textMuted }]}>⌕</Text>
          <TextInput
            style={[styles.searchInput, { color: t.text, fontFamily: fonts.regular }]}
            placeholder="Search articles…"
            placeholderTextColor={t.placeholder}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Text style={{ color: t.textMuted, fontSize: 14 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <View style={[styles.filters, { borderBottomColor: t.border, backgroundColor: t.surface }]}>
        <FilterRow items={REGIONS} active={region} onSelect={setRegion} />
        <FilterRow items={CATEGORIES} active={category} onSelect={setCategory} />
        <FilterRow
          items={DATE_FILTERS.map((d) => d.label)}
          active={DATE_FILTERS.find((d) => d.value === dateFilter)?.label ?? "All time"}
          onSelect={(label) => {
            const found = DATE_FILTERS.find((d) => d.label === label);
            if (found) setDateFilter(found.value);
          }}
        />
      </View>

      {/* Feed */}
      {loading ? (
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={<SkeletonFeed />}
          keyExtractor={(_, i) => String(i)}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ArticleCard article={item} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.text} />}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          ListHeaderComponent={showTrending ? <TrendingSection /> : null}
          ListFooterComponent={hasMore && !search ? (
            <View style={styles.loadingMore}>
              <SkeletonFeed />
            </View>
          ) : null}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={[styles.emptyTitle, { color: t.text, fontFamily: fonts.semibold }]}>
                {search ? "No results" : dateFilter === "today" ? "No articles today yet" : "Nothing here"}
              </Text>
              <Text style={[styles.emptyHint, { color: t.textMuted, fontFamily: fonts.regular }]}>
                {search
                  ? "Try a different keyword"
                  : dateFilter === "today"
                  ? "New articles are fetched daily at 6am"
                  : "Pull down to refresh"}
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  logo: { fontSize: 22 },
  logoSub: { fontSize: 13 },
  offlineBanner: { backgroundColor: "#CA8A04", paddingVertical: 5, paddingHorizontal: 16 },
  offlineText: { color: "#fff", fontSize: 12, textAlign: "center" },
  searchRow: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 6,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14 },
  filters: { borderBottomWidth: StyleSheet.hairlineWidth, paddingBottom: 4 },
  filterRow: { flexGrow: 0 },
  filterContent: { paddingHorizontal: 12, paddingTop: 6, paddingBottom: 2, gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginRight: 4 },
  chipText: { fontSize: 12 },
  empty: { alignItems: "center", paddingTop: 80, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 16, marginBottom: 6 },
  emptyHint: { fontSize: 13, textAlign: "center", lineHeight: 19 },
  loadingMore: { paddingTop: 4 },
});
