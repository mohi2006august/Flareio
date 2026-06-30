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

  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const processQueue = useCallback(() => {
    if (speakingRef.current || queueRef.current.length === 0 || mutedRef.current) return;
    const text = queueRef.current.shift();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 1.0;
    utter.lang = 'en-US';
    // prefer a clear female voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('google us'));
    if (preferred) utter.voice = preferred;
    let fallbackTimeout;
    
    utter.onstart = () => {
      clearTimeout(fallbackTimeout);
    };
    
    utter.onend = () => {
      clearTimeout(fallbackTimeout);
      speakingRef.current = false;
      processQueue();
    };
    
    utter.onerror = () => {
      clearTimeout(fallbackTimeout);
      speakingRef.current = false;
      processQueue();
    };
    
    speakingRef.current = true;
    window.speechSynthesis.speak(utter);

    // If the browser blocks audio due to autoplay policies, it might never fire onstart or onerror.
    // This fallback unlocks the queue after 2 seconds so future clicks (like the Ask button) will work.
    fallbackTimeout = setTimeout(() => {
      if (speakingRef.current) {
        speakingRef.current = false;
        // Optionally clear the hung synthesis queue
        window.speechSynthesis.cancel();
        processQueue();
      }
    }, 2000);
  }, []);

  const speak = useCallback((text) => {
    if (!SUPPORTED || mutedRef.current) return;
    queueRef.current.push(text);
    processQueue();
  }, [processQueue]);

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

  useEffect(() => {
    if (muted && SUPPORTED) {
      window.speechSynthesis.cancel();
      queueRef.current = [];
      speakingRef.current = false;
    }
  }, [muted]);

  return { supported: SUPPORTED, speak };
}
