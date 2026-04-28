import { glass } from "../constants";

export function Card({ children, style = {} }) {
  return <div style={{ ...glass, overflow: "hidden", ...style }}>{children}</div>;
}

export function Head({ label, color = "#0ea5e9", right, icon, dot }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 20px", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {dot && (
          <span style={{ position: "relative", display: "inline-flex", width: 8, height: 8 }}>
            <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: dot,
              animation: "ping 1.5s ease-out infinite", opacity: 0.5 }} />
            <span style={{ position: "relative", width: 8, height: 8, borderRadius: "50%", background: dot }} />
          </span>
        )}
        {icon && <span style={{ fontSize: "0.82rem" }}>{icon}</span>}
        <span style={{ fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.14em",
          color, textTransform: "uppercase" }}>{label}</span>
      </div>
      {right && <span style={{ fontSize: "0.52rem", color: "rgba(0,0,0,0.50)",
        letterSpacing: "0.1em" }}>{right}</span>}
    </div>
  );
}

export function Shimmer({ h = 80 }) {
  return (
    <div style={{ position: "relative", overflow: "hidden", height: h, borderRadius: 10,
      background: "rgba(0,0,0,0.06)" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)",
        animation: "shimmer 1.6s infinite" }} />
    </div>
  );
}
