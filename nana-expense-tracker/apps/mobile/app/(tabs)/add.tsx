import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { CategoryPicker } from '@/components/CategoryPicker';
import { useCategories, useExpenses } from '@/hooks/useExpenses';
import { useColorScheme } from '@/components/useColorScheme';
import type { InputMethod } from '@/types/expense';

export default function AddExpenseScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
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

  const isFormValid = amount && selectedCategoryId && !saving;

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={['bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-5 pt-4 pb-6">
            <View 
              className="bg-white dark:bg-slate-800 rounded-3xl p-6"
              style={styles.amountCard}
            >
              <Text className="text-sm font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
                Amount
              </Text>
              <View className="flex-row items-center">
                <Text className="text-4xl font-bold text-slate-300 dark:text-slate-600 mr-1">$</Text>
                <TextInput
                  className="flex-1 text-5xl font-bold text-slate-900 dark:text-white"
                  placeholder="0.00"
                  placeholderTextColor={isDark ? '#475569' : '#cbd5e1'}
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={(text) => setAmount(formatAmountInput(text))}
                  style={{ lineHeight: 60 }}
                />
              </View>
            </View>
          </View>

          <View className="px-5 mb-6">
            <Text className="text-sm font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-1">
              Category
            </Text>
            {categoriesLoading ? (
              <View className="bg-white dark:bg-slate-800 rounded-2xl p-4" style={styles.card}>
                <Text className="text-slate-400 dark:text-slate-500">Loading categories...</Text>
              </View>
            ) : (
              <CategoryPicker
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onSelect={setSelectedCategoryId}
              />
            )}
          </View>

          <View className="px-5 mb-6">
            <Text className="text-sm font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-1">
              Note (Optional)
            </Text>
            <View 
              className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden"
              style={styles.card}
            >
              <TextInput
                className="px-4 py-4 text-slate-900 dark:text-white text-base min-h-[100px]"
                placeholder="What was this expense for?"
                placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View className="px-5 mb-6">
            <Text className="text-sm font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-1">
              Quick Actions
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-white dark:bg-slate-800 rounded-2xl p-4 items-center"
                style={styles.actionButton}
                onPress={handleScanReceipt}
                activeOpacity={0.7}
              >
                <View className="w-14 h-14 rounded-2xl bg-coral-100 dark:bg-coral-900/30 items-center justify-center mb-3">
                  <Text className="text-2xl">📷</Text>
                </View>
                <Text className="text-slate-900 dark:text-white font-semibold text-sm">Scan Receipt</Text>
                <Text className="text-slate-400 dark:text-slate-500 text-xs mt-1">Auto-fill from photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-white dark:bg-slate-800 rounded-2xl p-4 items-center"
                style={styles.actionButton}
                onPress={handleVoiceInput}
                activeOpacity={0.7}
              >
                <View className="w-14 h-14 rounded-2xl bg-accent-100 dark:bg-accent-900/30 items-center justify-center mb-3">
                  <Text className="text-2xl">🎤</Text>
                </View>
                <Text className="text-slate-900 dark:text-white font-semibold text-sm">Voice Input</Text>
                <Text className="text-slate-400 dark:text-slate-500 text-xs mt-1">Say "Hey Nana"</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="px-5">
            <TouchableOpacity
              onPress={handleSave}
              disabled={!isFormValid}
              activeOpacity={0.8}
            >
              {isFormValid ? (
                <LinearGradient
                  colors={['#3398ff', '#1a7af5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveButton}
                >
                  <Text className="text-white text-lg font-bold">
                    {saving ? 'Saving...' : 'Save Expense'}
                  </Text>
                </LinearGradient>
              ) : (
                <View 
                  className="bg-slate-200 dark:bg-slate-700"
                  style={styles.saveButton}
                >
                  <Text className="text-slate-400 dark:text-slate-500 text-lg font-bold">
                    Save Expense
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  actionButton: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  saveButton: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
