/**
 * Speech recognition — native entry point.
 *
 * Real speech-to-text on iOS/Android requires a development build with a
 * native speech module, which isn't available inside Expo Go. The app
 * gracefully falls back to typed commands (see VoiceInputModal). The web
 * build gets real recognition via speech.web.ts.
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

export function isSpeechRecognitionSupported(): boolean {
  return false;
}

export function startSpeechRecognition(_callbacks: SpeechCallbacks): SpeechSession | null {
  return null;
}
