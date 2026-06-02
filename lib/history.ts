import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "read_history";
const MAX = 500;

export async function markAsRead(id: string): Promise<void> {
  const history = await getHistory();
  if (history.includes(id)) return;
  await AsyncStorage.setItem(KEY, JSON.stringify([id, ...history].slice(0, MAX)));
}

export async function getHistory(): Promise<string[]> {
  const v = await AsyncStorage.getItem(KEY);
  if (!v) return [];
  try { return JSON.parse(v); } catch { return []; }
}

export async function isRead(id: string): Promise<boolean> {
  const h = await getHistory();
  return h.includes(id);
}
