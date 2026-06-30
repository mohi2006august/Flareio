import React, { useEffect, useRef } from 'react';
import { useDashboard, ALERT_LEVELS } from '../context/DashboardContext';
import { use3DTilt } from '../hooks/use3DTilt';

const LEVEL_ORDER = ['GREEN', 'YELLOW', 'ORANGE', 'RED'];

function AlertBadge({ level, active }) {
  const cfg = ALERT_LEVELS[level];
  return (
    <div
      className={`alert-badge ${active ? 'alert-badge--active' : 'alert-badge--inactive'}`}
      style={{ '--badge-color': cfg.color, '--badge-glow': cfg.glow }}
    >
      <div className="alert-badge__dot" />
      <div className="alert-badge__content">
        <span className="alert-badge__label">{level}</span>
        <span className="alert-badge__threshold">{cfg.threshold}</span>
      </div>
    </div>
  );
}

export default function AlertLevelCard() {
  const { state } = useDashboard();
  const { alertLevel, flareClass, probability } = state;
  const cfg = ALERT_LEVELS[alertLevel];
  const prevLevelRef = useRef(alertLevel);
  const { cardRef, glareRef, onMouseMove, onMouseLeave } = use3DTilt({ maxTilt: 8, scale: 1.02 });

  useEffect(() => {
    if (prevLevelRef.current !== alertLevel && (alertLevel === 'ORANGE' || alertLevel === 'RED')) {
      if (cardRef.current) {
        cardRef.current.animate(
          [
            { boxShadow: `0 0 0px ${cfg.color}` },
            { boxShadow: `0 0 60px ${cfg.color}88, 0 0 120px ${cfg.color}44` },
            { boxShadow: `0 0 30px ${cfg.color}44` },
          ],
          { duration: 1000, easing: 'ease-out' }
        );
      }
    }
    prevLevelRef.current = alertLevel;
  }, [alertLevel, cfg.color, cardRef]);

  return (
    <div
      ref={cardRef}
      className="alert-card tilt-card"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        '--alert-color': cfg.color,
        '--alert-glow': cfg.glow,
        boxShadow: `0 0 40px ${cfg.glow}, 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)`,
      }}
    >
      {/* Glare overlay */}
      <div ref={glareRef} className="tilt-glare" />

      <div className="alert-card__header">
        <span className="section-label">ALERT LEVEL</span>
        {(alertLevel === 'ORANGE' || alertLevel === 'RED') && (
          <span className="alert-card__pulse-badge">● ACTIVE</span>
        )}
      </div>

      <div className="alert-card__main">
        <div
          className="alert-card__level-display"
          style={{ color: cfg.color, textShadow: `0 0 30px ${cfg.color}99, 0 0 60px ${cfg.color}44` }}
        >
          {alertLevel}
        </div>
        <div className="alert-card__flare-class">
          <span className="flare-class-label">FLARE CLASS</span>
          <span className="flare-class-value" style={{ color: cfg.color, textShadow: `0 0 20px ${cfg.color}88` }}>
            {flareClass}
          </span>
        </div>
      </div>

      <div className="alert-card__thresholds">
        {LEVEL_ORDER.map(lvl => (
          <AlertBadge key={lvl} level={lvl} active={alertLevel === lvl} />
        ))}
      </div>

      <div className="alert-card__prob-bar">
        <div className="prob-bar-track">
          <div
            className="prob-bar-fill"
            style={{
              width: `${probability}%`,
              background: `linear-gradient(90deg, #22c55e, #eab308, #f4a623, #ef4444)`,
              backgroundSize: '400% 100%',
              backgroundPosition: `${probability}% 0`,
              boxShadow: `0 0 12px ${cfg.color}88`,
            }}
          />
        </div>
        <span className="prob-bar-label">{probability.toFixed(1)}% probability</span>
      </div>
    </div>
  );
}
