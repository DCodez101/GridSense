import { useState } from "react";

export function CaseStudies() {
  const stories = [
    { date: "OCT 2020", title: "Mumbai Blackout",
      without: "28M people lost power. Tata Steel lost ₹4.2Cr in one shift. Engineers found out 40 min after cascade began.",
      with: "GridSense flags 49.3Hz deviation 18 min before failure. Backup DG activated. ₹4.2Cr saved.",
      saving: "₹4.2Cr", warning: "18 min", c: "#f59e0b" },
    { date: "JUL 2022", title: "Northern Grid Stress",
      without: "Peak demand hit 210GW. No warning. 6 states faced 4-hr rolling cuts. ₹11Cr loss.",
      with: "ForecastAgent predicted 208GW+ demand 6 hrs ahead. DISCOMs pre-scheduled. Outage avoided.",
      saving: "₹11Cr", warning: "6 hrs", c: "#ef4444" },
    { date: "MAR 2023", title: "WB Line Trip",
      without: "765kV line tripped 2am. CESC unaware 22 min. Hospital generators started late.",
      with: "Fault detected in 3 sec. CESC alerted. Hospital on UPS in time.",
      saving: "₹2.8Cr", warning: "22 min", c: "#0ea5e9" },
  ];

  const [active, setActive] = useState(0);
  const s = stories[active];

  return (
    <div style={{ padding: "18px 20px 22px" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {stories.map((st, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            fontSize: "0.54rem", letterSpacing: "0.08em", padding: "6px 14px", borderRadius: 20, cursor: "pointer",
            border: `1px solid ${active === i ? st.c : "rgba(0,0,0,0.22)"}`,
            color: active === i ? st.c : "rgba(0,0,0,0.60)",
            background: active === i ? `${st.c}12` : "rgba(255,255,255,0.7)",
            fontWeight: active === i ? 700 : 500, transition: "all 0.18s",
          }}>{st.date} · {st.title}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
        <div style={{ borderRadius: 12, padding: "14px 16px",
          background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)" }}>
          <p style={{ fontSize: "0.5rem", letterSpacing: "0.16em", color: "rgba(180,20,20,0.75)", fontWeight: 700, marginBottom: 8 }}>✗ WITHOUT GRIDSENSE</p>
          <p style={{ fontSize: "0.65rem", color: "rgba(0,0,0,0.68)", lineHeight: 1.7 }}>{s.without}</p>
        </div>
        <div style={{ borderRadius: 12, padding: "14px 16px",
          background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.18)" }}>
          <p style={{ fontSize: "0.5rem", letterSpacing: "0.16em", color: "rgba(4,120,87,0.75)", fontWeight: 700, marginBottom: 8 }}>✓ WITH GRIDSENSE</p>
          <p style={{ fontSize: "0.65rem", color: "rgba(0,0,0,0.68)", lineHeight: 1.7 }}>{s.with}</p>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <div>
          <p style={{ fontSize: "0.47rem", letterSpacing: "0.14em", color: "rgba(0,0,0,0.48)", marginBottom: 3 }}>SAVING</p>
          <p style={{ fontSize: "1.6rem", fontWeight: 900, color: "#059669", letterSpacing: "-0.03em" }}>{s.saving}</p>
        </div>
        <div>
          <p style={{ fontSize: "0.47rem", letterSpacing: "0.14em", color: "rgba(0,0,0,0.48)", marginBottom: 3 }}>WARNING</p>
          <p style={{ fontSize: "1.6rem", fontWeight: 900, letterSpacing: "-0.03em", color: s.c }}>{s.warning}</p>
        </div>
      </div>
    </div>
  );
}
