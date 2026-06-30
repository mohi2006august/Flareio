import { useState, useEffect, useRef, useCallback } from 'react';
import { useDashboard } from '../context/DashboardContext';

const SR_SUPPORTED =
  typeof window !== 'undefined' &&
  ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

function matchIntent(transcript, state) {
  const t = transcript.toLowerCase();

  if (t.includes('probability') || t.includes('chance') || t.includes('likelihood')) {
    return `Current flare probability is ${state.nowcast.probability.toFixed(1)}%, with ${state.nowcast.confidence}% confidence. Alert level is ${state.alertLevel}.`;
  }
  if (t.includes('alert') || t.includes('warning') || t.includes('status')) {
    const msgs = {
      GREEN: 'All clear. No significant flare activity detected.',
      YELLOW: 'Advisory in effect. Moderate flare probability. Monitoring elevated.',
      ORANGE: 'Orange alert active. High probability of significant solar flare.',
      RED: 'Critical red alert! Major solar flare event in progress or imminent.',
    };
    return msgs[state.alertLevel] || `Current alert level is ${state.alertLevel}.`;
  }
  if (t.includes('x-class') || t.includes('x class') || t.includes('xclass') || t.includes('last flare')) {
    const xEntry = state.eventLog?.find(c => c.class?.startsWith('X'));
    if (xEntry) {
      const dt = new Date(xEntry.time);
      return `Last X-class flare was ${xEntry.class} detected at ${dt.toLocaleTimeString()} on ${dt.toLocaleDateString()}.`;
    }
    return 'No X-class flare has been detected in the current session catalogue.';
  }
  if (t.includes('confidence')) {
    return `Model confidence is currently ${state.nowcast.confidence}%.`;
  }
  if (t.includes('flux') || t.includes('solexs') || t.includes('helios')) {
    return `SoLEXS flux is ${state.fluxSoLEXS?.toExponential(2)} W per square meter. HEL1OS flux is ${state.fluxHEL1OS?.toExponential(2)} W per square meter.`;
  }
  if (t.includes('flare class') || t.includes('class')) {
    return `Current predicted flare class is ${state.nowcast.flareClass}.`;
  }
  if (t.includes('system mode') || t.includes('mode') || t.includes('data')) {
    return `Data source is ${state.metrics.dataSource}. Inference latency is ${state.metrics.latency} milliseconds.`;
  }
  if (t.includes('analyze') || t.includes('report') || t.includes('summary') || t.includes('everything')) {
    return `System Analysis Complete. Alert Level is ${state.alertLevel}. Immediate flare probability is ${state.nowcast.probability.toFixed(1)}% for a ${state.nowcast.flareClass} class event. Model confidence is ${state.nowcast.confidence}%. Out of distribution anomaly score is ${(state.oodScore * 100).toFixed(1)}%. SoLEXS flux is currently at ${state.fluxSoLEXS?.toExponential(2)}. All systems operational.`;
  }
  return `I heard: "${transcript}". Try asking to "analyze everything", or ask about probability, alerts, flux, confidence, or X-class flares.`;
}

export function useSpeechRecognition({ speak, muted }) {
  const { state } = useDashboard();
  const stateRef = useRef(state);
  stateRef.current = state;

  const speakRef = useRef(speak);
  speakRef.current = speak;

  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [answer, setAnswer] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!SR_SUPPORTED) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (e) => {
      const heard = e.results[0][0].transcript;
      setTranscript(heard);
      const ans = matchIntent(heard, stateRef.current);
      setAnswer(ans);
      if (!mutedRef.current && speakRef.current) {
        speakRef.current(ans);
      }
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = (e) => {
      setListening(false);
      setTranscript('Error');
      if (e.error === 'not-allowed') {
        setAnswer('Microphone access denied. Please enable microphone permissions in your browser address bar.');
      } else if (e.error === 'no-speech') {
        setAnswer('No speech detected. Please try asking again.');
      } else {
        setAnswer(`Speech recognition error: ${e.error}`);
      }
    };
    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
      try { recognition.stop(); } catch {}
    };
  }, []); // run once only

  const startListening = useCallback(() => {
    if (!SR_SUPPORTED || !recognitionRef.current) return;
    setTranscript('');
    setAnswer('');
    setListening(true);
    try { 
      recognitionRef.current.start(); 
    } catch (e) {
      setListening(false);
      setTranscript('Error');
      setAnswer('Could not access microphone engine. Try reloading the page.');
    }
  }, []);

  const stopListening = useCallback(() => {
    try { recognitionRef.current?.stop(); } catch {}
    setListening(false);
  }, []);

  return { supported: SR_SUPPORTED, listening, transcript, answer, startListening, stopListening };
}
