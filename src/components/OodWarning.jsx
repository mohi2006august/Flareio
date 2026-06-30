import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { AlertOctagon } from 'lucide-react';

export default function OodWarning() {
  const { state } = useDashboard();
  
  if (state.oodScore < 0.8) return null;

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
