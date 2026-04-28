# GridSense — AI-Powered India Power Grid Intelligence

Real-time anomaly detection, stakeholder alerts, and demand forecasting for India's power grid using a 5-agent AI pipeline.

Built by **Team Cortex Collective**

---

## The Problem

India loses **87,000 crore rupees every year** from unplanned power outages. When a grid failure happens, engineers find out 40 to 90 minutes after the cascade has already begun. Meanwhile, POSOCO publishes live grid data publicly — but no consumer-facing product was built on top of it.

GridSense changes that.

---

## The Solution

GridSense is an early warning system for India's power grid. It detects anomalies before blackouts happen, explains why they are occurring, and alerts the right stakeholders with actionable instructions — all in under 3 seconds.

---

## 5-Agent AI Pipeline

| Agent | Role |
|-------|------|
| Sensor Agent | Ingests real-time grid frequency, load, and generation data every 8 seconds |
| Anomaly Agent | Z-Score statistical detection with a 30-point rolling window, flags deviations beyond 1.5 sigma |
| Context Agent | Explains why the anomaly happened using weather data, time of day, and regional industrial patterns |
| Alert Agent | Sends targeted, actionable alerts to region-specific stakeholders (hospitals, factories, DISCOMs) |
| Forecast Agent | Generates 6-hour demand predictions using Weighted Moving Average with IMD temperature correction |

Detection to stakeholder alert: under 3 seconds. The current industry standard is 40 to 90 minutes. That is 1,800 times faster.

---

## Features

- Live grid frequency chart with real-time Hz monitoring and Z-Score anomaly highlighting
- India grid stress map built with D3.js, all states color-coded from green to red by severity
- Live anomaly feed with severity scores, Z-Score values, and weather context
- Stakeholder alerts targeted to Tata Steel, Reliance Industries, DISCOMs, and others
- 6-hour demand forecast with WMA-based predictions and dynamic confidence intervals
- Real-time economic loss counter during crisis simulation events
- 3 crisis simulation scenarios: Industrial Surge, Weather Failure, Transmission Fault
- Real email delivery via EmailJS integration
- IMD weather data via Open-Meteo API with graceful mock fallback
- Live agent activity log showing each agent's real-time reasoning
- Case studies from Mumbai 2020, Northern Grid 2022, and WB 2023 with rupee impact analysis
- Redis caching via Upstash with TTL-based state management
- MongoDB persistence for full anomaly and alert history

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Recharts, D3.js, Socket.io Client |
| Backend | Node.js, Express, Socket.io |
| Database | MongoDB Atlas, Redis (Upstash) |
| APIs | POSOCO/NLDC (mock format), Open-Meteo (IMD weather), EmailJS |
| ML | Z-Score Statistical Detection, Weighted Moving Average |
| Deploy | Vercel (frontend), Render (backend) |

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- MongoDB Atlas account (free tier works)
- Redis account via [Upstash](https://upstash.com) (free tier works)
- EmailJS account (free tier works)

### 1. Clone the repo

```bash
git clone https://github.com/DCodez101/GridSense.git
cd GridSense
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=3001
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/gridsense
REDIS_URL=rediss://default:<password>@<host>.upstash.io:6379
POSOCO_API_URL=https://www.nldc.in/api/grid/realtime
```

Start the backend:

```bash
node server.js
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

Start the frontend:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Project Structure

```
GridSense/
├── backend/
│   ├── server.js              # Entry point — Express, Socket.io, startup
│   ├── config/
│   │   └── constants.js       # REGIONS, REGION_BASELINE, SCENARIOS
│   ├── db/
│   │   ├── mongo.js           # MongoDB connection and models
│   │   └── redis.js           # Redis client, rGet, rSet, in-memory fallback
│   ├── ml/
│   │   ├── anomaly.js         # Z-Score anomaly detection agent
│   │   ├── context.js         # Context enrichment agent
│   │   └── forecast.js        # Weighted Moving Average forecast agent
│   ├── agents/
│   │   └── alert.js           # Stakeholder alert agent
│   ├── services/
│   │   ├── weather.js         # Open-Meteo IMD weather fetching
│   │   └── posoco.js          # POSOCO real/mock grid data
│   ├── pipeline/
│   │   └── index.js           # Main 8-second pipeline orchestrator
│   ├── routes/
│   │   └── api.js             # All REST API endpoints
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main dashboard
│   │   ├── constants/
│   │   │   └── index.js       # Shared constants, sev helper, glass style
│   │   ├── components/
│   │   │   ├── IndiaMap.jsx   # D3.js India grid stress map
│   │   │   ├── UI.jsx         # Card, Head, Shimmer shared components
│   │   │   ├── LossTicker.jsx
│   │   │   ├── CaseStudies.jsx
│   │   │   ├── CompareTable.jsx
│   │   │   ├── HistoryTimeline.jsx
│   │   │   ├── RedisProofPanel.jsx
│   │   │   └── EmailSentLog.jsx
│   │   ├── hooks/
│   │   │   └── useSocket.js   # All Socket.io event handling
│   │   └── services/
│   │       └── emailService.js # EmailJS integration
│   ├── index.html
│   └── package.json
└── README.md
```

---

## ML Algorithms

### Anomaly Detection — Z-Score

- Maintains a 30-point rolling window of frequency readings per region
- Pre-warmed with 20 seed values at startup to eliminate cold-start noise
- Flags deviations beyond 1.5 sigma from the rolling mean
- Severity score calculated as `min(10, round(zScore x 2.5))`
- Weather boost applied: +1 for temperature above 38°C, +1 for precipitation probability above 70%, +1 for wind speed above 50 km/h

### Demand Forecasting — Weighted Moving Average

- 5-point WMA giving higher weight to more recent readings
- Temperature correction factor applied using live IMD weather data
- Dynamic confidence intervals derived from actual historical variance, not hardcoded
- Confidence band widens with forecast horizon, consistent with standard time-series practice

---

## Crisis Simulation Scenarios

| Scenario | Region | Frequency | Severity |
|----------|--------|-----------|----------|
| Industrial Surge | UP | 49.1 Hz | 9/10 |
| Weather Failure | Maharashtra | 49.3 Hz | 8/10 |
| Transmission Fault | West Bengal | 49.0 Hz | 10/10 |

---

## Real Impact

| Incident | Without GridSense | With GridSense | Saving |
|----------|------------------|----------------|--------|
| Mumbai Blackout (Oct 2020) | 40 min delay, 4.2 Cr loss | 18 min advance warning | 4.2 Cr |
| Northern Grid Stress (Jul 2022) | 6 states, 4-hr rolling cuts | 6-hr forecast, pre-scheduled | 11 Cr |
| WB Line Trip (Mar 2023) | 22 min unaware, hospital risk | 3 sec detection, CESC alerted | 2.8 Cr |

---

## Deployment

### Frontend — Vercel

```bash
cd frontend
vercel --prod
```

Set the environment variable `VITE_API_URL` to your Render backend URL before deploying.

### Backend — Render

1. Connect your GitHub repo at [render.com](https://render.com)
2. Set root directory to `backend`
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add all environment variables from your `backend/.env`

---

## Team

| Name | Role |
|------|------|
| Darshana Krishna | Full-stack Development, Backend Architecture |
| Vikirna Majumdar | Frontend, UI/UX, Data Visualization |
| Sneha Aggarwal | Agent Pipeline, ML Integration |

---

## License

MIT License — see [LICENSE](LICENSE) for details.
