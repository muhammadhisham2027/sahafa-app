import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Share, Image } from "react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { formatDistanceToNow } from "date-fns";
import { type Article } from "../lib/api";
import { useTheme, fonts } from "../lib/theme";
import { addBookmark, removeBookmark, isBookmarked } from "../lib/bookmarks";
import { markAsRead, isRead } from "../lib/history";

export const regionColors: Record<string, string> = {
  "Egypt": "#DC2626",
  "Saudi Arabia": "#16A34A",
  "MENA": "#CA8A04",
  "Global": "#2563EB",
  "Europe": "#7C3AED",
  "Africa": "#EA580C",
  "Asia": "#DB2777",
};

const categoryColors: Record<string, string> = {
  "Tech": "#2563EB",
  "Startups": "#7C3AED",
  "Dev": "#EA580C",
  "AI": "#DC2626",
};

function readingMins(title: string, description: string | null): number {
  const words = `${title} ${description ?? ""}`.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

type Props = {
  article: Article;
  onBookmarkChange?: () => void;
  compact?: boolean;
};

export default function ArticleCard({ article, onBookmarkChange, compact }: Props) {
  const router = useRouter();
  const t = useTheme();
  const color = regionColors[article.source_region] ?? "#2563EB";
  const catColor = categoryColors[article.category] ?? "#2563EB";
  const timeAgo = formatDistanceToNow(new Date(article.published_at), { addSuffix: true });
  const mins = readingMins(article.title, article.description);
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

  const hasImage = !!article.image_url && !imgError;
  const sourceInitial = article.source_name.charAt(0).toUpperCase();
  const displayText = article.summary ?? article.description;

  // ── Compact (trending) card ──────────────────────────────
  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactCard, { backgroundColor: t.surface, borderColor: t.border }]}
        onPress={openArticle}
        activeOpacity={0.75}
      >
        <View style={[styles.compactStrip, { backgroundColor: color }]} />
        <View style={styles.compactBody}>
          <Text style={[styles.compactSource, { color: t.textMuted, fontFamily: fonts.semibold }]}>
            {article.source_name.toUpperCase()}
          </Text>
          <Text
            style={[styles.compactTitle, { color: read ? t.textMuted : t.text, fontFamily: fonts.bold }]}
            numberOfLines={3}
          >
            {article.title}
          </Text>
          <Text style={[styles.compactTime, { color: t.textMuted, fontFamily: fonts.regular }]}>
            {timeAgo}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  // ── Full card ────────────────────────────────────────────
  return (
    <TouchableOpacity
      style={[styles.card, { borderBottomColor: t.border, backgroundColor: t.surface }]}
      onPress={openArticle}
      activeOpacity={0.75}
    >
      {/* Meta row */}
      <View style={styles.metaRow}>
        <View style={[styles.regionDot, { backgroundColor: color }]} />
        <Text style={[styles.sourceName, { color: t.textMuted, fontFamily: fonts.semibold }]}>
          {article.source_name}
        </Text>
        <Text style={[styles.separator, { color: t.border }]}> · </Text>
        <Text style={[styles.metaText, { color: t.textMuted, fontFamily: fonts.regular }]}>{timeAgo}</Text>
        <Text style={[styles.separator, { color: t.border }]}> · </Text>
        <Text style={[styles.metaText, { color: t.textMuted, fontFamily: fonts.regular }]}>{mins} min</Text>
      </View>

      {/* Content row */}
      <View style={styles.contentRow}>
        <View style={styles.textBlock}>
          <Text
            style={[styles.title, { color: read ? t.textMuted : t.text, fontFamily: fonts.bold }]}
            numberOfLines={hasImage ? 3 : 3}
          >
            {article.title}
          </Text>
          {displayText && !hasImage && (
            <Text
              style={[styles.description, { color: t.textSecondary, fontFamily: fonts.regular }]}
              numberOfLines={2}
            >
              {displayText}
            </Text>
          )}
        </View>

        {/* Thumbnail */}
        <View style={styles.thumbContainer}>
          {hasImage ? (
            <Image
              source={{ uri: article.image_url! }}
              style={styles.thumb}
              onError={() => setImgError(true)}
            />
          ) : (
            <View style={[styles.thumbFallback, { backgroundColor: color + "15" }]}>
              <Text style={[styles.thumbInitial, { color, fontFamily: fonts.bold }]}>
                {sourceInitial}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Footer row */}
      <View style={styles.footerRow}>
        <View style={styles.tags}>
          <View style={[styles.pill, { backgroundColor: color + "12" }]}>
            <Text style={[styles.pillText, { color, fontFamily: fonts.semibold }]}>
              {article.source_region}
            </Text>
          </View>
          <View style={[styles.pill, { backgroundColor: catColor + "12" }]}>
            <Text style={[styles.pillText, { color: catColor, fontFamily: fonts.semibold }]}>
              {article.category}
            </Text>
          </View>
          {read && (
            <View style={[styles.pill, { backgroundColor: t.bgSecondary }]}>
              <Text style={[styles.pillText, { color: t.textMuted, fontFamily: fonts.semibold }]}>Read</Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={shareArticle} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.actionBtn, { color: t.textMuted }]}>↗</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleBookmark} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.actionBtn}>{bookmarked ? "🔖" : "🏷️"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const THUMB = 80;

const styles = StyleSheet.create({
  // Full card
  card: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  metaRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  regionDot: { width: 6, height: 6, borderRadius: 3, marginRight: 7 },
  sourceName: { fontSize: 11, letterSpacing: 0.2 },
  separator: { fontSize: 11 },
  metaText: { fontSize: 11 },
  contentRow: { flexDirection: "row", gap: 12, marginBottom: 10 },
  textBlock: { flex: 1 },
  title: { fontSize: 15, lineHeight: 22, marginBottom: 5 },
  description: { fontSize: 13, lineHeight: 19 },
  thumbContainer: { width: THUMB, height: THUMB, borderRadius: 8, overflow: "hidden", flexShrink: 0 },
  thumb: { width: THUMB, height: THUMB },
  thumbFallback: { width: THUMB, height: THUMB, alignItems: "center", justifyContent: "center" },
  thumbInitial: { fontSize: 26 },
  footerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  tags: { flexDirection: "row", gap: 6, flexWrap: "wrap", flex: 1 },
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  pillText: { fontSize: 11 },
  actions: { flexDirection: "row", gap: 14, marginLeft: 8 },
  actionBtn: { fontSize: 15 },

  // Compact (trending) card
  compactCard: {
    width: 172,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    marginRight: 10,
  },
  compactStrip: { height: 3 },
  compactBody: { padding: 12, gap: 5 },
  compactSource: { fontSize: 10, letterSpacing: 0.6 },
  compactTitle: { fontSize: 13, lineHeight: 18 },
  compactTime: { fontSize: 11 },
});
