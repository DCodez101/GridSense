export function CompareTable() {
  const rows = [
    { m: "Detection Time",    w: "40–90 min after failure",   g: "< 3 seconds",           d: "1800× faster"   },
    { m: "Stakeholder Alert", w: "Phone calls, manual",       g: "Automated email + UI",   d: "Zero delay"     },
    { m: "Root Cause",        w: "Post-mortem analysis",      g: "Real-time AI context",   d: "Instant"        },
    { m: "Forecast",          w: "None",                      g: "6-hr WMA demand curve",  d: "New capability" },
    { m: "Coverage",          w: "Engineer on duty only",     g: "5 regions, 24/7",        d: "Always on"      },
    { m: "Cost per outage",   w: "₹2–11 Crore avg loss",      g: "₹0 (prevented)",         d: "100% saving"    },
    { m: "Data persistence",  w: "Lost on system restart",    g: "MongoDB + Redis TTL",    d: "Always available"},
  ];

  return (
    <div style={{ padding: "18px 20px", overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 5px" }}>
        <thead>
          <tr>
            {["METRIC", "WITHOUT", "WITH GRIDSENSE", "DELTA"].map(h => (
              <th key={h} style={{ textAlign: "left", paddingBottom: 6, paddingLeft: 10,
                fontSize: "0.5rem", letterSpacing: "0.14em", color: "rgba(0,0,0,0.48)", fontWeight: 700 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td style={{ padding: "9px 10px", fontSize: "0.63rem", color: "rgba(0,0,0,0.80)", fontWeight: 600,
                background: "rgba(0,0,0,0.03)", borderRadius: "10px 0 0 10px" }}>{r.m}</td>
              <td style={{ padding: "9px 10px", fontSize: "0.61rem", color: "rgba(180,20,20,0.78)",
                background: "rgba(0,0,0,0.03)" }}>{r.w}</td>
              <td style={{ padding: "9px 10px", fontSize: "0.61rem", color: "rgba(4,120,87,0.82)",
                background: "rgba(0,0,0,0.03)" }}>{r.g}</td>
              <td style={{ padding: "9px 10px", fontSize: "0.63rem", color: "#047857", fontWeight: 700,
                background: "rgba(16,185,129,0.08)", borderRadius: "0 10px 10px 0" }}>{r.d}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
