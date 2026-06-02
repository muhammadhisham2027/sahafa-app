import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { fetchTrending, type Article } from "../lib/api";
import ArticleCard from "./ArticleCard";
import { useTheme } from "../lib/theme";

export default function TrendingSection() {
  const t = useTheme();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrending().then((data) => {
      setArticles(data);
      setLoading(false);
    });
  }, []);

  if (!loading && articles.length === 0) return null;

  return (
    <View style={[styles.section, { borderBottomColor: t.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: t.text }]}>Trending</Text>
        <Text style={[styles.subtitle, { color: t.textMuted }]}>Last 48 hours</Text>
      </View>
      {loading ? (
        <ActivityIndicator style={{ padding: 20 }} color={t.text} />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} compact />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { borderBottomWidth: 1, paddingBottom: 16 },
  header: { flexDirection: "row", alignItems: "baseline", paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10, gap: 8 },
  title: { fontSize: 16, fontWeight: "700" },
  subtitle: { fontSize: 12 },
  row: { paddingHorizontal: 16 },
});
