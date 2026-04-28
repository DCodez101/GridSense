export function EmailSentLog({ emailLog }) {
  if (emailLog.length === 0) return (
    <p style={{ padding: "22px 20px", fontSize: "0.65rem", color: "rgba(0,0,0,0.45)" }}>
      No emails sent yet — trigger Simulate Crisis to see live email delivery
    </p>
  );

  return (
    <div style={{ padding: "14px 16px 16px" }}>
      {emailLog.map((e, i) => (
        <div key={i} style={{ margin: "6px 0", padding: "12px 14px", borderRadius: 12,
          background: e.ok ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)",
          border: `1px solid ${e.ok ? "rgba(16,185,129,0.25)" : "rgba(245,158,11,0.25)"}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
            <span style={{ fontSize: "0.7rem", fontWeight: 700,
              color: e.ok ? "#047857" : "#92400e" }}>
              {e.ok ? "✅ EMAIL DELIVERED" : "⚠️ EMAIL SKIPPED"}
            </span>
            <span style={{ fontSize: "0.5rem", color: "rgba(0,0,0,0.42)", fontFamily: "'JetBrains Mono',monospace" }}>
              {e.time}
            </span>
          </div>
          <p style={{ fontSize: "0.62rem", color: "rgba(0,0,0,0.62)", marginBottom: 3 }}>
            To: <strong>{e.to}</strong>
          </p>
          <p style={{ fontSize: "0.58rem", color: "rgba(0,0,0,0.52)", lineHeight: 1.5 }}>{e.subject}</p>
          {!e.ok && e.reason === 'not configured' && (
            <p style={{ fontSize: "0.52rem", color: "#92400e", marginTop: 5 }}>
              Configure EmailJS in .env to enable real delivery → VITE_EMAILJS_*
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
