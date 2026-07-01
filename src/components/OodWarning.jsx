import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { AlertOctagon, CheckCircle2 } from 'lucide-react';

export default function OodWarning() {
  const { state } = useDashboard();
  
  if (state.oodScore < 0.8) {
    return (
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(34, 197, 94, 0.1)',
        border: '1px solid rgba(34, 197, 94, 0.3)',
        borderRadius: '20px',
        padding: '4px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontFamily: 'Inter, sans-serif',
        fontSize: '11px',
        fontWeight: '600',
        color: '#22c55e',
        zIndex: 50,
        boxShadow: '0 0 10px rgba(34,197,94,0.1) inset'
      }}>
        <CheckCircle2 size={12} />
        <span>Within distribution · score: {state.oodScore.toFixed(2)}</span>
      </div>
    );
  }

  return (
    <div className="ood-warning-bar">
      <div className="ood-warning-bar__left">
        <AlertOctagon size={16} />
        <span className="ood-warning-bar__title">EXTREME EVENT DETECTED</span>
        <span className="ood-warning-bar__desc">— input outside training distribution</span>
      </div>
      <div className="ood-warning-bar__right">
        <span className="ood-warning-bar__score">SCORE: {state.oodScore.toFixed(2)}</span>
        <span className="ood-warning-bar__action">CROSS-CHECK GOES IMMEDIATELY</span>
      </div>
    </div>
  );
}
