import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CategoryPicker } from '@/components/CategoryPicker';
import { VoiceInputModal } from '@/components/VoiceInputModal';
import { useCategories, useExpenses } from '@/hooks/useExpenses';
import { usePersistedSetting } from '@/hooks/usePersistedSetting';
import type { ParsedExpenseCommand } from '@/services/expenseParser';
import { resolveCategoryIdByKey } from '@/services/defaultCategories';
import { useLocale } from '@/i18n/LocaleContext';
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { Accent } from '@/constants/Colors';
import type { InputMethod } from '@/types/expense';
import { todayString } from '@/services/dates';
import { notify } from '@/services/dialogs';

export default function AddExpenseScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];
  const { t, currencySymbol } = useLocale();
  const [voiceEnabled] = usePersistedSetting('nana.settings.voiceEnabled', true);
  const { categories, loading: categoriesLoading } = useCategories();
  const { addExpense } = useExpenses();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  const [inputMethod, setInputMethod] = useState<InputMethod>('manual');

  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      const foodCategory = categories.find(c => c.id === 'food');
      if (foodCategory) {
        setSelectedCategoryId(foodCategory.id);
      }
    }
  }, [categories, selectedCategoryId]);

  const handleSave = async () => {
    if (!amount || !selectedCategoryId) {
      notify(t('commonError'), t('commonMissing'));
      return;
    }

    const parsedAmount = parseFloat(amount.replace(/,/g, ''));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      notify(t('commonError'), t('commonInvalidAmount'));
      return;
    }

    setSaving(true);
    try {
      const expense = await addExpense({
        amount: parsedAmount,
        category: selectedCategoryId,
        description: description.trim(),
        date: todayString(),
        inputMethod,
      });

      if (expense) {
        // Reset the form and return to the dashboard so the new expense is
        // immediately visible. (Alert callbacks never fire on web.)
        setAmount('');
        setDescription('');
        setInputMethod('manual');
        router.push('/(tabs)');
      } else {
        notify(t('commonError'), t('commonSaveFailed'));
      }
    } catch (error) {
      notify(t('commonError'), t('commonSaveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleScanReceipt = () => {
    router.push('/modal');
  };

  const handleVoiceInput = () => {
    setVoiceModalVisible(true);
  };

  const handleVoiceResult = (parsed: ParsedExpenseCommand) => {
    if (parsed.amount !== null) {
      setAmount(parsed.amount.toFixed(2));
    }
    if (parsed.category) {
      const matched = resolveCategoryIdByKey(parsed.category, categories);
      if (matched) setSelectedCategoryId(matched);
    }
    if (parsed.description) {
      setDescription(parsed.description);
    }
    setInputMethod('voice');
  };

  const formatAmountInput = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts[1] && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].slice(0, 2);
    }
    return cleaned;
  };

  const isFormValid = Boolean(amount && selectedCategoryId && !saving);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 130 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}>
            <View
              style={[
                styles.amountCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: isDark ? 'rgba(34,211,238,0.25)' : 'rgba(8,145,178,0.2)',
                  shadowColor: isDark ? Accent.cyan : '#0b1220',
                },
              ]}
            >
              <SectionLabel icon="currency-usd" text={t('addAmount')} theme={theme} />
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                <Text style={{ fontSize: 36, fontWeight: '800', color: theme.textSecondary, marginRight: 4 }}>{currencySymbol}</Text>
                <TextInput
                  style={{ flex: 1, fontSize: 46, fontWeight: '800', color: theme.text, letterSpacing: -1, lineHeight: 56 }}
                  placeholder="0.00"
                  placeholderTextColor={isDark ? '#26334b' : '#cdd8e9'}
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={(text: string) => setAmount(formatAmountInput(text))}
                />
              </View>
            </View>
          </View>

          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <SectionLabel icon="shape-outline" text={t('addCategory')} theme={theme} style={{ marginBottom: 14, paddingHorizontal: 4 }} />
            {categoriesLoading ? (
              <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, padding: 16 }]}>
                <Text style={{ color: theme.textSecondary }}>{t('addLoadingCategories')}</Text>
              </View>
            ) : (
              <CategoryPicker
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onSelect={setSelectedCategoryId}
              />
            )}
          </View>

          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <SectionLabel icon="text" text={t('addNote')} theme={theme} style={{ marginBottom: 14, paddingHorizontal: 4 }} />
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, overflow: 'hidden' }]}>
              <TextInput
                style={{ paddingHorizontal: 16, paddingVertical: 16, color: theme.text, fontSize: 15, minHeight: 96 }}
                placeholder={t('addNotePlaceholder')}
                placeholderTextColor={theme.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <SectionLabel icon="flash-outline" text={t('addQuickActions')} theme={theme} style={{ marginBottom: 14, paddingHorizontal: 4 }} />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <QuickAction
                icon="line-scan"
                iconColor={Accent.cyan}
                title={t('addScanReceipt')}
                subtitle={t('addScanReceiptSub')}
                onPress={handleScanReceipt}
                theme={theme}
              />
              {voiceEnabled ? (
                <QuickAction
                  icon="microphone-outline"
                  iconColor={Accent.violet}
                  title={t('addVoiceInput')}
                  subtitle={t('addVoiceInputSub')}
                  onPress={handleVoiceInput}
                  theme={theme}
                />
              ) : null}
            </View>
          </View>

          <View style={{ paddingHorizontal: 20 }}>
            <TouchableOpacity onPress={handleSave} disabled={!isFormValid} activeOpacity={0.8}>
              {isFormValid ? (
                <View
                  style={{
                    shadowColor: Accent.cyan,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.45,
                    shadowRadius: 14,
                    elevation: 10,
                  }}
                >
                  <LinearGradient
                    colors={[Accent.cyan, Accent.violet]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.saveButton}
                  >
                    <MaterialCommunityIcons name="check-circle-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={{ color: '#ffffff', fontSize: 17, fontWeight: '800' }}>
                      {saving ? t('addSaving') : t('addSave')}
                    </Text>
                  </LinearGradient>
                </View>
              ) : (
                <View style={[styles.saveButton, { backgroundColor: theme.surfaceSecondary }]}>
                  <Text style={{ color: theme.textSecondary, fontSize: 17, fontWeight: '800' }}>
                    {t('addSave')}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <VoiceInputModal
        visible={voiceModalVisible}
        onClose={() => setVoiceModalVisible(false)}
        onResult={handleVoiceResult}
      />
    </SafeAreaView>
  );
}

type ThemeType = (typeof Colors)['light'] | (typeof Colors)['dark'];

function SectionLabel({ icon, text, theme, style }: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  text: string;
  theme: ThemeType;
  style?: object;
}) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
      <MaterialCommunityIcons name={icon} size={14} color={theme.tint} />
      <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginLeft: 6 }}>
        {text}
      </Text>
    </View>
  );
}

function QuickAction({ icon, iconColor, title, subtitle, onPress, theme }: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  theme: ThemeType;
}) {
  return (
    <TouchableOpacity
      style={[styles.card, { flex: 1, backgroundColor: theme.surface, borderColor: theme.border, padding: 16, alignItems: 'center' }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 18,
          backgroundColor: iconColor + '1A',
          borderWidth: 1,
          borderColor: iconColor + '33',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        }}
      >
        <MaterialCommunityIcons name={icon} size={26} color={iconColor} />
      </View>
      <Text style={{ color: theme.text, fontWeight: '700', fontSize: 14 }}>{title}</Text>
      <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 3 }}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  amountCard: {
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 24,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 6,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
  },
  saveButton: {
    flexDirection: 'row',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
