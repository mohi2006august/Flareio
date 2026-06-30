import React, { useEffect, useRef, useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { use3DTilt } from '../hooks/use3DTilt';

const SIZE = 280;
const R = 110;
const STROKE = 8;
const CIRCUMFERENCE = 2 * Math.PI * R;
const ARC_FRAC = 0.75; // 270 degrees
const ARC_LENGTH = CIRCUMFERENCE * ARC_FRAC;

export default function ProbabilityGauge() {
  const { state } = useDashboard();
  const { probability, confidence, alertLevel } = state;
  const { cardRef, glareRef, onMouseMove, onMouseLeave } = use3DTilt({ maxTilt: 10, scale: 1.03, glareOpacity: 0.1 });

  const [displayProb, setDisplayProb] = useState(0);

  // Animate the probability value
  useEffect(() => {
    let raf;
    let curr = displayProb;
    const animate = () => {
      curr += (probability - curr) * 0.08;
      if (Math.abs(curr - probability) < 0.1) curr = probability;
      setDisplayProb(curr);
      if (curr !== probability) {
        raf = requestAnimationFrame(animate);
      }
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [probability]);

  const alertColors = { GREEN: '#22c55e', YELLOW: '#eab308', ORANGE: '#f4a623', RED: '#ef4444' };
  const glowColor = alertColors[alertLevel] || '#22c55e';

  const fillLength = (displayProb / 100) * ARC_LENGTH;

  // Generate ticks
  const ticks = [];
  const numTicks = 40;
  for (let i = 0; i <= numTicks; i++) {
    const isMajor = i % 10 === 0;
    const angle = 135 + (i / numTicks) * 270; // 135 to 405 degrees
    const rad = (angle * Math.PI) / 180;
    const r1 = R + (isMajor ? 12 : 8);
    const r2 = R + 2;
    ticks.push(
      <line
        key={i}
        x1={SIZE/2 + r1 * Math.cos(rad)}
        y1={SIZE/2 + r1 * Math.sin(rad)}
        x2={SIZE/2 + r2 * Math.cos(rad)}
        y2={SIZE/2 + r2 * Math.sin(rad)}
        stroke={isMajor ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)'}
        strokeWidth={isMajor ? 2 : 1}
      />
    );
  }

  return (
    <div ref={cardRef} className="gauge-card tilt-card" onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
      <div ref={glareRef} className="tilt-glare" />

      <div className="gauge-label">FLARE PROBABILITY</div>
      
      <div className="gauge-wrapper" style={{ position: 'relative', width: SIZE, height: SIZE, margin: '0 auto' }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <defs>
            <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Sleek metallic background for the gauge center */}
            <radialGradient id="centerBg" cx="50%" cy="50%" r="50%">
              <stop offset="70%" stopColor="rgba(10, 20, 40, 0.4)" />
              <stop offset="100%" stopColor="rgba(10, 20, 40, 0.0)" />
            </radialGradient>
          </defs>

          {/* Background Track */}
          <circle
            cx={SIZE/2} cy={SIZE/2} r={R}
            fill="url(#centerBg)"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={STROKE}
            strokeDasharray={`${ARC_LENGTH} ${CIRCUMFERENCE}`}
            strokeLinecap="round"
            transform={`rotate(135 ${SIZE/2} ${SIZE/2})`}
          />

          {/* Ticks */}
          {ticks}

          {/* Active Fill Arc */}
          <circle
            cx={SIZE/2} cy={SIZE/2} r={R}
            fill="none"
            stroke={glowColor}
            strokeWidth={STROKE}
            strokeDasharray={`${fillLength} ${CIRCUMFERENCE}`}
            strokeLinecap="round"
            transform={`rotate(135 ${SIZE/2} ${SIZE/2})`}
            filter="url(#gaugeGlow)"
            style={{ transition: 'stroke 0.5s ease' }}
          />

          {/* Inner decorative rings */}
          <circle cx={SIZE/2} cy={SIZE/2} r={R - 20} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx={SIZE/2} cy={SIZE/2} r={R - 40} fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />

          {/* Text Elements */}
          <text
            x={SIZE/2} y={SIZE/2 - 5}
            textAnchor="middle" dominantBaseline="middle"
            fill="white"
            fontSize="48"
            fontWeight="900"
            fontFamily="'Orbitron', monospace"
            style={{ letterSpacing: '2px', textShadow: `0 0 20px ${glowColor}88` }}
          >
            {displayProb.toFixed(1)}<tspan fontSize="24" fill="rgba(255,255,255,0.5)">%</tspan>
          </text>
          
          <text
            x={SIZE/2} y={SIZE/2 + 25}
            textAnchor="middle"
            fill="rgba(255,255,255,0.4)"
            fontSize="10"
            fontWeight="700"
            fontFamily="'Rajdhani', sans-serif"
            letterSpacing="3px"
          >
            PROBABILITY
          </text>
        </svg>

        {/* 0% and 100% Labels outside SVG to prevent clipping */}
        <div style={{ position: 'absolute', bottom: '15px', left: '30px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', fontSize: '12px' }}>0%</div>
        <div style={{ position: 'absolute', bottom: '15px', right: '25px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', fontSize: '12px' }}>100%</div>
      </div>

      <div className="gauge-confidence" style={{ marginTop: '10px' }}>
        <span className="conf-dot" style={{ background: glowColor, boxShadow: `0 0 10px ${glowColor}` }} />
        Confidence: <strong style={{ color: 'white', marginLeft: '5px' }}>{confidence}%</strong>
      </div>
    </div>
  );
}
