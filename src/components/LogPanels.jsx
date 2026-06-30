import React, { useRef, useEffect } from 'react';
import { useDashboard, ALERT_LEVELS } from '../context/DashboardContext';
import { use3DTilt } from '../hooks/use3DTilt';

function formatTimestamp(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function AlertLogEntry({ entry, isNew }) {
  const cfg = ALERT_LEVELS[entry.level];
  return (
    <div
      className={`log-entry ${isNew ? 'log-entry--new' : ''}`}
      style={{ '--entry-color': cfg?.color || '#ffffff' }}
    >
      <div className="log-entry__time">{formatTimestamp(entry.timestamp)}</div>
      <div className="log-entry__body">
        <span className="log-entry__badge" style={{ background: cfg?.color || '#fff', color: '#0a2342' }}>
          {entry.level}
        </span>
        <span className="log-entry__msg">{entry.message}</span>
      </div>
    </div>
  );
}

function CatalogueEntry({ entry, isNew }) {
  const isXClass = entry.flareClass?.startsWith('X');
  const isMClass = entry.flareClass?.startsWith('M');
  const color = isXClass ? '#ef4444' : isMClass ? '#f4a623' : '#eab308';
  return (
    <div
      className={`log-entry ${isNew ? 'log-entry--new' : ''}`}
      style={{ '--entry-color': color }}
    >
      <div className="log-entry__time">{formatTimestamp(entry.timestamp)}</div>
      <div className="log-entry__body">
        <span className="log-entry__badge" style={{ background: color, color: '#0a2342' }}>
          {entry.flareClass}
        </span>
        <div className="catalogue-meta">
          <span>Conf: {entry.confidence}%</span>
          <span>Dur: {entry.duration}</span>
          <span>Peak: {entry.peak}</span>
        </div>
      </div>
    </div>
  );
}

function LogPanel({ title, icon, children, count }) {
  const bodyRef = useRef(null);
  const { cardRef, glareRef, onMouseMove, onMouseLeave } = use3DTilt({ maxTilt: 5, scale: 1.01, glareOpacity: 0.07 });

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [count]);

  return (
    <div
      ref={cardRef}
      className="log-panel tilt-card"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <div ref={glareRef} className="tilt-glare" />
      <div className="log-panel__header">
        <span className="section-label">{icon} {title}</span>
        <span className="log-panel__count">{count} entries</span>
      </div>
      <div className="log-panel__body" ref={bodyRef}>
        {children}
      </div>
    </div>
  );
}

export default function LogPanels() {
  const { state } = useDashboard();
  const prevAlertLen = useRef(state.alertLog.length);
  const prevCatLen = useRef(state.catalogue.length);

  const alertIsNew = state.alertLog.length > prevAlertLen.current;
  const catIsNew = state.catalogue.length > prevCatLen.current;
  prevAlertLen.current = state.alertLog.length;
  prevCatLen.current = state.catalogue.length;

  return (
    <div className="log-panels-row">
      <LogPanel title="ALERT LOG" icon="📋" count={state.alertLog.length}>
        {state.alertLog.map((entry, i) => (
          <AlertLogEntry key={entry.id} entry={entry} isNew={i === 0 && alertIsNew} />
        ))}
      </LogPanel>
      <LogPanel title="AUTOMATIC CATALOGUE" icon="📁" count={state.catalogue.length}>
        {state.catalogue.map((entry, i) => (
          <CatalogueEntry key={entry.id} entry={entry} isNew={i === 0 && catIsNew} />
        ))}
      </LogPanel>
    </div>
  );
}
