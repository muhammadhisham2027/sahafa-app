import { useColorScheme } from "react-native";

export const fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
};

export const lightColors = {
  bg: "#F8F8F8",
  surface: "#FFFFFF",
  border: "#EBEBEB",
  borderStrong: "#D4D4D4",
  text: "#0A0A0A",
  textSecondary: "#404040",
  textMuted: "#9E9E9E",
  chip: "#EDEDED",
  chipText: "#404040",
  chipActive: "#0A0A0A",
  chipActiveText: "#FFFFFF",
  bgSecondary: "#F3F3F3",
  bgCard: "#FFFFFF",
  placeholder: "#BBBBBB",
  statusBar: "dark" as const,
};

export const darkColors: typeof lightColors = {
  bg: "#0A0A0A",
  surface: "#111111",
  border: "#1E1E1E",
  borderStrong: "#333333",
  text: "#F5F5F5",
  textSecondary: "#A0A0A0",
  textMuted: "#525252",
  chip: "#1A1A1A",
  chipText: "#A0A0A0",
  chipActive: "#F5F5F5",
  chipActiveText: "#0A0A0A",
  bgSecondary: "#141414",
  bgCard: "#111111",
  placeholder: "#444444",
  statusBar: "light" as const,
};

export function useTheme() {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkColors : lightColors;
}
