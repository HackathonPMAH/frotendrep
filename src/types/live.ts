/** Payload from GET /ws/live (JSON per tick). */
export type LiveWsPayload = {
  timestamp: string;
  risk_score: number;
  status: string;
  time_to_disaster?: number | null;
  risk_history?: number[];
  crowd?: {
    size: number;
    blocked_exits?: string[];
  };
  features?: {
    crowd_size?: number;
    avg_density?: number;
    max_density?: number;
    avg_velocity?: number;
    direction_conflict?: number;
    turbulence?: number;
  };
  recommendations?: string[];
  hotspots?: unknown[];
  risk?: {
    risk_score?: number;
    status?: string;
    trend?: string;
    time_to_disaster?: number | null;
  };
};
