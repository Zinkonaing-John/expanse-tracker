import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ReceiptScanner } from '@/components/ReceiptScanner';
import { CategoryPicker } from '@/components/CategoryPicker';
import { useCategories, useExpenses } from '@/hooks/useExpenses';
import { useColorScheme } from '@/components/useColorScheme';
import { processReceiptImage } from '@/services/ocrService';
import type { InputMethod } from '@/types/expense';

type ScanState = 'camera' | 'processing' | 'review';

export default function ReceiptScannerModal() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { categories } = useCategories();
  const { addExpense } = useExpenses();

  const [scanState, setScanState] = useState<ScanState>('camera');
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [extractedPrices, setExtractedPrices] = useState<number[]>([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleCapture = async (imageUri: string) => {
    setCapturedImageUri(imageUri);
    setScanState('processing');

    try {
      if (Platform.OS === 'web') {
        setScanState('review');
        return;
      }

      const result = await processReceiptImage(imageUri);
      setExtractedPrices(result.prices);
      
      if (result.suggestedTotal) {
        setAmount(result.suggestedTotal.toFixed(2));
      }

      setScanState('review');
    } catch (error) {
      console.error('OCR failed:', error);
      Alert.alert(
        'OCR Not Available',
        'Text extraction requires a development build. You can still enter the amount manually.',
        [{ text: 'OK', onPress: () => setScanState('review') }]
      );
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleSelectPrice = (price: number) => {
    setAmount(price.toFixed(2));
  };

  const handleSave = async () => {
    if (!amount || !selectedCategoryId) {
      Alert.alert('Missing Information', 'Please enter an amount and select a category.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    setSaving(true);
    try {
      const expense = await addExpense({
        amount: parsedAmount,
        category: selectedCategoryId,
        description: description.trim(),
        date: new Date().toISOString().split('T')[0],
        receiptUri: capturedImageUri || undefined,
        inputMethod: 'camera' as InputMethod,
      });

      if (expense) {
        Alert.alert('Success', 'Expense saved from receipt!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save expense. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = amount && selectedCategoryId && !saving;

  if (scanState === 'camera') {
    return (
      <ReceiptScanner
        onCapture={handleCapture}
        onCancel={handleCancel}
      />
    );
  }

  if (scanState === 'processing') {
    return (
      <View className="flex-1 bg-slate-900 items-center justify-center">
        <View className="w-20 h-20 rounded-3xl bg-primary-500/20 items-center justify-center mb-6">
          <ActivityIndicator size="large" color="#3398ff" />
        </View>
        <Text className="text-white text-xl font-semibold mb-2">Processing Receipt</Text>
        <Text className="text-slate-400 text-sm">Extracting text from image...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <ScrollView 
        className="flex-1 px-5" 
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="pt-4 pb-6">
          <Text className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Review Receipt
          </Text>
          <Text className="text-slate-500 dark:text-slate-400">
            Confirm or adjust the extracted amount
          </Text>
        </View>

        {extractedPrices.length > 0 && (
          <View className="mb-6">
            <Text className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-1">
              Detected Prices
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-3">
                {extractedPrices.map((price, index) => {
                  const isSelected = amount === price.toFixed(2);
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleSelectPrice(price)}
                      activeOpacity={0.7}
                      className={`px-5 py-3 rounded-2xl ${
                        isSelected
                          ? 'bg-primary-500'
                          : 'bg-white dark:bg-slate-800'
                      }`}
                      style={isSelected ? styles.selectedPrice : styles.priceChip}
                    >
                      <Text
                        className={`font-bold text-base ${
                          isSelected
                            ? 'text-white'
                            : 'text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        ${price.toFixed(2)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        )}

        <View className="mb-6">
          <Text className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-1">
            Amount
          </Text>
          <View 
            className="bg-white dark:bg-slate-800 rounded-3xl p-6"
            style={styles.amountCard}
          >
            <View className="flex-row items-center">
              <Text className="text-4xl font-bold text-slate-300 dark:text-slate-600 mr-1">$</Text>
              <TextInput
                className="flex-1 text-5xl font-bold text-slate-900 dark:text-white"
                placeholder="0.00"
                placeholderTextColor={isDark ? '#475569' : '#cbd5e1'}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
                style={{ lineHeight: 60 }}
              />
            </View>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-1">
            Category
          </Text>
          <CategoryPicker
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
          />
        </View>

        <View className="mb-6">
          <Text className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-1">
            Note (Optional)
          </Text>
          <View 
            className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden"
            style={styles.card}
          >
            <TextInput
              className="px-4 py-4 text-slate-900 dark:text-white text-base"
              placeholder="What was this expense for?"
              placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
              value={description}
              onChangeText={setDescription}
            />
          </View>
        </View>

        <View className="flex-row gap-3 pt-4">
          <TouchableOpacity
            onPress={() => setScanState('camera')}
            activeOpacity={0.7}
            className="flex-1 bg-white dark:bg-slate-800 py-4 rounded-2xl"
            style={styles.card}
          >
            <Text className="text-center text-slate-700 dark:text-slate-200 font-semibold text-base">
              Retake Photo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            disabled={!isFormValid}
            activeOpacity={0.8}
            className="flex-1"
          >
            {isFormValid ? (
              <LinearGradient
                colors={['#3398ff', '#1a7af5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButton}
              >
                <Text className="text-center text-white font-bold text-base">
                  {saving ? 'Saving...' : 'Save Expense'}
                </Text>
              </LinearGradient>
            ) : (
              <View 
                className="bg-slate-200 dark:bg-slate-700"
                style={styles.saveButton}
              >
                <Text className="text-center text-slate-400 dark:text-slate-500 font-bold text-base">
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

const styles = StyleSheet.create({
  amountCard: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  card: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  priceChip: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedPrice: {
    shadowColor: '#3398ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
