import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Zap } from 'lucide-react';
import VoiceBar from './VoiceBar';

export default function Header() {
  const { simulateXClass } = useDashboard();
  const [simulating, setSimulating] = useState(false);

  const handleSimulate = () => {
    setSimulating(true);
    simulateXClass();
    setTimeout(() => setSimulating(false), 2000);
  };

  return (
    <header className="dashboard-header">
      {/* Logo + Title */}
      <div className="header-brand">
        <div className="header-logo">
          <svg width="36" height="36" viewBox="0 0 36 36">
            <defs>
              <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fff7b0" />
                <stop offset="50%" stopColor="#f4a623" />
                <stop offset="100%" stopColor="#e8721c" />
              </radialGradient>
            </defs>
            <circle cx="18" cy="18" r="10" fill="url(#sunGrad)" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const x1 = 18 + 13 * Math.cos(rad);
              const y1 = 18 + 13 * Math.sin(rad);
              const x2 = 18 + 17 * Math.cos(rad);
              const y2 = 18 + 17 * Math.sin(rad);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f4a623" strokeWidth="2" strokeLinecap="round" />;
            })}
            {/* Flare arc */}
            <path d="M 26 10 Q 30 5 34 8 Q 30 12 26 14 Z" fill="#ef4444" opacity="0.9" />
          </svg>
        </div>
        <div className="header-title-group">
          <h1 className="header-title">PBCAT-M</h1>
          <p className="header-subtitle">Solar Flare Forecasting System · ISRO / Space Weather Division</p>
        </div>
      </div>

      {/* Center status */}
      <div className="header-status">
        <div className="live-indicator">
          <span className="live-dot" />
          LIVE
        </div>
        <span className="header-time">
          {new Date().toUTCString().replace(' GMT', ' UTC')}
        </span>
      </div>

      {/* Right controls */}
      <div className="header-controls">
        <VoiceBar />
        <button
          className={`simulate-btn ${simulating ? 'simulate-btn--active' : ''}`}
          onClick={handleSimulate}
          disabled={simulating}
        >
          <Zap size={15} />
          {simulating ? 'Simulating…' : 'Simulate X-Class Flare'}
        </button>
      </div>
    </header>
  );
}
