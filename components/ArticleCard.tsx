import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Share, Image } from "react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { formatDistanceToNow } from "date-fns";
import { type Article } from "../lib/api";
import { useTheme } from "../lib/theme";
import { addBookmark, removeBookmark, isBookmarked } from "../lib/bookmarks";
import { markAsRead, isRead } from "../lib/history";

export const regionColors: Record<string, string> = {
  "Egypt": "#e53e3e",
  "Saudi Arabia": "#38a169",
  "MENA": "#d69e2e",
  "Global": "#3182ce",
  "Europe": "#805ad5",
  "Africa": "#dd6b20",
  "Asia": "#e91e8c",
};

const categoryColors: Record<string, string> = {
  "Tech": "#3182ce",
  "Startups": "#805ad5",
  "Dev": "#dd6b20",
  "AI": "#e53e3e",
};

function readingTime(title: string, description: string | null): string {
  const words = `${title} ${description ?? ""}`.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}

type Props = {
  article: Article;
  onBookmarkChange?: () => void;
  compact?: boolean;
};

export default function ArticleCard({ article, onBookmarkChange, compact }: Props) {
  const router = useRouter();
  const t = useTheme();
  const color = regionColors[article.source_region] ?? "#3182ce";
  const catColor = categoryColors[article.category] ?? "#3182ce";
  const timeAgo = formatDistanceToNow(new Date(article.published_at), { addSuffix: true });
  const [bookmarked, setBookmarked] = useState(false);
  const [read, setRead] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    isBookmarked(article.id).then(setBookmarked);
    isRead(article.id).then(setRead);
  }, [article.id]);

  const toggleBookmark = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    await Share.share({
      title: article.title,
      message: `${article.title}\n\nvia Sahafa 📰\n${article.url}`,
      url: article.url,
    });
  };

  const openArticle = async () => {
    await markAsRead(article.id);
    setRead(true);
    router.push({ pathname: "/article", params: { url: article.url, title: article.title } });
  };

  const displayText = article.summary ?? article.description;
  const hasImage = article.image_url && !imgError;
  const sourceInitial = article.source_name.charAt(0).toUpperCase();

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactCard, { borderColor: t.border, backgroundColor: t.bgCard }]}
        onPress={openArticle}
        activeOpacity={0.7}
      >
        <View style={[styles.compactStrip, { backgroundColor: color }]} />
        <View style={styles.compactBody}>
          <Text style={[styles.compactSource, { color: t.textMuted }]}>{article.source_name}</Text>
          <Text style={[styles.compactTitle, { color: read ? t.textMuted : t.text }]} numberOfLines={2}>
            {article.title}
          </Text>
          <Text style={[styles.compactTime, { color: t.textMuted }]}>{timeAgo}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, { borderBottomColor: t.border, opacity: read ? 0.75 : 1 }]}
      onPress={openArticle}
      activeOpacity={0.7}
    >
      <View style={styles.cardInner}>
        <View style={styles.cardContent}>
          {/* Meta row */}
          <View style={styles.meta}>
            <View style={[styles.regionDot, { backgroundColor: color }]} />
            <Text style={[styles.source, { color: t.textSecondary }]}>{article.source_name}</Text>
            <Text style={[styles.dot, { color: t.border }]}>·</Text>
            <Text style={[styles.time, { color: t.textMuted }]}>{timeAgo}</Text>
            <Text style={[styles.readTime, { color: t.textMuted }]}>· {readingTime(article.title, article.description)}</Text>
          </View>

          {/* Title */}
          <Text
            style={[styles.title, { color: read ? t.textMuted : t.text }]}
            numberOfLines={hasImage ? 2 : 3}
          >
            {article.title}
          </Text>

          {/* Summary / description */}
          {displayText && !hasImage && (
            <Text style={[styles.description, { color: t.textSecondary }]} numberOfLines={2}>
              {displayText}
            </Text>
          )}
        </View>

        {/* Thumbnail */}
        <View style={styles.thumbWrap}>
          {hasImage ? (
            <Image
              source={{ uri: article.image_url! }}
              style={styles.thumb}
              onError={() => setImgError(true)}
            />
          ) : (
            <View style={[styles.thumbFallback, { backgroundColor: color + "22" }]}>
              <Text style={[styles.thumbInitial, { color }]}>{sourceInitial}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.tags}>
          <View style={[styles.tag, { backgroundColor: color + "18" }]}>
            <Text style={[styles.tagText, { color }]}>{article.source_region}</Text>
          </View>
          <View style={[styles.tag, { backgroundColor: catColor + "15" }]}>
            <Text style={[styles.tagText, { color: catColor }]}>{article.category}</Text>
          </View>
          {read && (
            <View style={[styles.tag, { backgroundColor: t.bgSecondary }]}>
              <Text style={[styles.tagText, { color: t.textMuted }]}>Read</Text>
            </View>
          )}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={shareArticle} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.actionIcon, { color: t.textMuted }]}>↗</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleBookmark} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.actionIcon}>{bookmarked ? "🔖" : "🏷️"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12, borderBottomWidth: 1 },
  cardInner: { flexDirection: "row", gap: 12, marginBottom: 10 },
  cardContent: { flex: 1 },
  meta: { flexDirection: "row", alignItems: "center", marginBottom: 6, flexWrap: "wrap" },
  regionDot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  source: { fontSize: 12, fontWeight: "600" },
  dot: { fontSize: 12, marginHorizontal: 5 },
  time: { fontSize: 12 },
  readTime: { fontSize: 12, marginLeft: 2 },
  title: { fontSize: 15, fontWeight: "700", lineHeight: 21 },
  description: { fontSize: 13, lineHeight: 18, marginTop: 4 },
  thumbWrap: { width: 80, height: 80, borderRadius: 8, overflow: "hidden", flexShrink: 0 },
  thumb: { width: 80, height: 80 },
  thumbFallback: { width: 80, height: 80, alignItems: "center", justifyContent: "center" },
  thumbInitial: { fontSize: 28, fontWeight: "700" },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  tags: { flexDirection: "row", gap: 6, flexWrap: "wrap", flex: 1 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagText: { fontSize: 11, fontWeight: "600" },
  actions: { flexDirection: "row", gap: 14, marginLeft: 8 },
  actionIcon: { fontSize: 15 },
  // Compact (trending) card
  compactCard: { width: 180, borderRadius: 12, borderWidth: 1, overflow: "hidden", marginRight: 12 },
  compactStrip: { height: 4 },
  compactBody: { padding: 12 },
  compactSource: { fontSize: 11, fontWeight: "600", marginBottom: 4 },
  compactTitle: { fontSize: 13, fontWeight: "700", lineHeight: 18, marginBottom: 6 },
  compactTime: { fontSize: 11 },
});
