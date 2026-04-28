async function alertAgent(anomaly) {
  const stakeholders = {
    'UP':          'Tata Steel Meerut',
    'Maharashtra': 'Reliance Industries Mumbai',
    'Tamil Nadu':  'Chennai DISCOM',
    'West Bengal': 'CESC Kolkata',
    'Rajasthan':   'Jaipur DISCOM',
  };
  const stakeholder = stakeholders[anomaly.region] || 'Local DISCOM';
  const timeStr     = new Date().toLocaleTimeString('en-IN', { hour12: false });
  const deficit     = anomaly.load_mw - anomaly.generation_mw;

  const messages = [
    `URGENT [${timeStr}]: ${anomaly.region} grid at ${anomaly.frequency}Hz (SEV ${anomaly.severity}/10) — ${Math.abs(deficit).toLocaleString()}MW ${deficit > 0 ? 'deficit' : 'surplus'} detected. ${stakeholder}: activate standby generation within 5 minutes.`,
    `ALERT [${timeStr}]: Z-Score ${anomaly.zScore}σ deviation on ${anomaly.region} grid — frequency ${anomaly.frequency}Hz. ${stakeholder}: throttle non-critical load by ${Math.min(30, anomaly.severity * 3)}% immediately to prevent cascade.`,
    `GRID WARNING [${timeStr}]: ${anomaly.region} frequency ${anomaly.frequency}Hz, ${deficit > 0 ? 'under' : 'over'}-generation of ${Math.abs(deficit).toLocaleString()}MW. ${stakeholder}: switch critical systems to UPS, notify shift supervisor now.`,
    `CRITICAL [${timeStr}]: ${anomaly.region} SEV ${anomaly.severity}/10 — estimated ${Math.round(anomaly.severity * 8)} min to potential outage. ${stakeholder}: execute load shedding protocol Level ${Math.ceil(anomaly.severity / 3)} immediately.`,
  ];

  const idx = Math.floor((anomaly.frequency * 1000 + anomaly.severity + new Date().getMinutes()) % messages.length);

  return {
    region:      anomaly.region,
    stakeholder,
    message:     messages[idx],
    severity:    anomaly.severity,
  };
}

module.exports = { alertAgent };
