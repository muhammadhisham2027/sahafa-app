const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export type Article = {
  id: string;
  title: string;
  url: string;
  description: string | null;
  image_url: string | null;
  source_name: string;
  source_region: string;
  category: string;
  published_at: string;
};

export async function fetchArticles(params: {
  region?: string;
  category?: string;
  page?: number;
}): Promise<{ articles: Article[]; total: number }> {
  const query = new URLSearchParams();
  if (params.region && params.region !== "All") query.set("region", params.region);
  if (params.category && params.category !== "All") query.set("category", params.category);
  if (params.page) query.set("page", String(params.page));

  const res = await fetch(`${API_URL}/api/articles?${query}`);
  if (!res.ok) throw new Error("Failed to fetch articles");
  return res.json();
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
