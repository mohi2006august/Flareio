import React, { useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

export default function FlareProbabilityChart() {
  const { state } = useDashboard();
  const { forecast24h } = state;

  // Generate time-series data centered around NOW
  const data = useMemo(() => {
    const now = new Date();
    const points = [];
    // Past 12 hours + future 12 hours = 24 hours
    for (let h = -12; h <= 12; h++) {
      const t = new Date(now.getTime() + h * 3600 * 1000);
      const label = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const isNow = h === 0;
      const isFuture = h > 0;

      // Base values drift from forecast24h
      const drift = Math.sin(h * 0.3) * 10 + Math.cos(h * 0.5) * 5;
      points.push({
        time: label,
        x: Math.max(0, Math.min(100, forecast24h.x.prob + drift * 0.5 + (isFuture ? h * 0.8 : 0))),
        m: Math.max(0, Math.min(100, forecast24h.m.prob + drift * 0.7 + (isFuture ? h * 0.5 : 0))),
        c: Math.max(0, Math.min(100, forecast24h.c.prob + drift * 0.4 + (isFuture ? h * 0.3 : 0))),
        quietSun: Math.max(0, Math.min(100, forecast24h.quietSun.prob - drift * 0.3)),
        isNow,
        isFuture
      });
    }
    return points;
  }, [forecast24h]);

  const nowIndex = data.findIndex(d => d.isNow);
  const nowLabel = nowIndex >= 0 ? data[nowIndex].time : undefined;

  return (
    <div style={{
      background: 'rgba(10, 15, 30, 0.7)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
      backdropFilter: 'blur(10px)'
    }}>
      {/* Title row with Y-axis label inline */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: '12px'
      }}>
        <div style={{
          fontFamily: 'Orbitron, sans-serif',
          fontWeight: '700',
          fontSize: '13px',
          letterSpacing: '1px',
          color: 'white'
        }}>
          FLARE PROBABILITY (NEXT 24 HOURS)
        </div>
        <span style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '10px',
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: '0.5px'
        }}>
          Y-AXIS: PROBABILITY (%)
        </span>
      </div>

      <div style={{ display: 'flex', flex: 1, gap: '16px', minHeight: 0 }}>
        
        {/* Left: Legend with uncertainty */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '14px',
          minWidth: '130px'
        }}>
          <LegendItem label="X-Class" prob={forecast24h.x.prob} uncert={forecast24h.x.uncert} color="#ef4444" />
          <LegendItem label="M-Class" prob={forecast24h.m.prob} uncert={forecast24h.m.uncert} color="#f4a623" />
          <LegendItem label="C-Class" prob={forecast24h.c.prob} uncert={forecast24h.c.uncert} color="#eab308" />
          <LegendItem label="Quiet Sun" prob={forecast24h.quietSun.prob} uncert={forecast24h.quietSun.uncert} color="#22c55e" />
        </div>

        {/* Right: Line Chart */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10, fontFamily: 'Inter' }} axisLine={false} tickLine={false} interval={2} />
              <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10, fontFamily: 'Inter' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px' }} 
                itemStyle={{ fontFamily: 'Inter', fontSize: '12px' }}
                labelStyle={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter', fontSize: '12px' }}
              />
              
              {/* NOW marker */}
              {nowLabel && (
                <ReferenceLine 
                  x={nowLabel} 
                  stroke="rgba(255,255,255,0.8)" 
                  strokeWidth={2}
                  strokeDasharray="6 4" 
                  label={{ value: 'NOW', position: 'top', fill: 'white', fontSize: 11, fontWeight: 700, fontFamily: 'Orbitron' }}
                />
              )}

              <Line type="monotone" dataKey="x" name="X-Class" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="m" name="M-Class" stroke="#f4a623" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="c" name="C-Class" stroke="#eab308" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="quietSun" name="Quiet Sun" stroke="#22c55e" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}

function LegendItem({ label, prob, uncert, color }) {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
        <div style={{ width: '10px', height: '3px', background: color, borderRadius: '1px' }} />
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: '500' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', paddingLeft: '16px' }}>
        <span style={{ color, fontWeight: '700', fontSize: '14px', fontFamily: 'JetBrains Mono, monospace' }}>
          {prob.toFixed(1)}%
        </span>
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontFamily: 'JetBrains Mono, monospace' }}>
          ±{uncert.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
