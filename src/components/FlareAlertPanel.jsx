import React from 'react';
import { useDashboard } from '../context/DashboardContext';

export default function FlareAlertPanel() {
  const { state } = useDashboard();
  
  // Example dynamic values based on context
  const probM = 65;
  const probX = 25;
  const isHighRisk = probM > 50 || probX > 20;

  return (
    <div style={{
      background: 'rgba(10, 15, 30, 0.7)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      height: '35%',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        fontFamily: 'Orbitron, sans-serif',
        fontWeight: '700',
        fontSize: '14px',
        letterSpacing: '1px',
        color: 'white',
        marginBottom: '20px'
      }}>
        FLARE ALERT LEVEL <span style={{opacity: 0.5, marginLeft: '4px'}}>ⓘ</span>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        flex: 1
      }}>
        
        {/* Left: Alert Box */}
        <div style={{
          background: isHighRisk ? 'rgba(255, 0, 0, 0.1)' : 'rgba(0, 255, 0, 0.1)',
          border: isHighRisk ? '1px solid rgba(255, 0, 0, 0.4)' : '1px solid rgba(0, 255, 0, 0.4)',
          borderRadius: '8px',
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: isHighRisk ? '0 0 20px rgba(255, 0, 0, 0.2) inset' : 'none',
          minWidth: '200px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            {isHighRisk && (
              <span style={{ color: '#ff4444', fontSize: '24px' }}>⚠️</span>
            )}
            <span style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '28px',
              fontWeight: '900',
              color: 'white'
            }}>
              {isHighRisk ? 'HIGH' : 'LOW'}
            </span>
          </div>
          <div style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            fontWeight: '500',
            color: 'rgba(255,255,255,0.7)'
          }}>
            RISK OF M-CLASS FLARE
          </div>
        </div>

        {/* Right: Gauge and Probabilities */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Simple SVG Half-donut Gauge */}
          <div style={{ position: 'relative', width: '160px', height: '80px', overflow: 'hidden' }}>
            <svg viewBox="0 0 200 100" width="160" height="80">
              <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="30" />
              {/* Green section */}
              <path d="M 20 100 A 80 80 0 0 1 70 36" fill="none" stroke="#22c55e" strokeWidth="30" />
              {/* Yellow section */}
              <path d="M 70 36 A 80 80 0 0 1 130 36" fill="none" stroke="#eab308" strokeWidth="30" />
              {/* Red section */}
              <path d="M 130 36 A 80 80 0 0 1 180 100" fill="none" stroke="#ef4444" strokeWidth="30" />
              
              {/* Needle (Rotate based on risk: roughly 130deg for high risk) */}
              <g transform="translate(100, 100) rotate(45)">
                <circle cx="0" cy="0" r="8" fill="white" />
                <path d="M -4 0 L 0 -70 L 4 0 Z" fill="white" />
              </g>
            </svg>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '12px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Inter', fontSize: '11px' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>Prob. M-Class: {probM}%</span>
              <span style={{ color: '#f4a623' }}>75%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Inter', fontSize: '11px' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>Prob. X-Class: {probX}%</span>
              <span style={{ color: '#ef4444' }}>25%</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
