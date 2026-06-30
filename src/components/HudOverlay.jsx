import React, { useState, useEffect, useRef } from 'react';
import { useDashboard, ALERT_LEVELS } from '../context/DashboardContext';

/**
 * HUD Overlay – renders pure CSS/SVG telemetry readouts on top of
 * the 3D sun, giving the dashboard a true "mission control" feel.
 */
export default function HudOverlay() {
  const { state } = useDashboard();
  const { alertLevel, probability, flareClass, confidence } = state;
  const cfg = ALERT_LEVELS[alertLevel];

  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const missionTime = `T+ ${String(Math.floor(elapsed / 3600)).padStart(2,'0')}:${String(Math.floor((elapsed%3600)/60)).padStart(2,'0')}:${String(elapsed%60).padStart(2,'0')}`;

  return (
    <div className="hud-overlay">
      {/* ── Crosshair Center ── */}
      <div className="hud-crosshair">
        <div className="hud-crosshair__h" />
        <div className="hud-crosshair__v" />
        <div className="hud-crosshair__circle" />
        <div className="hud-crosshair__label">TARGET LOCK</div>
      </div>

      {/* ── Top-Right Telemetry Block ── */}
      <div className="hud-telem hud-telem--tr">
        <div className="hud-telem__row">
          <span className="hud-telem__key">MISSION</span>
          <span className="hud-telem__val">{missionTime}</span>
        </div>
        <div className="hud-telem__row">
          <span className="hud-telem__key">CLASS</span>
          <span className="hud-telem__val" style={{ color: cfg.color }}>{flareClass}</span>
        </div>
        <div className="hud-telem__row">
          <span className="hud-telem__key">CONF</span>
          <span className="hud-telem__val">{confidence}%</span>
        </div>
        <div className="hud-telem__row">
          <span className="hud-telem__key">SOLAR-X</span>
          <span className="hud-telem__val">{(Math.sin(elapsed * 0.3) * 120).toFixed(1)}"</span>
        </div>
        <div className="hud-telem__row">
          <span className="hud-telem__key">SOLAR-Y</span>
          <span className="hud-telem__val">{(Math.cos(elapsed * 0.2) * 80).toFixed(1)}"</span>
        </div>
      </div>

      {/* ── Left Status Block ── */}
      <div className="hud-telem hud-telem--ml">
        <div className="hud-telem__row">
          <span className="hud-telem__key">INSTRUMENT</span>
          <span className="hud-telem__val" style={{ color: '#22c55e' }}>SoLEXS</span>
        </div>
        <div className="hud-telem__row">
          <span className="hud-telem__key">DETECTOR</span>
          <span className="hud-telem__val" style={{ color: '#22c55e' }}>HEL1OS</span>
        </div>
        <div className="hud-telem__row">
          <span className="hud-telem__key">X-RAY</span>
          <span className="hud-telem__val">{(1e-4 * probability).toExponential(2)} W/m²</span>
        </div>
        <div className="hud-telem__row">
          <span className="hud-telem__key">GOES CH</span>
          <span className="hud-telem__val">1-8 Å</span>
        </div>
      </div>

      {/* ── Scanning Ring ── */}
      <svg className="hud-scan-ring" viewBox="0 0 200 200" width="200" height="200">
        <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
        <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" strokeDasharray="4 4" />
        <circle cx="100" cy="100" r="90" fill="none" stroke={cfg.color} strokeWidth="1" strokeDasharray="20 546" strokeLinecap="round" opacity="0.5" className="hud-scan-ring__arc" />
      </svg>

      {/* ── Corner Brackets ── */}
      <div className="hud-bracket hud-bracket--tl" />
      <div className="hud-bracket hud-bracket--tr" />
      <div className="hud-bracket hud-bracket--bl" />
      <div className="hud-bracket hud-bracket--br" />

      {/* ── Alert Level Indicator ── */}
      <div className="hud-alert-tag" style={{ '--hud-c': cfg.color }}>
        <span className="hud-alert-tag__dot" />
        <span className="hud-alert-tag__level">{alertLevel}</span>
        <span className="hud-alert-tag__prob">{probability.toFixed(1)}%</span>
      </div>
    </div>
  );
}
