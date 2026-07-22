import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { IoMicOutline, IoMic } from 'react-icons/io5';

export const VoiceSearchButton = ({ onSearchResult, currentLang }) => {
  const { t } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = currentLang === 'ur' ? 'ur-PK' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        toast.loading(t('voiceSearch.listening') || '🎤 Listening... Speak a city name', { id: 'voice-search' });
      };

      recognition.onresult = (event) => {
        setIsListening(false);
        toast.dismiss('voice-search');

        if (event.results && event.results[0] && event.results[0][0]) {
          const transcript = event.results[0][0].transcript.trim();

          if (transcript) {
            // Remove spoken prefix phrases if user says "search Lahore", "weather in Lahore", or Urdu equivalents
            let cleanedCity = transcript
              .replace(/^(search for|search|show weather in|weather in|find|weather|موسم|تلاش کریں)\s+/i, '')
              .replace(/[.,!?]/g, '')
              .trim();

            if (cleanedCity) {
              cleanedCity = cleanedCity.charAt(0).toUpperCase() + cleanedCity.slice(1);
            }

            toast.success(`✅ ${t('voiceSearch.recognized') || 'Voice recognized'}: "${cleanedCity}"`);
            if (onSearchResult) {
              onSearchResult(cleanedCity);
            }
          }
        }
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        toast.dismiss('voice-search');

        // Gracefully ignore "aborted" - treat as normal session termination
        if (event.error === 'aborted') {
          return;
        }

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          toast.error(t('voiceSearch.permissionDenied') || '🎤 Microphone permission denied. Please allow microphone access.');
        } else if (event.error === 'no-speech') {
          toast.error(t('voiceSearch.noSpeech') || '🎤 No voice detected. Please try again.');
        } else if (event.error === 'audio-capture') {
          toast.error('🎤 No microphone detected.');
        } else {
          console.warn('Speech recognition status:', event.error);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        toast.dismiss('voice-search');
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [currentLang, onSearchResult, t]);

  const toggleListening = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const SpeechRecognition = typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;

    if (!SpeechRecognition) {
      toast.error(t('voiceSearch.notSupported') || 'Voice Search is not supported in this browser.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (err) {
        // ignore
      }
      setIsListening(false);
      toast.dismiss('voice-search');
      return;
    }

    try {
      recognitionRef.current?.start();
    } catch (err) {
      // Handle InvalidStateError if already running
      if (err.name === 'InvalidStateError') {
        try {
          recognitionRef.current?.stop();
        } catch (stopErr) {
          // ignore
        }
        setIsListening(false);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      aria-label="Voice Search"
      title={isListening ? 'Listening...' : t('voiceSearch.title') || 'Voice Search'}
      className={`absolute right-3 top-2.5 p-1 rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer z-10 ${isListening
        ? 'text-rose-400 bg-rose-500/20 animate-pulse border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.5)] scale-110'
        : 'text-slate-400 hover:text-blue-400 hover:bg-white/10'
        }`}
    >
      {isListening ? (
        <IoMic className="text-base animate-bounce" />
      ) : (
        <IoMicOutline className="text-base" />
      )}
    </button>
  );
};
