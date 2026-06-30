import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const time = new Date(label).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return (
      <div className="chart-tooltip">
        <div className="chart-tooltip__time">{time} UTC</div>
        {payload.map(p => (
          <div key={p.dataKey} className="chart-tooltip__val" style={{ color: p.stroke }}>
            {p.name}: {Number(p.value).toExponential(2)} W/m²
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function LightCurvePanel() {
  const { state } = useDashboard();
  const [timeRange, setTimeRange] = useState(360); // minutes to show

  // Filter history based on timeRange
  const cutoff = Date.now() - timeRange * 60 * 1000;
  const data = state.history.filter(d => new Date(d.time).getTime() > cutoff);
  
  // Format X Axis ticks
  const formatXAxis = (tickItem) => {
    return new Date(tickItem).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="light-curve-panel">
      <div className="light-curve-panel__header">
        <div className="light-curve-panel__title-group">
          <h2 className="light-curve-panel__title">X-RAY FLUX TELEMETRY</h2>
          <span className="light-curve-panel__subtitle">SoLEXS · 2–22 keV | HEL1OS · 8–150 keV</span>
        </div>
        <div className="light-curve-panel__controls">
          <button className={`lc-btn ${timeRange === 30 ? 'lc-btn--active' : ''}`} onClick={() => setTimeRange(30)}>30M</button>
          <button className={`lc-btn ${timeRange === 60 ? 'lc-btn--active' : ''}`} onClick={() => setTimeRange(60)}>1H</button>
          <button className={`lc-btn ${timeRange === 180 ? 'lc-btn--active' : ''}`} onClick={() => setTimeRange(180)}>3H</button>
          <button className={`lc-btn ${timeRange === 360 ? 'lc-btn--active' : ''}`} onClick={() => setTimeRange(360)}>6H</button>
        </div>
      </div>

      <div className="light-curve-panel__charts">
        {/* SoLEXS Chart */}
        <div className="lc-chart-wrapper">
          <div className="lc-chart-label" style={{ color: '#38bdf8' }}>SoLEXS</div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="time" tickFormatter={formatXAxis} stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} minTickGap={30} />
              <YAxis scale="log" domain={['auto', 'auto']} tickFormatter={(val) => val.toExponential(0)} stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} width={50} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={1e-5} stroke="#f4a623" strokeDasharray="4 4" label={{ position: 'insideTopLeft', value: 'M-CLASS THRESHOLD', fill: '#f4a623', fontSize: 9 }} />
              <ReferenceLine y={1e-4} stroke="#ef4444" strokeDasharray="4 4" label={{ position: 'insideTopLeft', value: 'X-CLASS THRESHOLD', fill: '#ef4444', fontSize: 9 }} />
              <Line type="monotone" dataKey="fluxSoLEXS" name="Flux" stroke="#38bdf8" strokeWidth={1.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* HEL1OS Chart */}
        <div className="lc-chart-wrapper">
          <div className="lc-chart-label" style={{ color: '#f4a623' }}>HEL1OS</div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="time" tickFormatter={formatXAxis} stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} minTickGap={30} />
              <YAxis scale="log" domain={['auto', 'auto']} tickFormatter={(val) => val.toExponential(0)} stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} width={50} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="fluxHEL1OS" name="Flux" stroke="#f4a623" strokeWidth={1.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
