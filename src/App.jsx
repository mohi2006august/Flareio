import React, { useState, useCallback } from 'react';
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

function DashboardWithVoice() {
  const [muted, setMuted] = useState(false);
  const { supported: ttsSupported, speak } = useVoiceAlerts(muted);

  return (
    <VoiceContext.Provider value={{ muted, setMuted, speak, ttsSupported }}>
      {/* 3D Three.js Space Background */}
      <SpaceBackground />

      <div className="dashboard-root">
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
  const [ready, setReady] = useState(false);
  const handleDone = useCallback(() => setReady(true), []);

  return (
    <>
      {!ready && <Preloader onDone={handleDone} />}
      {ready && (
        <DashboardProvider>
          <DashboardWithVoice />
        </DashboardProvider>
      )}
    </>
  );
}

