import { useEffect, useState, useRef } from "react";
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from "recharts";

import IndiaMap            from "./components/IndiaMap";
import { CaseStudies }     from "./components/CaseStudies";
import { CompareTable }    from "./components/CompareTable";
import { HistoryTimeline } from "./components/HistoryTimeline";
import { RedisProofPanel } from "./components/RedisProofPanel";
import { EmailSentLog }    from "./components/EmailSentLog";
import { LossTicker }      from "./components/LossTicker";
import { Card, Head, Shimmer } from "./components/UI";
import { useSocket }       from "./hooks/useSocket";
import { initEmailJS, isEmailJSConfigured } from "./services/emailService";
import { API, WEATHER_REGIONS, AGENTS, sev } from "./constants";

export default function App() {
  const [gridData,    setGridData]    = useState([]);
  const [anomalies,   setAnomalies]   = useState([]);
  const [alerts,      setAlerts]      = useState([]);
  const [forecasts,   setForecasts]   = useState({});
  const [agentLog,    setAgentLog]    = useState([]);
  const [simulating,  setSimulating]  = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [activeView,  setActiveView]  = useState(null);
  const [tick,        setTick]        = useState(0);
  const [crisisMode,  setCrisisMode]  = useState(false);
  const [crisisInfo,  setCrisisInfo]  = useState(null);
  const [scenario,    setScenario]    = useState("industrial_surge");
  const [history,     setHistory]     = useState([]);
  const [showExtra,   setShowExtra]   = useState("story");
  const [weatherMap,  setWeatherMap]  = useState({});
  const [redisProof,  setRedisProof]  = useState(null);
  const [loadingProof,setLoadingProof]= useState(false);
  const [emailLog,    setEmailLog]    = useState([]);
  const [dbStatus,    setDbStatus]    = useState({ redis: "…", mongo: "…" });
  const [emailReady,  setEmailReady]  = useState(false);

  useSocket({
    setGridData, setAnomalies, setAlerts, setForecasts,
    setAgentLog, setLoading, setCrisisMode, setCrisisInfo,
    setHistory, setEmailLog,
  });

  useEffect(() => {
    initEmailJS();
    setEmailReady(isEmailJSConfigured());
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetch(`${API}/api/grid-status`)
      .then(r => r.json())
      .then(d => setHistory(Array.isArray(d) ? d : []))
      .catch(() => {});
    fetch(`${API}/api/weather`)
      .then(r => r.json())
      .then(data => { const m = {}; data.forEach(d => { m[d.region] = d; }); setWeatherMap(m); })
      .catch(() => {});
    fetch(`${API}/api/health`)
      .then(r => r.json())
      .then(h => setDbStatus({ redis: h.redis, mongo: h.mongodb }))
      .catch(() => {});
  }, []);

  const loadRedisProof = async () => {
    setLoadingProof(true);
    try {
      const r = await fetch(`${API}/api/redis-demo`);
      const d = await r.json();
      setRedisProof(d);
    } catch {
      setRedisProof({ redis_status: 'ERROR — backend unreachable', cached_keys: {} });
    }
    setLoadingProof(false);
  };

  const triggerSim = async () => {
    if (simulating) return;
    setSimulating(true);
    try {
      await fetch(`${API}/api/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario })
      });
    } catch (e) { console.error(e); }
    setTimeout(() => setSimulating(false), 8500);
  };

  const freqData     = gridData.slice(-35).map((d, i) => ({ i, hz: d.frequency }));
  const forecastData = Object.values(forecasts)[0] || [];
  const showFreq  = !activeView || ["SENSOR", "ANOMALY"].includes(activeView);
  const showFore  = !activeView || activeView === "FORECAST";
  const showAnoms = !activeView || ["ANOMALY", "SENSOR", "CONTEXT"].includes(activeView);
  const showAlts  = !activeView || activeView === "ALERT";

  const hh = String(new Date().getHours()).padStart(2, "0");
  const mm = String(new Date().getMinutes()).padStart(2, "0");
  const ss = String(new Date().getSeconds()).padStart(2, "0");

  return (
    <div style={{
      minHeight: "100vh", width: "100%",
      background: "linear-gradient(135deg,#e8f4fd 0%,#f0e8ff 30%,#fef3e8 60%,#e8f8f5 100%)",
      fontFamily: "'Inter','SF Pro Display',system-ui,sans-serif",
      color: "rgba(0,0,0,0.88)", overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body,#root{width:100%;min-height:100vh;font-family:'Inter',sans-serif;
          background:linear-gradient(135deg,#e8f4fd 0%,#f0e8ff 30%,#fef3e8 60%,#e8f8f5 100%);}
        body::before{content:'';position:fixed;inset:0;z-index:0;pointer-events:none;
          background:
            radial-gradient(ellipse 60% 45% at 10% 10%,rgba(99,179,237,0.25) 0%,transparent 60%),
            radial-gradient(ellipse 55% 40% at 90% 90%,rgba(167,139,250,0.2) 0%,transparent 60%),
            radial-gradient(ellipse 45% 50% at 50% 50%,rgba(52,211,153,0.12) 0%,transparent 65%);}
        @keyframes ping{75%,100%{transform:scale(2.2);opacity:0;}}
        @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}
        @keyframes fadein{from{opacity:0}to{opacity:1}}
        .fadein{animation:fadein 0.22s ease-out;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-track{background:rgba(0,0,0,0.04);}
        ::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.20);border-radius:2px;}
        button{font-family:'Inter',sans-serif;}
        select{font-family:'Inter',sans-serif;}
        .recharts-tooltip-wrapper{z-index:50!important;}
      `}</style>

      {/* ── HEADER ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        display: "flex", alignItems: "center", height: 58, padding: "0 24px", gap: 14,
        background: "rgba(255,255,255,0.78)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(0,0,0,0.10)",
        boxShadow: "0 2px 16px rgba(100,120,200,0.1)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg,#0ea5e9,#8b5cf6)", boxShadow: "0 4px 14px rgba(99,102,241,0.35)" }}>
            <span style={{ fontSize: "1rem" }}>⚡</span>
          </div>
          <span style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "-0.02em",
            background: "linear-gradient(135deg,#0ea5e9,#8b5cf6)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            GridSense
          </span>
        </div>

        <div style={{ width: 1, height: 20, background: "rgba(0,0,0,0.15)", flexShrink: 0 }} />
        <span style={{ fontSize: "0.47rem", letterSpacing: "0.18em", color: "rgba(0,0,0,0.52)", flexShrink: 0 }}>
          INDIA POWER GRID · AI AGENT MONITOR · POSOCO FEED
        </span>

        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: "0.44rem", padding: "3px 9px", borderRadius: 20,
            background: dbStatus.redis === 'connected' ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
            border: `1px solid ${dbStatus.redis === 'connected' ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
            color: dbStatus.redis === 'connected' ? "#047857" : "#92400e", fontWeight: 700 }}>
            Redis {dbStatus.redis === 'connected' ? '✅' : '⚡'}
          </span>
          <span style={{ fontSize: "0.44rem", padding: "3px 9px", borderRadius: 20,
            background: dbStatus.mongo === 'connected' ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
            border: `1px solid ${dbStatus.mongo === 'connected' ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
            color: dbStatus.mongo === 'connected' ? "#047857" : "#92400e", fontWeight: 700 }}>
            MongoDB {dbStatus.mongo === 'connected' ? '✅' : '⚡'}
          </span>
          {emailReady && (
            <span style={{ fontSize: "0.44rem", padding: "3px 9px", borderRadius: 20,
              background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)",
              color: "#047857", fontWeight: 700 }}>
              📧 Email ✅
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 20,
          background: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.25)", flexShrink: 0 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", flexShrink: 0,
            animation: "ping 1.5s ease-out infinite" }} />
          <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0369a1",
            fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.06em", fontVariantNumeric: "tabular-nums" }}>
            {hh}<span style={{ opacity: tick % 2 ? 0.2 : 1 }}>:</span>
            {mm}<span style={{ opacity: tick % 2 ? 0.2 : 1 }}>:</span>{ss}
          </span>
          <span style={{ fontSize: "0.4rem", color: "rgba(0,0,0,0.48)", letterSpacing: "0.1em" }}>IST</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 7, flex: 1, overflowX: "auto", minWidth: 0 }}>
          {AGENTS.map(a => {
            const on = activeView === a.key;
            return (
              <button key={a.key} onClick={() => setActiveView(p => p === a.key ? null : a.key)} style={{
                flexShrink: 0, fontSize: "0.52rem", letterSpacing: "0.1em",
                padding: "5px 14px", borderRadius: 20, cursor: "pointer",
                border: `1px solid ${on ? a.color : "rgba(0,0,0,0.20)"}`,
                color: on ? a.color : "rgba(0,0,0,0.60)",
                background: on ? `${a.color}14` : "rgba(255,255,255,0.7)",
                fontWeight: on ? 700 : 500,
                boxShadow: on ? `0 0 12px ${a.color}44` : "none",
                transition: "all 0.18s",
              }}>{on ? "▶ " : ""}{a.key}</button>
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <select value={scenario} onChange={e => setScenario(e.target.value)} disabled={simulating}
            style={{
              fontSize: "0.54rem", letterSpacing: "0.06em", padding: "7px 12px", borderRadius: 20, cursor: "pointer",
              background: "rgba(255,255,255,0.90)", border: "1px solid rgba(0,0,0,0.20)",
              color: "rgba(0,0,0,0.78)", outline: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            }}>
            <option value="industrial_surge">⚡ Industrial Surge</option>
            <option value="weather_failure">🌀 Weather Failure</option>
            <option value="transmission_fault">⚠ Transmission Fault</option>
          </select>

          <button onClick={triggerSim} disabled={simulating} style={{
            fontSize: "0.58rem", letterSpacing: "0.08em", padding: "7px 18px", borderRadius: 20, fontWeight: 700,
            cursor: simulating ? "not-allowed" : "pointer",
            border: `1px solid ${simulating ? "rgba(0,0,0,0.15)" : "rgba(239,68,68,0.45)"}`,
            color: simulating ? "rgba(0,0,0,0.40)" : "#dc2626",
            background: simulating ? "rgba(0,0,0,0.04)" : "rgba(239,68,68,0.08)",
            boxShadow: simulating ? "none" : "0 2px 12px rgba(239,68,68,0.2)",
            transition: "all 0.18s",
          }}>{simulating ? "◌ Simulating..." : "▲ Simulate Crisis"}</button>
        </div>
      </header>

      <LossTicker active={simulating} />

      {crisisMode && crisisInfo && (
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 24px",
          background: "rgba(239,68,68,0.09)", borderBottom: "1px solid rgba(239,68,68,0.25)" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#b91c1c", letterSpacing: "0.14em" }}>
            ⚠ CRISIS MODE ACTIVE
          </span>
          <span style={{ fontSize: "0.62rem", color: "rgba(185,28,28,0.80)" }}>
            {crisisInfo.scenario?.toUpperCase()} · {crisisInfo.region} · {crisisInfo.frequency} Hz
          </span>
          <span style={{ marginLeft: "auto", fontSize: "0.5rem", color: "rgba(185,28,28,0.55)", letterSpacing: "0.12em" }}>
            PIPELINE ACTIVE
          </span>
        </div>
      )}

      {/* ── STAT CARDS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, padding: "18px 24px 0" }}>
        {[
          { label: "Active Agents",  value: "5/5",           color: "#0ea5e9", icon: "🤖" },
          { label: "Live Anomalies", value: anomalies.length, color: "#ef4444", icon: "⚠️" },
          { label: "Alerts Sent",    value: alerts.length,    color: "#f59e0b", icon: "📲" },
          { label: "Emails Sent",    value: emailLog.filter(e => e.ok).length, color: "#10b981", icon: "📧" },
          { label: "DB Records",     value: history.length,   color: "#8b5cf6", icon: "🗄️" },
        ].map(s => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.9)",
            borderRadius: 18, boxShadow: "0 4px 24px rgba(100,120,180,0.1)", padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: "0.9rem" }}>{s.icon}</span>
              <span style={{ fontSize: "0.47rem", letterSpacing: "0.16em", color: "rgba(0,0,0,0.55)", fontWeight: 600, textTransform: "uppercase" }}>
                {s.label}
              </span>
            </div>
            <div style={{ fontSize: "2.1rem", fontWeight: 900, color: s.color, lineHeight: 1, letterSpacing: "-0.03em" }}>
              {loading ? "—" : s.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── WEATHER STRIP ── */}
      {Object.keys(weatherMap).length > 0 && (
        <div style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.9)",
          borderRadius: 14, margin: "14px 24px 0", overflow: "hidden", display: "flex", alignItems: "center" }}>
          <div style={{ padding: "11px 18px", borderRight: "1px solid rgba(0,0,0,0.09)", flexShrink: 0 }}>
            <span style={{ fontSize: "0.48rem", letterSpacing: "0.18em", color: "rgba(0,0,0,0.50)", fontWeight: 700 }}>IMD WEATHER</span>
          </div>
          {WEATHER_REGIONS.map((r, i) => {
            const w = weatherMap[r]; if (!w) return null;
            return (
              <div key={r} style={{ display: "flex", alignItems: "center", gap: 9, padding: "11px 20px", flexShrink: 0,
                borderRight: i < WEATHER_REGIONS.length - 1 ? "1px solid rgba(0,0,0,0.09)" : "none" }}>
                <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "rgba(0,0,0,0.70)" }}>{r}</span>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, color: w.temperature_c > 38 ? "#b45309" : "#0369a1", fontVariantNumeric: "tabular-nums" }}>
                  {w.temperature_c}°C
                </span>
                <span style={{ fontSize: "0.88rem" }}>{w.precipitation_prob > 60 ? "🌧" : "☀️"}</span>
                <span style={{ fontSize: "0.58rem", color: "rgba(0,0,0,0.50)" }}>{w.precipitation_prob}%</span>
                {w.wind_kmh > 50 && <span style={{ fontSize: "0.53rem", color: "#b45309", fontWeight: 700 }}>💨{w.wind_kmh}</span>}
              </div>
            );
          })}
        </div>
      )}

      {/* ── MAIN LAYOUT ── */}
      <div style={{ display: "flex", flexDirection: "row", gap: 14, padding: "14px 24px 24px", alignItems: "flex-start", width: "100%" }}>

        {/* LEFT 60% */}
        <div style={{ flex: "0 0 60%", maxWidth: "60%", display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>

          {showFreq && (
            <Card>
              <Head label="Live Grid Frequency" color="#0369a1" right="Hz · REAL-TIME · Z-SCORE MONITORED" dot="#0ea5e9" icon="📊" />
              <div style={{ padding: "16px 20px 14px" }}>
                {loading ? <Shimmer h={184} /> : (
                  <ResponsiveContainer width="100%" height={184}>
                    <LineChart data={freqData} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
                      <CartesianGrid stroke="rgba(0,0,0,0.07)" strokeDasharray="4 4" />
                      <XAxis dataKey="i" hide />
                      <YAxis domain={[49.6, 50.4]} tick={{ fontSize: 10, fill: "rgba(0,0,0,0.52)", fontFamily: "'JetBrains Mono',monospace" }} />
                      <Tooltip contentStyle={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(14,165,233,0.30)",
                        borderRadius: 10, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "rgba(0,0,0,0.82)" }}
                        formatter={v => [`${v} Hz`, ""]} labelFormatter={() => ""} />
                      <ReferenceLine y={49.7} stroke="rgba(239,68,68,0.35)" strokeDasharray="3 3" />
                      <ReferenceLine y={50.3} stroke="rgba(239,68,68,0.35)" strokeDasharray="3 3" />
                      <ReferenceLine y={50.0} stroke="rgba(0,0,0,0.12)" />
                      <Line type="monotone" dataKey="hz" stroke="#0ea5e9" dot={false} strokeWidth={2.5}
                        style={{ filter: "drop-shadow(0 0 6px rgba(14,165,233,0.55))" }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          )}

          {showFore && (
            <Card>
              <Head label="6-Hour Demand Forecast" color="#7c3aed" right="WMA + TEMP CORRECTION · MW" dot="#8b5cf6" icon="🔮" />
              <div style={{ padding: "16px 20px 14px" }}>
                {loading ? <Shimmer h={148} /> : (
                  <ResponsiveContainer width="100%" height={148}>
                    <AreaChart data={forecastData} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
                      <CartesianGrid stroke="rgba(0,0,0,0.07)" strokeDasharray="4 4" />
                      <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "rgba(0,0,0,0.52)", fontFamily: "'JetBrains Mono',monospace" }} />
                      <YAxis tick={{ fontSize: 10, fill: "rgba(0,0,0,0.52)", fontFamily: "'JetBrains Mono',monospace" }} />
                      <Tooltip contentStyle={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(139,92,246,0.30)",
                        borderRadius: 10, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "rgba(0,0,0,0.82)" }} />
                      <defs>
                        <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="confidence_high" stroke="none" fill="rgba(139,92,246,0.07)" />
                      <Area type="monotone" dataKey="confidence_low" stroke="none" fill="rgba(255,255,255,0.5)" />
                      <Area type="monotone" dataKey="demand" stroke="#8b5cf6" fill="url(#fg)" strokeWidth={2.5}
                        style={{ filter: "drop-shadow(0 0 5px rgba(139,92,246,0.45))" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {showAnoms && (
              <Card style={{ display: "flex", flexDirection: "column" }}>
                <Head label="Anomaly Feed" color="#b91c1c" right={`${anomalies.length}`} dot="#ef4444" icon="⚠️" />
                <div style={{ overflowY: "auto", maxHeight: 280 }}>
                  {loading ? [1, 2, 3].map(i => <div key={i} style={{ padding: "14px 16px" }}><Shimmer h={60} /></div>)
                  : anomalies.length === 0
                  ? <p style={{ padding: "22px 18px", fontSize: "0.65rem", color: "rgba(0,0,0,0.45)" }}>Monitoring…</p>
                  : anomalies.map((a, i) => {
                      const sv = sev(a.severity);
                      return (
                        <div key={i} className="fadein" style={{
                          margin: "8px 10px", padding: "13px 14px", borderRadius: 12, background: sv.bg, border: `1px solid ${sv.br}`,
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                            <span style={{ fontSize: "0.88rem", fontWeight: 800, color: sv.c, letterSpacing: "-0.01em" }}>{a.region}</span>
                            <span style={{ fontSize: "0.58rem", padding: "3px 9px", fontWeight: 700, color: sv.c,
                              background: "rgba(255,255,255,0.7)", borderRadius: 20, border: `1px solid ${sv.br}` }}>
                              {a.severity}/10
                            </span>
                          </div>
                          <p style={{ fontSize: "0.62rem", color: "rgba(0,0,0,0.62)", marginBottom: 5, fontFamily: "'JetBrains Mono',monospace" }}>
                            {a.frequency} Hz
                            {a.zScore && <span style={{ color: "rgba(0,0,0,0.48)" }}> · Z: {a.zScore}σ</span>}
                            {a.weatherBoost > 0 && <span style={{ color: "#b45309" }}> · wx+{a.weatherBoost}</span>}
                          </p>
                          <p style={{ fontSize: "0.61rem", color: "rgba(0,0,0,0.62)", lineHeight: 1.6,
                            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{a.reason}</p>
                          {a.context && (
                            <p style={{ fontSize: "0.58rem", color: "rgba(109,40,217,0.72)", marginTop: 7,
                              paddingLeft: 9, borderLeft: "2px solid rgba(139,92,246,0.35)",
                              fontStyle: "italic", lineHeight: 1.6,
                              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                              📍 {a.context.slice(0, 88)}
                            </p>
                          )}
                        </div>
                      );
                    })}
                </div>
              </Card>
            )}
            {showAlts && (
              <Card style={{ display: "flex", flexDirection: "column" }}>
                <Head label="Stakeholder Alerts" color="#92400e" right={`${alerts.length}`} dot="#f59e0b" icon="📲" />
                <div style={{ overflowY: "auto", maxHeight: 280 }}>
                  {loading ? [1, 2, 3].map(i => <div key={i} style={{ padding: "14px 16px" }}><Shimmer h={52} /></div>)
                  : alerts.length === 0
                  ? <p style={{ padding: "22px 18px", fontSize: "0.65rem", color: "rgba(0,0,0,0.45)" }}>No active alerts</p>
                  : alerts.map((a, i) => (
                    <div key={i} className="fadein" style={{
                      margin: "8px 10px", padding: "13px 14px", borderRadius: 12,
                      background: "rgba(245,158,11,0.09)", border: "1px solid rgba(245,158,11,0.30)",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#92400e" }}>{a.stakeholder}</span>
                        <span style={{ fontSize: "0.5rem", color: "rgba(0,0,0,0.48)", letterSpacing: "0.08em" }}>{a.region}</span>
                      </div>
                      <p style={{ fontSize: "0.61rem", color: "rgba(0,0,0,0.65)", lineHeight: 1.6,
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{a.message}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Extra panels */}
          <Card>
            <div style={{ display: "flex", borderBottom: "1px solid rgba(0,0,0,0.08)", overflowX: "auto" }}>
              {[
                { key: "story",   label: "Case Studies",    color: "#b45309" },
                { key: "history", label: "Anomaly History", color: "#0369a1" },
                { key: "compare", label: "vs Current",      color: "#7c3aed" },
                { key: "redis",   label: "Redis Proof",     color: "#10b981" },
                { key: "email",   label: "Email Log",       color: "#f43f5e" },
              ].map(tab => (
                <button key={tab.key} onClick={() => setShowExtra(tab.key)} style={{
                  flexShrink: 0, fontSize: "0.54rem", letterSpacing: "0.1em", padding: "12px 16px",
                  border: "none", background: "transparent", cursor: "pointer",
                  borderBottom: showExtra === tab.key ? `2px solid ${tab.color}` : "2px solid transparent",
                  color: showExtra === tab.key ? tab.color : "rgba(0,0,0,0.52)",
                  fontWeight: showExtra === tab.key ? 700 : 500,
                  transition: "color 0.15s,border-color 0.15s",
                }}>{tab.label}</button>
              ))}
            </div>
            {showExtra === "story"   && <CaseStudies />}
            {showExtra === "history" && <HistoryTimeline history={history} />}
            {showExtra === "compare" && <CompareTable />}
            {showExtra === "redis"   && (
              <RedisProofPanel redisProof={redisProof} loadingProof={loadingProof} onRefresh={loadRedisProof} />
            )}
            {showExtra === "email"   && <EmailSentLog emailLog={emailLog} />}
          </Card>
        </div>

        {/* RIGHT 40% */}
        <div style={{ flex: "0 0 calc(40% - 14px)", maxWidth: "calc(40% - 14px)", display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <Card>
            <IndiaMap anomalies={anomalies} />
          </Card>
          <Card style={{ display: "flex", flexDirection: "column" }}>
            <Head label="Agent Activity Log" color="#7c3aed" right="LIVE · REAL-TIME REASONING" dot="#8b5cf6" icon="🤖" />
            <div style={{ overflowY: "auto", maxHeight: 340 }}>
              {loading ? [1, 2, 3, 4, 5].map(i => <div key={i} style={{ padding: "8px 18px" }}><Shimmer h={16} /></div>)
              : agentLog.length === 0
              ? <p style={{ padding: "22px 18px", fontSize: "0.65rem", color: "rgba(0,0,0,0.45)" }}>Awaiting pipeline…</p>
              : agentLog.map(e => (
                <div key={e.id} className="fadein" style={{
                  display: "flex", gap: 10, alignItems: "flex-start",
                  padding: "9px 18px", borderBottom: "1px solid rgba(0,0,0,0.06)", transition: "background 0.12s",
                }}
                  onMouseEnter={ev => ev.currentTarget.style.background = "rgba(0,0,0,0.03)"}
                  onMouseLeave={ev => ev.currentTarget.style.background = "transparent"}>
                  <span style={{ fontSize: "0.5rem", color: "rgba(0,0,0,0.42)", flexShrink: 0,
                    fontFamily: "'JetBrains Mono',monospace", fontVariantNumeric: "tabular-nums", minWidth: 50, paddingTop: 1 }}>{e.time}</span>
                  <span style={{ fontSize: "0.59rem", fontWeight: 700, flexShrink: 0, color: e.color, minWidth: 76,
                    fontFamily: "'JetBrains Mono',monospace", paddingTop: 1 }}>[{e.agent}]</span>
                  <span style={{ fontSize: "0.6rem", color: "rgba(0,0,0,0.65)", lineHeight: 1.55,
                    fontFamily: "'JetBrains Mono',monospace", wordBreak: "break-word" }}>{e.msg}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 24px 20px" }}>
        <span style={{ fontSize: "0.47rem", letterSpacing: "0.14em", color: "rgba(0,0,0,0.45)" }}>
          GRIDSENSE v1.0 · CORTEX COLLECTIVE
        </span>
        <span style={{ fontSize: "0.47rem", letterSpacing: "0.14em", color: "rgba(0,0,0,0.40)" }}>
          ML: Z-SCORE + WMA · MongoDB + Redis · 5 AGENTS ACTIVE
        </span>
      </div>
    </div>
  );
}
