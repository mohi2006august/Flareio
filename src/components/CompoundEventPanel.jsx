import React from 'react';
import { useDashboard } from '../context/DashboardContext';

export default function CompoundEventPanel() {
  const { state } = useDashboard();
  const { compoundEvents } = state;

  if (!compoundEvents || compoundEvents.length < 2) return null;

  const getClassColor = (c) => {
    if (c.startsWith('X')) return '#ef4444';
    if (c.startsWith('M')) return '#f4a623';
    if (c.startsWith('C')) return '#eab308';
    return '#22c55e';
  };

  return (
    <div className="compound-event-panel">
      <div className="compound-event-panel__header">
        <span className="section-label" style={{ color: '#ef4444' }}>MULTIPLE EVENT WARNING</span>
      </div>
      <div className="compound-event-panel__cards">
        {compoundEvents.map((ev, i) => (
          <div key={i} className="compound-card">
            <div className="compound-card__lbl">EVENT {i + 1}</div>
            <div className="compound-card__class" style={{ color: getClassColor(ev.class) }}>{ev.class}</div>
            <div className="compound-card__prob">{ev.prob.toFixed(1)}% <span style={{fontSize:'10px',opacity:0.5}}>±{ev.uncert}%</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}
