import { useColorScheme } from "react-native";

export const lightColors = {
  bg: "#ffffff",
  bgSecondary: "#f3f3f3",
  bgCard: "#ffffff",
  border: "#f0f0f0",
  text: "#1a1a1a",
  textSecondary: "#555555",
  textMuted: "#999999",
  chip: "#f3f3f3",
  chipText: "#555555",
  chipActive: "#1a1a1a",
  chipActiveText: "#ffffff",
  filterBg: "#f3f3f3",
  placeholder: "#bbbbbb",
  statusBar: "dark" as const,
};

export const darkColors: typeof lightColors = {
  bg: "#0f0f0f",
  bgSecondary: "#1a1a1a",
  bgCard: "#1a1a1a",
  border: "#2a2a2a",
  text: "#f0f0f0",
  textSecondary: "#aaaaaa",
  textMuted: "#666666",
  chip: "#2a2a2a",
  chipText: "#aaaaaa",
  chipActive: "#f0f0f0",
  chipActiveText: "#0f0f0f",
  filterBg: "#1a1a1a",
  placeholder: "#555555",
  statusBar: "light" as const,
};

export function useTheme() {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkColors : lightColors;
}
