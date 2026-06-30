import React, { useContext, useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX, MessageSquare, X } from 'lucide-react';
import { VoiceContext } from '../context/VoiceContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

export default function VoiceBar() {
  const { muted, setMuted, speak, ttsSupported } = useContext(VoiceContext);
  const [showAnswer, setShowAnswer] = useState(false);

  const srSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const voiceSupported = ttsSupported && srSupported;

  const { listening, transcript, answer, startListening, stopListening } =
    useSpeechRecognition({ speak, muted });

  const handleMicClick = () => {
    if (listening) {
      stopListening();
    } else {
      setShowAnswer(true);
      startListening();
    }
  };

  return (
    <div className="voice-bar">
      {!voiceSupported && (
        <span className="voice-unavailable-badge">
          ⚠ Voice unavailable in this browser
        </span>
      )}

      {voiceSupported && (
        <>
          <button
            className={`voice-btn ${listening ? 'voice-btn--listening' : ''}`}
            onClick={handleMicClick}
            title={listening ? 'Stop listening' : "Ask a question (e.g. 'what's the current probability?')"}
            id="voice-mic-btn"
          >
            {listening ? <MicOff size={16} /> : <Mic size={16} />}
            <span>{listening ? 'Listening…' : 'Ask'}</span>
          </button>

          <button
            className={`mute-btn ${muted ? 'mute-btn--muted' : ''}`}
            onClick={() => setMuted(m => !m)}
            title={muted ? 'Unmute voice alerts' : 'Mute voice alerts'}
            id="voice-mute-btn"
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </>
      )}

      {showAnswer && (transcript || answer) && (
        <div className="voice-answer-popup">
          <button className="voice-answer-close" onClick={() => setShowAnswer(false)}>
            <X size={12} />
          </button>
          {transcript && (
            <div className="voice-answer-query">
              <MessageSquare size={12} />
              <em>&ldquo;{transcript}&rdquo;</em>
            </div>
          )}
          {answer && <div className="voice-answer-text">{answer}</div>}
        </div>
      )}
    </div>
  );
}
