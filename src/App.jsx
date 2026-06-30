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
          {/* Top Section */}
          <div className="dashboard-top-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <ProbabilityGauge />
          </div>

          {/* Spacer to expose the majestic 3D sun */}
          <div style={{ flexGrow: 1, minHeight: '30vh' }} />

          {/* Bottom Section */}
          <div className="dashboard-bottom-section" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <StatCards />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '18px', alignItems: 'flex-start' }}>
              <LightCurveChart />
              <LogPanels />
            </div>
            <AlertLevelCard />
          </div>
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
  const [phase, setPhase] = useState('PRELOAD'); // PRELOAD, DASHBOARD

  const handlePreloaderDone = useCallback(() => setPhase('DASHBOARD'), []);

  return (
    <>
      {phase === 'PRELOAD' && <Preloader onDone={handlePreloaderDone} />}

      {/* Mount Dashboard early to initialize SpaceBackground, but keep it visually hidden until DASHBOARD phase */}
      <DashboardProvider>
        <DashboardWithVoice phase={phase} />
      </DashboardProvider>
    </>
  );
}

