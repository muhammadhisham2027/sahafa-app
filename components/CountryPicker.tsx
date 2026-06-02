import { useState, useMemo } from "react";
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, SafeAreaView,
} from "react-native";
import { useTheme, fonts } from "../lib/theme";

type Props = {
  visible: boolean;
  countries: string[];
  selected: string;
  onSelect: (country: string) => void;
  onClose: () => void;
};

export default function CountryPicker({ visible, countries, selected, onSelect, onClose }: Props) {
  const t = useTheme();
  const [search, setSearch] = useState("");

  const sorted = useMemo(() => ["All", ...countries.sort()], [countries]);

  const filtered = useMemo(() =>
    search.trim()
      ? sorted.filter((c) => c.toLowerCase().includes(search.toLowerCase()))
      : sorted,
    [sorted, search]
  );

  const handleSelect = (country: string) => {
    onSelect(country);
    setSearch("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]}>
        <View style={[styles.header, { borderBottomColor: t.border, backgroundColor: t.surface }]}>
          <Text style={[styles.title, { color: t.text, fontFamily: fonts.bold }]}>Country</Text>
          <TouchableOpacity onPress={() => { setSearch(""); onClose(); }}>
            <Text style={[styles.done, { color: t.text, fontFamily: fonts.medium }]}>Done</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.searchWrap, { backgroundColor: t.bgSecondary, borderBottomColor: t.border }]}>
          <Text style={[styles.searchIcon, { color: t.textMuted }]}>⌕</Text>
          <TextInput
            style={[styles.searchInput, { color: t.text, fontFamily: fonts.regular }]}
            placeholder="Search countries…"
            placeholderTextColor={t.placeholder}
            value={search}
            onChangeText={setSearch}
            autoFocus
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Text style={{ color: t.textMuted, fontSize: 14 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const isSelected = item === selected;
            return (
              <TouchableOpacity
                onPress={() => handleSelect(item)}
                style={[styles.row, { borderBottomColor: t.border, backgroundColor: t.surface }]}
              >
                <Text style={[styles.rowText, { color: t.text, fontFamily: isSelected ? fonts.semibold : fonts.regular }]}>
                  {item}
                </Text>
                {isSelected && <Text style={[styles.check, { color: t.text }]}>✓</Text>}
              </TouchableOpacity>
            );
          }}
          keyboardShouldPersistTaps="handled"
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 18 },
  done: { fontSize: 15 },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    margin: 12,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowText: { fontSize: 15 },
  check: { fontSize: 15 },
});
