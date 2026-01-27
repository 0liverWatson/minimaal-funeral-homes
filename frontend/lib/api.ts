export type FuneralHome = {
  internal_id: number;
  cluster_id: number | null;

  name: string | null;
  street: string | null;
  city: string | null;
  region: string | null;
  postal_code: string | null;
  country: string | null;

  phone: string | null;
  website: string | null;
  latitude: number | null;
  longitude: number | null;

  sources: string | null;
  source_ids: string | null;
  cluster_size: number | null;
};

export type SearchParams = {
  name?: string;
  city?: string;
  region?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  website?: string;

  limit: number;
  offset: number;

  sort_by?: string;
  sort_dir?: "asc" | "desc";
};

function cleanParams(params: Record<string, unknown>) {
  const out = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    const s = String(v).trim();
    if (!s) return;
    out.set(k, s);
  });
  return out;
}

export async function fetchFuneralHomes(params: SearchParams): Promise<FuneralHome[]> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");

  const qs = cleanParams(params);
  const url = `${base.replace(/\/$/, "")}/funeral-homes?${qs.toString()}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

export async function fetchFuneralHomesCount(
  params: Omit<SearchParams, "limit" | "offset" | "sort_by" | "sort_dir">
): Promise<number> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");

  const qs = cleanParams(params);
  const url = `${base.replace(/\/$/, "")}/funeral-homes/count?${qs.toString()}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text || res.statusText}`);
  }
  const data = await res.json();
  return Number(data.total ?? 0);
}
