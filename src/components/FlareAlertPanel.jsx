import React from 'react';
import { useDashboard, ALERT_LEVELS } from '../context/DashboardContext';

export default function FlareAlertPanel() {
  const { state } = useDashboard();
  const { alertLevel, forecast24h, nowcast } = state;
  const cfg = ALERT_LEVELS[alertLevel];

  // Determine risk label from alertLevel
  const riskLabel = alertLevel === 'GREEN' ? 'LOW' : alertLevel === 'YELLOW' ? 'MODERATE' : alertLevel === 'ORANGE' ? 'HIGH' : 'CRITICAL';
  const isElevated = alertLevel !== 'GREEN';

  return (
    <div style={{
      background: 'rgba(10, 15, 30, 0.7)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        fontFamily: 'Orbitron, sans-serif',
        fontWeight: '700',
        fontSize: '13px',
        letterSpacing: '1px',
        color: 'white',
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>24-HOUR FORECAST</span>
        <span style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '10px',
          fontWeight: '500',
          color: 'rgba(255,255,255,0.5)',
          letterSpacing: '0.5px'
        }}>HORIZON: 1–24 HR</span>
      </div>

      <div style={{
        display: 'flex',
        gap: '20px',
        alignItems: 'stretch'
      }}>
        
        {/* Left: Alert Level Box */}
        <div style={{
          background: `${cfg.bg}`,
          border: `1px solid ${cfg.color}40`,
          borderRadius: '8px',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '140px',
          boxShadow: isElevated ? `0 0 20px ${cfg.color}20 inset` : 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            {isElevated && (
              <span style={{ color: cfg.color, fontSize: '20px' }}>⚠️</span>
            )}
            <span style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '24px',
              fontWeight: '900',
              color: cfg.color
            }}>
              {riskLabel}
            </span>
          </div>
          <div style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '10px',
            fontWeight: '500',
            color: 'rgba(255,255,255,0.6)',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            OVERALL RISK LEVEL
          </div>
        </div>

        {/* Right: Per-Class Probabilities with Uncertainty */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '10px'
        }}>
          <ProbRow label="X-Class" prob={forecast24h.x.prob} uncert={forecast24h.x.uncert} color="#ef4444" />
          <ProbRow label="M-Class" prob={forecast24h.m.prob} uncert={forecast24h.m.uncert} color="#f4a623" />
          <ProbRow label="C-Class" prob={forecast24h.c.prob} uncert={forecast24h.c.uncert} color="#eab308" />
          <ProbRow label="Quiet Sun" prob={forecast24h.quietSun.prob} uncert={forecast24h.quietSun.uncert} color="#22c55e" />
        </div>

      </div>
    </div>
  );
}

function ProbRow({ label, prob, uncert, color }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontFamily: 'Inter, sans-serif',
      fontSize: '13px',
      fontWeight: '600',
      gap: '8px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '80px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: color, flexShrink: 0 }} />
        <span style={{ color: 'rgba(255,255,255,0.8)' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span style={{ color, fontWeight: '700', fontSize: '15px', fontFamily: 'JetBrains Mono, monospace' }}>
          {prob.toFixed(1)}%
        </span>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace' }}>
          ±{uncert.toFixed(1)}%
        </span>
      </div>
      {/* Mini bar */}
      <div style={{ width: '60px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(prob, 100)}%`, height: '100%', background: color, borderRadius: '2px', transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
}
