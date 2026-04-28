const REGIONS = ['UP', 'Maharashtra', 'Tamil Nadu', 'West Bengal', 'Rajasthan'];

const REGION_BASELINE = {
  'UP':          { base: 49.98, load: 22000, gen: 21800, lat: 26.85, lon: 80.91 },
  'Maharashtra': { base: 50.01, load: 28000, gen: 27900, lat: 19.76, lon: 75.71 },
  'Tamil Nadu':  { base: 49.97, load: 18000, gen: 17900, lat: 10.90, lon: 78.66 },
  'West Bengal': { base: 50.02, load: 16000, gen: 15900, lat: 22.98, lon: 87.85 },
  'Rajasthan':   { base: 49.99, load: 14000, gen: 13900, lat: 27.02, lon: 74.22 },
};

const SCENARIOS = {
  industrial_surge: {
    name: "Industrial Surge", region: "UP", frequency: 49.1,
    load_mw: 28500, generation_mw: 24200, severity: 9,
    reason: "Meerut-Kanpur steel belt simultaneous shift change — 4,300MW unscheduled load surge overwhelmed AGC response within 90 seconds, Northern Grid frequency collapsed to 49.1Hz.",
    context: "Three major steel plants in Meerut/Kanpur initiated simultaneous morning shift — grid scheduling failed to anticipate combined 4.3GW draw. Tehri hydro at minimum discharge for maintenance.",
    stakeholder: "Tata Steel Meerut",
    alert_msg: "URGENT [CRISIS SIM]: UP grid at 49.1Hz — 4,300MW deficit. Tata Steel Meerut: activate ALL backup DG sets immediately. Estimated 18-min window before cascade failure.",
  },
  weather_failure: {
    name: "Weather Failure", region: "Maharashtra", frequency: 49.3,
    load_mw: 26800, generation_mw: 23500, severity: 8,
    reason: "Cyclone-driven coastal substation trip — 3,200MW generation dropped offline as Konkan coast 765kV towers collapsed under 95km/h sustained winds.",
    context: "Cyclonic storm Vayu making landfall near Ratnagiri — sustained 95km/h winds caused 6 high-tension towers to collapse on the Konkan coast, isolating Koyna hydro from Western Grid.",
    stakeholder: "Reliance Industries Mumbai",
    alert_msg: "CRITICAL [CRISIS SIM]: Storm-induced generation loss in Maharashtra — 49.3Hz. Reliance Industries Mumbai: throttle non-critical industrial load by 30% immediately. Grid stress SEV 8/10.",
  },
  transmission_fault: {
    name: "Transmission Fault", region: "West Bengal", frequency: 49.0,
    load_mw: 22000, generation_mw: 18800, severity: 10,
    reason: "Farakka-Jerat 765kV line tripped on Zone-3 distance relay — Eastern Grid islanded from ISTS, creating 3,200MW import deficit with no fast-response backup available.",
    context: "Farakka-Jerat 765kV line tripped on distance relay Zone-3 operation — suspected fault at Jerat substation isolating West Bengal from ISTS grid. DVC hydro insufficient to cover deficit.",
    stakeholder: "CESC Kolkata",
    alert_msg: "EMERGENCY [CRISIS SIM]: Grid islanding in West Bengal — 49.0Hz, SEV 10/10. CESC Kolkata: execute emergency load shedding Protocol Level 3 immediately. CESC command centre on standby.",
  },
};

module.exports = { REGIONS, REGION_BASELINE, SCENARIOS };
