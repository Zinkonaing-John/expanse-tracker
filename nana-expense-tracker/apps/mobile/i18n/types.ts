export type LocaleCode = 'en' | 'ko' | 'my' | 'km' | 'zh';

export type CategoryKey =
  | 'food'
  | 'coffee'
  | 'transport'
  | 'shopping'
  | 'entertainment'
  | 'bills'
  | 'health'
  | 'other';

export interface ParserConfig {
  wakeWordPattern: RegExp;
  amountPatterns: RegExp[];
  /** Patterns where captured group 1 is multiplied (e.g. Myanmar "၃ ထောင်" → ×1000). */
  amountMultipliers?: { pattern: RegExp; multiplier: number }[];
  categoryKeywords: Record<CategoryKey, string[]>;
  currencySymbols: string[];
}

export interface LocaleStrings {
  appName: string;
  tabDashboard: string;
  tabAdd: string;
  tabHistory: string;
  tabSettings: string;
  dashboardGreeting: string;
  dashboardToday: string;
  dashboardWeek: string;
  dashboardMonth: string;
  dashboardRecent: string;
  dashboardSpentThisMonth: string;
  addAmount: string;
  addCategory: string;
  addNote: string;
  addNotePlaceholder: string;
  addQuickActions: string;
  addScanReceipt: string;
  addScanReceiptSub: string;
  addVoiceInput: string;
  addVoiceInputSub: string;
  addSave: string;
  addSaving: string;
  addLoadingCategories: string;
  historyToday: string;
  historyWeek: string;
  historyMonth: string;
  historyYear: string;
  historyTotal: string;
  historyExpenses: string;
  historyEmpty: string;
  historyDeleteTitle: string;
  historyDeleteMessage: string;
  historyDelete: string;
  expenseDetailTitle: string;
  expenseEdit: string;
  expenseSave: string;
  expenseDate: string;
  settingsVoiceAssistant: string;
  settingsHeyNana: string;
  settingsHeyNanaSub: string;
  settingsPreferences: string;
  settingsLanguage: string;
  settingsLanguageSub: string;
  settingsData: string;
  settingsExportCsv: string;
  settingsExportJson: string;
  settingsExportJsonSub: string;
  settingsClearData: string;
  settingsClearDataSub: string;
  settingsClearConfirmTitle: string;
  settingsClearConfirmMessage: string;
  settingsClearConfirmButton: string;
  settingsClearSuccess: string;
  settingsAbout: string;
  settingsAboutSub: string;
  settingsAboutMessage: string;
  settingsHelp: string;
  settingsHelpMessage: string;
  settingsTagline: string;
  settingsTaglineSub: string;
  settingsNoData: string;
  settingsExportError: string;
  commonMissing: string;
  commonInvalidAmount: string;
  commonError: string;
  commonSaveFailed: string;
  commonCancel: string;
  commonDelete: string;
  voiceModalTitle: string;
  voiceListening: string;
  voiceTapToSpeak: string;
  voiceTypeCommand: string;
  voiceTypePlaceholder: string;
  voiceParseError: string;
  voiceHint: string;
  receiptReviewTitle: string;
  receiptSave: string;
  receiptSaving: string;
  categories: Record<CategoryKey, string>;
  languageNames: Record<LocaleCode, string>;
}

export interface LocalePack {
  code: LocaleCode;
  currency: string;
  currencyLocale: string;
  speechLocale: string;
  strings: LocaleStrings;
  parserConfig: ParserConfig;
}

export const LOCALE_CODES: LocaleCode[] = ['en', 'ko', 'my', 'km', 'zh'];

export const CATEGORY_KEYS: CategoryKey[] = [
  'food',
  'coffee',
  'transport',
  'shopping',
  'entertainment',
  'bills',
  'health',
  'other',
];

/** Maps canonical category key to English DB name for legacy category rows. */
export const CATEGORY_KEY_TO_DB_NAME: Record<CategoryKey, string> = {
  food: 'Food',
  coffee: 'Coffee',
  transport: 'Transport',
  shopping: 'Shopping',
  entertainment: 'Entertainment',
  bills: 'Bills',
  health: 'Health',
  other: 'Other',
};
