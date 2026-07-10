import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import {
  isSpeechRecognitionSupported,
  startWakeWordListener,
  type SpeechSession,
} from '@/services/speech';

const WAKE_COOLDOWN_MS = 4000;

type UseWakeWordListenerOptions = {
  enabled: boolean;
  locale: string;
  onWakeWord: (transcript: string, commandAfterWake: string | null) => void;
};

export function useWakeWordListener({
  enabled,
  locale,
  onWakeWord,
}: UseWakeWordListenerOptions) {
  const sessionRef = useRef<SpeechSession | null>(null);
  const lastWakeRef = useRef(0);
  const onWakeWordRef = useRef(onWakeWord);

  onWakeWordRef.current = onWakeWord;

  useEffect(() => {
    if (!enabled || !isSpeechRecognitionSupported()) {
      sessionRef.current?.stop();
      sessionRef.current = null;
      return;
    }

    let appState: AppStateStatus = AppState.currentState;
    let cancelled = false;

    const start = () => {
      if (cancelled || appState !== 'active') return;
      sessionRef.current?.stop();

      const session = startWakeWordListener(
        {
          onWakeWord: (transcript, commandAfterWake) => {
            const now = Date.now();
            if (now - lastWakeRef.current < WAKE_COOLDOWN_MS) return;
            lastWakeRef.current = now;
            sessionRef.current?.stop();
            sessionRef.current = null;
            onWakeWordRef.current(transcript, commandAfterWake);
          },
          onError: () => {
            sessionRef.current = null;
          },
        },
        { locale }
      );

      sessionRef.current = session;
    };

    const handleAppState = (next: AppStateStatus) => {
      appState = next;
      if (next === 'active') {
        start();
      } else {
        sessionRef.current?.stop();
        sessionRef.current = null;
      }
    };

    start();
    const subscription = AppState.addEventListener('change', handleAppState);

    return () => {
      cancelled = true;
      subscription.remove();
      sessionRef.current?.stop();
      sessionRef.current = null;
    };
  }, [enabled, locale]);
}
