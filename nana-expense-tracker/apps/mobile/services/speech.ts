/**
 * Speech recognition — native entry point (iOS/Android dev build).
 */
import { requireOptionalNativeModule } from 'expo-modules-core';
import { containsWakeWord, extractCommandAfterWakeWord } from './wakeWord';

export interface SpeechSession {
  stop: () => void;
}

export interface SpeechCallbacks {
  onPartialResult?: (transcript: string) => void;
  onResult: (transcript: string) => void;
  onError: (message: string) => void;
  onEnd?: () => void;
}

export interface WakeWordCallbacks {
  onWakeWord: (transcript: string, commandAfterWake: string | null) => void;
  onError?: (message: string) => void;
}

export interface SpeechOptions {
  /** BCP-47 locale, e.g. en-US, my-MM */
  locale?: string;
}

let cachedSupported: boolean | null = null;

function getSpeechNativeModule() {
  return requireOptionalNativeModule('ExpoSpeechRecognition');
}

function loadSpeechRecognitionModule():
  | typeof import('expo-speech-recognition')
  | null {
  if (!getSpeechNativeModule()) {
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-speech-recognition') as typeof import('expo-speech-recognition');
  } catch {
    return null;
  }
}

export function isSpeechRecognitionSupported(): boolean {
  if (cachedSupported !== null) {
    return cachedSupported;
  }

  const speech = loadSpeechRecognitionModule();
  if (!speech) {
    cachedSupported = false;
    return false;
  }

  try {
    cachedSupported = speech.isRecognitionAvailable();
  } catch {
    cachedSupported = false;
  }

  return cachedSupported;
}

export function startSpeechRecognition(
  callbacks: SpeechCallbacks,
  options?: SpeechOptions
): SpeechSession | null {
  const speech = loadSpeechRecognitionModule();
  if (!speech) {
    return null;
  }

  const {
    ExpoSpeechRecognitionModule,
    addSpeechRecognitionListener,
    isRecognitionAvailable,
  } = speech;

  try {
    if (!isRecognitionAvailable()) {
      return null;
    }

    const subscriptions = [
      addSpeechRecognitionListener('result', (event) => {
        const text = event.results[0]?.transcript ?? '';
        if (!text) return;
        if (event.isFinal) {
          callbacks.onResult(text.trim());
        } else {
          callbacks.onPartialResult?.(text);
        }
      }),
      addSpeechRecognitionListener('error', (event) => {
        callbacks.onError(event.message || event.error);
      }),
      addSpeechRecognitionListener('end', () => {
        callbacks.onEnd?.();
        subscriptions.forEach((sub) => sub.remove());
      }),
    ];

    ExpoSpeechRecognitionModule.start({
      lang: options?.locale ?? 'en-US',
      interimResults: true,
      continuous: false,
    });

    return {
      stop: () => {
        try {
          ExpoSpeechRecognitionModule.stop();
        } catch {
          // already stopped
        }
        subscriptions.forEach((sub) => sub.remove());
      },
    };
  } catch {
    return null;
  }
}

export function startWakeWordListener(
  callbacks: WakeWordCallbacks,
  options?: SpeechOptions
): SpeechSession | null {
  const speech = loadSpeechRecognitionModule();
  if (!speech) {
    return null;
  }

  const {
    ExpoSpeechRecognitionModule,
    addSpeechRecognitionListener,
    isRecognitionAvailable,
  } = speech;

  try {
    if (!isRecognitionAvailable()) {
      return null;
    }

    const subscriptions = [
      addSpeechRecognitionListener('result', (event) => {
        const text = event.results[0]?.transcript ?? '';
        if (!text || !containsWakeWord(text)) return;
        callbacks.onWakeWord(text.trim(), extractCommandAfterWakeWord(text));
      }),
      addSpeechRecognitionListener('error', (event) => {
        callbacks.onError?.(event.message || event.error);
      }),
      addSpeechRecognitionListener('end', () => {
        subscriptions.forEach((sub) => sub.remove());
      }),
    ];

    ExpoSpeechRecognitionModule.start({
      lang: options?.locale ?? 'en-US',
      interimResults: true,
      continuous: true,
    });

    return {
      stop: () => {
        try {
          ExpoSpeechRecognitionModule.abort();
        } catch {
          // already stopped
        }
        subscriptions.forEach((sub) => sub.remove());
      },
    };
  } catch {
    return null;
  }
}
