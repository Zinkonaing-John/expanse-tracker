import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import { voiceService, parseExpenseFromVoice, type ParsedExpenseCommand } from '@/services/voiceService';

type VoiceState = 'idle' | 'listening_wake' | 'listening_command' | 'processing';

interface UseVoiceCommandOptions {
  enabled?: boolean;
  onExpenseDetected?: (expense: ParsedExpenseCommand) => void;
  onError?: (error: Error) => void;
}

export function useVoiceCommand(options: UseVoiceCommandOptions = {}) {
  const { enabled = true, onExpenseDetected, onError } = options;
  
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [lastParsedExpense, setLastParsedExpense] = useState<ParsedExpenseCommand | null>(null);
  
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    
    const initVoice = async () => {
      if (!enabled || Platform.OS === 'web') return;

      try {
        const success = await voiceService.initialize({
          wakeWord: 'Hey Nana',
          onWakeWordDetected: handleWakeWordDetected,
          onSpeechResult: handleSpeechResult,
          onError: handleError,
        });

        if (mountedRef.current) {
          setIsInitialized(success);
        }
      } catch (error) {
        console.error('Voice initialization failed:', error);
      }
    };

    initVoice();

    return () => {
      mountedRef.current = false;
      voiceService.cleanup();
    };
  }, [enabled]);

  const handleWakeWordDetected = useCallback(() => {
    if (!mountedRef.current) return;
    
    setVoiceState('listening_command');
    startListeningForCommand();
  }, []);

  const handleSpeechResult = useCallback((text: string) => {
    if (!mountedRef.current) return;

    setLastCommand(text);
    const parsed = parseExpenseFromVoice(text);
    setLastParsedExpense(parsed);
    setVoiceState('idle');

    if (parsed.amount && parsed.confidence > 0.5) {
      onExpenseDetected?.(parsed);
    }
  }, [onExpenseDetected]);

  const handleError = useCallback((error: Error) => {
    if (!mountedRef.current) return;

    console.error('Voice error:', error);
    setVoiceState('idle');
    onError?.(error);
  }, [onError]);

  const startListeningForWakeWord = useCallback(async () => {
    if (!isInitialized || voiceState !== 'idle') return;

    try {
      setVoiceState('listening_wake');
      await voiceService.startWakeWordDetection();
    } catch (error) {
      console.error('Failed to start wake word detection:', error);
      setVoiceState('idle');
    }
  }, [isInitialized, voiceState]);

  const stopListening = useCallback(async () => {
    try {
      await voiceService.stopWakeWordDetection();
      setVoiceState('idle');
    } catch (error) {
      console.error('Failed to stop listening:', error);
    }
  }, []);

  const startListeningForCommand = useCallback(async () => {
    if (!isInitialized) return;

    try {
      setVoiceState('listening_command');
      const result = await voiceService.startSpeechToText();
      
      if (result && mountedRef.current) {
        handleSpeechResult(result);
      } else {
        setVoiceState('idle');
      }
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setVoiceState('idle');
    }
  }, [isInitialized, handleSpeechResult]);

  const simulateVoiceCommand = useCallback((text: string) => {
    setLastCommand(text);
    const parsed = parseExpenseFromVoice(text);
    setLastParsedExpense(parsed);

    if (parsed.amount && parsed.confidence > 0.3) {
      onExpenseDetected?.(parsed);
    }

    return parsed;
  }, [onExpenseDetected]);

  const showVoiceUnavailableAlert = useCallback(() => {
    Alert.alert(
      'Voice Commands',
      'Voice commands require a development build with native modules.\n\nTo enable voice features:\n1. Run "npx expo prebuild"\n2. Build with "npx expo run:ios" or "npx expo run:android"',
      [{ text: 'OK' }]
    );
  }, []);

  return {
    voiceState,
    isInitialized,
    isListening: voiceState === 'listening_wake' || voiceState === 'listening_command',
    lastCommand,
    lastParsedExpense,
    startListeningForWakeWord,
    startListeningForCommand,
    stopListening,
    simulateVoiceCommand,
    showVoiceUnavailableAlert,
    isAvailable: voiceService.isAvailable(),
  };
}
