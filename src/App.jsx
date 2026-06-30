import React, { useState } from 'react';
import { DashboardProvider } from './context/DashboardContext';
import { VoiceContext } from './context/VoiceContext';
import { useVoiceAlerts } from './hooks/useVoiceAlerts';
import Header from './components/Header';
import ProbabilityGauge from './components/ProbabilityGauge';
import AlertLevelCard from './components/AlertLevelCard';
import LightCurveChart from './components/LightCurveChart';
import StatCards from './components/StatCards';
import LogPanels from './components/LogPanels';

function DashboardWithVoice() {
  const [muted, setMuted] = useState(false);
  const { supported: ttsSupported, speak } = useVoiceAlerts(muted);

  return (
    <VoiceContext.Provider value={{ muted, setMuted, speak, ttsSupported }}>
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
  return (
    <DashboardProvider>
      <DashboardWithVoice />
    </DashboardProvider>
  );
}
