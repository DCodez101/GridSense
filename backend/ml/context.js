const { rGet } = require('../db/redis');

async function contextAgent(anomaly) {
  const hour        = new Date().getHours();
  const deficit     = anomaly.load_mw - anomaly.generation_mw;
  const weather     = anomaly.weatherData;
  const timeContext = hour < 6  ? "pre-dawn low activity"
                    : hour < 10 ? "morning industrial startup"
                    : hour < 14 ? "midday peak operations"
                    : hour < 18 ? "afternoon sustained load"
                    : hour < 22 ? "evening residential + industrial overlap"
                    :             "post-midnight base load";

  const regionalStories = {
    'UP': [
      `Meerut-Kanpur industrial belt running double shifts during ${timeContext} — steel furnace load cycling causing ${Math.abs(deficit).toLocaleString()}MW demand spikes unpredictable to AGC.`,
      `UP agricultural sector running tube-well pumps for ${timeContext} irrigation — unmetered rural load adding ~${Math.round(Math.abs(deficit) * 0.4).toLocaleString()}MW unscheduled draw.`,
      `Lucknow commercial district peak cooling load during ${timeContext}${weather ? ` with ${weather.temperature_c}°C ambient temperature` : ''} stressing Northern Regional Grid balance.`,
    ],
    'Maharashtra': [
      `Mumbai's BKC and Andheri IT corridor data centres running at full capacity during ${timeContext}, creating ${Math.abs(deficit).toLocaleString()}MW sustained base load above forecast.`,
      `Pune auto manufacturing plants — Tata Motors, Bajaj — running extended shifts during ${timeContext}, drawing ${Math.abs(deficit).toLocaleString()}MW above scheduled allocation.`,
      `Konkan coastal wind generation underperforming${weather ? ` at ${weather.wind_kmh}km/h` : ''} — Western Grid compensating with expensive gas peakers during ${timeContext}.`,
    ],
    'Tamil Nadu': [
      `Chennai auto corridor (Hyundai, Ford, BMW) running assembly lines during ${timeContext} — high-precision machinery causing rapid load fluctuations.`,
      `Tamil Nadu solar fleet output dropping during ${timeContext}${weather ? ` due to ${weather.precipitation_prob}% cloud cover` : ''} — thermal backup ramping insufficient.`,
      `Mettur reservoir discharge reduced — hydro output down ~${Math.round(Math.abs(deficit) * 0.3).toLocaleString()}MW, Southern Grid relying on costly coal during ${timeContext}.`,
    ],
    'West Bengal': [
      `Haldia petrochemical complex and Durgapur steel plants running at peak during ${timeContext} — Eastern Grid load forecast missed by ${Math.abs(deficit).toLocaleString()}MW.`,
      `Kolkata metro + industrial load overlap during ${timeContext} — DVC hydro at reduced dispatch, frequency sliding to ${anomaly.frequency}Hz.`,
      `West Bengal jute mills restarted after scheduled maintenance — sudden ${Math.abs(deficit).toLocaleString()}MW reconnection not anticipated in dispatch schedule.`,
    ],
    'Rajasthan': [
      `Rajasthan solar parks output dropped${weather ? ` with ${weather.precipitation_prob}% cloud cover` : ' unexpectedly'} during ${timeContext} — ${Math.round(Math.abs(deficit) * 0.5).toLocaleString()}MW renewable shortfall.`,
      `Jaipur + Jodhpur cement and mining operations running heavy equipment during ${timeContext} — motor start-up current spikes causing frequency oscillation.`,
      `Chambal hydro allocation reduced for irrigation — Northern Grid short by ${Math.abs(deficit).toLocaleString()}MW during ${timeContext}, frequency drifting ${anomaly.zScore}σ from baseline.`,
    ],
  };

  const stories = regionalStories[anomaly.region] || [
    `Regional industrial activity during ${timeContext} causing ${Math.abs(deficit).toLocaleString()}MW generation-load mismatch.`
  ];

  const idx = Math.floor((anomaly.frequency * 100 + anomaly.load_mw + hour) % stories.length);
  return { ...anomaly, context: stories[idx] };
}

module.exports = { contextAgent };
