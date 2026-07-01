import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Zap, Shield, Satellite } from 'lucide-react';
import VoiceBar from './VoiceBar';

function RefreshCountdown() {
  const [secondsLeft, setSecondsLeft] = useState(30);
  
  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft(prev => prev <= 1 ? 30 : prev - 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const radius = 8;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - secondsLeft / 30);

  return (
    <div className="refresh-countdown" title={`Next update in ${secondsLeft}s`}>
      <svg width="22" height="22" viewBox="0 0 22 22" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="11" cy="11" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
        <circle cx="11" cy="11" r={radius} fill="none" stroke="#38bdf8" strokeWidth="2"
          strokeDasharray={circumference} strokeDashoffset={dashOffset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
      </svg>
      <span className="refresh-countdown__text">{secondsLeft}s</span>
    </div>
  );
}

export default function Header() {
  const { state, simulateXClass } = useDashboard();
  const [simulating, setSimulating] = useState(false);
  const [utcTime, setUtcTime] = useState('');
  
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setPulse(true);
    const id = setTimeout(() => setPulse(false), 500);
    return () => clearTimeout(id);
  }, [state.history.length]);

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

  const isDegraded = state.metrics.dataSource === 'DEGRADED';
  const sourceLabel = isDegraded ? 'DEGRADED · GOES' : 'PRIMARY · ADITYA-L1';

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
        <RefreshCountdown />
        <div className="nav-header__divider" />
        <div className="nav-header__mission-tag">
          <Shield size={12} />
          <span>ISRO Space Weather</span>
        </div>
        <div className="nav-header__divider" />
        
        {/* Data Source Pill — fixed */}
        <div className={`telem-source ${isDegraded ? 'degraded' : ''}`} style={{ fontSize: '10px', padding: '3px 8px' }}>
          <span className={`telem-source__dot ${isDegraded ? 'telem-source__dot--degraded' : ''}`} />
          {sourceLabel}
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
