import AsyncStorage from "@react-native-async-storage/async-storage";
import { type Article } from "./api";

const KEY = "offline_feed_cache";

type Cache = { articles: Article[]; total: number; timestamp: number };

export async function saveCache(articles: Article[], total: number): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify({ articles, total, timestamp: Date.now() }));
}

export async function loadCache(): Promise<Cache | null> {
  const v = await AsyncStorage.getItem(KEY);
  if (!v) return null;
  try { return JSON.parse(v); } catch { return null; }
}

export function cacheAgeMinutes(timestamp: number): number {
  return Math.floor((Date.now() - timestamp) / 60000);
}
