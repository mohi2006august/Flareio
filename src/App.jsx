import React, { useState, useCallback, useEffect } from 'react';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { VoiceContext } from './context/VoiceContext';
import { useVoiceAlerts } from './hooks/useVoiceAlerts';

// Components
import Header from './components/Header';
import AlertBanner from './components/AlertBanner';
import OodWarning from './components/OodWarning';
import Magnetogram from './components/Magnetogram';
import FlareAlertPanel from './components/FlareAlertPanel';
import FlareProbabilityChart from './components/FlareProbabilityChart';
import LightCurvePanel from './components/LightCurvePanel';
import Preloader from './components/Preloader';
import FlareEventLog from './components/FlareEventLog';

function DashboardGrid() {
  const { state } = useDashboard();
  
  return (
    <div className="mc-dashboard">
      <Header />
      <OodWarning />
      <AlertBanner />
      <main className="mc-grid">
        {/* Left Column */}
        <div className="mc-col-left">
          <div className="magnetogram-container">
            <Magnetogram />
          </div>
          <LightCurvePanel />
        </div>

        {/* Right Column */}
        <div className="mc-col-right">
          <FlareAlertPanel />
          <FlareProbabilityChart />
          <FlareEventLog />
        </div>
      </main>
    </div>
  );
}

function DashboardWithVoice({ phase }) {
  const [muted, setMuted] = useState(false);
  const { supported: ttsSupported, speak } = useVoiceAlerts(muted);
  const [hasWelcomed, setHasWelcomed] = useState(false);

  useEffect(() => {
    if (phase === 'DASHBOARD' && !hasWelcomed && ttsSupported && !muted) {
      setTimeout(() => {
        speak("Welcome to Flare Sense Mission Control. All systems nominal. Space weather monitoring is active.");
      }, 500);
      setHasWelcomed(true);
    }
  }, [phase, hasWelcomed, ttsSupported, muted, speak]);

  const dashboardClass = `dashboard-root ${phase === 'DASHBOARD' ? 'dashboard-root--active' : 'dashboard-root--hidden'}`;

  return (
    <VoiceContext.Provider value={{ muted, setMuted, speak, ttsSupported }}>
      <div className={dashboardClass}>
        {/* Wrapping DashboardContext inside the transition layer to avoid mounting SpaceBackground too late */}
        <DashboardGrid />
      </div>
    </VoiceContext.Provider>
  );
}

export default function App() {
  const [phase, setPhase] = useState('PRELOAD'); 

  const handlePreloaderDone = useCallback(() => setPhase('DASHBOARD'), []);

  return (
    <DashboardProvider>
      {phase === 'PRELOAD' && <Preloader onDone={handlePreloaderDone} />}
      <DashboardWithVoice phase={phase} />
    </DashboardProvider>
  );
}
