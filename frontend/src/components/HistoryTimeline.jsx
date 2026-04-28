import { sev } from "../constants";

export function HistoryTimeline({ history }) {
  if (!history.length) return (
    <p style={{ padding: "22px 20px", fontSize: "0.65rem", color: "rgba(0,0,0,0.45)" }}>No history yet</p>
  );

  return (
    <div style={{ overflowX: "auto", padding: "18px 20px 16px" }}>
      <div style={{ display: "flex", gap: 10, minWidth: "max-content" }}>
        {history.slice(0, 20).map((a, i) => {
          const sv = sev(a.severity);
          const t  = new Date(a.timestamp);
          const ts = `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
          return (
            <div key={i} style={{ background: sv.bg, border: `1px solid ${sv.br}`,
              borderRadius: 12, padding: "12px 14px", minWidth: 90, flexShrink: 0 }}>
              <p style={{ fontSize: "0.7rem", fontWeight: 700, color: sv.c, marginBottom: 5 }}>{a.region}</p>
              <p style={{ fontSize: "0.6rem", color: "rgba(0,0,0,0.62)", marginBottom: 3 }}>{a.frequency} Hz</p>
              <p style={{ fontSize: "0.6rem", fontWeight: 700, color: sv.c, marginBottom: 7 }}>SEV {a.severity}/10</p>
              {a.zScore && <p style={{ fontSize: "0.48rem", color: "rgba(0,0,0,0.52)" }}>Z: {a.zScore}σ</p>}
              <p style={{ fontSize: "0.48rem", color: "rgba(0,0,0,0.45)", marginTop: 5 }}>{ts}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
