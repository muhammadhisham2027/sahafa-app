import { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator,
  SectionList, Share,
} from "react-native";
import { useRouter } from "expo-router";
import { formatDistanceToNow, format } from "date-fns";
import { subscribe, fetchNewsletterArchive, type Article, type NewsletterIssue } from "../../lib/api";
import { useTheme } from "../../lib/theme";
import { regionColors } from "../../components/ArticleCard";

const LANDING_URL = "https://sahafa-api-eight.vercel.app";

type Section =
  | { key: "form"; data: [null] }
  | { key: "archive-header"; data: [null] }
  | { key: string; data: Article[]; date: string };

export default function NewsletterScreen() {
  const t = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [issues, setIssues] = useState<NewsletterIssue[]>([]);
  const [archiveLoading, setArchiveLoading] = useState(true);

  useEffect(() => {
    fetchNewsletterArchive()
      .then(setIssues)
      .finally(() => setArchiveLoading(false));
  }, []);

  const handleSubscribe = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setStatus("idle");
    try {
      await subscribe(email.trim());
      setStatus("success");
      setEmail("");
    } catch (e: unknown) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    await Share.share({
      title: "Sahafa — Tech news from everywhere",
      message: `I've been using Sahafa for daily tech news from Egypt, MENA, and the world. It's free and has a great newsletter!\n\n${LANDING_URL}`,
      url: LANDING_URL,
    });
  };

  const sections: { key: string; title?: string; data: any[] }[] = [
    { key: "form", data: [null] },
    { key: "invite", data: [null] },
    ...(issues.map((issue) => ({
      key: issue.date,
      title: format(new Date(issue.date), "MMMM d, yyyy"),
      data: issue.articles,
    }))),
  ];

  const renderItem = ({ item, section }: { item: any; section: any }) => {
    if (section.key === "form") {
      return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={[styles.formCard, { backgroundColor: t.bgCard, borderColor: t.border }]}>
            <Text style={[styles.formTitle, { color: t.text }]}>Daily Tech Briefing</Text>
            <Text style={[styles.formSubtitle, { color: t.textSecondary }]}>
              Top stories from 48 sources — delivered to your inbox every morning.
            </Text>
            <View style={styles.bullets}>
              {["🌍 Global + MENA + Egypt coverage", "🕗 Delivered at 8am daily", "🆓 Completely free"].map((b) => (
                <Text key={b} style={[styles.bullet, { color: t.text }]}>{b}</Text>
              ))}
            </View>
            {status === "success" ? (
              <View style={styles.success}>
                <Text style={styles.successIcon}>🎉</Text>
                <Text style={[styles.successText, { color: t.text }]}>You're subscribed!</Text>
                <Text style={[styles.successHint, { color: t.textMuted }]}>Check your inbox tomorrow morning.</Text>
              </View>
            ) : (
              <>
                <TextInput
                  style={[styles.input, { borderColor: t.border, color: t.text }]}
                  placeholder="your@email.com"
                  placeholderTextColor={t.placeholder}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {status === "error" && <Text style={styles.error}>{errorMsg}</Text>}
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: t.text }, (!email.trim() || loading) && styles.buttonDisabled]}
                  onPress={handleSubscribe}
                  disabled={!email.trim() || loading}
                >
                  {loading
                    ? <ActivityIndicator color={t.bg} />
                    : <Text style={[styles.buttonText, { color: t.bg }]}>Subscribe for free</Text>
                  }
                </TouchableOpacity>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      );
    }

    if (section.key === "invite") {
      return (
        <TouchableOpacity
          style={[styles.inviteCard, { backgroundColor: t.bgSecondary, borderColor: t.border }]}
          onPress={handleInvite}
          activeOpacity={0.7}
        >
          <Text style={styles.inviteEmoji}>👋</Text>
          <View style={styles.inviteText}>
            <Text style={[styles.inviteTitle, { color: t.text }]}>Share Sahafa</Text>
            <Text style={[styles.inviteHint, { color: t.textMuted }]}>Invite a friend to follow along</Text>
          </View>
          <Text style={[styles.inviteArrow, { color: t.textMuted }]}>↗</Text>
        </TouchableOpacity>
      );
    }

    // Archive article row
    const article: Article = item;
    const color = regionColors[article.source_region] ?? "#3182ce";
    return (
      <TouchableOpacity
        style={[styles.archiveRow, { borderBottomColor: t.border }]}
        onPress={() => router.push({ pathname: "/article", params: { url: article.url, title: article.title } })}
        activeOpacity={0.7}
      >
        <View style={[styles.archiveDot, { backgroundColor: color }]} />
        <View style={styles.archiveBody}>
          <Text style={[styles.archiveTitle, { color: t.text }]} numberOfLines={2}>{article.title}</Text>
          <Text style={[styles.archiveMeta, { color: t.textMuted }]}>
            {article.source_name} · {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]}>
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => (item ? item.id ?? String(index) : String(index))}
        renderItem={renderItem}
        renderSectionHeader={({ section }) => {
          if (section.key === "form" || section.key === "invite") return null;
          return (
            <View style={[styles.sectionHeader, { backgroundColor: t.bgSecondary, borderBottomColor: t.border }]}>
              <Text style={[styles.sectionTitle, { color: t.text }]}>📬 {section.title}</Text>
            </View>
          );
        }}
        ListHeaderComponent={
          <View style={[styles.pageHeader, { borderBottomColor: t.border }]}>
            <Text style={[styles.pageTitle, { color: t.text }]}>Newsletter</Text>
          </View>
        }
        ListFooterComponent={
          archiveLoading ? <ActivityIndicator style={{ padding: 32 }} color={t.text} /> :
          issues.length === 0 ? (
            <View style={styles.archiveEmpty}>
              <Text style={[styles.archiveEmptyText, { color: t.textMuted }]}>No past issues yet — check back tomorrow.</Text>
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 40 }}
        stickySectionHeadersEnabled
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pageHeader: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1 },
  pageTitle: { fontSize: 26, fontWeight: "700" },
  formCard: { margin: 16, borderRadius: 16, padding: 20, borderWidth: 1 },
  formTitle: { fontSize: 20, fontWeight: "700", marginBottom: 6 },
  formSubtitle: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  bullets: { gap: 8, marginBottom: 20 },
  bullet: { fontSize: 14 },
  input: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, marginBottom: 10 },
  error: { color: "#e53e3e", fontSize: 13, marginBottom: 8 },
  button: { borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { fontSize: 15, fontWeight: "600" },
  success: { alignItems: "center", paddingVertical: 12 },
  successIcon: { fontSize: 40 },
  successText: { fontSize: 18, fontWeight: "700", marginTop: 10 },
  successHint: { fontSize: 13, marginTop: 4 },
  inviteCard: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 16, borderWidth: 1, gap: 12 },
  inviteEmoji: { fontSize: 24 },
  inviteText: { flex: 1 },
  inviteTitle: { fontSize: 15, fontWeight: "600" },
  inviteHint: { fontSize: 13, marginTop: 2 },
  inviteArrow: { fontSize: 18 },
  sectionHeader: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  sectionTitle: { fontSize: 14, fontWeight: "700" },
  archiveRow: { flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, gap: 10 },
  archiveDot: { width: 7, height: 7, borderRadius: 4, marginTop: 5 },
  archiveBody: { flex: 1 },
  archiveTitle: { fontSize: 14, fontWeight: "600", lineHeight: 20 },
  archiveMeta: { fontSize: 12, marginTop: 3 },
  archiveEmpty: { padding: 32, alignItems: "center" },
  archiveEmptyText: { fontSize: 14, textAlign: "center" },
});
