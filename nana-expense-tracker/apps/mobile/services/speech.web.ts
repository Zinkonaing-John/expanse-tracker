/**
 * Speech recognition — web implementation using the Web Speech API
 * (supported in Chrome, Edge, and Safari).
 */
import type { SpeechCallbacks, SpeechSession } from './speech';
export type { SpeechCallbacks, SpeechSession } from './speech';

function getRecognitionCtor(): (new () => any) | null {
  if (typeof window === 'undefined') return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getRecognitionCtor() !== null;
}

export function startSpeechRecognition(
  callbacks: SpeechCallbacks,
  options?: { locale?: string }
): SpeechSession | null {
  const Ctor = getRecognitionCtor();
  if (!Ctor) return null;

  const recognition = new Ctor();
  recognition.lang = options?.locale ?? 'en-US';
  recognition.interimResults = true;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;

  let finalTranscript = '';

  recognition.onresult = (event: any) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) {
        finalTranscript += result[0].transcript;
      } else {
        interim += result[0].transcript;
      }
    }
    if (interim && callbacks.onPartialResult) {
      callbacks.onPartialResult(finalTranscript + interim);
    }
    if (finalTranscript) {
      callbacks.onResult(finalTranscript.trim());
    }
  };

  recognition.onerror = (event: any) => {
    const code = event?.error || 'unknown';
    const messages: Record<string, string> = {
      'not-allowed': 'Microphone access was denied. Please allow microphone access and try again.',
      'no-speech': "Didn't catch that — please try again.",
      'audio-capture': 'No microphone was found on this device.',
      network: 'Speech recognition needs a network connection.',
    };
    callbacks.onError(messages[code] || `Speech recognition failed (${code}).`);
  };

  recognition.onend = () => {
    callbacks.onEnd?.();
  };

  try {
    recognition.start();
  } catch {
    callbacks.onError('Could not start speech recognition.');
    return null;
  }

  return {
    stop: () => {
      try {
        recognition.stop();
      } catch {
        // already stopped
      }
    },
  };
}
