import React, { useState, useEffect } from 'react';
import { useDashboard, ALERT_LEVELS } from '../context/DashboardContext';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export default function AlertBanner() {
  const { state, acknowledgeAlert } = useDashboard();
  const { alertLevel, nowcast, alertActiveSince, alertAcked, compoundEvents } = state;
  const cfg = ALERT_LEVELS[alertLevel];
  const isRed = alertLevel === 'RED';

  const [activeDuration, setActiveDuration] = useState('');

  useEffect(() => {
    const tick = () => {
      const diff = Math.floor((Date.now() - alertActiveSince) / 1000);
      const m = Math.floor(diff / 60);
      const s = diff % 60;
      setActiveDuration(`${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [alertActiveSince]);

  // If RED and unacknowledged, pulse. If acknowledged, stay solid.
  const bannerClass = `alert-strip ${isRed && !alertAcked ? 'alert-strip--pulse' : ''}`;

  return (
    <div className={bannerClass} style={{ '--alert-color': cfg.color, '--alert-bg': cfg.bg }}>
      <div className="alert-strip__left">
        <div className="alert-strip__level-tag">
          <span className="alert-strip__dot" />
          {cfg.label}
        </div>
        <div className="alert-strip__divider" />
        <div className="alert-strip__class">CLASS {nowcast.flareClass[0]}</div>
        <div className="alert-strip__prob">{nowcast.probability.toFixed(1)}% ± {nowcast.uncertainty}%</div>
        <div className="alert-strip__horizon">IN NEXT 30 MIN</div>
        {compoundEvents.length > 0 && (
          <>
            <div className="alert-strip__divider" />
            <div className="alert-strip__compound-badge">COMPOUND</div>
          </>
        )}
      </div>

      <div className="alert-strip__right">
        <div className="alert-strip__time">ACTIVE FOR {activeDuration}</div>
        
        {isRed && !alertAcked && (
          <button className="alert-strip__ack-btn" onClick={acknowledgeAlert}>
            <CheckCircle size={14} />
            ACKNOWLEDGE
          </button>
        )}
        {isRed && alertAcked && (
          <div className="alert-strip__acked-text">
            <CheckCircle size={12} />
            ACKNOWLEDGED
          </div>
        )}
      </div>
    </div>
  );
}
