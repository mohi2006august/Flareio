import React, { useMemo } from 'react';
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Area,
} from 'recharts';
import { useDashboard } from '../context/DashboardContext';
import { use3DTilt } from '../hooks/use3DTilt';

const FLARE_THRESHOLDS = [
  { value: 1e-4, label: 'X', color: '#ef4444' },
  { value: 1e-5, label: 'M', color: '#f4a623' },
  { value: 1e-6, label: 'C', color: '#eab308' },
  { value: 1e-7, label: 'B', color: '#22c55e' },
];

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function logScale(v) {
  if (!v || v <= 0) return -9;
  return Math.log10(v);
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip__time">{formatTime(label)}</div>
      {payload.map((p, i) => (
        <div key={i} className="chart-tooltip__row" style={{ color: p.color }}>
          <span>{p.name}:</span>
          <span>{p.value != null ? `10^${p.value.toFixed(2)}` : 'N/A'} W/m²</span>
        </div>
      ))}
    </div>
  );
};

const CustomYTick = ({ x, y, payload }) => (
  <text x={x - 4} y={y} textAnchor="end" fill="rgba(255,255,255,0.45)" fontSize={10} fontFamily="monospace" dominantBaseline="middle">
    10^{payload.value}
  </text>
);

const CustomXTick = ({ x, y, payload }) => (
  <text x={x} y={y + 10} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={10} fontFamily="monospace">
    {formatTime(payload.value)}
  </text>
);

export default function LightCurveChart() {
  const { state } = useDashboard();
  const { cardRef, glareRef, onMouseMove, onMouseLeave } = use3DTilt({ maxTilt: 5, scale: 1.01, glareOpacity: 0.08 });

  const chartData = useMemo(() => {
    const sixHoursAgo = Date.now() - 6 * 3600 * 1000;
    return state.history
      .filter(p => new Date(p.timestamp).getTime() >= sixHoursAgo)
      .map(p => ({
        timestamp: p.timestamp,
        solexs: logScale(p.fluxSoLEXS),
        helios: logScale(p.fluxHEL1OS),
      }));
  }, [state.history]);

  const yDomain = [-9, -3];
  const yTicks = [-9, -8, -7, -6, -5, -4, -3];

  const xTicksRaw = useMemo(() => {
    if (chartData.length === 0) return [];
    const step = Math.max(1, Math.floor(chartData.length / 6));
    return chartData.filter((_, i) => i % step === 0).map(d => d.timestamp);
  }, [chartData]);

  return (
    <div
      ref={cardRef}
      className="chart-card tilt-card"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <div ref={glareRef} className="tilt-glare" />

      <div className="chart-card__header">
        <span className="section-label">SOLAR X-RAY FLUX — LIGHT CURVE</span>
        <div className="chart-legend-pills">
          <span className="legend-pill" style={{ '--pill-color': '#38bdf8' }}>
            <span className="legend-pill__dot" /> SoLEXS
          </span>
          <span className="legend-pill" style={{ '--pill-color': '#f4a623' }}>
            <span className="legend-pill__dot" /> HEL1OS
          </span>
          <span className="chart-window-label">Last 6 Hours · Log Scale W/m²</span>
        </div>
      </div>

      <div className="chart-card__body">
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 60 }}>
            <defs>
              <linearGradient id="solexsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="heliosGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f4a623" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f4a623" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />

            {FLARE_THRESHOLDS.map(t => (
              <ReferenceLine
                key={t.label}
                y={Math.log10(t.value)}
                stroke={t.color}
                strokeDasharray="6 3"
                strokeOpacity={0.5}
                label={{ value: t.label, fill: t.color, fontSize: 10, position: 'insideRight', fontFamily: 'monospace' }}
              />
            ))}

            <XAxis
              dataKey="timestamp"
              ticks={xTicksRaw}
              tick={<CustomXTick />}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={yDomain}
              ticks={yTicks}
              tick={<CustomYTick />}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              tickLine={false}
              label={{
                value: 'Flux (W/m²)',
                angle: -90,
                position: 'insideLeft',
                offset: -45,
                fill: 'rgba(255,255,255,0.3)',
                fontSize: 11,
                fontFamily: 'Inter, sans-serif',
              }}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Area fills for depth */}
            <Area type="monotone" dataKey="solexs" stroke="none" fill="url(#solexsGrad)" isAnimationActive={false} />
            <Area type="monotone" dataKey="helios" stroke="none" fill="url(#heliosGrad)" isAnimationActive={false} />

            <Line
              type="monotone" dataKey="solexs" name="SoLEXS"
              stroke="#38bdf8" strokeWidth={2} dot={false}
              activeDot={{ r: 5, fill: '#38bdf8', stroke: '#0a2342', strokeWidth: 2 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone" dataKey="helios" name="HEL1OS"
              stroke="#f4a623" strokeWidth={2} dot={false}
              activeDot={{ r: 5, fill: '#f4a623', stroke: '#0a2342', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
