import React from 'react';
import { useDashboard, ALERT_LEVELS } from '../context/DashboardContext';
import { Download } from 'lucide-react';

export default function FlareEventLog() {
  const { state } = useDashboard();
  const { eventLog, metrics } = state;

  const getClassColor = (c) => {
    if (c.startsWith('X')) return '#ef4444';
    if (c.startsWith('M')) return '#f4a623';
    if (c.startsWith('C')) return '#eab308';
    return '#22c55e';
  };

  const handleExport = () => {
    // Fake export for now
    alert("Exporting catalogue to CSV...");
  };

  return (
    <div className="event-log-panel tilt-card">
      <div className="tilt-glare" />
      
      <div className="event-log__header">
        <div className="event-log__title-group">
          <span className="section-label">FLARE EVENT LOG</span>
          <span className="event-log__metrics">TPR {metrics.tpr}% · FAR {metrics.far}%</span>
        </div>
        <button className="event-log__export-btn" onClick={handleExport} title="Export CSV">
          <Download size={14} />
        </button>
      </div>

      <div className="event-log__table-wrap">
        <table className="event-log__table">
          <thead>
            <tr>
              <th>TIME (UTC)</th>
              <th>CLASS</th>
              <th>PROB</th>
              <th>LEAD TIME</th>
              <th>TAG</th>
            </tr>
          </thead>
          <tbody>
            {eventLog.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center', opacity: 0.5 }}>No recent events</td></tr>
            )}
            {eventLog.map(ev => (
              <tr key={ev.id} className="event-log__row">
                <td className="event-log__time">{new Date(ev.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                <td className="event-log__class" style={{ color: getClassColor(ev.class) }}>{ev.class}</td>
                <td className="event-log__prob">{ev.prob}%</td>
                <td className="event-log__lead">T - {ev.lead}m</td>
                <td className="event-log__tag">
                  <span className={`tag-badge tag-badge--${ev.type.replace(' ', '-').toLowerCase()}`}>
                    {ev.type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
