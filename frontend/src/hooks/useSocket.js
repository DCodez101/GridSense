import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { API } from "../constants";
import { sendAlertEmail } from "../services/emailService";

const socket = io(API);
let lastEmailSent = 0;

export function useSocket({ setGridData, setAnomalies, setAlerts, setForecasts,
  setAgentLog, setLoading, setCrisisMode, setCrisisInfo, setHistory, setEmailLog }) {

  const lastEmailTime = useRef(0);

  function addLog(agent, msg, color = "#0ea5e9") {
    setAgentLog(prev => [{
      agent, msg, color,
      time: new Date().toLocaleTimeString("en-IN", { hour12: false }),
      id: Date.now() + Math.random()
    }, ...prev].slice(0, 100));
  }

  async function sendEmailForAlert(alert) {
    const now = Date.now();
    if (now - lastEmailSent < 5 * 60 * 1000) return;
    lastEmailSent = now;

    const payload = {
      to_name:   alert.stakeholder,
      to_email:  "selfmyself112@gmail.com",
      subject:   `GridSense ALERT: ${alert.region} Grid Emergency — SEV ${alert.severity}/10`,
      message:   alert.message,
      region:    alert.region,
      frequency: alert.frequency || "N/A",
      severity:  alert.severity,
      timestamp: new Date().toLocaleTimeString("en-IN", { hour12: false }),
    };

    const result = await sendAlertEmail(payload);
    setEmailLog(prev => [{
      ok: result.ok, to: payload.to_name,
      subject: payload.subject, reason: result.reason, time: payload.timestamp,
    }, ...prev].slice(0, 20));

    if (result.ok) addLog("ALERT", `📧 Email delivered → ${alert.stakeholder}`, "#10b981");
  }

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 3000);

    socket.on("grid-update", (data) => {
      setLoading(false);
      setGridData(prev => [...prev.slice(-60), ...data]);
      const freqs = data.map(d => d.frequency);
      addLog("SENSOR", `${data.length} regions · ${Math.min(...freqs).toFixed(3)}–${Math.max(...freqs).toFixed(3)} Hz`, "#0ea5e9");
    });

    socket.on("anomaly", (a) => {
      setAnomalies(prev => [a, ...prev].slice(0, 30));
      setHistory(prev => [a, ...prev].slice(0, 50));
      const z = a.zScore ? ` | Z: ${a.zScore}σ` : "";
      const w = a.weatherBoost > 0 ? ` | wx+${a.weatherBoost} (${a.weatherData?.temperature_c}°C)` : "";
      addLog("ANOMALY", `${a.region} ${a.frequency}Hz${z}${w} | SEV ${a.severity}/10`, "#f43f5e");
      if (a.context) addLog("CONTEXT", `${a.region}: ${a.context.slice(0, 70)}`, "#8b5cf6");
    });

    socket.on("alert", (a) => {
      setAlerts(prev => [a, ...prev].slice(0, 30));
      addLog("ALERT", `→ ${a.stakeholder} | SEV ${a.severity}/10`, "#f59e0b");
      if (a.severity >= 7) sendEmailForAlert(a);
    });

    socket.on("forecast", (f) => {
      setForecasts(prev => ({ ...prev, [f.region]: f.data }));
      const h1 = f.data?.[0];
      addLog("FORECAST", `${f.region}: WMA${h1 ? ` | H+1: ${h1.demand.toLocaleString()} MW` : ""}`, "#10b981");
    });

    socket.on("crisis-start", (data) => {
      setCrisisMode(true);
      setCrisisInfo(data);
      addLog("SENSOR", `⚡ CRISIS: ${data.scenario} — ${data.region} @ ${data.frequency}Hz`, "#f43f5e");
    });

    socket.on("crisis-end", () => {
      setCrisisMode(false);
      setCrisisInfo(null);
      addLog("SENSOR", "Crisis ended — resuming normal monitoring", "#10b981");
    });

    return () => { socket.off(); clearTimeout(t); };
  }, []);

  return { socket };
}
