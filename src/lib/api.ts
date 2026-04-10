/**
 * API base for HTTP calls. In dev, Vite proxies /api and /ws to the backend (see vite.config.ts).
 * Override with VITE_API_BASE_URL (e.g. http://127.0.0.1:8000) if you serve the app without the proxy.
 */
export function getApiBase(): string {
  const raw = import.meta.env.VITE_API_BASE_URL as string | undefined;
  return raw ? raw.replace(/\/$/, "") : "";
}

export function apiUrl(path: string): string {
  const base = getApiBase();
  const p = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}

export function getWsLiveUrl(search?: string): string {
  const base = getApiBase();
  const q = search && search.startsWith("?") ? search : search ? `?${search}` : "";
  if (base) {
    const u = new URL(base);
    const wsScheme = u.protocol === "https:" ? "wss:" : "ws:";
    return `${wsScheme}//${u.host}/ws/live${q}`;
  }
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${window.location.host}/ws/live${q}`;
}

export type DashboardOverviewCard = {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
};

export type DashboardBundle = {
  overviewCards: DashboardOverviewCard[];
  densityTimeline: { time: string; density: number }[];
  riskHistory: { time: string; s1: number; s2: number; s3: number }[];
  performance: {
    responseTimes: { name: string; value: number }[];
    exitGateUsage: { name: string; value: number }[];
  };
  incidents: { time: string; zone: string; level: string; message: string }[];
};

export async function fetchDashboard(): Promise<DashboardBundle> {
  const res = await fetch(apiUrl("/api/dashboard"));
  if (!res.ok) throw new Error(`Dashboard ${res.status}`);
  return res.json() as Promise<DashboardBundle>;
}

export type BaseMapUploadResponse = {
  id: number;
  kind: "image" | "video";
  content_type: string;
  media_url: string;
};

export type AnalyzeBaseMapResponse = {
  input_mode: string;
  frame_size: { width: number; height: number };
  base_map_id: number;
  heatmap: number[][];
  hotspots: { x: number; y: number; intensity: number; cell: { r: number; c: number } }[];
  recommendations: string[];
  risk: { risk_score: number; status: string; time_to_disaster?: number };
  features: Record<string, unknown>;
};

export async function uploadBaseMap(file: File): Promise<BaseMapUploadResponse> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch(apiUrl("/api/base-map/upload"), { method: "POST", body });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const detail = (err as { detail?: string }).detail ?? res.statusText;
    throw new Error(typeof detail === "string" ? detail : "Upload failed");
  }
  return res.json() as Promise<BaseMapUploadResponse>;
}

export async function analyzeBaseMap(): Promise<AnalyzeBaseMapResponse> {
  const res = await fetch(apiUrl("/api/base-map/analyze"), { method: "POST" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const detail = (err as { detail?: string }).detail ?? res.statusText;
    throw new Error(typeof detail === "string" ? detail : "Analysis failed");
  }
  return res.json() as Promise<AnalyzeBaseMapResponse>;
}
