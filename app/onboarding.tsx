import { useEffect, useState } from "react";
import {
  View, Text, SectionList, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { fetchSources, type Source } from "../lib/api";
import { markOnboardingDone, saveSelectedSources } from "../lib/preferences";
import { useTheme } from "../lib/theme";

type Section = { title: string; data: Source[] };

export default function OnboardingScreen() {
  const t = useTheme();
  const [sources, setSources] = useState<Source[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSources()
      .then((data) => {
        setSources(data);
        setSelected(new Set(data.map((s) => s.name)));
      })
      .finally(() => setLoading(false));
  }, []);

  const toggle = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(sources.map((s) => s.name)));
  const clearAll = () => setSelected(new Set());

  const sections: Section[] = [];
  const byRegion: Record<string, Source[]> = {};
  for (const s of sources) {
    (byRegion[s.region] ??= []).push(s);
  }
  const regionOrder = ["Global", "MENA", "Egypt", "Saudi Arabia", "Europe", "Africa", "Asia"];
  for (const r of regionOrder) {
    if (byRegion[r]) sections.push({ title: r, data: byRegion[r] });
  }

  const handleContinue = async () => {
    if (selected.size === 0) return;
    setSaving(true);
    await saveSelectedSources([...selected]);
    await markOnboardingDone();
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]}>
      <View style={[styles.header, { borderBottomColor: t.border }]}>
        <Text style={[styles.title, { color: t.text }]}>Choose your sources</Text>
        <Text style={[styles.subtitle, { color: t.textMuted }]}>
          Pick the outlets you want to follow. You can change this later in Settings.
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={selectAll}>
            <Text style={[styles.action, { color: t.text }]}>Select all</Text>
          </TouchableOpacity>
          <Text style={{ color: t.textMuted }}> · </Text>
          <TouchableOpacity onPress={clearAll}>
            <Text style={[styles.action, { color: t.textMuted }]}>Clear all</Text>
          </TouchableOpacity>
          <Text style={[styles.count, { color: t.textMuted }]}>{selected.size} selected</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color={t.text} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.name}
          renderSectionHeader={({ section }) => (
            <View style={[styles.sectionHeader, { backgroundColor: t.bgSecondary }]}>
              <Text style={[styles.sectionTitle, { color: t.textMuted }]}>{section.title}</Text>
            </View>
          )}
          renderItem={({ item }) => {
            const on = selected.has(item.name);
            return (
              <TouchableOpacity
                onPress={() => toggle(item.name)}
                style={[styles.row, { borderBottomColor: t.border }]}
              >
                <View style={styles.rowLeft}>
                  <Text style={[styles.sourceName, { color: t.text }]}>{item.name}</Text>
                  <Text style={[styles.sourceCategory, { color: t.textMuted }]}>{item.category}</Text>
                </View>
                <View style={[styles.checkbox, { borderColor: t.border, backgroundColor: on ? t.text : "transparent" }]}>
                  {on && <Text style={[styles.checkmark, { color: t.bg }]}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <View style={[styles.footer, { backgroundColor: t.bg, borderTopColor: t.border }]}>
        <TouchableOpacity
          onPress={handleContinue}
          disabled={selected.size === 0 || saving}
          style={[styles.btn, { backgroundColor: t.text, opacity: selected.size === 0 ? 0.4 : 1 }]}
        >
          <Text style={[styles.btnText, { color: t.bg }]}>
            {saving ? "Saving…" : `Continue with ${selected.size} source${selected.size !== 1 ? "s" : ""}`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, borderBottomWidth: 1 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 6 },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  actions: { flexDirection: "row", alignItems: "center" },
  action: { fontSize: 13, fontWeight: "600" },
  count: { fontSize: 13, marginLeft: "auto" },
  sectionHeader: { paddingHorizontal: 20, paddingVertical: 6 },
  sectionTitle: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8 },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  rowLeft: { flex: 1 },
  sourceName: { fontSize: 15, fontWeight: "500" },
  sourceCategory: { fontSize: 12, marginTop: 2 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  checkmark: { fontSize: 13, fontWeight: "700" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, borderTopWidth: StyleSheet.hairlineWidth },
  btn: { borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  btnText: { fontSize: 15, fontWeight: "700" },
});
