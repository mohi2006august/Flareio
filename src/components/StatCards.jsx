import React, { useState, useEffect, useRef } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Activity, Clock, Wifi, Cpu } from 'lucide-react';

function CountdownTimer({ lastUpdateTime }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setElapsed(0);
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - lastUpdateTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastUpdateTime]);

  const remaining = Math.max(0, 30 - elapsed);
  const progress = ((30 - remaining) / 30) * 100;

  return (
    <div className="countdown-wrapper">
      <div className="countdown-ring">
        <svg width="52" height="52" viewBox="0 0 52 52">
          <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
          <circle
            cx="26" cy="26" r="22"
            fill="none"
            stroke="#f4a623"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 22}`}
            strokeDashoffset={`${2 * Math.PI * 22 * (progress / 100)}`}
            transform="rotate(-90 26 26)"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
          <text x="26" y="26" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="13" fontWeight="700" fontFamily="monospace">
            {remaining}s
          </text>
        </svg>
      </div>
      <div className="countdown-sub">next update</div>
    </div>
  );
}

function StatusBadge({ value, goodValues, warnValues }) {
  const isGood = goodValues?.includes(value);
  const isWarn = warnValues?.includes(value);
  const color = isGood ? '#22c55e' : isWarn ? '#eab308' : '#ef4444';
  return (
    <span className="status-badge" style={{ '--badge-c': color }}>
      <span className="status-badge__dot" />
      {value}
    </span>
  );
}

const STAT_CONFIGS = [
  {
    id: 'confidence',
    icon: Activity,
    label: 'CONFIDENCE',
    getValue: (s) => `${s.confidence}%`,
    getExtra: (s) => (s.confidence >= 80 ? '▲ HIGH' : s.confidence >= 65 ? '━ MODERATE' : '▼ LOW'),
    getExtraColor: (s) => s.confidence >= 80 ? '#22c55e' : s.confidence >= 65 ? '#eab308' : '#ef4444',
    renderValue: null,
  },
  {
    id: 'lastUpdate',
    icon: Clock,
    label: 'LAST UPDATE',
    renderValue: (s) => <CountdownTimer lastUpdateTime={s.lastUpdateTime} />,
    getValue: null,
  },
  {
    id: 'dataStatus',
    icon: Wifi,
    label: 'DATA STATUS',
    getValue: (s) => null,
    renderValue: (s) => (
      <StatusBadge value={s.dataStatus} goodValues={['NOMINAL']} warnValues={['DEGRADED']} />
    ),
    getExtra: (s) => s.dataStatus === 'NOMINAL' ? 'All sensors online' : 'Check sensor feed',
    getExtraColor: (s) => s.dataStatus === 'NOMINAL' ? '#22c55e' : '#eab308',
  },
  {
    id: 'systemMode',
    icon: Cpu,
    label: 'SYSTEM MODE',
    renderValue: (s) => (
      <StatusBadge value={s.systemMode} goodValues={['AUTO']} warnValues={['MANUAL']} />
    ),
    getValue: null,
    getExtra: () => 'PBCAT-M v2.1',
    getExtraColor: () => 'rgba(255,255,255,0.35)',
  },
];

export default function StatCards() {
  const { state } = useDashboard();

  return (
    <div className="stat-cards-row">
      {STAT_CONFIGS.map(cfg => {
        const Icon = cfg.icon;
        return (
          <div className="stat-card" key={cfg.id}>
            <div className="stat-card__header">
              <Icon size={14} className="stat-card__icon" />
              <span className="stat-card__label">{cfg.label}</span>
            </div>
            <div className="stat-card__value">
              {cfg.renderValue ? cfg.renderValue(state) : (
                <span className="stat-card__number">{cfg.getValue(state)}</span>
              )}
            </div>
            {cfg.getExtra && (
              <div className="stat-card__extra" style={{ color: cfg.getExtraColor(state) }}>
                {cfg.getExtra(state)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
