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
  "Egypt": "#FF3B30",
  "Saudi Arabia": "#34C759",
  "MENA": "#FF9500",
  "Global": "#007AFF",
  "Europe": "#5856D6",
  "Africa": "#FF6B35",
  "Asia": "#FF2D55",
  "Americas": "#30B0C7",
  "Oceania": "#32ADE6",
};

const categoryColors: Record<string, string> = {
  "Tech": "#007AFF",
  "Startups": "#5856D6",
  "Dev": "#FF6B35",
  "AI": "#FF3B30",
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
    await Share.share({
      title: article.title,
      message: `${article.title}\n\nvia Sahafa\n${article.url}`,
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
        style={[
          styles.compactCard,
          {
            backgroundColor: dark ? "rgba(255,255,255,0.07)" : "#FFFFFF",
            borderColor: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
            shadowColor: t.shadow,
          },
        ]}
        onPress={openArticle}
        activeOpacity={0.75}
      >
        <View style={[styles.compactAccent, { backgroundColor: regionColor }]} />
        <View style={styles.compactBody}>
          <Text style={[styles.compactSource, { color: regionColor, fontFamily: fonts.semibold }]}>
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
      style={[
        styles.card,
        {
          backgroundColor: dark ? "rgba(255,255,255,0.07)" : "#FFFFFF",
          borderColor: dark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.0)",
          shadowColor: t.shadow,
        },
      ]}
      onPress={openArticle}
      activeOpacity={0.78}
    >
      {/* Hero image */}
      {hasImage ? (
        <Image
          source={{ uri: article.image_url! }}
          style={styles.heroImage}
          onError={() => setImgError(true)}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.heroFallback, { backgroundColor: regionColor + "18" }]}>
          <Text style={[styles.heroInitial, { color: regionColor, fontFamily: fonts.bold }]}>
            {sourceInitial}
          </Text>
        </View>
      )}

      <View style={styles.body}>
        {/* Meta */}
        <View style={styles.metaRow}>
          <View style={[styles.sourceDot, { backgroundColor: regionColor }]} />
          <Text style={[styles.sourceName, { color: regionColor, fontFamily: fonts.semibold }]}>
            {article.source_name}
          </Text>
          <Text style={[styles.metaDot, { color: t.textMuted }]}> · </Text>
          <Text style={[styles.metaText, { color: t.textMuted, fontFamily: fonts.regular }]}>{timeAgo}</Text>
          <Text style={[styles.metaDot, { color: t.textMuted }]}> · </Text>
          <Text style={[styles.metaText, { color: t.textMuted, fontFamily: fonts.regular }]}>{mins} min</Text>
        </View>

        {/* Title */}
        <Text
          style={[
            styles.title,
            { color: read ? t.textMuted : t.text, fontFamily: fonts.bold },
          ]}
          numberOfLines={3}
        >
          {article.title}
        </Text>

        {/* Summary / description */}
        {displayText && (
          <Text
            style={[styles.description, { color: t.textMuted, fontFamily: fonts.regular }]}
            numberOfLines={2}
          >
            {displayText}
          </Text>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.pills}>
            <View style={[styles.pill, { backgroundColor: catColor + "18" }]}>
              <Text style={[styles.pillText, { color: catColor, fontFamily: fonts.semibold }]}>
                {article.category}
              </Text>
            </View>
            <View style={[styles.pill, { backgroundColor: regionColor + "18" }]}>
              <Text style={[styles.pillText, { color: regionColor, fontFamily: fonts.semibold }]}>
                {article.source_region}
              </Text>
            </View>
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
    marginHorizontal: 14,
    marginBottom: 12,
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    // Android
    elevation: 3,
  },
  heroImage: {
    width: "100%",
    height: 176,
  },
  heroFallback: {
    width: "100%",
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  heroInitial: { fontSize: 28 },

  body: { padding: 14 },

  metaRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  sourceDot: { width: 5, height: 5, borderRadius: 3, marginRight: 6 },
  sourceName: { fontSize: 11, letterSpacing: 0.2 },
  metaDot: { fontSize: 11 },
  metaText: { fontSize: 11 },

  title: { fontSize: 15.5, lineHeight: 22, marginBottom: 6 },
  description: { fontSize: 13, lineHeight: 19, marginBottom: 12 },

  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2 },
  pills: { flexDirection: "row", gap: 6, flex: 1, flexWrap: "wrap" },
  pill: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
  pillText: { fontSize: 11 },

  actions: { flexDirection: "row", gap: 14 },
  actionIcon: { fontSize: 15 },

  // Compact
  compactCard: {
    width: 176,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginRight: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  compactAccent: { height: 3 },
  compactBody: { padding: 12, gap: 6 },
  compactSource: { fontSize: 10, letterSpacing: 0.7 },
  compactTitle: { fontSize: 13.5, lineHeight: 19 },
  compactTime: { fontSize: 11 },
});
