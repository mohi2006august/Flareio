import React, { useEffect, useRef } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { use3DTilt } from '../hooks/use3DTilt';

const SIZE = 280;
const STROKE = 22;
const R = (SIZE - STROKE) / 2;
const CX = SIZE / 2;
const CY = SIZE / 2;
const START_ANGLE = -220;
const END_ANGLE = 40;
const ARC_SPAN = END_ANGLE - START_ANGLE;

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const s = polarToCartesian(cx, cy, r, startAngle);
  const e = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
}

const GRADIENT_STOPS = [
  { pct: 0,    color: '#22c55e' },
  { pct: 0.25, color: '#eab308' },
  { pct: 0.5,  color: '#f4a623' },
  { pct: 0.75, color: '#ef4444' },
  { pct: 1,    color: '#dc2626' },
];

function getArcColor(probability) {
  const p = probability / 100;
  if (p < 0.25) return '#22c55e';
  if (p < 0.5)  return '#eab308';
  if (p < 0.75) return '#f4a623';
  return '#ef4444';
}

function Tick({ angle, major }) {
  const inner = polarToCartesian(CX, CY, R - STROKE / 2 - (major ? 14 : 8), angle);
  const outer = polarToCartesian(CX, CY, R + STROKE / 2 + 2, angle);
  return (
    <line
      x1={inner.x} y1={inner.y}
      x2={outer.x} y2={outer.y}
      stroke={major ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)'}
      strokeWidth={major ? 2 : 1}
    />
  );
}

export default function ProbabilityGauge() {
  const { state } = useDashboard();
  const { probability, confidence, alertLevel } = state;

  const fillAngle = START_ANGLE + (probability / 100) * ARC_SPAN;
  const fillColor = getArcColor(probability);

  const animRef = useRef({ probability: 0, fillAngle: START_ANGLE });
  const svgRef = useRef(null);
  const rafRef = useRef(null);
  const targetRef = useRef({ probability, fillAngle });
  targetRef.current = { probability, fillAngle };

  const { cardRef, glareRef, onMouseMove, onMouseLeave } = use3DTilt({ maxTilt: 10, scale: 1.03, glareOpacity: 0.1 });

  useEffect(() => {
    const animate = () => {
      const curr = animRef.current;
      const tgt = targetRef.current;
      curr.probability += (tgt.probability - curr.probability) * 0.08;
      curr.fillAngle += (tgt.fillAngle - curr.fillAngle) * 0.08;
      if (svgRef.current) {
        const path = svgRef.current.querySelector('#fill-arc');
        const text = svgRef.current.querySelector('#prob-text');
        const glow = svgRef.current.querySelector('#glow-arc');
        const newPath = describeArc(CX, CY, R, START_ANGLE, curr.fillAngle);
        if (path) path.setAttribute('d', newPath);
        if (glow) glow.setAttribute('d', newPath);
        if (text) text.textContent = curr.probability.toFixed(1) + '%';
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const ticks = [];
  for (let i = 0; i <= 10; i++) {
    const angle = START_ANGLE + (i / 10) * ARC_SPAN;
    ticks.push(<Tick key={i} angle={angle} major={i % 2 === 0} />);
  }

  const alertColors = { GREEN: '#22c55e', YELLOW: '#eab308', ORANGE: '#f4a623', RED: '#ef4444' };
  const glowColor = alertColors[alertLevel] || '#f4a623';

  return (
    <div
      ref={cardRef}
      className="gauge-card tilt-card"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* Glare overlay */}
      <div ref={glareRef} className="tilt-glare" />

      {/* 3D depth rings behind the card */}
      <div className="gauge-3d-depth" />

      <div className="gauge-label">FLARE PROBABILITY</div>
      <div className="gauge-wrapper">
        <svg
          ref={svgRef}
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ filter: `drop-shadow(0 0 24px ${glowColor}66)` }}
        >
          <defs>
            <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              {GRADIENT_STOPS.map((s, i) => (
                <stop key={i} offset={`${s.pct * 100}%`} stopColor={s.color} />
              ))}
            </linearGradient>
            <filter id="arcBlur">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="innerGlow">
              <feGaussianBlur stdDeviation="6" result="glow" />
              <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <radialGradient id="innerBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(20,50,100,0.95)" />
              <stop offset="100%" stopColor="rgba(10,35,66,0.85)" />
            </radialGradient>
          </defs>

          {/* Track */}
          <path
            d={describeArc(CX, CY, R, START_ANGLE, END_ANGLE)}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />

          {/* Tick marks */}
          {ticks}

          {/* Glow arc */}
          <path
            id="glow-arc"
            d={describeArc(CX, CY, R, START_ANGLE, START_ANGLE)}
            fill="none"
            stroke={fillColor}
            strokeWidth={STROKE + 12}
            strokeLinecap="round"
            opacity={0.2}
            filter="url(#arcBlur)"
          />

          {/* Fill arc */}
          <path
            id="fill-arc"
            d={describeArc(CX, CY, R, START_ANGLE, START_ANGLE)}
            fill="none"
            stroke="url(#arcGrad)"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />

          {/* Inner circle */}
          <circle cx={CX} cy={CY} r={R - STROKE / 2 - 10} fill="url(#innerBg)" />
          <circle cx={CX} cy={CY} r={R - STROKE / 2 - 14} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
          <circle cx={CX} cy={CY} r={R - STROKE / 2 - 30} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={1} />

          {/* Center text */}
          <text
            id="prob-text"
            x={CX} y={CY - 8}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="38"
            fontWeight="800"
            fill="white"
            fontFamily="'Orbitron', 'Rajdhani', monospace"
            style={{ letterSpacing: '-1px', filter: `drop-shadow(0 0 8px ${glowColor})` }}
          >
            {probability.toFixed(1)}%
          </text>
          <text
            x={CX} y={CY + 24}
            textAnchor="middle"
            fontSize="11"
            fill="rgba(255,255,255,0.55)"
            fontFamily="'Inter', sans-serif"
            letterSpacing="2"
          >
            PROBABILITY
          </text>

          {/* Min/Max labels */}
          {(() => {
            const minPt = polarToCartesian(CX, CY, R + STROKE / 2 + 14, START_ANGLE);
            const maxPt = polarToCartesian(CX, CY, R + STROKE / 2 + 14, END_ANGLE);
            return (
              <>
                <text x={minPt.x} y={minPt.y} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.35)" fontFamily="monospace">0%</text>
                <text x={maxPt.x} y={maxPt.y} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.35)" fontFamily="monospace">100%</text>
              </>
            );
          })()}
        </svg>
      </div>
      <div className="gauge-confidence">
        <span className="conf-dot" style={{ background: glowColor, boxShadow: `0 0 8px ${glowColor}` }} />
        Confidence: <strong>{confidence}%</strong>
      </div>
    </div>
  );
}
