import { useEffect, useState } from "react";
import {
  View, Text, SectionList, TouchableOpacity, StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { fetchSources, type Source } from "../lib/api";
import { markOnboardingDone, saveSelectedSources } from "../lib/preferences";
import { useTheme, fonts } from "../lib/theme";

type Section = { title: string; data: Source[] };
const REGION_ORDER = ["Global", "MENA", "Egypt", "Saudi Arabia", "Europe", "Africa", "Asia"];

export default function OnboardingScreen() {
  const t = useTheme();
  const [sources, setSources] = useState<Source[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSources().then((data) => {
      setSources(data);
      setSelected(new Set(data.map((s) => s.name)));
    }).finally(() => setLoading(false));
  }, []);

  const toggle = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const sections: Section[] = [];
  const byRegion: Record<string, Source[]> = {};
  for (const s of sources) (byRegion[s.region] ??= []).push(s);
  for (const r of REGION_ORDER) {
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
      <View style={[styles.topBar, { borderBottomColor: t.border }]}>
        <View>
          <Text style={[styles.title, { color: t.text, fontFamily: fonts.bold }]}>
            Choose your sources
          </Text>
          <Text style={[styles.subtitle, { color: t.textMuted, fontFamily: fonts.regular }]}>
            Change anytime in the Sources tab
          </Text>
        </View>
        <View style={styles.topActions}>
          <TouchableOpacity onPress={() => setSelected(new Set(sources.map((s) => s.name)))}>
            <Text style={[styles.topAction, { color: t.text, fontFamily: fonts.medium }]}>All</Text>
          </TouchableOpacity>
          <Text style={{ color: t.border }}> · </Text>
          <TouchableOpacity onPress={() => setSelected(new Set())}>
            <Text style={[styles.topAction, { color: t.textMuted, fontFamily: fonts.medium }]}>None</Text>
          </TouchableOpacity>
          <Text style={[styles.selectedCount, { color: t.textMuted, fontFamily: fonts.regular }]}>
            {selected.size} selected
          </Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color={t.text} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.name}
          renderSectionHeader={({ section }) => (
            <View style={[styles.sectionHeader, { backgroundColor: t.bgSecondary, borderBottomColor: t.border }]}>
              <Text style={[styles.sectionTitle, { color: t.textMuted, fontFamily: fonts.semibold }]}>
                {section.title.toUpperCase()}
              </Text>
            </View>
          )}
          renderItem={({ item }) => {
            const on = selected.has(item.name);
            return (
              <TouchableOpacity
                onPress={() => toggle(item.name)}
                style={[styles.row, { borderBottomColor: t.border, backgroundColor: t.surface }]}
              >
                <View style={styles.rowLeft}>
                  <Text style={[styles.sourceName, { color: t.text, fontFamily: fonts.medium }]}>{item.name}</Text>
                  <Text style={[styles.sourceCategory, { color: t.textMuted, fontFamily: fonts.regular }]}>{item.category}</Text>
                </View>
                <View style={[styles.checkbox, { borderColor: on ? t.text : t.borderStrong, backgroundColor: on ? t.text : "transparent" }]}>
                  {on && <Text style={[styles.checkmark, { color: t.bg }]}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <View style={[styles.footer, { backgroundColor: t.surface, borderTopColor: t.border }]}>
        <TouchableOpacity
          onPress={handleContinue}
          disabled={selected.size === 0 || saving}
          style={[styles.continueBtn, { backgroundColor: t.text, opacity: selected.size === 0 ? 0.3 : 1 }]}
        >
          <Text style={[styles.continueBtnText, { color: t.bg, fontFamily: fonts.semibold }]}>
            {saving ? "Saving…" : `Continue with ${selected.size} source${selected.size !== 1 ? "s" : ""}`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 22, marginBottom: 4 },
  subtitle: { fontSize: 13 },
  topActions: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  topAction: { fontSize: 14 },
  selectedCount: { fontSize: 13, marginLeft: "auto" },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionTitle: { fontSize: 11, letterSpacing: 0.8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLeft: { flex: 1 },
  sourceName: { fontSize: 15 },
  sourceCategory: { fontSize: 12, marginTop: 2 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: { fontSize: 13, fontWeight: "700" },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  continueBtn: { borderRadius: 12, paddingVertical: 15, alignItems: "center" },
  continueBtnText: { fontSize: 15 },
});
