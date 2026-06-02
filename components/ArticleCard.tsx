import { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Share, Image, useColorScheme,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { formatDistanceToNow } from "date-fns";
import { type Article } from "../lib/api";
import { useTheme, fonts } from "../lib/theme";
import { addBookmark, removeBookmark, isBookmarked } from "../lib/bookmarks";
import { markAsRead, isRead } from "../lib/history";

export const regionColors: Record<string, string> = {
  "Egypt":        "#FF3B30",
  "Saudi Arabia": "#34C759",
  "MENA":         "#FF9500",
  "Global":       "#007AFF",
  "Europe":       "#5856D6",
  "Africa":       "#FF6B35",
  "Asia":         "#FF2D55",
  "Americas":     "#30B0C7",
  "Oceania":      "#32ADE6",
};

const categoryColors: Record<string, string> = {
  "Tech":     "#007AFF",
  "Startups": "#5856D6",
  "Dev":      "#FF6B35",
  "AI":       "#FF3B30",
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
  const dark = useColorScheme() === "dark";
  const regionColor = regionColors[article.source_region] ?? "#007AFF";
  const catColor = categoryColors[article.category] ?? "#007AFF";
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
    await Share.share({ title: article.title, url: article.url });
  };

  const openArticle = async () => {
    await markAsRead(article.id);
    setRead(true);
    router.push({ pathname: "/article", params: { url: article.url, title: article.title } });
  };

  const hasImage = !!article.image_url && !imgError;

  // ── Compact (trending) card ──────────────────────────────
  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactCard, {
          backgroundColor: dark ? "#1C1C1E" : "#FFFFFF",
          borderColor: dark ? "#2C2C2E" : "#F0F0F0",
        }]}
        onPress={openArticle}
        activeOpacity={0.75}
      >
        <View style={[styles.compactAccent, { backgroundColor: regionColor }]} />
        <View style={styles.compactBody}>
          <Text style={[styles.compactSource, { color: regionColor, fontFamily: fonts.semibold }]}>
            {article.source_name.toUpperCase()}
          </Text>
          <Text style={[styles.compactTitle, { color: read ? t.textMuted : t.text, fontFamily: fonts.bold }]} numberOfLines={3}>
            {article.title}
          </Text>
          <Text style={[styles.compactTime, { color: t.textMuted, fontFamily: fonts.regular }]}>{timeAgo}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  // ── Full card ────────────────────────────────────────────
  const cardBg = dark ? "#1C1C1E" : "#FFFFFF";
  const cardBorder = dark ? "#2C2C2E" : "#F2F2F2";

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}
      onPress={openArticle}
      activeOpacity={0.78}
    >
      {/* Hero image — only when real image exists */}
      {hasImage && (
        <Image
          source={{ uri: article.image_url! }}
          style={styles.heroImage}
          onError={() => setImgError(true)}
          resizeMode="cover"
        />
      )}

      <View style={styles.body}>
        {/* Category + source row */}
        <View style={styles.metaRow}>
          <View style={[styles.catBadge, { backgroundColor: catColor }]}>
            <Text style={[styles.catText, { fontFamily: fonts.semibold }]}>{article.category}</Text>
          </View>
          <Text style={[styles.sourceName, { color: t.textMuted, fontFamily: fonts.medium }]} numberOfLines={1}>
            {article.source_name}
          </Text>
          <Text style={[styles.dot, { color: t.textMuted }]}>·</Text>
          <Text style={[styles.timeText, { color: t.textMuted, fontFamily: fonts.regular }]}>{timeAgo}</Text>
          <Text style={[styles.dot, { color: t.textMuted }]}>·</Text>
          <Text style={[styles.timeText, { color: t.textMuted, fontFamily: fonts.regular }]}>{mins}m</Text>
        </View>

        {/* Title */}
        <Text
          style={[styles.title, { color: read ? t.textMuted : t.text, fontFamily: fonts.bold }]}
          numberOfLines={3}
        >
          {article.title}
        </Text>

        {/* Summary — only show if no image */}
        {!hasImage && (article.summary ?? article.description) ? (
          <Text style={[styles.summary, { color: t.textMuted, fontFamily: fonts.regular }]} numberOfLines={2}>
            {article.summary ?? article.description}
          </Text>
        ) : null}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={[styles.regionBadge, { borderColor: regionColor + "50" }]}>
            <Text style={[styles.regionText, { color: regionColor, fontFamily: fonts.medium }]}>
              {article.source_region}
            </Text>
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
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  heroImage: {
    width: "100%",
    height: 180,
  },
  body: {
    padding: 14,
    gap: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "nowrap",
  },
  catBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  catText: {
    fontSize: 10,
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  sourceName: {
    fontSize: 12,
    flex: 1,
  },
  dot: { fontSize: 11 },
  timeText: { fontSize: 11 },
  title: {
    fontSize: 15,
    lineHeight: 21,
  },
  summary: {
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  regionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  regionText: { fontSize: 11 },
  actions: { flexDirection: "row", gap: 16 },
  actionIcon: { fontSize: 15 },

  // Compact
  compactCard: {
    width: 180,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  compactAccent: { height: 3 },
  compactBody: { padding: 12, gap: 5 },
  compactSource: { fontSize: 10, letterSpacing: 0.6 },
  compactTitle: { fontSize: 13, lineHeight: 18 },
  compactTime: { fontSize: 11 },
});
