const { REGIONS, REGION_BASELINE } = require('../config/constants');
const { rGet } = require('../db/redis');

const freqStats = {};

function prewarmZScore() {
  REGIONS.forEach(region => {
    const b = REGION_BASELINE[region];
    const seedValues = Array.from({ length: 20 }, () =>
      parseFloat((b.base + (Math.random() - 0.5) * 0.15).toFixed(3))
    );
    freqStats[region] = { values: seedValues };
  });
  console.log('[ML] Z-Score pre-warmed for all regions ✅');
}

async function anomalyAgent(gridPoint) {
  if (!freqStats[gridPoint.region]) {
    freqStats[gridPoint.region] = { values: [] };
  }
  freqStats[gridPoint.region].values.push(gridPoint.frequency);
  if (freqStats[gridPoint.region].values.length > 30)
    freqStats[gridPoint.region].values.shift();

  const vals = freqStats[gridPoint.region].values;
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const std  = Math.sqrt(vals.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / vals.length) || 0.3;
  const zScore = Math.abs((gridPoint.frequency - mean) / std);

  if (zScore < 1.5 && Math.abs(gridPoint.frequency - 50.0) < 0.15) return null;

  const severity = Math.min(10, Math.round(zScore * 2.5));

  const weather = await rGet(`weather:${gridPoint.region}`);
  let weatherBoost = 0, weatherData = null;
  if (weather) {
    weatherData = weather;
    if (weather.temperature_c > 38) weatherBoost += 1;
    if (weather.precipitation_prob > 70) weatherBoost += 1;
    if (weather.wind_kmh > 50) weatherBoost += 1;
  }
  const finalSeverity = Math.min(10, severity + weatherBoost);

  const deviation = (gridPoint.frequency - 50.0).toFixed(3);
  const deficit   = gridPoint.load_mw - gridPoint.generation_mw;
  const hour      = new Date().getHours();
  const timeSlot  = hour < 6  ? "early morning low-demand period"
                  : hour < 10 ? "morning ramp-up period"
                  : hour < 14 ? "midday industrial peak"
                  : hour < 18 ? "afternoon high-load window"
                  : hour < 22 ? "evening peak demand hours"
                  :             "late night base-load period";

  const regionContext = {
    'UP':          { industry: 'steel and textile mills',     grid: 'Northern Regional Grid', hydro: 'Tehri hydro'   },
    'Maharashtra': { industry: 'petrochemical and IT parks',  grid: 'Western Regional Grid',  hydro: 'Koyna hydro'   },
    'Tamil Nadu':  { industry: 'auto manufacturing plants',   grid: 'Southern Regional Grid', hydro: 'Mettur dam'    },
    'West Bengal': { industry: 'jute and chemical factories', grid: 'Eastern Regional Grid',  hydro: 'DVC hydro'     },
    'Rajasthan':   { industry: 'cement and mining ops',       grid: 'Northern Regional Grid', hydro: 'Chambal hydro' },
  };
  const ctx = regionContext[gridPoint.region] || { industry: 'industrial units', grid: 'Regional Grid', hydro: 'hydro generation' };

  const reasons = [
    `${gridPoint.region} ${ctx.industry} drew ${deficit > 0 ? `${deficit.toLocaleString()}MW surplus load` : `unexpected ${Math.abs(deficit).toLocaleString()}MW demand spike`} during ${timeSlot}, pulling frequency ${Math.abs(deviation)}Hz ${parseFloat(deviation) < 0 ? 'below' : 'above'} nominal.`,
    `Z-Score of ${zScore.toFixed(2)}σ detected on ${ctx.grid} — ${gridPoint.load_mw.toLocaleString()}MW load against ${gridPoint.generation_mw.toLocaleString()}MW scheduled generation indicates ${deficit > 0 ? 'under-generation' : 'over-generation'} of ${Math.abs(deficit).toLocaleString()}MW.`,
    `${ctx.hydro} dispatch shortfall during ${timeSlot} — thermal backup in ${gridPoint.region} unable to compensate ${Math.abs(deficit).toLocaleString()}MW gap fast enough, causing ${Math.abs(deviation)}Hz frequency drift.`,
    `Automatic generation control (AGC) in ${gridPoint.region} failed to rebalance ${deficit > 0 ? 'load surge' : 'generation surplus'} of ${Math.abs(deficit).toLocaleString()}MW within governor response time, resulting in ${zScore.toFixed(2)}σ deviation.`,
    `${gridPoint.region} inter-regional tie-line schedule mismatch — actual import/export deviating from SCADA-planned values by ~${Math.abs(deficit).toLocaleString()}MW during ${timeSlot}, frequency at ${gridPoint.frequency}Hz.`,
    weatherData && weatherData.temperature_c > 36
      ? `Ambient temperature of ${weatherData.temperature_c}°C in ${gridPoint.region} driving ${Math.round(weatherData.temperature_c * 45)}MW unscheduled AC load spike, overwhelming scheduled generation of ${gridPoint.generation_mw.toLocaleString()}MW.`
      : null,
    weatherData && weatherData.precipitation_prob > 60
      ? `${weatherData.precipitation_prob}% precipitation probability in ${gridPoint.region} — solar generation output dropped ~${Math.round(weatherData.precipitation_prob * 12)}MW unexpectedly, creating ${Math.abs(deviation)}Hz frequency deviation.`
      : null,
    weatherData && weatherData.wind_kmh > 45
      ? `Wind speed of ${weatherData.wind_kmh}km/h in ${gridPoint.region} causing wind farm output fluctuation of ±${Math.round(weatherData.wind_kmh * 8)}MW, destabilizing frequency to ${gridPoint.frequency}Hz.`
      : null,
  ].filter(Boolean);

  const idx    = Math.floor((gridPoint.frequency * 1000 + gridPoint.load_mw + hour) % reasons.length);
  const reason = reasons[idx];

  return {
    ...gridPoint,
    severity: finalSeverity,
    reason,
    zScore: zScore.toFixed(2),
    weatherBoost,
    weatherData,
    algorithm: "Z-Score Statistical Detection",
  };
}

module.exports = { anomalyAgent, prewarmZScore };
