export const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const WEATHER_REGIONS = ["UP", "Maharashtra", "Tamil Nadu", "West Bengal", "Rajasthan"];

export const AGENTS = [
  { key: "SENSOR",   color: "#0ea5e9" },
  { key: "ANOMALY",  color: "#f43f5e" },
  { key: "CONTEXT",  color: "#8b5cf6" },
  { key: "ALERT",    color: "#f59e0b" },
  { key: "FORECAST", color: "#10b981" },
];

export function sev(s) {
  if (s >= 8) return { c: "#ef4444", bg: "rgba(239,68,68,0.1)",   br: "rgba(239,68,68,0.3)"   };
  if (s >= 5) return { c: "#f97316", bg: "rgba(249,115,22,0.1)",  br: "rgba(249,115,22,0.3)"  };
  return             { c: "#eab308", bg: "rgba(234,179,8,0.1)",   br: "rgba(234,179,8,0.25)"  };
}

export const glass = {
  background:           "rgba(255,255,255,0.65)",
  backdropFilter:       "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border:               "1px solid rgba(255,255,255,0.9)",
  borderRadius:         18,
  boxShadow:            "0 4px 24px rgba(100,120,180,0.1), inset 0 1px 0 rgba(255,255,255,0.95)",
};
