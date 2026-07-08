import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ReceiptScanner } from '@/components/ReceiptScanner';
import { CategoryPicker } from '@/components/CategoryPicker';
import { useCategories, useExpenses } from '@/hooks/useExpenses';
import { processReceiptImage } from '@/services/ocrService';
import type { InputMethod } from '@/types/expense';

type ScanState = 'camera' | 'processing' | 'review';

export default function ReceiptScannerModal() {
  const router = useRouter();
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
      <View className="flex-1 bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text className="text-white mt-4 text-lg">Extracting text from receipt...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1 px-4" keyboardShouldPersistTaps="handled">
        <View className="py-4">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Review Receipt
          </Text>
          <Text className="text-gray-600 dark:text-gray-400">
            Confirm or adjust the extracted amount
          </Text>
        </View>

        {extractedPrices.length > 0 && (
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Detected Prices (tap to select)
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {extractedPrices.map((price, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleSelectPrice(price)}
                    className={`px-4 py-2 rounded-full ${
                      amount === price.toFixed(2)
                        ? 'bg-primary-500'
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}
                  >
                    <Text
                      className={`font-semibold ${
                        amount === price.toFixed(2)
                          ? 'text-white'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      ${price.toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        <View className="py-4">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Amount
          </Text>
          <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3">
            <Text className="text-2xl text-gray-500 dark:text-gray-400 mr-2">$</Text>
            <TextInput
              className="flex-1 text-3xl font-bold text-gray-900 dark:text-white"
              placeholder="0.00"
              placeholderTextColor="#9ca3af"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
        </View>

        <View className="py-4">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Category
          </Text>
          <CategoryPicker
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
          />
        </View>

        <View className="py-4">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Description (Optional)
          </Text>
          <TextInput
            className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white"
            placeholder="What was this expense for?"
            placeholderTextColor="#9ca3af"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View className="flex-row gap-3 py-4 mb-8">
          <TouchableOpacity
            onPress={() => setScanState('camera')}
            className="flex-1 bg-gray-100 dark:bg-gray-800 py-4 rounded-xl"
          >
            <Text className="text-center text-gray-700 dark:text-gray-300 font-semibold">
              Retake Photo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            disabled={!amount || !selectedCategoryId || saving}
            className={`flex-1 py-4 rounded-xl ${
              amount && selectedCategoryId && !saving
                ? 'bg-primary-500'
                : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                amount && selectedCategoryId && !saving
                  ? 'text-white'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {saving ? 'Saving...' : 'Save Expense'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
