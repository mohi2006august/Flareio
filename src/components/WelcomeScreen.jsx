import React, { useEffect, useState } from 'react';

export default function WelcomeScreen({ onDone }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Show the welcome screen for a brief period, then trigger exit animation
    const t = setTimeout(() => {
      setExiting(true);
      // Wait for exit animation to complete before unmounting
      setTimeout(onDone, 1200); 
    }, 2400);

    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className={`welcome-screen ${exiting ? 'welcome-screen--exit' : ''}`}>
      <div className="welcome-screen__content">
        <h1 className="welcome-screen__title">Welcome to FlareSense Model</h1>
        <div className="welcome-screen__subtitle">Initializing Interface...</div>
        
        {/* Subtle scanning line underneath the welcome text */}
        <div className="welcome-screen__scan-line"></div>
      </div>
    </div>
  );
}
