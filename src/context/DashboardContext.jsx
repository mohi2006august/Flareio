import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────
export const ALERT_LEVELS = {
  GREEN: { label: 'GREEN', color: '#22c55e', glow: '#22c55e40', threshold: '< 25%' },
  YELLOW: { label: 'YELLOW', color: '#eab308', glow: '#eab30840', threshold: '25 – 50%' },
  ORANGE: { label: 'ORANGE', color: '#f4a623', glow: '#f4a62340', threshold: '50 – 75%' },
  RED: { label: 'RED', color: '#ef4444', glow: '#ef444440', threshold: '> 75%' },
};

export const FLARE_CLASSES = ['A', 'B', 'C', 'M', 'X'];

const WS_URL = 'ws://localhost:8000/ws'; // swap for real backend

// ─── Helpers ──────────────────────────────────────────────────────────────────
function gaussian(mean = 0, std = 1) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }

function probabilityToAlertLevel(p) {
  if (p < 25) return 'GREEN';
  if (p < 50) return 'YELLOW';
  if (p < 75) return 'ORANGE';
  return 'RED';
}

function probabilityToFlareClass(p) {
  if (p < 15) return 'A' + (Math.random() * 9 + 1).toFixed(1);
  if (p < 30) return 'B' + (Math.random() * 9 + 1).toFixed(1);
  if (p < 50) return 'C' + (Math.random() * 9 + 1).toFixed(1);
  if (p < 75) return 'M' + (Math.random() * 9 + 1).toFixed(1);
  return 'X' + (Math.random() * 5 + 1).toFixed(1);
}

function generateFluxSoLEXS(baseProbability) {
  const base = 1e-7 + (baseProbability / 100) * 1e-5;
  return clamp(base * Math.exp(gaussian(0, 0.3)), 1e-9, 1e-3);
}

function generateFluxHEL1OS(fluxSoLEXS) {
  return clamp(fluxSoLEXS * (0.7 + Math.random() * 0.6) * Math.exp(gaussian(0, 0.2)), 1e-9, 1e-3);
}

function buildDataPoint(prevProbability = 30, forceXClass = false) {
  let probability;
  if (forceXClass) {
    probability = 85 + gaussian(0, 3);
  } else {
    const spike = Math.random() < 0.05 ? gaussian(20, 8) : 0;
    probability = clamp(prevProbability + gaussian(0, 4) + spike, 0, 100);
  }
  probability = Math.round(clamp(probability, 0, 100) * 10) / 10;

  const fluxSoLEXS = generateFluxSoLEXS(probability);
  const fluxHEL1OS = generateFluxHEL1OS(fluxSoLEXS);
  const alertLevel = probabilityToAlertLevel(probability);
  const flareClass = forceXClass ? 'X' + (Math.random() * 4 + 1).toFixed(1) : probabilityToFlareClass(probability);
  const confidence = Math.round(clamp(70 + gaussian(0, 8) + (probability > 60 ? 10 : 0), 50, 99));

  return {
    timestamp: new Date().toISOString(),
    probability,
    fluxSoLEXS,
    fluxHEL1OS,
    alertLevel,
    confidence,
    flareClass,
    dataStatus: Math.random() < 0.97 ? 'NOMINAL' : 'DEGRADED',
    systemMode: 'AUTO',
  };
}

function buildInitialHistory() {
  const history = [];
  let prob = 28;
  const now = Date.now();
  for (let i = 360; i >= 0; i -= 5) {
    const ts = new Date(now - i * 60 * 1000);
    const spike = i < 60 && Math.random() < 0.1 ? gaussian(20, 10) : 0;
    prob = clamp(prob + gaussian(0, 3) + spike, 0, 100);
    history.push({
      timestamp: ts.toISOString(),
      probability: Math.round(prob * 10) / 10,
      fluxSoLEXS: generateFluxSoLEXS(prob),
      fluxHEL1OS: generateFluxHEL1OS(generateFluxSoLEXS(prob)),
    });
  }
  return history;
}

// ─── Initial State ─────────────────────────────────────────────────────────────
const initialPoint = buildDataPoint(28);
const initialState = {
  ...initialPoint,
  history: buildInitialHistory(),
  alertLog: [
    { id: 1, timestamp: new Date(Date.now() - 3600000).toISOString(), level: 'GREEN', message: 'System initialized — nominal conditions' },
  ],
  catalogue: [
    { id: 1, timestamp: new Date(Date.now() - 7200000).toISOString(), flareClass: 'C3.2', confidence: 78, duration: '12 min', peak: '1.2e-6 W/m²' },
    { id: 2, timestamp: new Date(Date.now() - 14400000).toISOString(), flareClass: 'B7.1', confidence: 65, duration: '8 min', peak: '4.1e-7 W/m²' },
  ],
  lastUpdateTime: Date.now(),
  isMockWS: true,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
function dashboardReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_DATA': {
      const newPoint = action.payload;
      const prevLevel = state.alertLevel;
      const newLevel = newPoint.alertLevel;

      const newHistory = [
        ...state.history.slice(-432), // keep max 6h at 5s intervals = 432 pts
        {
          timestamp: newPoint.timestamp,
          probability: newPoint.probability,
          fluxSoLEXS: newPoint.fluxSoLEXS,
          fluxHEL1OS: newPoint.fluxHEL1OS,
        },
      ];

      let newAlertLog = state.alertLog;
      if (prevLevel !== newLevel) {
        newAlertLog = [
          {
            id: Date.now(),
            timestamp: newPoint.timestamp,
            level: newLevel,
            message: `Alert level changed ${prevLevel} → ${newLevel} (P=${newPoint.probability.toFixed(1)}%, Class ${newPoint.flareClass})`,
          },
          ...state.alertLog.slice(0, 99),
        ];
      }

      let newCatalogue = state.catalogue;
      if (['M', 'X'].some(c => newPoint.flareClass.startsWith(c)) && Math.random() < 0.1) {
        newCatalogue = [
          {
            id: Date.now(),
            timestamp: newPoint.timestamp,
            flareClass: newPoint.flareClass,
            confidence: newPoint.confidence,
            duration: `${Math.round(5 + Math.random() * 25)} min`,
            peak: newPoint.fluxSoLEXS.toExponential(2) + ' W/m²',
          },
          ...state.catalogue.slice(0, 49),
        ];
      }

      return {
        ...state,
        ...newPoint,
        history: newHistory,
        alertLog: newAlertLog,
        catalogue: newCatalogue,
        lastUpdateTime: Date.now(),
      };
    }

    case 'SIMULATE_X_CLASS': {
      const xPoint = buildDataPoint(state.probability, true);
      const newHistory = [
        ...state.history.slice(-432),
        { timestamp: xPoint.timestamp, probability: xPoint.probability, fluxSoLEXS: xPoint.fluxSoLEXS, fluxHEL1OS: xPoint.fluxHEL1OS },
      ];
      const newCatalogue = [
        {
          id: Date.now(),
          timestamp: xPoint.timestamp,
          flareClass: xPoint.flareClass,
          confidence: xPoint.confidence,
          duration: `${Math.round(10 + Math.random() * 30)} min`,
          peak: xPoint.fluxSoLEXS.toExponential(2) + ' W/m²',
        },
        ...state.catalogue.slice(0, 49),
      ];
      const newAlertLog = [
        {
          id: Date.now(),
          timestamp: xPoint.timestamp,
          level: 'RED',
          message: `🚨 X-CLASS FLARE SIMULATED — ${xPoint.flareClass} detected (P=${xPoint.probability.toFixed(1)}%)`,
        },
        ...state.alertLog.slice(0, 99),
      ];
      return {
        ...state,
        ...xPoint,
        alertLevel: 'RED',
        history: newHistory,
        catalogue: newCatalogue,
        alertLog: newAlertLog,
        lastUpdateTime: Date.now(),
      };
    }

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const wsRef = useRef(null);
  const intervalRef = useRef(null);

  const simulateXClass = useCallback(() => {
    dispatch({ type: 'SIMULATE_X_CLASS' });
  }, []);

  useEffect(() => {
    // Try real WebSocket first, fall back to mock
    let connected = false;
    try {
      const ws = new WebSocket(WS_URL);
      ws.onopen = () => { connected = true; wsRef.current = ws; };
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          dispatch({ type: 'UPDATE_DATA', payload: data });
        } catch {}
      };
      ws.onerror = () => { if (!connected) startMock(); };
      ws.onclose = () => { if (!connected) startMock(); };
    } catch {
      startMock();
    }

    function startMock() {
      intervalRef.current = setInterval(() => {
        dispatch((currentAction) => {
          // We need current probability — use functional update pattern via ref
          return currentAction;
        });
        // Dispatch with a thunk-like approach using a closure ref
        dispatch({ type: '__TICK__' }); // sentinel, handled below
      }, 5000);
    }

    return () => {
      wsRef.current?.close();
      clearInterval(intervalRef.current);
    };
  }, []);

  // Separate effect to handle the tick using current state
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const current = stateRef.current;
      const newPoint = buildDataPoint(current.probability);
      dispatch({ type: 'UPDATE_DATA', payload: newPoint });
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, []); // eslint-disable-line

  return (
    <DashboardContext.Provider value={{ state, simulateXClass }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
}
