import { useEffect, useState, useRef } from "react";

export function LossTicker({ active }) {
  const [loss, setLoss] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (active) {
      setLoss(0);
      ref.current = setInterval(() => setLoss(p => p + Math.floor(2000 + Math.random() * 4000)), 80);
    } else {
      clearInterval(ref.current);
      setLoss(0);
    }
    return () => clearInterval(ref.current);
  }, [active]);

  if (!active) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 24px",
      background: "rgba(239,68,68,0.08)", borderBottom: "1px solid rgba(239,68,68,0.2)" }}>
      <span style={{ fontSize: "0.62rem", letterSpacing: "0.18em", color: "#dc2626", fontWeight: 700 }}>
        ESTIMATED ECONOMIC LOSS
      </span>
      <span style={{ marginLeft: "auto", fontSize: "1.4rem", fontWeight: 900, color: "#dc2626",
        fontFamily: "'Inter',sans-serif", letterSpacing: "-0.02em" }}>
        ₹ {loss.toLocaleString("en-IN")}
        <span style={{ fontSize: "0.5rem", color: "rgba(220,38,38,0.65)", marginLeft: 6, letterSpacing: "0.1em" }}>/MIN</span>
      </span>
    </div>
  );
}
