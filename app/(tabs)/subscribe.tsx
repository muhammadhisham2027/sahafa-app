import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";
import { subscribe } from "../../lib/api";
import { useTheme } from "../../lib/theme";

export default function SubscribeScreen() {
  const t = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.inner}>
        <Text style={[styles.title, { color: t.text }]}>Daily Tech Briefing</Text>
        <Text style={[styles.subtitle, { color: t.textSecondary }]}>
          Get the best tech and startup news from Egypt, MENA, and the world — delivered to your inbox every morning.
        </Text>

        <View style={styles.bullets}>
          {["📰 Top stories from 25+ sources", "🌍 Global + regional coverage", "🕗 Delivered every day at 8am", "🆓 Completely free"].map((b) => (
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
              style={[styles.button, { backgroundColor: t.chipActive }, (!email.trim() || loading) && styles.buttonDisabled]}
              onPress={handleSubscribe}
              disabled={!email.trim() || loading}
            >
              {loading
                ? <ActivityIndicator color={t.chipActiveText} />
                : <Text style={[styles.buttonText, { color: t.chipActiveText }]}>Subscribe for free</Text>
              }
            </TouchableOpacity>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 10 },
  subtitle: { fontSize: 15, lineHeight: 22, marginBottom: 28 },
  bullets: { gap: 10, marginBottom: 36 },
  bullet: { fontSize: 15 },
  input: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, marginBottom: 12 },
  error: { color: "#e53e3e", fontSize: 13, marginBottom: 8 },
  button: { borderRadius: 12, paddingVertical: 15, alignItems: "center" },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { fontSize: 15, fontWeight: "600" },
  success: { alignItems: "center", paddingTop: 20 },
  successIcon: { fontSize: 48 },
  successText: { fontSize: 22, fontWeight: "700", marginTop: 12 },
  successHint: { fontSize: 14, marginTop: 6 },
});
