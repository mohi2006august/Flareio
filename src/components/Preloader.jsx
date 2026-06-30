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

// Telemetry strings to simulate real-time operations
const TELEMETRY_POOL = [
  "MAG_FLUX: 4.82e-6 T/s", "ORBIT: Aditya-L1 Halo L1", "SOLEXS_TEMP: 243.15 K", 
  "HEL1OS_HV: 1.25 kV", "DATA_RATE: 12.4 Mbps", "SNR: 42.8 dB", 
  "CR_SHIELD: NOMINAL", "SOLAR_WIND: 428 km/s", "SW_DENSITY: 6.2 p/cm³", 
  "HE_ABUNDANCE: 4.2%", "DEC: -15° 42' 18\"", "RA: 14h 28m 35s",
  "INFERENCE: PBCAT-v2.1", "SYS_CLK: UT_NOMINAL", "CORE_USAGE: 38.4%"
];

// Soft synthesizer audio feedback
const playTone = (freq, type = 'sine', duration = 0.06, volume = 0.05) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Fail silently if blocked by browser policy
  }
};

const playCompletionSwell = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C Major Chord (C5, E5, G5, C6)
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + i * 0.08);
      
      gain.gain.setValueAtTime(0.04, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5 + i * 0.08);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + 0.6 + i * 0.08);
    });
  } catch (e) {}
};

export default function Preloader({ onDone }) {
  const canvasRef = useRef(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [telemetry, setTelemetry] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const rafRef = useRef(null);

  // ── Telemetry feed generator ──────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry(prev => {
        const next = [...prev];
        if (next.length > 14) next.shift();
        const randStr = TELEMETRY_POOL[Math.floor(Math.random() * TELEMETRY_POOL.length)];
        const ts = new Date().toISOString().split('T')[1].substring(0, 8);
        next.push(`[${ts}] ${randStr}`);
        
        // Soft audio click on telemetry change
        if (soundEnabled && Math.random() < 0.4) {
          playTone(1200 + Math.random() * 800, 'sine', 0.01, 0.01);
        }
        return next;
      });
    }, 250);
    return () => clearInterval(timer);
  }, [soundEnabled]);

  // ── Canvas Animation: Solar dynamics and stars ──────────────────────────────
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

    const stars = Array.from({ length: 350 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.2,
      o: Math.random() * 0.7 + 0.3,
      twinkle: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.005,
    }));

    // Coronal mass ejection shockwaves
    let shockwaves = [];

    let t = 0;
    const draw = () => {
      t += 0.016;

      // Dark space backdrop with radial gradient depth
      const bgGrad = ctx.createRadialGradient(W/2, H/2, 50, W/2, H/2, Math.max(W, H));
      bgGrad.addColorStop(0, '#041630');
      bgGrad.addColorStop(1, '#020c1b');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Cyber grid lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < W; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Stars
      stars.forEach(s => {
        const opacity = s.o * (0.5 + 0.5 * Math.sin(s.twinkle + t * s.speed * 60));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${opacity})`;
        ctx.fill();
      });

      // Sun position
      const sx = W * 0.5, sy = H * 0.42;

      // Dynamic Coronal Shockwaves
      if (Math.random() < 0.012 && shockwaves.length < 5) {
        shockwaves.push({ r: 20, maxR: 200 + Math.random() * 200, opacity: 0.7 });
      }

      shockwaves = shockwaves.filter(sw => {
        sw.r += 2.5;
        sw.opacity *= 0.97;
        
        ctx.beginPath();
        ctx.arc(sx, sy, sw.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(244, 166, 35, ${sw.opacity * 0.25})`;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        return sw.r < sw.maxR && sw.opacity > 0.01;
      });

      // Pulsing outer solar halos
      [90, 60, 38].forEach((r, i) => {
        const pulse = 1 + 0.08 * Math.sin(t * 1.5 + i * 1.5);
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * pulse);
        g.addColorStop(0, `rgba(244,166,35,${[0.08, 0.16, 0.26][i]})`);
        g.addColorStop(1, 'rgba(244,166,35,0)');
        ctx.beginPath();
        ctx.arc(sx, sy, r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });

      // Rotating corona spikes
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2 + t * 0.05;
        const len = 35 + 15 * Math.sin(t * 2 + i * 1.1);
        const x1 = sx + Math.cos(angle) * 18;
        const y1 = sy + Math.sin(angle) * 18;
        const x2 = sx + Math.cos(angle) * (18 + len);
        const y2 = sy + Math.sin(angle) * (18 + len);
        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, 'rgba(244,166,35,0.7)');
        grad.addColorStop(0.5, 'rgba(232,114,28,0.3)');
        grad.addColorStop(1, 'rgba(244,166,35,0)');
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 3 - i * 0.12;
        ctx.stroke();
      }

      // Main Sun sphere
      const sunGrad = ctx.createRadialGradient(sx - 5, sy - 5, 0, sx, sy, 20);
      sunGrad.addColorStop(0, '#fffae0');
      sunGrad.addColorStop(0.3, '#fff066');
      sunGrad.addColorStop(0.6, '#f4a623');
      sunGrad.addColorStop(1, '#d35400');
      ctx.beginPath();
      ctx.arc(sx, sy, 20, 0, Math.PI * 2);
      ctx.fillStyle = sunGrad;
      ctx.fill();

      // Core glow
      ctx.shadowColor = '#f4a623';
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(sx, sy, 12, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      // Orbital telemetry rings
      ctx.beginPath();
      ctx.arc(sx, sy, 110, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.setLineDash([6, 15]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Rotating sweep indicator
      ctx.beginPath();
      ctx.arc(sx, sy, 110, t, t + 0.5);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // ── Boot sequence logic ───────────────────────────────────────────────────
  useEffect(() => {
    let step = 0;
    let prog = 0;
    const totalDuration = BOOT_STEPS.reduce((s, b) => s + b.duration, 0);
    let elapsed = 0;

    const tick = () => {
      if (step >= BOOT_STEPS.length) return;
      const currentStep = BOOT_STEPS[step];
      elapsed += 16; 

      if (elapsed >= currentStep.duration) {
        elapsed = 0;
        step++;
        setStepIdx(step);
        
        // Play beep on new step
        if (soundEnabled) {
          if (step === BOOT_STEPS.length) {
            playCompletionSwell();
          } else {
            playTone(880 + step * 60, 'sine', 0.06, 0.04);
          }
        }
      }

      prog = BOOT_STEPS.slice(0, step).reduce((s, b) => s + b.duration, 0) +
             Math.min(elapsed, currentStep?.duration || 0);
      setProgress(Math.min(100, (prog / totalDuration) * 100));

      if (step < BOOT_STEPS.length) {
        setTimeout(tick, 16);
      } else {
        setTimeout(() => {
          setExiting(true);
          setTimeout(onDone, 700);
        }, 400);
      }
    };

    // Initial audio cue
    if (soundEnabled) {
      playTone(440, 'triangle', 0.15, 0.05);
    }

    const timeout = setTimeout(tick, 300);
    return () => clearTimeout(timeout);
  }, [onDone, soundEnabled]);

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
