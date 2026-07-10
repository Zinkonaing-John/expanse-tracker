import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { Accent } from '@/constants/Colors';
import type { ParsedExpenseCommand } from '@/services/expenseParser';
import { isSpeechRecognitionSupported, startSpeechRecognition, type SpeechSession } from '@/services/speech';
import { useLocale } from '@/i18n/LocaleContext';

type VoiceInputModalProps = {
  visible: boolean;
  onClose: () => void;
  /** Called with the parsed command when the user confirms. */
  onResult: (parsed: ParsedExpenseCommand, rawText: string) => void;
  /** Prefill from wake-word command (text after "Hey Nana"). */
  initialCommand?: string;
  /** Start the mic automatically when opened (e.g. after wake word with no amount). */
  autoListen?: boolean;
};

export function VoiceInputModal({
  visible,
  onClose,
  onResult,
  initialCommand,
  autoListen = false,
}: VoiceInputModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];
  const { t, parseCommand, pack } = useLocale();

  const speechSupported = useMemo(() => isSpeechRecognitionSupported(), []);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [typedCommand, setTypedCommand] = useState('');
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<SpeechSession | null>(null);

  useEffect(() => {
    if (!visible) {
      sessionRef.current?.stop();
      sessionRef.current = null;
      setListening(false);
      setTranscript('');
      setTypedCommand('');
      setError(null);
      return;
    }

    if (initialCommand) {
      setTypedCommand(initialCommand);
      setTranscript(initialCommand);
    }
  }, [visible, initialCommand]);

  const applyCommand = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const parsed = parseCommand(trimmed);
    if (parsed.amount === null) {
      setError(t('voiceParseError', { text: trimmed, hint: t('voiceHint') }));
      return;
    }
    onResult(parsed, trimmed);
    onClose();
  }, [onClose, onResult, parseCommand, t]);

  const startListening = useCallback(() => {
    setError(null);
    setTranscript('');
    const session = startSpeechRecognition({
      onPartialResult: (transcriptText) => setTranscript(transcriptText),
      onResult: (transcriptText) => {
        setTranscript(transcriptText);
        setListening(false);
        applyCommand(transcriptText);
      },
      onError: (message) => {
        setListening(false);
        setError(message);
      },
      onEnd: () => setListening(false),
    }, { locale: pack.speechLocale });
    if (session) {
      sessionRef.current = session;
      setListening(true);
      return;
    }

    setError(t('voiceMicUnavailable'));
  }, [applyCommand, pack.speechLocale, t]);

  useEffect(() => {
    if (!visible || !autoListen || !speechSupported) return;
    const timer = setTimeout(() => startListening(), 300);
    return () => clearTimeout(timer);
  }, [visible, autoListen, speechSupported, startListening]);

  const stopListening = () => {
    sessionRef.current?.stop();
    setListening(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="microphone" size={20} color={Accent.violet} />
              <Text style={{ color: theme.text, fontSize: 18, fontWeight: '800', marginLeft: 8 }}>
                {t('voiceModalTitle')}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialCommunityIcons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {speechSupported ? (
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <TouchableOpacity
                onPress={listening ? stopListening : startListening}
                activeOpacity={0.8}
                style={[
                  styles.micButton,
                  {
                    backgroundColor: listening ? 'rgba(239,68,68,0.15)' : 'rgba(139,92,246,0.15)',
                    borderColor: listening ? 'rgba(239,68,68,0.5)' : 'rgba(139,92,246,0.4)',
                    shadowColor: listening ? '#ef4444' : Accent.violet,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={listening ? 'stop' : 'microphone'}
                  size={38}
                  color={listening ? '#ef4444' : Accent.violet}
                />
              </TouchableOpacity>
              <Text style={{ color: theme.text, fontWeight: '700', fontSize: 15, marginTop: 12 }}>
                {listening ? t('voiceListening') : t('voiceTapToSpeak')}
              </Text>
              <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 4, textAlign: 'center' }}>
                {t('voiceHint')}
              </Text>
              {transcript ? (
                <Text style={{ color: theme.tint, fontSize: 15, marginTop: 10, textAlign: 'center', fontStyle: 'italic' }}>
                  "{transcript}"
                </Text>
              ) : null}
            </View>
          ) : (
            <View
              style={[
                styles.infoBanner,
                {
                  backgroundColor: isDark ? 'rgba(139,92,246,0.10)' : 'rgba(139,92,246,0.08)',
                  borderColor: 'rgba(139,92,246,0.30)',
                },
              ]}
            >
              <MaterialCommunityIcons name="information-outline" size={18} color={Accent.violet} />
              <Text style={{ color: isDark ? '#c4b5fd' : '#6d28d9', fontSize: 13, marginLeft: 8, flex: 1, lineHeight: 18 }}>
                Live speech needs a development build on this platform. Type your command below instead.
              </Text>
            </View>
          )}

          <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>
            {speechSupported ? t('voiceTypeCommand') : t('voiceTypeCommand')}
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TextInput
              style={[
                styles.commandInput,
                { backgroundColor: theme.surfaceSecondary, borderColor: theme.border, color: theme.text },
              ]}
              placeholder={t('voiceTypePlaceholder')}
              placeholderTextColor={theme.textSecondary}
              value={typedCommand}
              onChangeText={setTypedCommand}
              onSubmitEditing={() => applyCommand(typedCommand)}
              returnKeyType="done"
            />
            <TouchableOpacity
              onPress={() => applyCommand(typedCommand)}
              activeOpacity={0.8}
              style={[styles.parseButton, { backgroundColor: Accent.violet }]}
            >
              <MaterialCommunityIcons name="arrow-right" size={22} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={[styles.errorBanner, { backgroundColor: 'rgba(239,68,68,0.10)', borderColor: 'rgba(239,68,68,0.35)' }]}>
              <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#ef4444" />
              <Text style={{ color: '#ef4444', fontSize: 13, marginLeft: 6, flex: 1 }}>{error}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 16, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  micButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 18,
  },
  commandInput: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  parseButton: {
    width: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    marginTop: 14,
  },
});
