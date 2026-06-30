import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Zap, Radio, Shield, Satellite } from 'lucide-react';
import VoiceBar from './VoiceBar';

export default function Header() {
  const { simulateXClass } = useDashboard();
  const [simulating, setSimulating] = useState(false);
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setUtcTime(
        now.toISOString().replace('T', '  ').slice(0, 21) + ' UTC'
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
      {/* Ambient glow line at the very top */}
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
            PBCAT-M · SoLEXS / HEL1OS · Aditya-L1
          </p>
        </div>
      </div>

      {/* Center: Live Badge + Clock */}
      <div className="nav-header__center">
        <div className="nav-header__live-badge">
          <span className="nav-header__live-dot" />
          <span className="nav-header__live-text">LIVE</span>
        </div>
        <div className="nav-header__divider" />
        <div className="nav-header__mission-tag">
          <Shield size={12} />
          <span>ISRO Space Weather</span>
        </div>
        <div className="nav-header__divider" />
        <time className="nav-header__clock">{utcTime}</time>
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
