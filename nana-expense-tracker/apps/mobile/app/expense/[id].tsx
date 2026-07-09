import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CategoryPicker } from '@/components/CategoryPicker';
import { useCategories, useExpenses } from '@/hooks/useExpenses';
import { useLocale } from '@/i18n/LocaleContext';
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { Accent } from '@/constants/Colors';
import { getCategoryDisplayName } from '@/services/categoryDisplay';
import { confirmDialog, notify } from '@/services/dialogs';

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];
  const { t, formatCurrency, categoryLabel } = useLocale();
  const { categories } = useCategories();
  const { expenses, updateExpense, deleteExpense } = useExpenses();

  const expense = expenses.find((e) => e.id === id);

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (expense) {
      setAmount(expense.amount.toString());
      setDescription(expense.description ?? '');
      setSelectedCategoryId(expense.category);
    }
  }, [expense?.id]);

  if (!expense) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: theme.textSecondary }}>Expense not found</Text>
      </SafeAreaView>
    );
  }

  const category = categories.find((c) => c.id === expense.category);

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
      const ok = await updateExpense(expense.id, {
        amount: parsedAmount,
        category: selectedCategoryId,
        description: description.trim(),
      });
      if (ok) {
        router.back();
      } else {
        notify(t('commonError'), t('commonSaveFailed'));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const catName = getCategoryDisplayName(category, categoryLabel);
    const confirmed = await confirmDialog(
      t('historyDeleteTitle'),
      t('historyDeleteMessage', { category: catName, amount: formatCurrency(expense.amount) }),
      t('historyDelete'),
      true
    );
    if (!confirmed) return;
    await deleteExpense(expense.id);
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {expense.receiptUri ? (
          <Image
            source={{ uri: expense.receiptUri }}
            style={styles.receiptImage}
            resizeMode="contain"
          />
        ) : null}

        <Text style={[styles.label, { color: theme.textSecondary }]}>{t('addAmount')}</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />

        <Text style={[styles.label, { color: theme.textSecondary }]}>{t('addCategory')}</Text>
        <CategoryPicker
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
        />

        <Text style={[styles.label, { color: theme.textSecondary, marginTop: 16 }]}>{t('addNote')}</Text>
        <TextInput
          style={[styles.input, styles.multiline, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TouchableOpacity onPress={handleSave} disabled={saving} style={{ marginTop: 24 }}>
          <View style={[styles.saveButton, { backgroundColor: Accent.cyan }]}>
            <Text style={styles.saveButtonText}>{saving ? t('addSaving') : t('expenseSave')}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleDelete} style={{ marginTop: 16 }}>
          <View style={[styles.saveButton, { backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.35)' }]}>
            <Text style={[styles.saveButtonText, { color: '#ef4444' }]}>{t('historyDelete')}</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 8,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  receiptImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 20,
    backgroundColor: '#f1f5f9',
  },
  saveButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
  },
});
