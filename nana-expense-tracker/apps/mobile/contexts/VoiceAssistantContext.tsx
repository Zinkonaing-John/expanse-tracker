import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'expo-router';
import { VoiceInputModal } from '@/components/VoiceInputModal';
import { useWakeWordListener } from '@/hooks/useWakeWordListener';
import { usePersistedSetting } from '@/hooks/usePersistedSetting';
import { useLocale } from '@/i18n/LocaleContext';
import type { ParsedExpenseCommand } from '@/services/expenseParser';

export type VoiceDraft = {
  parsed: ParsedExpenseCommand;
  rawText: string;
};

type VoiceAssistantContextValue = {
  openVoiceModal: (initialCommand?: string, autoListen?: boolean) => void;
  consumePendingDraft: () => VoiceDraft | null;
};

const VoiceAssistantContext = createContext<VoiceAssistantContextValue | null>(null);

export function VoiceAssistantProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { parseCommand, pack } = useLocale();
  const [voiceEnabled] = usePersistedSetting('nana.settings.voiceEnabled', true);

  const [modalVisible, setModalVisible] = useState(false);
  const [initialCommand, setInitialCommand] = useState<string | undefined>();
  const [autoListen, setAutoListen] = useState(false);
  const pendingDraftRef = useRef<VoiceDraft | null>(null);

  const deliverDraft = useCallback(
    (parsed: ParsedExpenseCommand, rawText: string) => {
      pendingDraftRef.current = { parsed, rawText };
      setModalVisible(false);
      setInitialCommand(undefined);
      setAutoListen(false);
      router.push('/(tabs)/add');
    },
    [router]
  );

  const openVoiceModal = useCallback((command?: string, listen = false) => {
    setInitialCommand(command);
    setAutoListen(listen);
    setModalVisible(true);
  }, []);

  const handleWakeWord = useCallback(
    (_transcript: string, commandAfterWake: string | null) => {
      if (commandAfterWake) {
        const parsed = parseCommand(commandAfterWake);
        if (parsed.amount !== null) {
          deliverDraft(parsed, commandAfterWake);
          return;
        }
      }
      openVoiceModal(commandAfterWake ?? undefined, true);
    },
    [deliverDraft, openVoiceModal, parseCommand]
  );

  useWakeWordListener({
    enabled: voiceEnabled && !modalVisible,
    locale: pack.speechLocale,
    onWakeWord: handleWakeWord,
  });

  const consumePendingDraft = useCallback(() => {
    const draft = pendingDraftRef.current;
    pendingDraftRef.current = null;
    return draft;
  }, []);

  const handleVoiceResult = useCallback(
    (parsed: ParsedExpenseCommand, rawText: string) => {
      deliverDraft(parsed, rawText);
    },
    [deliverDraft]
  );

  return (
    <VoiceAssistantContext.Provider value={{ openVoiceModal, consumePendingDraft }}>
      {children}
      <VoiceInputModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setInitialCommand(undefined);
          setAutoListen(false);
        }}
        onResult={handleVoiceResult}
        initialCommand={initialCommand}
        autoListen={autoListen}
      />
    </VoiceAssistantContext.Provider>
  );
}

export function useVoiceAssistant(): VoiceAssistantContextValue {
  const ctx = useContext(VoiceAssistantContext);
  if (!ctx) {
    throw new Error('useVoiceAssistant must be used within VoiceAssistantProvider');
  }
  return ctx;
}
