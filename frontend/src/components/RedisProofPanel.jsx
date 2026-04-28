import { Shimmer } from "./UI";

export function RedisProofPanel({ redisProof, loadingProof, onRefresh }) {
  if (loadingProof) return (
    <div style={{ padding: "20px" }}>
      <Shimmer h={120} />
    </div>
  );

  if (!redisProof) return (
    <div style={{ padding: "22px 20px" }}>
      <p style={{ fontSize: "0.65rem", color: "rgba(0,0,0,0.45)", marginBottom: 12 }}>
        Click to fetch live Redis state
      </p>
      <button onClick={onRefresh} style={{
        fontSize: "0.58rem", padding: "8px 18px", borderRadius: 20, cursor: "pointer",
        background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.3)",
        color: "#0369a1", fontWeight: 600
      }}>🔄 Load Redis Proof</button>
    </div>
  );

  const isConnected = redisProof.redis_status?.includes('CONNECTED');
  const keys = Object.entries(redisProof.cached_keys || {});

  return (
    <div style={{ padding: "18px 20px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18,
        padding: "12px 16px", borderRadius: 12,
        background: isConnected ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)",
        border: `1px solid ${isConnected ? "rgba(16,185,129,0.25)" : "rgba(245,158,11,0.25)"}` }}>
        <span style={{ fontSize: "1.1rem" }}>{isConnected ? "✅" : "⚠️"}</span>
        <div>
          <p style={{ fontSize: "0.68rem", fontWeight: 700, color: isConnected ? "#047857" : "#92400e" }}>
            {redisProof.redis_status}
          </p>
          <p style={{ fontSize: "0.55rem", color: "rgba(0,0,0,0.50)", marginTop: 2 }}>
            {redisProof.operations_run} cache operations completed
          </p>
        </div>
        <button onClick={onRefresh} style={{
          marginLeft: "auto", fontSize: "0.52rem", padding: "5px 12px", borderRadius: 16,
          cursor: "pointer", background: "rgba(14,165,233,0.1)",
          border: "1px solid rgba(14,165,233,0.25)", color: "#0369a1", fontWeight: 600
        }}>🔄 Refresh</button>
      </div>

      <p style={{ fontSize: "0.58rem", fontWeight: 700, color: "rgba(0,0,0,0.65)", marginBottom: 10, letterSpacing: "0.1em" }}>
        WHAT REDIS IS DOING:
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        {Object.entries(redisProof.explanation || {}).filter(([k]) => k !== 'purpose' && k !== 'benefit').map(([k, v]) => (
          <div key={k} style={{ padding: "9px 12px", borderRadius: 10,
            background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.15)" }}>
            <p style={{ fontSize: "0.5rem", fontWeight: 700, color: "#0369a1", marginBottom: 3,
              letterSpacing: "0.1em", textTransform: "uppercase" }}>{k.replace(/_/g, ' ')}</p>
            <p style={{ fontSize: "0.58rem", color: "rgba(0,0,0,0.62)", lineHeight: 1.5 }}>{v}</p>
          </div>
        ))}
      </div>

      {keys.length > 0 && (
        <>
          <p style={{ fontSize: "0.58rem", fontWeight: 700, color: "rgba(0,0,0,0.65)", marginBottom: 10, letterSpacing: "0.1em" }}>
            LIVE CACHED DATA ({keys.length} keys):
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {keys.map(([key, val]) => (
              <div key={key} style={{ padding: "8px 12px", borderRadius: 10,
                background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <p style={{ fontSize: "0.48rem", color: "#047857", fontWeight: 700, marginBottom: 3,
                  fontFamily: "'JetBrains Mono',monospace" }}>{key}</p>
                {val.frequency && <p style={{ fontSize: "0.56rem", color: "rgba(0,0,0,0.60)" }}>{val.frequency} Hz · SEV {val.severity}</p>}
                {val.temp && <p style={{ fontSize: "0.56rem", color: "rgba(0,0,0,0.60)" }}>{val.temp}°C · {val.source}</p>}
                {val.cached && <span style={{ fontSize: "0.45rem", color: "#059669", fontWeight: 700 }}>✅ CACHED</span>}
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ marginTop: 16, padding: "10px 14px", borderRadius: 10,
        background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.2)" }}>
        <p style={{ fontSize: "0.6rem", color: "rgba(109,40,217,0.75)", lineHeight: 1.6 }}>
          💡 <strong>Demo benefit:</strong> {redisProof.explanation?.benefit}
        </p>
      </div>
    </div>
  );
}
