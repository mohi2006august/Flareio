import { useEffect, useRef, useCallback } from 'react';
import { useDashboard } from '../context/DashboardContext';

const SUPPORTED = typeof window !== 'undefined' && 'speechSynthesis' in window;

const ALERT_MESSAGES = {
  ORANGE: (state) =>
    `Warning. Solar flare alert level elevated to Orange. Current probability is ${state.probability.toFixed(0)} percent. Flare class ${state.flareClass}. Confidence ${state.confidence} percent.`,
  RED: (state) =>
    `Critical alert! Alert level is now Red. X-class or major flare detected. Probability ${state.probability.toFixed(0)} percent. Flare class ${state.flareClass}. Immediate attention required.`,
};

export function useVoiceAlerts(muted) {
  const { state } = useDashboard();
  const prevLevelRef = useRef(state.alertLevel);
  const queueRef = useRef([]);
  const speakingRef = useRef(false);

  const processQueue = useCallback(() => {
    if (speakingRef.current || queueRef.current.length === 0 || muted) return;
    const text = queueRef.current.shift();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 1.0;
    utter.lang = 'en-US';
    // prefer a clear female voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('google us'));
    if (preferred) utter.voice = preferred;
    speakingRef.current = true;
    utter.onend = () => {
      speakingRef.current = false;
      processQueue();
    };
    utter.onerror = () => {
      speakingRef.current = false;
      processQueue();
    };
    window.speechSynthesis.speak(utter);
  }, [muted]);

  const speak = useCallback((text) => {
    if (!SUPPORTED || muted) return;
    queueRef.current.push(text);
    processQueue();
  }, [muted, processQueue]);

  useEffect(() => {
    const prev = prevLevelRef.current;
    const curr = state.alertLevel;
    if (prev !== curr) {
      prevLevelRef.current = curr;
      if ((curr === 'ORANGE' || curr === 'RED') && ALERT_MESSAGES[curr]) {
        speak(ALERT_MESSAGES[curr](state));
      }
    }
  }, [state.alertLevel, state, speak]);

  return { supported: SUPPORTED, speak };
}
