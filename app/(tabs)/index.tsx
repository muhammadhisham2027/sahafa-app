import { useEffect, useState, useCallback, useRef } from "react";
import {
  View, Text, FlatList, TouchableOpacity, RefreshControl,
  StyleSheet, SafeAreaView, ScrollView, TextInput,
  AppState, type AppStateStatus, useColorScheme,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { fetchArticles, fetchSources, type Article, type DateFilter } from "../../lib/api";
import { getSelectedSources } from "../../lib/preferences";
import { saveCache, loadCache, cacheAgeMinutes } from "../../lib/offline";
import { setupNotifications } from "../../lib/notifications";
import ArticleCard from "../../components/ArticleCard";
import TrendingSection from "../../components/TrendingSection";
import { SkeletonFeed } from "../../components/Skeleton";
import CountryPicker from "../../components/CountryPicker";
import { useTheme, fonts } from "../../lib/theme";

const REGIONS = ["All", "Global", "MENA", "Egypt", "Saudi Arabia", "Europe", "Africa", "Asia", "Americas", "Oceania"];
const CATEGORIES = ["All", "Tech", "Startups", "Dev", "AI"];
const DATE_FILTERS: { label: string; value: DateFilter }[] = [
  { label: "All time", value: "all" },
  { label: "Today", value: "today" },
  { label: "This week", value: "week" },
  { label: "This month", value: "month" },
];

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? t.chipActive : t.chip,
          borderColor: active ? "transparent" : t.border,
        },
      ]}
    >
      <Text style={[styles.chipText, { color: active ? t.chipActiveText : t.chipText, fontFamily: fonts.medium }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function FilterRow({ items, active, onSelect }: { items: string[]; active: string; onSelect: (v: string) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
      {items.map((item) => (
        <Chip key={item} label={item} active={active === item} onPress={() => onSelect(item)} />
      ))}
    </ScrollView>
  );
}

export default function FeedScreen() {
  const t = useTheme();
  const dark = useColorScheme() === "dark";
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [region, setRegion] = useState("All");
  const [country, setCountry] = useState("All");
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
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

  useEffect(() => {
    fetchSources().then((srcs) => {
      const unique = [...new Set(srcs.map((s) => s.country).filter(Boolean))];
      setAvailableCountries(unique);
    }).catch(() => {});
  }, []);

  const load = useCallback(async (reset = false) => {
    const currentPage = reset ? 1 : page;
    if (reset) { setLoading(true); setPage(1); }
    try {
      const { articles: data, total } = await fetchArticles({
        region, country, category, date: dateFilter,
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
  }, [region, country, category, dateFilter, page, selectedSources]);

  useEffect(() => {
    if (selectedSources !== null) load(true);
  }, [region, country, category, dateFilter, selectedSources]);

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

  const showTrending = !search && region === "All" && country === "All" && category === "All" && dateFilter === "all";

  const headerBg = dark ? "rgba(8,8,15,0.95)" : "rgba(242,242,247,0.95)";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]}>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: t.border }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.logo, { color: t.text, fontFamily: fonts.bold }]}>صحافة</Text>
          <Text style={[styles.logoSub, { color: t.textMuted, fontFamily: fonts.regular }]}>Sahafa</Text>
        </View>

        {/* Search */}
        <View style={[styles.searchWrap, { backgroundColor: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }]}>
          <Text style={[styles.searchIcon, { color: t.textMuted }]}>⌕</Text>
          <TextInput
            style={[styles.searchInput, { color: t.text, fontFamily: fonts.regular }]}
            placeholder="Search…"
            placeholderTextColor={t.textMuted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Text style={{ color: t.textMuted, fontSize: 13 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Offline banner */}
      {offline && (
        <View style={styles.offlineBanner}>
          <Text style={[styles.offlineText, { fontFamily: fonts.medium }]}>
            Offline · cached {cacheAge < 60 ? `${cacheAge}m` : `${Math.floor(cacheAge / 60)}h`} ago
          </Text>
        </View>
      )}

      {/* Filters */}
      <View style={[styles.filters, { backgroundColor: headerBg, borderBottomColor: t.border }]}>
        <FilterRow items={REGIONS} active={region} onSelect={(r) => { setRegion(r); setCountry("All"); }} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
          <Chip
            label={country !== "All" ? `🌍 ${country}` : "🌍 Country"}
            active={country !== "All"}
            onPress={() => setCountryPickerVisible(true)}
          />
          {country !== "All" && (
            <Chip label="✕ Clear" active={false} onPress={() => setCountry("All")} />
          )}
        </ScrollView>
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

      <CountryPicker
        visible={countryPickerVisible}
        countries={availableCountries}
        selected={country}
        onSelect={setCountry}
        onClose={() => setCountryPickerVisible(false)}
      />

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
          ListFooterComponent={hasMore && !search ? <View style={{ paddingTop: 4 }}><SkeletonFeed /></View> : null}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={[styles.emptyTitle, { color: t.text, fontFamily: fonts.semibold }]}>
                {search ? "No results" : dateFilter === "today" ? "No articles today yet" : "Nothing here"}
              </Text>
              <Text style={[styles.emptyHint, { color: t.textMuted, fontFamily: fonts.regular }]}>
                {search ? "Try a different keyword" : dateFilter === "today" ? "New articles are fetched daily at 6am" : "Pull down to refresh"}
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingTop: 10, paddingBottom: 100 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  headerLeft: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  logo: { fontSize: 20 },
  logoSub: { fontSize: 12 },

  searchWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 6,
  },
  searchIcon: { fontSize: 15 },
  searchInput: { flex: 1, fontSize: 14 },

  offlineBanner: { backgroundColor: "#CA8A04", paddingVertical: 5, paddingHorizontal: 16 },
  offlineText: { color: "#fff", fontSize: 12, textAlign: "center" },

  filters: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 6,
  },
  filterContent: { paddingHorizontal: 14, paddingTop: 8, paddingBottom: 2, gap: 7 },

  chip: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipText: { fontSize: 12.5 },

  empty: { alignItems: "center", paddingTop: 80, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 16, marginBottom: 6 },
  emptyHint: { fontSize: 13, textAlign: "center", lineHeight: 19 },
});
