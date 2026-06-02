import { useEffect, useState, useCallback } from "react";
import {
  View, Text, SectionList, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { fetchSources, type Source } from "../../lib/api";
import { getSelectedSources, saveSelectedSources } from "../../lib/preferences";
import { useTheme } from "../../lib/theme";

type Section = { title: string; data: Source[] };

const REGION_ORDER = ["Global", "MENA", "Egypt", "Saudi Arabia", "Europe", "Africa", "Asia"];

export default function SettingsScreen() {
  const t = useTheme();
  const [sources, setSources] = useState<Source[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const loadData = useCallback(async () => {
    const [srcs, stored] = await Promise.all([fetchSources(), getSelectedSources()]);
    setSources(srcs);
    setSelected(new Set(stored ?? srcs.map((s) => s.name)));
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, []);
  useFocusEffect(useCallback(() => { setSaved(false); }, []));

  const toggle = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
    setSaved(false);
  };

  const handleSave = async () => {
    await saveSelectedSources([...selected]);
    setSaved(true);
  };

  const sections: Section[] = [];
  const byRegion: Record<string, Source[]> = {};
  for (const s of sources) (byRegion[s.region] ??= []).push(s);
  for (const r of REGION_ORDER) {
    if (byRegion[r]) sections.push({ title: r, data: byRegion[r] });
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]}>
      <View style={[styles.header, { borderBottomColor: t.border }]}>
        <Text style={[styles.title, { color: t.text }]}>Sources</Text>
        <Text style={[styles.subtitle, { color: t.textMuted }]}>
          {selected.size} of {sources.length} selected
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => { setSelected(new Set(sources.map((s) => s.name))); setSaved(false); }}>
            <Text style={[styles.action, { color: t.text }]}>All</Text>
          </TouchableOpacity>
          <Text style={{ color: t.textMuted }}> · </Text>
          <TouchableOpacity onPress={() => { setSelected(new Set()); setSaved(false); }}>
            <Text style={[styles.action, { color: t.textMuted }]}>None</Text>
          </TouchableOpacity>
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
          onPress={handleSave}
          disabled={selected.size === 0}
          style={[styles.btn, { backgroundColor: saved ? t.chipActive : t.text, opacity: selected.size === 0 ? 0.4 : 1 }]}
        >
          <Text style={[styles.btnText, { color: t.bg }]}>
            {saved ? "Saved ✓" : "Save preferences"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  subtitle: { fontSize: 13, marginBottom: 8 },
  headerActions: { flexDirection: "row", alignItems: "center" },
  action: { fontSize: 13, fontWeight: "600" },
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
