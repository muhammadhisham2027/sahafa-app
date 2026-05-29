import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Share } from "react-native";
import { useRouter } from "expo-router";
import { formatDistanceToNow } from "date-fns";
import { type Article } from "../lib/api";
import { useTheme } from "../lib/theme";
import { addBookmark, removeBookmark, isBookmarked } from "../lib/bookmarks";

const regionColors: Record<string, string> = {
  "Egypt": "#e53e3e",
  "Saudi Arabia": "#38a169",
  "MENA": "#d69e2e",
  "Global": "#3182ce",
  "Europe": "#805ad5",
  "Africa": "#dd6b20",
  "Asia": "#e91e8c",
};

type Props = {
  article: Article;
  onBookmarkChange?: () => void;
};

export default function ArticleCard({ article, onBookmarkChange }: Props) {
  const router = useRouter();
  const t = useTheme();
  const color = regionColors[article.source_region] ?? "#3182ce";
  const timeAgo = formatDistanceToNow(new Date(article.published_at), { addSuffix: true });
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    isBookmarked(article.id).then(setBookmarked);
  }, [article.id]);

  const toggleBookmark = async () => {
    if (bookmarked) {
      await removeBookmark(article.id);
      setBookmarked(false);
    } else {
      await addBookmark(article);
      setBookmarked(true);
    }
    onBookmarkChange?.();
  };

  const shareArticle = async () => {
    await Share.share({ title: article.title, url: article.url, message: `${article.title}\n${article.url}` });
  };

  return (
    <TouchableOpacity
      style={[styles.card, { borderBottomColor: t.border }]}
      onPress={() => router.push({ pathname: "/article", params: { url: article.url, title: article.title } })}
      activeOpacity={0.7}
    >
      <View style={styles.meta}>
        <View style={[styles.regionDot, { backgroundColor: color }]} />
        <Text style={[styles.source, { color: t.textSecondary }]}>{article.source_name}</Text>
        <Text style={[styles.dot, { color: t.border }]}>·</Text>
        <Text style={[styles.time, { color: t.textMuted }]}>{timeAgo}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={shareArticle} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.actionIcon}>↗</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleBookmark} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.actionIcon}>{bookmarked ? "🔖" : "🏷️"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={[styles.title, { color: t.text }]} numberOfLines={3}>{article.title}</Text>
      {article.description && (
        <Text style={[styles.description, { color: t.textSecondary }]} numberOfLines={2}>{article.description}</Text>
      )}

      <View style={styles.tags}>
        <View style={[styles.tag, { backgroundColor: color + "18" }]}>
          <Text style={[styles.tagText, { color }]}>{article.source_region}</Text>
        </View>
        <View style={[styles.tagGray, { backgroundColor: t.bgSecondary }]}>
          <Text style={[styles.tagGrayText, { color: t.textMuted }]}>{article.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1 },
  meta: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  regionDot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  source: { fontSize: 12, fontWeight: "600" },
  dot: { fontSize: 12, marginHorizontal: 5 },
  time: { fontSize: 12, flex: 1 },
  actions: { flexDirection: "row", gap: 12 },
  actionIcon: { fontSize: 15 },
  title: { fontSize: 15, fontWeight: "700", lineHeight: 21, marginBottom: 5 },
  description: { fontSize: 13, lineHeight: 18, marginBottom: 8 },
  tags: { flexDirection: "row", gap: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagText: { fontSize: 11, fontWeight: "600" },
  tagGray: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagGrayText: { fontSize: 11, fontWeight: "600" },
});
