import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ReceiptScanner } from '@/components/ReceiptScanner';
import { CategoryPicker } from '@/components/CategoryPicker';
import { useCategories, useExpenses } from '@/hooks/useExpenses';
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { Accent } from '@/constants/Colors';
import type { InputMethod } from '@/types/expense';
import { todayString } from '@/services/dates';
import { notify } from '@/services/dialogs';

type ScanState = 'camera' | 'review';

export default function ReceiptScannerModal() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];
  const { categories } = useCategories();
  const { addExpense } = useExpenses();

  const [scanState, setScanState] = useState<ScanState>('camera');
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Automatic text extraction (OCR) needs a native module that isn't
  // available in Expo Go, so the photo is attached as-is and the user
  // confirms the amount in the review step.
  const handleCapture = (imageUri: string) => {
    setCapturedImageUri(imageUri);
    setScanState('review');
  };

  const handleCancel = () => {
    router.back();
  };

  const handleSave = async () => {
    if (!amount || !selectedCategoryId) {
      notify('Missing Information', 'Please enter an amount and select a category.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      notify('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    setSaving(true);
    try {
      const expense = await addExpense({
        amount: parsedAmount,
        category: selectedCategoryId,
        description: description.trim(),
        date: todayString(),
        receiptUri: capturedImageUri || undefined,
        inputMethod: 'camera' as InputMethod,
      });

      if (expense) {
        // Navigate directly; Alert callbacks never fire on web.
        router.back();
      } else {
        notify('Error', 'Failed to save expense. Please try again.');
      }
    } catch (error) {
      notify('Error', 'Failed to save expense. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = Boolean(amount && selectedCategoryId && !saving);

  if (scanState === 'camera') {
    return (
      <ReceiptScanner
        onCapture={handleCapture}
        onCancel={handleCancel}
        onSkip={() => setScanState('review')}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 20 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ paddingTop: 16, paddingBottom: 24 }}>
          <Text style={{ color: theme.text, fontSize: 28, fontWeight: '800', marginBottom: 6 }}>
            Review Receipt
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: 14 }}>
            {capturedImageUri
              ? 'Photo attached — enter the total from your receipt'
              : 'Enter the total from your receipt'}
          </Text>
        </View>

        {capturedImageUri && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: isDark ? 'rgba(34,211,238,0.08)' : 'rgba(8,145,178,0.06)',
              borderColor: isDark ? 'rgba(34,211,238,0.25)' : 'rgba(8,145,178,0.2)',
              borderWidth: 1,
              borderRadius: 16,
              padding: 12,
              marginBottom: 24,
            }}
          >
            <MaterialCommunityIcons name="receipt" size={18} color={theme.tint} />
            <Text style={{ color: theme.tint, fontSize: 13, fontWeight: '600', marginLeft: 8, flex: 1 }}>
              Receipt photo will be saved with this expense
            </Text>
          </View>
        )}

        <View style={{ marginBottom: 24 }}>
          <Text style={styles.sectionLabel(theme)}>Amount</Text>
          <View
            style={{
              backgroundColor: theme.surface,
              borderRadius: 24,
              borderWidth: 1.5,
              borderColor: isDark ? 'rgba(34,211,238,0.25)' : 'rgba(8,145,178,0.2)',
              padding: 24,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 36, fontWeight: '800', color: theme.textSecondary, marginRight: 4 }}>$</Text>
              <TextInput
                style={{ flex: 1, fontSize: 46, fontWeight: '800', color: theme.text, letterSpacing: -1, lineHeight: 56 }}
                placeholder="0.00"
                placeholderTextColor={isDark ? '#26334b' : '#cdd8e9'}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
          </View>
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={styles.sectionLabel(theme)}>Category</Text>
          <CategoryPicker
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
          />
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={styles.sectionLabel(theme)}>Note (Optional)</Text>
          <View
            style={{
              backgroundColor: theme.surface,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: theme.border,
              overflow: 'hidden',
            }}
          >
            <TextInput
              style={{ paddingHorizontal: 16, paddingVertical: 15, color: theme.text, fontSize: 15 }}
              placeholder="What was this expense for?"
              placeholderTextColor={theme.textSecondary}
              value={description}
              onChangeText={setDescription}
            />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, paddingTop: 8 }}>
          <TouchableOpacity
            onPress={() => setScanState('camera')}
            activeOpacity={0.7}
            style={{
              flex: 1,
              flexDirection: 'row',
              backgroundColor: theme.surface,
              borderWidth: 1,
              borderColor: theme.border,
              paddingVertical: 16,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons name="camera-retake-outline" size={18} color={theme.text} style={{ marginRight: 8 }} />
            <Text style={{ color: theme.text, fontWeight: '700', fontSize: 15 }}>
              Retake
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            disabled={!isFormValid}
            activeOpacity={0.8}
            style={{ flex: 1 }}
          >
            {isFormValid ? (
              <LinearGradient
                colors={[Accent.cyan, Accent.violet]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  flexDirection: 'row',
                  paddingVertical: 16,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialCommunityIcons name="check-circle-outline" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 15 }}>
                  {saving ? 'Saving...' : 'Save Expense'}
                </Text>
              </LinearGradient>
            ) : (
              <View
                style={{
                  paddingVertical: 16,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.surfaceSecondary,
                }}
              >
                <Text style={{ color: theme.textSecondary, fontWeight: '800', fontSize: 15 }}>
                  Save Expense
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  sectionLabel: (theme: { textSecondary: string }) => ({
    fontSize: 11,
    fontWeight: '700' as const,
    color: theme.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.5,
    marginBottom: 12,
    paddingHorizontal: 4,
  }),
};
