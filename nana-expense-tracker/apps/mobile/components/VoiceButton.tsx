import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Alert, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useVoiceCommand } from '@/hooks/useVoiceCommand';
import { useCategories, useExpenses } from '@/hooks/useExpenses';
import { CategoryPicker } from './CategoryPicker';
import type { ParsedExpenseCommand } from '@/services/voiceService';
import type { InputMethod } from '@/types/expense';

type VoiceButtonProps = {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
};

export function VoiceButton({ size = 'md', showLabel = true }: VoiceButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [parsedExpense, setParsedExpense] = useState<ParsedExpenseCommand | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { categories } = useCategories();
  const { addExpense } = useExpenses();
  
  const {
    voiceState,
    isAvailable,
    simulateVoiceCommand,
    showVoiceUnavailableAlert,
    startListeningForCommand,
  } = useVoiceCommand({
    onExpenseDetected: handleExpenseDetected,
  });

  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    if (voiceState === 'listening_command' || voiceState === 'listening_wake') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [voiceState]);

  function handleExpenseDetected(expense: ParsedExpenseCommand) {
    setParsedExpense(expense);
    
    if (expense.category) {
      const matchedCategory = categories.find(
        c => c.name.toLowerCase() === expense.category?.toLowerCase()
      );
      if (matchedCategory) {
        setSelectedCategoryId(matchedCategory.id);
      }
    }
    
    setShowModal(true);
  }

  const handlePress = () => {
    if (!isAvailable) {
      setShowModal(true);
    } else {
      startListeningForCommand();
    }
  };

  const handleTestCommand = () => {
    if (!testInput.trim()) return;
    const result = simulateVoiceCommand(testInput);
    handleExpenseDetected(result);
    setTestInput('');
  };

  const handleSaveExpense = async () => {
    if (!parsedExpense?.amount || !selectedCategoryId) {
      Alert.alert('Missing Information', 'Please ensure amount and category are set.');
      return;
    }

    setSaving(true);
    try {
      const expense = await addExpense({
        amount: parsedExpense.amount,
        category: selectedCategoryId,
        description: parsedExpense.description || '',
        date: new Date().toISOString().split('T')[0],
        inputMethod: 'voice' as InputMethod,
      });

      if (expense) {
        Alert.alert('Success', `Expense of $${parsedExpense.amount.toFixed(2)} saved!`);
        setShowModal(false);
        setParsedExpense(null);
        setSelectedCategoryId(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save expense.');
    } finally {
      setSaving(false);
    }
  };

  const sizeStyles = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  const iconSize = {
    sm: 20,
    md: 26,
    lg: 32,
  };

  const isListening = voiceState === 'listening_command' || voiceState === 'listening_wake';

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        className="items-center"
      >
        <Animated.View
          style={{ transform: [{ scale: pulseAnim }] }}
          className={`${sizeStyles[size]} rounded-full items-center justify-center ${
            isListening ? 'bg-red-500' : 'bg-primary-500'
          }`}
        >
          <MaterialCommunityIcons name="microphone" size={iconSize[size]} color="#ffffff" />
        </Animated.View>
        {showLabel && (
          <Text className="text-gray-600 dark:text-gray-400 text-sm mt-2">
            {isListening ? 'Listening...' : 'Hey Nana'}
          </Text>
        )}
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 bg-white dark:bg-gray-900 p-4">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              Voice Command
            </Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text className="text-primary-500 text-lg">Cancel</Text>
            </TouchableOpacity>
          </View>

          {!isAvailable && !parsedExpense && (
            <View className="bg-amber-100 dark:bg-amber-900/30 rounded-xl p-4 mb-6">
              <Text className="text-amber-800 dark:text-amber-200 font-medium mb-2">
                Voice Recognition Demo Mode
              </Text>
              <Text className="text-amber-700 dark:text-amber-300 text-sm mb-4">
                Full voice recognition requires a development build. Try typing a command below to test the parser:
              </Text>
              <View className="flex-row gap-2">
                <TextInput
                  className="flex-1 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
                  placeholder='Try: "lunch is $12.50"'
                  placeholderTextColor="#9ca3af"
                  value={testInput}
                  onChangeText={setTestInput}
                  onSubmitEditing={handleTestCommand}
                />
                <TouchableOpacity
                  onPress={handleTestCommand}
                  className="bg-primary-500 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white font-medium">Test</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {parsedExpense && (
            <View>
              <View className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 mb-6">
                <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                  Detected Amount
                </Text>
                <Text className="text-4xl font-bold text-gray-900 dark:text-white">
                  ${parsedExpense.amount?.toFixed(2) || '0.00'}
                </Text>
                {parsedExpense.description && (
                  <Text className="text-gray-600 dark:text-gray-400 mt-2">
                    "{parsedExpense.description}"
                  </Text>
                )}
              </View>

              <View className="mb-6">
                <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Category {parsedExpense.category && `(detected: ${parsedExpense.category})`}
                </Text>
                <CategoryPicker
                  categories={categories}
                  selectedCategoryId={selectedCategoryId}
                  onSelect={setSelectedCategoryId}
                />
              </View>

              <TouchableOpacity
                onPress={handleSaveExpense}
                disabled={!parsedExpense.amount || !selectedCategoryId || saving}
                className={`py-4 rounded-xl ${
                  parsedExpense.amount && selectedCategoryId && !saving
                    ? 'bg-primary-500'
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <Text
                  className={`text-center text-lg font-semibold ${
                    parsedExpense.amount && selectedCategoryId && !saving
                      ? 'text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {saving ? 'Saving...' : 'Save Expense'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {!parsedExpense && isAvailable && (
            <View className="flex-1 items-center justify-center">
              <View className="w-32 h-32 rounded-full bg-primary-100 dark:bg-primary-900/30 items-center justify-center mb-4">
                <MaterialCommunityIcons name="microphone" size={56} color="#22d3ee" />
              </View>
              <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Listening...
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-center px-8">
                Say something like "Lunch is $12.50" or "Coffee $5"
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}

type FloatingVoiceButtonProps = {
  onExpenseAdded?: () => void;
};

export function FloatingVoiceButton({ onExpenseAdded }: FloatingVoiceButtonProps) {
  return (
    <View className="absolute bottom-24 right-4">
      <VoiceButton size="lg" showLabel={false} />
    </View>
  );
}
