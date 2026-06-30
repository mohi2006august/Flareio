import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────
export const ALERT_LEVELS = {
  GREEN: { label: 'NOMINAL', color: '#22c55e', glow: '#22c55e40', bg: 'rgba(34,197,94,0.1)' },
  YELLOW: { label: 'ELEVATED', color: '#eab308', glow: '#eab30840', bg: 'rgba(234,179,8,0.1)' },
  ORANGE: { label: 'HIGH', color: '#f4a623', glow: '#f4a62340', bg: 'rgba(244,166,35,0.1)' },
  RED: { label: 'CRITICAL', color: '#ef4444', glow: '#ef444440', bg: 'rgba(239,68,68,0.1)' },
};

export const FLARE_CLASSES = ['A', 'B', 'C', 'M', 'X'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function gaussian(mean = 0, std = 1) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }

function getAlertLevel(p) {
  if (p < 25) return 'GREEN';
  if (p < 50) return 'YELLOW';
  if (p < 75) return 'ORANGE';
  return 'RED';
}

function getFlareClass(p) {
  if (p < 15) return 'A' + (Math.random() * 9 + 1).toFixed(1);
  if (p < 30) return 'B' + (Math.random() * 9 + 1).toFixed(1);
  if (p < 50) return 'C' + (Math.random() * 9 + 1).toFixed(1);
  if (p < 75) return 'M' + (Math.random() * 9 + 1).toFixed(1);
  return 'X' + (Math.random() * 5 + 1).toFixed(1);
}

function generateFluxSoLEXS(prob) {
  const base = 1e-7 + (prob / 100) * 1e-4;
  return clamp(base * Math.exp(gaussian(0, 0.4)), 1e-9, 5e-3);
}

function generateFluxHEL1OS(flux) {
  return clamp(flux * (0.5 + Math.random()) * Math.exp(gaussian(0, 0.3)), 1e-9, 5e-3);
}

// ─── Initial State ─────────────────────────────────────────────────────────────
function buildInitialHistory() {
  const history = [];
  let p = 20;
  const now = Date.now();
  // 6 hours of data = 360 mins, one point per 2 mins = 180 points
  for (let i = 360; i >= 0; i -= 2) {
    const ts = new Date(now - i * 60 * 1000);
    p = clamp(p + gaussian(0, 4), 5, 40);
    history.push({
      time: ts.toISOString(),
      fluxSoLEXS: generateFluxSoLEXS(p),
      fluxHEL1OS: generateFluxHEL1OS(generateFluxSoLEXS(p)),
      isPrediction: false
    });
  }
  return history;
}

const initialState = {
  alertLevel: 'GREEN',
  alertAcked: false,
  alertActiveSince: Date.now(),
  nowcast: {
    probability: 22.4,
    uncertainty: 2.1,
    flareClass: 'B4.2',
    confidence: 94,
    horizon: '0–30 min'
  },
  forecast: {
    probability: 35.8,
    uncertainty: 6.4,
    flareClass: 'C1.5',
    confidence: 82,
    horizon: '1–24 hr',
    onsetMins: 310
  },
  fluxSoLEXS: 4e-7,
  fluxHEL1OS: 3e-7,
  oodScore: 0.12,
  compoundEvents: [], // Array of { class, prob, uncert }
  eventLog: [
    { id: 1, time: new Date(Date.now() - 86400000).toISOString(), class: 'M2.1', prob: 88, lead: 45, type: 'CONFIRMED' },
    { id: 2, time: new Date(Date.now() - 40000000).toISOString(), class: 'C4.5', prob: 65, lead: 120, type: 'CONFIRMED' },
    { id: 3, time: new Date(Date.now() - 15000000).toISOString(), class: 'M1.1', prob: 92, lead: 32, type: 'FALSE ALARM' },
  ],
  history: buildInitialHistory(),
  metrics: {
    tpr: 88,
    far: 19,
    latency: 147,
    statusSoLEXS: 'ACTIVE',
    statusHEL1OS: 'ACTIVE',
    dataSource: 'PRIMARY',
    lastUpdate: new Date().toISOString()
  }
};

function dashboardReducer(state, action) {
  switch (action.type) {
    case 'TICK': {
      const { nowcast, forecast, history } = state;
      const isExtreme = action.payload.forceXClass;
      
      const newNowProb = isExtreme ? clamp(gaussian(95, 3), 90, 100) : clamp(nowcast.probability + gaussian(0, 3), 5, 98);
      const newForeProb = isExtreme ? clamp(gaussian(98, 2), 90, 100) : clamp(forecast.probability + gaussian(0, 5), 5, 99);
      
      const newAlertLevel = getAlertLevel(newNowProb);
      
      // Update Alert Active Time
      let newAlertActiveSince = state.alertActiveSince;
      let newAlertAcked = state.alertAcked;
      if (newAlertLevel !== state.alertLevel) {
        newAlertActiveSince = Date.now();
        newAlertAcked = false; // Reset ack on level change
      }

      // OOD Score Logic
      let oodScore = clamp(gaussian(0.2, 0.1), 0.0, 0.4);
      if (Math.random() < 0.05 || isExtreme) oodScore = clamp(gaussian(0.85, 0.1), 0.7, 0.99);

      // Compound Event Logic
      let compoundEvents = [];
      if (newNowProb > 60 && Math.random() < 0.2) {
        compoundEvents = [
          { class: getFlareClass(newNowProb), prob: newNowProb, uncert: 4.2 },
          { class: getFlareClass(newNowProb - 20), prob: newNowProb - 20, uncert: 8.5 }
        ];
      }

      const fluxS = generateFluxSoLEXS(newNowProb);
      const fluxH = generateFluxHEL1OS(fluxS);

      const newHistory = [...history, {
        time: new Date().toISOString(),
        fluxSoLEXS: fluxS,
        fluxHEL1OS: fluxH,
        isPrediction: false
      }].slice(-300); // Keep last 300 points

      // Check if we need to log a new event (e.g. crossing RED threshold)
      const newEventLog = [...state.eventLog];
      if (newAlertLevel === 'RED' && state.alertLevel !== 'RED') {
        newEventLog.unshift({
          id: Date.now(),
          time: new Date().toISOString(),
          class: getFlareClass(newNowProb),
          prob: Math.round(newNowProb),
          lead: Math.floor(Math.random() * 120 + 10),
          type: 'DETECTED'
        });
      }

      return {
        ...state,
        alertLevel: newAlertLevel,
        alertAcked: newAlertAcked,
        alertActiveSince: newAlertActiveSince,
        nowcast: {
          probability: Math.round(newNowProb * 10)/10,
          uncertainty: Math.round(gaussian(3, 1)*10)/10,
          flareClass: getFlareClass(newNowProb),
          confidence: Math.round(clamp(90 - (newNowProb * 0.1) + gaussian(0, 5), 50, 99)),
          horizon: '0–30 min'
        },
        forecast: {
          probability: Math.round(newForeProb * 10)/10,
          uncertainty: Math.round(gaussian(8, 2)*10)/10,
          flareClass: getFlareClass(newForeProb),
          confidence: Math.round(clamp(75 - (newForeProb * 0.2) + gaussian(0, 5), 40, 99)),
          horizon: '1–24 hr',
          onsetMins: Math.max(10, Math.floor(forecast.onsetMins - 0.5 + gaussian(0, 5)))
        },
        fluxSoLEXS: fluxS,
        fluxHEL1OS: fluxH,
        oodScore,
        compoundEvents,
        history: newHistory,
        eventLog: newEventLog.slice(0, 10),
        metrics: {
          ...state.metrics,
          latency: Math.round(gaussian(150, 15)),
          lastUpdate: new Date().toISOString(),
          dataSource: Math.random() < 0.95 ? 'PRIMARY' : 'DEGRADED'
        }
      };
    }
    case 'ACKNOWLEDGE_ALERT':
      return { ...state, alertAcked: true };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const timerRef = useRef(null);

  const tick = useCallback((forceXClass = false) => {
    dispatch({ type: 'TICK', payload: { forceXClass } });
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => tick(false), 2000);
    return () => clearInterval(timerRef.current);
  }, [tick]);

  const simulateXClass = useCallback(() => {
    tick(true);
  }, [tick]);

  const acknowledgeAlert = useCallback(() => {
    dispatch({ type: 'ACKNOWLEDGE_ALERT' });
  }, []);

  return (
    <DashboardContext.Provider value={{ state, simulateXClass, acknowledgeAlert }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within a DashboardProvider');
  return ctx;
}
