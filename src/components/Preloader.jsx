import React, { useEffect, useRef, useState } from 'react';

const BOOT_STEPS = [
  { label: 'Initializing PBCAT-M kernel…',        duration: 420 },
  { label: 'Connecting to Aditya-L1 telemetry…',  duration: 500 },
  { label: 'Calibrating SoLEXS instrument…',       duration: 480 },
  { label: 'Calibrating HEL1OS instrument…',       duration: 460 },
  { label: 'Loading historical light curves…',     duration: 520 },
  { label: 'Running PBCAT-M inference engine…',    duration: 550 },
  { label: 'Establishing WebSocket pipeline…',     duration: 400 },
  { label: 'Space weather dashboard ready.',        duration: 300 },
];

// Total = ~3630ms — long enough to feel premium, short enough to not annoy

export default function Preloader({ onDone }) {
  const canvasRef = useRef(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const rafRef = useRef(null);

  // ── Canvas: animated sun + stars ─────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // Generate stars once
    const stars = Array.from({ length: 280 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.2 + 0.2,
      o: Math.random() * 0.6 + 0.2,
      twinkle: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.005,
    }));

    let t = 0;
    const draw = () => {
      t += 0.016;

      // Background
      ctx.fillStyle = '#020c1b';
      ctx.fillRect(0, 0, W, H);

      // Stars
      stars.forEach(s => {
        const opacity = s.o * (0.6 + 0.4 * Math.sin(s.twinkle + t * s.speed * 60));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${opacity})`;
        ctx.fill();
      });

      // Sun — centred slightly left of centre
      const sx = W * 0.5, sy = H * 0.42;

      // Outer halo pulses
      [80, 55, 36].forEach((r, i) => {
        const pulse = 1 + 0.06 * Math.sin(t * 1.2 + i * 1.2);
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * pulse);
        g.addColorStop(0, `rgba(244,166,35,${[0.08, 0.14, 0.22][i]})`);
        g.addColorStop(1, 'rgba(244,166,35,0)');
        ctx.beginPath();
        ctx.arc(sx, sy, r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });

      // Corona rays
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + t * 0.08;
        const len = 30 + 12 * Math.sin(t * 1.5 + i * 0.8);
        const x1 = sx + Math.cos(angle) * 18;
        const y1 = sy + Math.sin(angle) * 18;
        const x2 = sx + Math.cos(angle) * (18 + len);
        const y2 = sy + Math.sin(angle) * (18 + len);
        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, 'rgba(244,166,35,0.6)');
        grad.addColorStop(1, 'rgba(244,166,35,0)');
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.5 - i * 0.1;
        ctx.stroke();
      }

      // Sun body gradient
      const sunGrad = ctx.createRadialGradient(sx - 4, sy - 4, 0, sx, sy, 18);
      sunGrad.addColorStop(0, '#fff9d6');
      sunGrad.addColorStop(0.4, '#f4a623');
      sunGrad.addColorStop(1, '#e8721c');
      ctx.beginPath();
      ctx.arc(sx, sy, 18, 0, Math.PI * 2);
      ctx.fillStyle = sunGrad;
      ctx.fill();

      // X-ray flare arc
      const fAngle = t * 0.4;
      ctx.beginPath();
      ctx.arc(sx, sy, 26, fAngle, fAngle + 1.2);
      ctx.strokeStyle = `rgba(239,68,68,${0.5 + 0.3 * Math.sin(t * 2)})`;
      ctx.lineWidth = 3;
      ctx.stroke();

      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // ── Boot sequence ──────────────────────────────────────────────────────────
  useEffect(() => {
    let step = 0;
    let prog = 0;
    const totalDuration = BOOT_STEPS.reduce((s, b) => s + b.duration, 0);
    let elapsed = 0;

    const tick = () => {
      if (step >= BOOT_STEPS.length) return;
      const currentStep = BOOT_STEPS[step];
      elapsed += 16; // ~60fps tick

      // Advance step
      if (elapsed >= currentStep.duration) {
        elapsed = 0;
        step++;
        setStepIdx(step);
      }

      // Smooth progress bar
      prog = BOOT_STEPS.slice(0, step).reduce((s, b) => s + b.duration, 0) +
             Math.min(elapsed, currentStep?.duration || 0);
      setProgress(Math.min(100, (prog / totalDuration) * 100));

      if (step < BOOT_STEPS.length) {
        setTimeout(tick, 16);
      } else {
        // All steps done — fade out
        setTimeout(() => {
          setExiting(true);
          setTimeout(onDone, 700);
        }, 300);
      }
    };

    const timeout = setTimeout(tick, 300);
    return () => clearTimeout(timeout);
  }, [onDone]);

  return (
    <div className={`preloader ${exiting ? 'preloader--exit' : ''}`}>
      <canvas ref={canvasRef} className="preloader__canvas" />

      <div className="preloader__ui">
        {/* Logo */}
        <div className="preloader__logo-group">
          <div className="preloader__logo-ring" />
          <div className="preloader__logo-ring preloader__logo-ring--2" />
          <div className="preloader__logo-core">
            <svg width="48" height="48" viewBox="0 0 36 36">
              <defs>
                <radialGradient id="plSunGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fff9d6" />
                  <stop offset="50%" stopColor="#f4a623" />
                  <stop offset="100%" stopColor="#e8721c" />
                </radialGradient>
              </defs>
              <circle cx="18" cy="18" r="10" fill="url(#plSunGrad)" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                const rad = (angle * Math.PI) / 180;
                return (
                  <line
                    key={i}
                    x1={18 + 13 * Math.cos(rad)} y1={18 + 13 * Math.sin(rad)}
                    x2={18 + 17 * Math.cos(rad)} y2={18 + 17 * Math.sin(rad)}
                    stroke="#f4a623" strokeWidth="2" strokeLinecap="round"
                  />
                );
              })}
              <path d="M 26 10 Q 30 5 34 8 Q 30 12 26 14 Z" fill="#ef4444" opacity="0.9" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className="preloader__title">PBCAT-M</div>
        <div className="preloader__subtitle">
          Solar Flare Forecasting System · ISRO / Space Weather Division
        </div>

        {/* Scanning line animation */}
        <div className="preloader__scan-box">
          <div className="preloader__scan-line" />
          <div className="preloader__scan-grid" />
        </div>

        {/* Progress bar */}
        <div className="preloader__bar-wrap">
          <div
            className="preloader__bar-fill"
            style={{ width: `${progress}%` }}
          />
          <div className="preloader__bar-glow" style={{ left: `${progress}%` }} />
        </div>

        {/* Boot log */}
        <div className="preloader__log">
          {BOOT_STEPS.slice(0, stepIdx + 1).map((step, i) => (
            <div
              key={i}
              className={`preloader__log-line ${i === stepIdx ? 'preloader__log-line--active' : 'preloader__log-line--done'}`}
            >
              <span className="preloader__log-prefix">
                {i < stepIdx ? '✓' : '›'}
              </span>
              {step.label}
            </div>
          ))}
        </div>

        {/* Percentage */}
        <div className="preloader__percent">
          {Math.round(progress)}
          <span>%</span>
        </div>
      </div>
    </div>
  );
}
