import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { fetchTrending, type Article } from "../lib/api";
import ArticleCard from "./ArticleCard";
import { SkeletonBox } from "./Skeleton";
import { useTheme, fonts } from "../lib/theme";

function TrendingSkeleton() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={{ width: 172, gap: 8, padding: 12 }}>
          <SkeletonBox width={60} height={10} />
          <SkeletonBox width="100%" height={14} />
          <SkeletonBox width="80%" height={14} />
          <SkeletonBox width={50} height={10} />
        </View>
      ))}
    </ScrollView>
  );
}

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
        <Text style={[styles.title, { color: t.text, fontFamily: fonts.bold }]}>Trending</Text>
        <Text style={[styles.subtitle, { color: t.textMuted, fontFamily: fonts.regular }]}>Last 48 hours</Text>
      </View>
      {loading ? (
        <TrendingSkeleton />
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
  section: { borderBottomWidth: StyleSheet.hairlineWidth, paddingBottom: 12 },
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    gap: 8,
  },
  title: { fontSize: 15 },
  subtitle: { fontSize: 12 },
  row: { paddingHorizontal: 16 },
});
