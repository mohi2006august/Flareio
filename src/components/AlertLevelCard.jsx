import React, { useEffect, useRef } from 'react';
import { useDashboard, ALERT_LEVELS } from '../context/DashboardContext';
import { use3DTilt } from '../hooks/use3DTilt';

export default function AlertLevelCard() {
  const { state } = useDashboard();
  const { alertLevel, flareClass, probability } = state;
  const cfg = ALERT_LEVELS[alertLevel];
  const prevLevelRef = useRef(alertLevel);
  const { cardRef, glareRef, onMouseMove, onMouseLeave } = use3DTilt({ maxTilt: 3, scale: 1.01 });

  useEffect(() => {
    if (prevLevelRef.current !== alertLevel && (alertLevel === 'ORANGE' || alertLevel === 'RED')) {
      if (cardRef.current) {
        cardRef.current.animate(
          [
            { boxShadow: `0 0 0px ${cfg.color}` },
            { boxShadow: `0 0 40px ${cfg.color}88, inset 0 0 20px ${cfg.color}44` },
            { boxShadow: `0 0 10px ${cfg.color}22` },
          ],
          { duration: 800, easing: 'ease-out' }
        );
      }
    }
    prevLevelRef.current = alertLevel;
  }, [alertLevel, cfg.color, cardRef]);

  return (
    <div
      ref={cardRef}
      className="alert-banner tilt-card"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        '--alert-color': cfg.color,
        '--alert-glow': cfg.glow,
        boxShadow: `0 0 20px ${cfg.glow}, 0 10px 30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
    >
      <div ref={glareRef} className="tilt-glare" />

      {/* Status Dot */}
      <div className="alert-banner__status">
        <div className="alert-banner__dot" />
        <span className="alert-banner__label">SYSTEM STATUS</span>
      </div>

      {/* Main Alert Level */}
      <div className="alert-banner__level" style={{ color: cfg.color, textShadow: `0 0 20px ${cfg.color}99` }}>
        {alertLevel}
      </div>

      {/* Probability Bar */}
      <div className="alert-banner__prob-wrap">
        <div className="alert-banner__prob-track">
          <div
            className="alert-banner__prob-fill"
            style={{
              width: `${probability}%`,
              background: `linear-gradient(90deg, #22c55e, #eab308, #f4a623, #ef4444)`,
              backgroundSize: '400% 100%',
              backgroundPosition: `${probability}% 0`,
              boxShadow: `0 0 10px ${cfg.color}88`,
            }}
          />
        </div>
        <span className="alert-banner__prob-text">{probability.toFixed(1)}%</span>
      </div>

      {/* Flare Class */}
      <div className="alert-banner__flare">
        <span className="alert-banner__flare-label">CLASS</span>
        <span className="alert-banner__flare-val" style={{ color: cfg.color }}>{flareClass}</span>
      </div>
    </div>
  );
}
