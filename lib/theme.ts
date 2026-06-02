import { useColorScheme } from "react-native";

export const fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
};

export const lightColors = {
  bg: "#F2F2F7",
  surface: "#FFFFFF",
  border: "rgba(0,0,0,0.07)",
  borderStrong: "rgba(0,0,0,0.13)",
  text: "#0A0A0A",
  textSecondary: "#3C3C43",
  textMuted: "#8E8E93",
  chip: "rgba(0,0,0,0.06)",
  chipText: "#3C3C43",
  chipActive: "#0A0A0A",
  chipActiveText: "#FFFFFF",
  bgSecondary: "#F2F2F7",
  bgCard: "#FFFFFF",
  placeholder: "#C7C7CC",
  shadow: "#000",
  statusBar: "dark" as const,
};

export const darkColors: typeof lightColors = {
  bg: "#08080F",
  surface: "rgba(255,255,255,0.07)",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.16)",
  text: "#F2F2F7",
  textSecondary: "#EBEBF5",
  textMuted: "#636366",
  chip: "rgba(255,255,255,0.08)",
  chipText: "#EBEBF5",
  chipActive: "#F2F2F7",
  chipActiveText: "#08080F",
  bgSecondary: "rgba(255,255,255,0.04)",
  bgCard: "rgba(255,255,255,0.07)",
  placeholder: "#48484A",
  shadow: "#000",
  statusBar: "light" as const,
};

export function useTheme() {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkColors : lightColors;
}
