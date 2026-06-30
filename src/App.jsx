import React, { useState, useCallback, useEffect } from 'react';
import { DashboardProvider } from './context/DashboardContext';
import { VoiceContext } from './context/VoiceContext';
import { useVoiceAlerts } from './hooks/useVoiceAlerts';
import Header from './components/Header';
import ProbabilityGauge from './components/ProbabilityGauge';
import AlertLevelCard from './components/AlertLevelCard';
import LightCurveChart from './components/LightCurveChart';
import StatCards from './components/StatCards';
import LogPanels from './components/LogPanels';
import SpaceBackground from './components/SpaceBackground';
import Preloader from './components/Preloader';

function DashboardWithVoice({ phase }) {
  const [muted, setMuted] = useState(false);
  const { supported: ttsSupported, speak } = useVoiceAlerts(muted);
  const [hasWelcomed, setHasWelcomed] = useState(false);

  useEffect(() => {
    if (phase === 'DASHBOARD' && !hasWelcomed && ttsSupported && !muted) {
      // Small delay to let the visual transition start
      setTimeout(() => {
        speak("Welcome to Flare Sense. All systems nominal. Space weather monitoring is active.");
      }, 500);
      setHasWelcomed(true);
    }
  }, [phase, hasWelcomed, ttsSupported, muted, speak]);

  // When phase is DASHBOARD, the active class triggers stagger animations
  const dashboardClass = `dashboard-root ${phase === 'DASHBOARD' ? 'dashboard-root--active' : 'dashboard-root--hidden'}`;

  return (
    <VoiceContext.Provider value={{ muted, setMuted, speak, ttsSupported }}>
      {/* 3D Three.js Space Background */}
      <SpaceBackground />

      <div className={dashboardClass}>
        <Header />
        <main className="dashboard-main">
          <div className="top-row">
            <ProbabilityGauge />
            <AlertLevelCard />
          </div>
          <LightCurveChart />
          <StatCards />
          <LogPanels />
        </main>
        <footer className="dashboard-footer">
          <span>PBCAT-M v2.1.0 · SoLEXS &amp; HEL1OS Instruments · Aditya-L1 Mission</span>
          <span>
            Simulated data · Swap <code>ws://localhost:8000/ws</code> for real FastAPI backend
          </span>
        </footer>
      </div>
    </VoiceContext.Provider>
  );
}

export default function App() {
  const [phase, setPhase] = useState('BOOT'); // BOOT, PRELOAD, DASHBOARD

  const handleBoot = useCallback(() => setPhase('PRELOAD'), []);
  const handlePreloaderDone = useCallback(() => setPhase('DASHBOARD'), []);

  return (
    <>
      {phase === 'BOOT' && (
        <div className="boot-screen" onClick={handleBoot}>
          <div className="boot-screen__btn">
            <span className="boot-screen__icon">⏻</span>
            INITIALIZE SYSTEM
          </div>
          <div className="boot-screen__hint">Click anywhere to begin boot sequence</div>
        </div>
      )}

      {phase === 'PRELOAD' && <Preloader onDone={handlePreloaderDone} />}

      {/* Mount Dashboard early to initialize SpaceBackground, but keep it visually hidden until DASHBOARD phase */}
      {phase !== 'BOOT' && (
        <DashboardProvider>
          <DashboardWithVoice phase={phase} />
        </DashboardProvider>
      )}
    </>
  );
}

