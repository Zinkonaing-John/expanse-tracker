/**
 * Speech recognition — native entry point (iOS/Android dev build).
 */

export interface SpeechSession {
  stop: () => void;
}

export interface SpeechCallbacks {
  onPartialResult?: (transcript: string) => void;
  onResult: (transcript: string) => void;
  onError: (message: string) => void;
  onEnd?: () => void;
}

export interface SpeechOptions {
  /** BCP-47 locale, e.g. en-US, my-MM */
  locale?: string;
}

export function isSpeechRecognitionSupported(): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { isRecognitionAvailable } = require('expo-speech-recognition') as typeof import('expo-speech-recognition');
    return isRecognitionAvailable();
  } catch {
    return false;
  }
}

export function startSpeechRecognition(
  callbacks: SpeechCallbacks,
  options?: SpeechOptions
): SpeechSession | null {
  try {
    const {
      ExpoSpeechRecognitionModule,
      addSpeechRecognitionListener,
      isRecognitionAvailable,
    } = require('expo-speech-recognition') as typeof import('expo-speech-recognition');

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
