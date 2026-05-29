import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { type Article } from "../lib/api";
import { formatDistanceToNow } from "date-fns";

const regionColors: Record<string, string> = {
  "Egypt": "#e53e3e",
  "Saudi Arabia": "#38a169",
  "MENA": "#d69e2e",
  "Global": "#3182ce",
  "Europe": "#805ad5",
  "Africa": "#dd6b20",
  "Asia": "#e91e8c",
};

export default function ArticleCard({ article }: { article: Article }) {
  const router = useRouter();
  const color = regionColors[article.source_region] ?? "#3182ce";
  const timeAgo = formatDistanceToNow(new Date(article.published_at), { addSuffix: true });

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: "/article", params: { url: article.url, title: article.title } })}
      activeOpacity={0.7}
    >
      <View style={styles.meta}>
        <View style={[styles.regionDot, { backgroundColor: color }]} />
        <Text style={styles.source}>{article.source_name}</Text>
        <Text style={styles.dot}>·</Text>
        <Text style={styles.time}>{timeAgo}</Text>
      </View>
      <Text style={styles.title} numberOfLines={3}>{article.title}</Text>
      {article.description && (
        <Text style={styles.description} numberOfLines={2}>{article.description}</Text>
      )}
      <View style={styles.tags}>
        <View style={[styles.tag, { backgroundColor: color + "18" }]}>
          <Text style={[styles.tagText, { color }]}>{article.source_region}</Text>
        </View>
        <View style={styles.tagGray}>
          <Text style={styles.tagGrayText}>{article.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 16, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: "#f3f3f3",
  },
  meta: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  regionDot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  source: { fontSize: 12, fontWeight: "600", color: "#555" },
  dot: { fontSize: 12, color: "#ccc", marginHorizontal: 5 },
  time: { fontSize: 12, color: "#aaa" },
  title: { fontSize: 15, fontWeight: "700", color: "#1a1a1a", lineHeight: 21, marginBottom: 5 },
  description: { fontSize: 13, color: "#777", lineHeight: 18, marginBottom: 8 },
  tags: { flexDirection: "row", gap: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagText: { fontSize: 11, fontWeight: "600" },
  tagGray: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: "#f3f3f3" },
  tagGrayText: { fontSize: 11, fontWeight: "600", color: "#888" },
});
