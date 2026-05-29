import AsyncStorage from "@react-native-async-storage/async-storage";
import { type Article } from "./api";

export type { Article };

const KEY = "sahafa_bookmarks";

export async function getBookmarks(): Promise<Article[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function addBookmark(article: Article): Promise<void> {
  const existing = await getBookmarks();
  if (existing.find((a) => a.id === article.id)) return;
  await AsyncStorage.setItem(KEY, JSON.stringify([article, ...existing]));
}

export async function removeBookmark(id: string): Promise<void> {
  const existing = await getBookmarks();
  await AsyncStorage.setItem(KEY, JSON.stringify(existing.filter((a) => a.id !== id)));
}

export async function isBookmarked(id: string): Promise<boolean> {
  const existing = await getBookmarks();
  return existing.some((a) => a.id === id);
}
