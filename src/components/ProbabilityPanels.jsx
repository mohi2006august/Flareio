import React from 'react';
import { useDashboard, ALERT_LEVELS } from '../context/DashboardContext';

function ClassBreakdownBar({ prob }) {
  // Simple heuristic for the breakdown bar based on total probability
  const pX = Math.max(0, prob - 75) / 100 * 100;
  const pM = Math.max(0, Math.min(prob, 75) - 50) / 100 * 100;
  const pC = Math.max(0, Math.min(prob, 50) - 25) / 100 * 100;
  const pBg = Math.max(0, Math.min(prob, 25)) / 100 * 100;
  
  return (
    <div className="class-breakdown">
      <div className="class-breakdown__seg class-breakdown__seg--bg" style={{ width: `${pBg}%` }} />
      <div className="class-breakdown__seg class-breakdown__seg--c" style={{ width: `${pC}%` }} />
      <div className="class-breakdown__seg class-breakdown__seg--m" style={{ width: `${pM}%` }} />
      <div className="class-breakdown__seg class-breakdown__seg--x" style={{ width: `${pX}%` }} />
    </div>
  );
}

function GaugeCard({ title, data, isForecast = false }) {
  const { probability, uncertainty, flareClass, confidence, horizon, onsetMins } = data;
  
  const getLevelColor = (p) => {
    if (p < 25) return '#22c55e';
    if (p < 50) return '#eab308';
    if (p < 75) return '#f4a623';
    return '#ef4444';
  };
  
  const color = getLevelColor(probability);
  const strokeDash = `${(probability / 100) * 283} 283`;

  return (
    <div className="prob-panel">
      <div className="prob-panel__header">
        <span className="prob-panel__title">{title}</span>
        <span className="prob-panel__horizon">{horizon}</span>
      </div>
      
      <div className="prob-panel__gauge-wrap">
        <svg viewBox="0 0 100 50" className="prob-panel__gauge">
          <path d="M 5 45 A 40 40 0 0 1 95 45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" strokeLinecap="round" />
          <path d="M 5 45 A 40 40 0 0 1 95 45" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={strokeDash} className="prob-panel__gauge-fill" />
        </svg>
        <div className="prob-panel__center-data">
          <div className="prob-panel__prob">{probability.toFixed(1)}<span className="prob-panel__pct">%</span></div>
          <div className="prob-panel__uncert">±{uncertainty.toFixed(1)}%</div>
          <div className="prob-panel__class" style={{ color }}>{flareClass}</div>
        </div>
      </div>

      <div className="prob-panel__footer">
        <div className="prob-panel__conf">
          {confidence >= 80 ? 'HIGH CONFIDENCE' : 'LOW CONFIDENCE — CROSS-CHECK GOES'}
        </div>
        <ClassBreakdownBar prob={probability} />
        
        {isForecast && (
          <div className="prob-panel__onset">
            <div>ONSET IN ~{Math.floor(onsetMins / 60)}h {onsetMins % 60}m</div>
            <div className="prob-panel__onset-range">
              {Math.floor(onsetMins / 60) - 2}–{Math.floor(onsetMins / 60) + 2} hours from now
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProbabilityPanels() {
  const { state } = useDashboard();
  
  return (
    <div className="prob-panels-container">
      <GaugeCard title="NOWCAST" data={state.nowcast} />
      <GaugeCard title="FORECAST" data={state.forecast} isForecast={true} />
    </div>
  );
}
