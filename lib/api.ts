const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export type Article = {
  id: string;
  title: string;
  url: string;
  description: string | null;
  summary: string | null;
  image_url: string | null;
  source_name: string;
  source_region: string;
  category: string;
  published_at: string;
};

export type Source = {
  name: string;
  url: string;
  region: string;
  category: string;
};

export type DateFilter = "all" | "today" | "week" | "month";

export type NewsletterIssue = {
  date: string;
  articles: Article[];
};

export async function fetchArticles(params: {
  region?: string;
  category?: string;
  date?: DateFilter;
  sources?: string[];
  page?: number;
}): Promise<{ articles: Article[]; total: number }> {
  const query = new URLSearchParams();
  if (params.region && params.region !== "All") query.set("region", params.region);
  if (params.category && params.category !== "All") query.set("category", params.category);
  if (params.date && params.date !== "all") query.set("date", params.date);
  if (params.sources && params.sources.length > 0) query.set("sources", params.sources.join(","));
  if (params.page) query.set("page", String(params.page));

  const res = await fetch(`${API_URL}/api/articles?${query}`);
  if (!res.ok) throw new Error("Failed to fetch articles");
  return res.json();
}

export async function fetchTrending(): Promise<Article[]> {
  const res = await fetch(`${API_URL}/api/trending`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.articles ?? [];
}

export async function fetchSources(): Promise<Source[]> {
  const res = await fetch(`${API_URL}/api/sources`);
  if (!res.ok) throw new Error("Failed to fetch sources");
  const data = await res.json();
  return data.sources;
}

export async function fetchNewsletterArchive(): Promise<NewsletterIssue[]> {
  const res = await fetch(`${API_URL}/api/newsletter/archive`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.issues ?? [];
}

export async function subscribe(email: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? "Subscribe failed");
  }
}
