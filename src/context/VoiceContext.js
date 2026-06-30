import React from 'react';

// Shared voice context — lifted to App level to share mute/speak between
// useVoiceAlerts (which fires on alert transitions) and VoiceBar (user controls)
export const VoiceContext = React.createContext({
  muted: false,
  setMuted: () => {},
  speak: () => {},
  ttsSupported: false,
});
