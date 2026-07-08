import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CategoryPicker } from '@/components/CategoryPicker';
import { useCategories, useExpenses } from '@/hooks/useExpenses';
import type { InputMethod } from '@/types/expense';

export default function AddExpenseScreen() {
  const router = useRouter();
  const { categories, loading: categoriesLoading } = useCategories();
  const { addExpense } = useExpenses();
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      const foodCategory = categories.find(c => c.name === 'Food');
      if (foodCategory) {
        setSelectedCategoryId(foodCategory.id);
      }
    }
  }, [categories, selectedCategoryId]);

  const handleSave = async () => {
    if (!amount || !selectedCategoryId) {
      Alert.alert('Missing Information', 'Please enter an amount and select a category.');
      return;
    }

    const parsedAmount = parseFloat(amount.replace(/,/g, ''));
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
        inputMethod: 'manual' as InputMethod,
      });

      if (expense) {
        Alert.alert('Success', 'Expense saved successfully!', [
          { text: 'OK', onPress: () => {
            setAmount('');
            setDescription('');
            router.push('/(tabs)');
          }}
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save expense. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleScanReceipt = () => {
    router.push('/modal');
  };

  const handleVoiceInput = () => {
    Alert.alert('Voice Input', 'Voice input feature coming soon! Say "Hey Nana" to activate.');
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

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-4" keyboardShouldPersistTaps="handled">
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
                onChangeText={(text) => setAmount(formatAmountInput(text))}
              />
            </View>
          </View>

          <View className="py-4">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Category
            </Text>
            {categoriesLoading ? (
              <Text className="text-gray-500 dark:text-gray-400">Loading categories...</Text>
            ) : (
              <CategoryPicker
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onSelect={setSelectedCategoryId}
              />
            )}
          </View>

          <View className="py-4">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Description (Optional)
            </Text>
            <TextInput
              className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white min-h-[80px]"
              placeholder="What was this expense for?"
              placeholderTextColor="#9ca3af"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View className="flex-row gap-3 py-4">
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl py-4"
              onPress={handleScanReceipt}
            >
              <Text className="text-2xl mr-2">📷</Text>
              <Text className="text-gray-700 dark:text-gray-300 font-medium">Scan Receipt</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl py-4"
              onPress={handleVoiceInput}
            >
              <Text className="text-2xl mr-2">🎤</Text>
              <Text className="text-gray-700 dark:text-gray-300 font-medium">Voice Input</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={!amount || !selectedCategoryId || saving}
            className={`rounded-xl py-4 mt-4 mb-8 ${
              amount && selectedCategoryId && !saving
                ? 'bg-primary-500'
                : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <Text
              className={`text-center text-lg font-semibold ${
                amount && selectedCategoryId && !saving
                  ? 'text-white'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {saving ? 'Saving...' : 'Save Expense'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
