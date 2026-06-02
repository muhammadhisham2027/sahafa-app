import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  ONBOARDING_DONE: "onboarding_done",
  SELECTED_SOURCES: "selected_sources",
};

export async function isOnboardingDone(): Promise<boolean> {
  const v = await AsyncStorage.getItem(KEYS.ONBOARDING_DONE);
  return v === "true";
}

export async function markOnboardingDone(): Promise<void> {
  await AsyncStorage.setItem(KEYS.ONBOARDING_DONE, "true");
}

export async function getSelectedSources(): Promise<string[] | null> {
  const v = await AsyncStorage.getItem(KEYS.SELECTED_SOURCES);
  if (!v) return null;
  try { return JSON.parse(v); } catch { return null; }
}

export async function saveSelectedSources(names: string[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.SELECTED_SOURCES, JSON.stringify(names));
}
