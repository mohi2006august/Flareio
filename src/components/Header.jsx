import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Zap, Shield, Satellite } from 'lucide-react';
import VoiceBar from './VoiceBar';

export default function Header() {
  const { state, simulateXClass } = useDashboard();
  const [simulating, setSimulating] = useState(false);
  const [utcTime, setUtcTime] = useState('');
  
  // LIVE badge pulse animation triggered on state.history update (which ticks every 2s in mock, 
  // but conceptually every prediction arrival)
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setPulse(true);
    const id = setTimeout(() => setPulse(false), 500);
    return () => clearTimeout(id);
  }, [state.history.length]); // Pulse whenever new data arrives

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setUtcTime(
        now.toISOString().replace('T', '  ').slice(0, 19) + ' UTC'
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleSimulate = () => {
    setSimulating(true);
    simulateXClass();
    setTimeout(() => setSimulating(false), 2000);
  };

  return (
    <header className="nav-header">
      <div className="nav-header__glow-line" />

      {/* Left: Logo + Title */}
      <div className="nav-header__brand">
        <div className="nav-header__logo-wrap">
          <div className="nav-header__logo-ring" />
          <Satellite size={18} className="nav-header__logo-icon" />
        </div>
        <div className="nav-header__titles">
          <h1 className="nav-header__title">
            FLARE<span className="nav-header__title-accent">SENSE</span>
          </h1>
          <p className="nav-header__subtitle">
            PBCAT-M v1.0 · SoLEXS / HEL1OS
          </p>
        </div>
      </div>

      {/* Center: Live Badge, Source, Clock */}
      <div className="nav-header__center">
        <div className={`nav-header__live-badge ${pulse ? 'pulse-active' : ''}`}>
          <span className="nav-header__live-dot" />
          <span className="nav-header__live-text">LIVE</span>
        </div>
        <div className="nav-header__divider" />
        <div className="nav-header__mission-tag">
          <Shield size={12} />
          <span>ISRO Space Weather</span>
        </div>
        <div className="nav-header__divider" />
        
        {/* Data Source Pill always visible */}
        <div className={`telem-source ${state.metrics.dataSource === 'DEGRADED' ? 'degraded' : ''}`} style={{ fontSize: '10px', padding: '3px 8px' }}>
          <span className={`telem-source__dot ${state.metrics.dataSource === 'DEGRADED' ? 'telem-source__dot--degraded' : ''}`} />
          {state.metrics.dataSource} · GOES
        </div>
        
        <div className="nav-header__divider" />
        <time className="nav-header__clock nav-header__clock--large">{utcTime}</time>
      </div>

      {/* Right: Controls */}
      <div className="nav-header__controls">
        <VoiceBar />
        <button
          className={`nav-header__sim-btn ${simulating ? 'nav-header__sim-btn--active' : ''}`}
          onClick={handleSimulate}
          disabled={simulating}
        >
          <Zap size={14} />
          <span>{simulating ? 'Simulating…' : 'X-Class Flare'}</span>
        </button>
      </div>
    </header>
  );
}
