import { useEffect, useState, useCallback, useRef } from "react";
import {
  View, Text, FlatList, TouchableOpacity, RefreshControl,
  StyleSheet, ScrollView, TextInput,
  AppState, type AppStateStatus, useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
  const [searchFocused, setSearchFocused] = useState(false);
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

  useEffect(() => { getSelectedSources().then(setSelectedSources); }, []);

  useEffect(() => {
    fetchSources().then((srcs) => {
      setAvailableCountries([...new Set(srcs.map((s) => s.country).filter(Boolean))]);
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

  useFocusEffect(useCallback(() => {
    getSelectedSources().then((sources) => {
      setSelectedSources((prev) => {
        const a = JSON.stringify(prev?.slice().sort());
        const b = JSON.stringify(sources?.slice().sort());
        return a !== b ? sources : prev;
      });
    });
  }, []));

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

  const cycleCat = () => {
    const i = CATEGORIES.indexOf(category);
    setCategory(CATEGORIES[(i + 1) % CATEGORIES.length]);
  };

  const cycleDate = () => {
    const i = DATE_FILTERS.findIndex((d) => d.value === dateFilter);
    setDateFilter(DATE_FILTERS[(i + 1) % DATE_FILTERS.length].value);
  };

  const onRefresh = () => { setRefreshing(true); load(true); };
  const onEndReached = () => { if (hasMore && !loading) { setPage((p) => p + 1); load(); } };

  const filtered = search.trim()
    ? articles.filter((a) =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.source_name.toLowerCase().includes(search.toLowerCase()))
    : articles;

  const showTrending = !search && region === "All" && country === "All" && category === "All" && dateFilter === "all";

  const bg = dark ? "#08080F" : "#F2F2F7";
  const headerBg = dark ? "#0F0F14" : "#FFFFFF";
  const inputBg = dark ? "#1C1C1E" : "#F2F2F7";
  const dateLabel = DATE_FILTERS.find((d) => d.value === dateFilter)?.label ?? "All time";
  const catActive = category !== "All";
  const dateActive = dateFilter !== "all";
  const countryActive = country !== "All";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={["top"]}>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: t.border }]}>
        <View style={styles.headerTop}>
          <View style={styles.logoBlock}>
            <Text style={[styles.logo, { color: t.text, fontFamily: fonts.bold }]}>صحافة</Text>
            <Text style={[styles.logoSub, { color: t.textMuted, fontFamily: fonts.regular }]}>Sahafa</Text>
          </View>

          {/* Search */}
          <View style={[styles.searchWrap, { backgroundColor: inputBg }]}>
            <Text style={{ color: t.textMuted, fontSize: 14 }}>⌕</Text>
            <TextInput
              style={[styles.searchInput, { color: t.text, fontFamily: fonts.regular }]}
              placeholder="Search…"
              placeholderTextColor={t.textMuted}
              value={search}
              onChangeText={setSearch}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Text style={{ color: t.textMuted, fontSize: 13 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Region row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.regionRow}
        >
          {REGIONS.map((r) => {
            const active = region === r;
            return (
              <TouchableOpacity
                key={r}
                onPress={() => { setRegion(r); setCountry("All"); }}
                style={[styles.regionChip, {
                  backgroundColor: active ? t.text : "transparent",
                }]}
              >
                <Text style={[styles.regionChipText, {
                  color: active ? (dark ? "#08080F" : "#FFFFFF") : t.textMuted,
                  fontFamily: active ? fonts.semibold : fonts.regular,
                }]}>
                  {r}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Compact secondary filters */}
        <View style={styles.secondaryRow}>
          <TouchableOpacity
            onPress={cycleCat}
            style={[styles.filterPill, {
              backgroundColor: catActive ? t.text : inputBg,
              borderColor: catActive ? "transparent" : t.border,
            }]}
          >
            <Text style={[styles.filterPillText, {
              color: catActive ? (dark ? "#08080F" : "#FFFFFF") : t.textMuted,
              fontFamily: fonts.medium,
            }]}>
              {category}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={cycleDate}
            style={[styles.filterPill, {
              backgroundColor: dateActive ? t.text : inputBg,
              borderColor: dateActive ? "transparent" : t.border,
            }]}
          >
            <Text style={[styles.filterPillText, {
              color: dateActive ? (dark ? "#08080F" : "#FFFFFF") : t.textMuted,
              fontFamily: fonts.medium,
            }]}>
              {dateLabel}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCountryPickerVisible(true)}
            style={[styles.filterPill, {
              backgroundColor: countryActive ? t.text : inputBg,
              borderColor: countryActive ? "transparent" : t.border,
            }]}
          >
            <Text style={[styles.filterPillText, {
              color: countryActive ? (dark ? "#08080F" : "#FFFFFF") : t.textMuted,
              fontFamily: fonts.medium,
            }]}>
              {countryActive ? country : "🌍 Country"}
            </Text>
          </TouchableOpacity>

          {countryActive && (
            <TouchableOpacity onPress={() => setCountry("All")} style={styles.clearBtn}>
              <Text style={{ color: t.textMuted, fontSize: 12 }}>✕</Text>
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

      <CountryPicker
        visible={countryPickerVisible}
        countries={availableCountries}
        selected={country}
        onSelect={setCountry}
        onClose={() => setCountryPickerVisible(false)}
      />

      {/* Feed */}
      {loading ? (
        <SkeletonFeed />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ArticleCard article={item} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.text} />}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          ListHeaderComponent={showTrending ? <TrendingSection /> : null}
          ListFooterComponent={hasMore && !search ? <SkeletonFeed /> : null}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={[styles.emptyTitle, { color: t.text, fontFamily: fonts.semibold }]}>
                {search ? "No results" : "Nothing here"}
              </Text>
              <Text style={[styles.emptyHint, { color: t.textMuted, fontFamily: fonts.regular }]}>
                {search ? "Try a different keyword" : "Pull down to refresh"}
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 80 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 10,
  },
  logoBlock: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  logo: { fontSize: 20 },
  logoSub: { fontSize: 12 },

  searchWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  searchInput: { flex: 1, fontSize: 14 },

  regionRow: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    gap: 4,
  },
  regionChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  regionChipText: { fontSize: 13 },

  secondaryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 6,
    gap: 8,
    flexWrap: "wrap",
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  filterPillText: { fontSize: 12 },
  clearBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  offlineBanner: { backgroundColor: "#CA8A04", paddingVertical: 5, paddingHorizontal: 16 },
  offlineText: { color: "#fff", fontSize: 12, textAlign: "center" },

  empty: { alignItems: "center", paddingTop: 80, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 16, marginBottom: 6 },
  emptyHint: { fontSize: 13, textAlign: "center", lineHeight: 19 },
});
