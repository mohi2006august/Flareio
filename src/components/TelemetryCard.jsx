import React, { useState, useEffect } from 'react';
import { useDashboard, ALERT_LEVELS } from '../context/DashboardContext';

export default function TelemetryCard() {
  const { state } = useDashboard();
  const { nowcast, metrics, alertLevel } = state;
  const cfg = ALERT_LEVELS[alertLevel];

  // 30-second refresh ring animation
  const [refreshPct, setRefreshPct] = useState(0);
  
  useEffect(() => {
    let startTime = Date.now();
    const id = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed > 30000) startTime = Date.now(); // reset every 30s
      setRefreshPct((elapsed % 30000) / 30000 * 100);
    }, 50);
    return () => clearInterval(id);
  }, []);

  const ringDash = `${(refreshPct / 100) * 125} 125`;

  return (
    <div className="telemetry-card tilt-card">
      <div className="tilt-glare" />
      
      <div className="telem-header">
        <span className="section-label">SYSTEM TELEMETRY</span>
        <div className="telem-source">
          <span className={`telem-source__dot ${metrics.dataSource === 'DEGRADED' ? 'telem-source__dot--degraded' : ''}`} />
          {metrics.dataSource} · Aditya-L1
        </div>
      </div>

      <div className="telem-primary">
        <div className="telem-class-block">
          <div className="telem-class-val" style={{ color: cfg.color }}>{nowcast.flareClass}</div>
          <div className="telem-class-lbl">DETECTED CLASS</div>
        </div>
        
        <div className="telem-refresh-ring">
          <svg viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
            <circle cx="22" cy="22" r="20" fill="none" stroke="#38bdf8" strokeWidth="3" strokeDasharray={ringDash} strokeLinecap="round" transform="rotate(-90 22 22)" />
          </svg>
          <div className="telem-refresh-val">{Math.ceil(30 - (refreshPct/100)*30)}s</div>
        </div>
      </div>

      <div className="telem-stats">
        <div className="telem-stat">
          <span className="telem-stat__lbl">PROBABILITY</span>
          <span className="telem-stat__val">{nowcast.probability.toFixed(1)}%</span>
        </div>
        <div className="telem-stat">
          <span className="telem-stat__lbl">LATENCY</span>
          <span className="telem-stat__val">{metrics.latency} ms</span>
        </div>
        <div className="telem-stat">
          <span className="telem-stat__lbl">UPDATED</span>
          <span className="telem-stat__val">{new Date(metrics.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} UTC</span>
        </div>
      </div>

      <div className="telem-divider" />

      <div className="telem-instruments">
        <div className="telem-inst">
          <span className="telem-inst__name">SoLEXS</span>
          <div className="telem-inst__status">
            <span className="telem-inst__dot" /> ACTIVE
          </div>
        </div>
        <div className="telem-inst">
          <span className="telem-inst__name">HEL1OS</span>
          <div className="telem-inst__status">
            <span className="telem-inst__dot" /> ACTIVE
          </div>
        </div>
      </div>

      {/* Gap Indicator (conditionally shown if degraded) */}
      {metrics.dataSource === 'DEGRADED' && (
        <div className="telem-gap-warn">
          GAP · 00:00:43
        </div>
      )}
    </div>
  );
}
