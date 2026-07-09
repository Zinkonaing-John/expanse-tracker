# Nana Expense Tracker — Task Checklist

> **Intent:** [`docs/intent/nana-expense-tracker.md`](../docs/intent/nana-expense-tracker.md)  
> Work tasks in order unless noted as parallelizable.

---

## Task 1: Dev environment & test harness

**Description:** Ensure clean checkout runs on macOS. Add root `npm test` script, fix Puppeteer Chrome path for local dev, use relative screenshot directory. Baseline before feature work.

**Acceptance criteria:**
- [ ] `cd nana-expense-tracker && npm install` succeeds
- [ ] `npm test` runs all `tools/*.test.mjs` and exits 0
- [ ] Puppeteer resolves Chrome via `CHROME_PATH` with macOS default fallback
- [ ] Screenshots write to `nana-expense-tracker/tools/screenshots/`

**Verification:**
- [ ] `cd nana-expense-tracker && npm test`
- [ ] Manual: Expo web starts with `npm run mobile:web`

**Dependencies:** None

**Files likely touched:**
- `nana-expense-tracker/package.json`
- `nana-expense-tracker/tools/browser-test.mjs`
- `nana-expense-tracker/tools/flow-test.mjs`
- `nana-expense-tracker/tools/voice-test.mjs`
- `nana-expense-tracker/tools/receipt-test.mjs`
- `nana-expense-tracker/tools/settings-test.mjs`

**Estimated scope:** Small

---

## Task 2: Language pack architecture

**Description:** Create the i18n foundation: `LocaleCode` type (`en` | `ko` | `my` | `km` | `zh`), `LocalePack` interface (strings, currency, BCP-47 speech locale, parser config), `LocaleProvider` context, `useLocale()` hook, and persisted language setting in AsyncStorage (extend beyond boolean `usePersistedSetting`).

**Acceptance criteria:**
- [ ] `LocalePack` type defines: `code`, `currency`, `currencyLocale`, `speechLocale`, `strings`, `parserConfig`
- [ ] `useLocale()` returns `{ locale, setLocale, t, formatCurrency, parseCommand }`
- [ ] Default locale is `en`; choice persists across app restart
- [ ] Parser config is separate from React (unit-testable)

**Verification:**
- [ ] TypeScript compiles with no errors in mobile app
- [ ] Unit test: `formatCurrency(1500, 'my')` formats as MMK

**Dependencies:** Task 1

**Files likely touched:**
- `nana-expense-tracker/apps/mobile/i18n/types.ts` (new)
- `nana-expense-tracker/apps/mobile/i18n/LocaleContext.tsx` (new)
- `nana-expense-tracker/apps/mobile/i18n/index.ts` (new)
- `nana-expense-tracker/apps/mobile/hooks/usePersistedLocale.ts` (new)
- `nana-expense-tracker/apps/mobile/app/_layout.tsx`

**Estimated scope:** Medium (4-5 files)

---

## Task 3: English pack — vertical slice

**Description:** Implement the first complete language pack (en/USD). Migrate existing `expenseParser.ts` logic into pack config. Add `i18n/locales/en.ts` with all UI strings for one screen (Settings) to prove the pattern. Settings shows language picker with all 5 options (others fall back to English strings until Tasks 4–7).

**Acceptance criteria:**
- [ ] `i18n/locales/en.ts` exports full English `LocalePack`
- [ ] `parseExpenseCommand("Lunch is $12.50", "en")` returns amount 12.50, category Food
- [ ] Settings screen shows language picker (5 options)
- [ ] Selecting English formats amounts as `$12.50`

**Verification:**
- [ ] `node --experimental-strip-types tools/parser.test.mjs` passes (update imports if moved)
- [ ] Manual: switch language in Settings → currency format updates

**Dependencies:** Task 2

**Files likely touched:**
- `nana-expense-tracker/apps/mobile/i18n/locales/en.ts` (new)
- `nana-expense-tracker/apps/mobile/services/expenseParser.ts` (refactor to locale-aware)
- `nana-expense-tracker/apps/mobile/app/(tabs)/settings.tsx`
- `nana-expense-tracker/tools/parser.test.mjs`

**Estimated scope:** Medium (3-5 files)

---

## Checkpoint: After Tasks 1–3

- [ ] `npm test` passes
- [ ] Language picker visible in Settings
- [ ] English parser + USD formatting work
- [ ] Human review before adding remaining language packs

---

## Task 4: Myanmar pack (my/MMK)

**Description:** Add Myanmar language pack: UI strings (မြန်မာ), MMK currency formatting, speech locale `my-MM`, and voice parser with Myanmar keywords and amount patterns (e.g. ကျပ်, ထောင်, ကော်ဖီ, နေ့လည်စာ).

**Acceptance criteria:**
- [ ] UI strings in Myanmar script for all keys defined in `en.ts`
- [ ] `parseExpenseCommand("ကော်ဖီ ၃ ထောင်", "my")` extracts amount 3000 and category Coffee
- [ ] `formatCurrency(3000, "my")` displays MMK correctly
- [ ] Category keywords map to canonical IDs (not English names)

**Verification:**
- [ ] New unit tests in `tools/parser-my.test.mjs` (or extended parser test)
- [ ] Manual: select Myanmar in Settings → UI shows Myanmar strings

**Dependencies:** Task 3

**Files likely touched:**
- `nana-expense-tracker/apps/mobile/i18n/locales/my.ts` (new)
- `nana-expense-tracker/tools/parser-my.test.mjs` (new)

**Estimated scope:** Medium (2-3 files)

---

## Task 5: Korean pack (ko/KRW)

**Description:** Add Korean pack: UI strings (한국어), KRW formatting, speech locale `ko-KR`, parser keywords (커피, 점심, 원, ₩).

**Acceptance criteria:**
- [ ] `parseExpenseCommand("커피 5000원", "ko")` extracts amount 5000, category Coffee
- [ ] `formatCurrency(5000, "ko")` displays ₩5,000
- [ ] All UI string keys translated

**Verification:**
- [ ] Unit tests for Korean parser
- [ ] Manual: select Korean → UI and currency update

**Dependencies:** Task 3

**Files likely touched:**
- `nana-expense-tracker/apps/mobile/i18n/locales/ko.ts` (new)
- `nana-expense-tracker/tools/parser-ko.test.mjs` (new)

**Estimated scope:** Medium (2-3 files)

**Parallelizable with:** Tasks 4, 6, 7 (after Task 3)

---

## Task 6: Khmer pack (km/KHR)

**Description:** Add Cambodia/Khmer pack: UI strings (ខ្មែរ), KHR formatting, speech locale `km-KH`, parser keywords (កាហ្វេ, អាហារ, រៀល, ៛).

**Acceptance criteria:**
- [ ] `parseExpenseCommand` works with Khmer phrases and riel amounts
- [ ] `formatCurrency` displays KHR correctly
- [ ] All UI string keys translated

**Verification:**
- [ ] Unit tests for Khmer parser
- [ ] Manual: select Khmer → UI and currency update

**Dependencies:** Task 3

**Files likely touched:**
- `nana-expense-tracker/apps/mobile/i18n/locales/km.ts` (new)
- `nana-expense-tracker/tools/parser-km.test.mjs` (new)

**Estimated scope:** Medium (2-3 files)

**Parallelizable with:** Tasks 4, 5, 7

---

## Task 7: Chinese pack (zh/CNY)

**Description:** Add Simplified Chinese pack: UI strings (简体中文), CNY formatting, speech locale `zh-CN`, parser keywords (咖啡, 午餐, 元, ¥).

**Acceptance criteria:**
- [ ] `parseExpenseCommand("咖啡 35元", "zh")` extracts amount 35, category Coffee
- [ ] `formatCurrency(35, "zh")` displays ¥35.00
- [ ] All UI string keys translated

**Verification:**
- [ ] Unit tests for Chinese parser
- [ ] Manual: select Chinese → UI and currency update

**Dependencies:** Task 3

**Files likely touched:**
- `nana-expense-tracker/apps/mobile/i18n/locales/zh.ts` (new)
- `nana-expense-tracker/tools/parser-zh.test.mjs` (new)

**Estimated scope:** Medium (2-3 files)

**Parallelizable with:** Tasks 4, 5, 6

---

## Checkpoint: After Tasks 4–7

- [ ] All 5 locale parser unit tests pass
- [ ] Settings switches UI + currency for each language
- [ ] `npm test` includes all parser tests
- [ ] Human review before UI wiring

---

## Task 8: Localize all screens

**Description:** Replace hardcoded English strings in Dashboard, Add, History, modals, and dialogs with `t()` calls. Pass `formatCurrency` from `useLocale()` everywhere amounts are shown.

**Acceptance criteria:**
- [ ] `(tabs)/index.tsx`, `add.tsx`, `history.tsx` use `t()` for all user-visible text
- [ ] `VoiceInputModal`, `modal.tsx`, `ExpenseCard` use `t()`
- [ ] `dialogs.ts` messages use locale (or accept localized strings from callers)
- [ ] Period labels (Today/Week/Month) localized per active pack
- [ ] No raw `en-US` `Intl.NumberFormat` outside `useLocale`

**Verification:**
- [ ] Manual: cycle through 5 languages on each tab — no English leftovers
- [ ] `npm test` passes

**Dependencies:** Tasks 4–7

**Files likely touched:**
- `nana-expense-tracker/apps/mobile/app/(tabs)/index.tsx`
- `nana-expense-tracker/apps/mobile/app/(tabs)/add.tsx`
- `nana-expense-tracker/apps/mobile/app/(tabs)/history.tsx`
- `nana-expense-tracker/apps/mobile/app/modal.tsx`
- `nana-expense-tracker/apps/mobile/components/VoiceInputModal.tsx`
- `nana-expense-tracker/apps/mobile/components/ExpenseCard.tsx`
- `nana-expense-tracker/apps/mobile/services/dialogs.ts`

**Estimated scope:** Large (7 files) — if too big, split into Task 8a (tabs) and 8b (components)

---

## Task 9: Localize category display

**Description:** Categories in DB keep canonical IDs. Display names come from active language pack (`categories.food` → "Food" / "အစား" / "음식"). Update `CategoryPicker`, `CategoryIcon`, and `ExpenseCard` to use localized names.

**Acceptance criteria:**
- [ ] Each locale pack defines localized names for all 8 default categories
- [ ] Voice parser returns canonical category ID; UI shows localized name
- [ ] Existing expenses display correct localized category after language switch

**Verification:**
- [ ] Manual: add expense in Myanmar → switch to Korean → category label updates
- [ ] Unit test: parser returns canonical ID regardless of input language

**Dependencies:** Task 8

**Files likely touched:**
- `nana-expense-tracker/apps/mobile/i18n/locales/*.ts` (category name maps)
- `nana-expense-tracker/apps/mobile/components/CategoryPicker.tsx`
- `nana-expense-tracker/apps/mobile/components/CategoryIcon.tsx`
- `nana-expense-tracker/apps/mobile/services/defaultCategories.ts`

**Estimated scope:** Medium (3-5 files)

---

## Checkpoint: After Tasks 8–9

- [ ] Full UI localized in all 5 languages
- [ ] Categories display in active language
- [ ] Human review before native voice work

---

## Task 10: Dev build setup & documentation

**Description:** Document dev build workflow for iOS and Android. Update README with Expo Go vs dev build feature matrix. Verify `expo prebuild` succeeds and permissions are set for microphone (and camera for receipt backup).

**Acceptance criteria:**
- [ ] README section: "Dev Build Required for Voice"
- [ ] `app.json` has `NSMicrophoneUsageDescription` (iOS) and `RECORD_AUDIO` (Android)
- [ ] `npx expo prebuild` completes without errors
- [ ] Scripts documented: `npm run build:ios`, `npm run build:android`

**Verification:**
- [ ] Manual: `cd apps/mobile && npx expo prebuild`
- [ ] At least one platform builds (simulator or device)

**Dependencies:** Task 1

**Files likely touched:**
- `nana-expense-tracker/README.md`
- `nana-expense-tracker/apps/mobile/app.json`
- `nana-expense-tracker/apps/mobile/package.json`

**Estimated scope:** Small

---

## Task 11: Native speech module (iOS + Android)

**Description:** Replace `speech.ts` stub with real native speech recognition using `expo-speech-recognition` (or equivalent Expo SDK 54 compatible module). Implement `isSpeechRecognitionSupported()` and `startSpeechRecognition()` with partial results. Keep `speech.web.ts` unchanged for web dev.

**Acceptance criteria:**
- [ ] `isSpeechRecognitionSupported()` returns `true` in dev build on iOS and Android
- [ ] `startSpeechRecognition` accepts `locale` parameter (BCP-47)
- [ ] Partial and final transcripts delivered via callbacks
- [ ] Microphone permission requested on first use
- [ ] Expo Go still returns `false` (graceful fallback to typed commands)

**Verification:**
- [ ] Manual on iOS dev build: speak → transcript appears
- [ ] Manual on Android dev build: speak → transcript appears
- [ ] `npm test` passes

**Dependencies:** Task 10

**Files likely touched:**
- `nana-expense-tracker/apps/mobile/services/speech.ts`
- `nana-expense-tracker/apps/mobile/package.json`
- `nana-expense-tracker/apps/mobile/app.json`

**Estimated scope:** Medium (3-4 files)

---

## Task 12: Wire speech locale + parser to active language

**Description:** Connect `VoiceInputModal` to `useLocale()`: pass `speechLocale` to native speech, use `parseCommand` from active pack, show localized error messages when amount not found.

**Acceptance criteria:**
- [ ] Speech recognition uses `pack.speechLocale` from Settings
- [ ] Parsed command uses locale-specific parser
- [ ] Error messages localized (e.g. Myanmar hint phrase in Myanmar)
- [ ] Switching language in Settings changes speech locale on next voice session

**Verification:**
- [ ] Dev build: set Myanmar → speak Myanmar phrase → form prefills → save
- [ ] Repeat for all 5 languages
- [ ] Unit tests still pass

**Dependencies:** Tasks 8–9, 11

**Files likely touched:**
- `nana-expense-tracker/apps/mobile/components/VoiceInputModal.tsx`
- `nana-expense-tracker/apps/mobile/app/(tabs)/add.tsx`

**Estimated scope:** Small (2 files)

---

## Task 13: Wire `voiceEnabled` setting

**Description:** Read `voiceEnabled` from Settings across the app. When off, hide/disable voice entry on Add screen. When on, show voice as primary input.

**Acceptance criteria:**
- [ ] `voiceEnabled` off → no voice button on Add screen
- [ ] `voiceEnabled` on → voice button prominent on Add screen
- [ ] Toggle persists and reflects immediately on tab switch
- [ ] Typed fallback still available when voice UI is shown but speech unsupported

**Verification:**
- [ ] Manual: toggle off → voice hidden; toggle on → voice visible
- [ ] `node tools/settings-test.mjs` passes (update for language picker if needed)

**Dependencies:** Task 8

**Files likely touched:**
- `nana-expense-tracker/apps/mobile/app/(tabs)/add.tsx`
- `nana-expense-tracker/apps/mobile/app/(tabs)/settings.tsx`

**Estimated scope:** Small (2 files)

---

## Checkpoint: After Tasks 10–13

- [ ] Voice works in dev build for all 5 languages
- [ ] `voiceEnabled` gates voice UI
- [ ] Human review before UX polish

---

## Task 14: Expense detail & edit screen

**Description:** History tap opens detail view instead of delete dialog. Detail shows amount, category, date, description, receipt thumbnail. Edit mode allows changing fields. Delete available with confirmation. Uses `updateExpense` from existing hook.

**Acceptance criteria:**
- [ ] Tap expense in history → detail screen (not delete)
- [ ] Edit amount, description, category, date → save persists
- [ ] Delete from detail with localized confirmation
- [ ] Dashboard totals update after edit
- [ ] All labels localized via `t()`

**Verification:**
- [ ] Manual: add → history → tap → edit amount → save → dashboard reflects change
- [ ] Manual: delete from detail works
- [ ] Extend `tools/flow-test.mjs` with edit step (optional)

**Dependencies:** Tasks 8–9

**Files likely touched:**
- `nana-expense-tracker/apps/mobile/app/(tabs)/history.tsx`
- `nana-expense-tracker/apps/mobile/app/expense/[id].tsx` (new)
- `nana-expense-tracker/apps/mobile/app/_layout.tsx`

**Estimated scope:** Medium (3-4 files)

---

## Task 15: Receipt modal fixes (backup input)

**Description:** Fix receipt flow as backup input: auto-select default category on review (like Add screen), wire optional paste-text into `receiptParser`, show receipt thumbnail in detail (Task 14). No full OCR in v1 — photo attach + manual/paste only.

**Acceptance criteria:**
- [ ] Receipt modal auto-selects default category when categories load
- [ ] Optional "paste receipt text" uses `receiptParser` to prefill amount
- [ ] Receipt image attached and viewable on expense detail
- [ ] Flow works as backup when voice is unavailable

**Verification:**
- [ ] Manual: capture receipt → enter amount → save without picking category manually
- [ ] `node tools/receipt-test.mjs` passes

**Dependencies:** Task 14

**Files likely touched:**
- `nana-expense-tracker/apps/mobile/app/modal.tsx`
- `nana-expense-tracker/apps/mobile/services/receiptParser.ts`

**Estimated scope:** Medium (2-3 files)

---

## Task 16: Settings cleanup (remove stubs)

**Description:** Remove or replace non-functional Settings rows per intent. Language picker replaces "Currency coming soon". Remove: Voice Training, Cloud Backup, Notifications toggle (or hide until implemented). Keep: Export CSV/JSON, Clear Data, About, voiceEnabled toggle.

**Acceptance criteria:**
- [ ] No "Coming soon" alerts remain in Settings
- [ ] Language picker is the primary preference (replaces currency row)
- [ ] Removed rows: Voice Training, Cloud Backup, Notifications (or hidden)
- [ ] Export and Clear Data still work
- [ ] About text accurate (dev build for voice, 5 languages, local-only)

**Verification:**
- [ ] Manual: open Settings → no dead-end "coming soon" taps
- [ ] `node tools/settings-test.mjs` passes

**Dependencies:** Tasks 3, 8, 13

**Files likely touched:**
- `nana-expense-tracker/apps/mobile/app/(tabs)/settings.tsx`
- `nana-expense-tracker/README.md`

**Estimated scope:** Small (2 files)

---

## Checkpoint: v1 Complete

- [ ] **Success 1:** Voice save works in all 5 languages (dev build, iOS + Android)
- [ ] **Success 2:** Dashboard today/week/month totals correct
- [ ] **Success 3:** History edit + delete work
- [ ] **Success 4:** Data persists after app kill + relaunch (SQLite on native)
- [ ] `npm test` passes (all parser + export tests)
- [ ] README accurate — no false OCR/cloud/backend claims
- [ ] Ready for daily personal use

---

## Post-v1 Backlog (not scheduled)

| Item | Notes |
|------|-------|
| Receipt OCR (on-device) | Dev build; feed text into `receiptParser` |
| Category CRUD | User-managed categories |
| Spending charts | `byCategory` data already available |
| Backend API | Explicitly out of scope per intent |
| Cloud backup | Out of scope per intent |
| Traditional Chinese (zh-TW) | Separate pack if needed |
