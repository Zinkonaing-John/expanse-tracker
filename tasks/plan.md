# Implementation Plan: Nana Expense Tracker (Confirmed Intent)

> **Source of truth:** [`docs/intent/nana-expense-tracker.md`](../docs/intent/nana-expense-tracker.md)  
> **Supersedes:** Previous plan (backend sync, phased languages, web-first)

## Overview

Turn Nana into a **personal, offline expense tracker** you actually use on your phone right after paying. Voice is the primary input; receipt photo and manual entry are backups. The app runs on **iOS and Android via dev build** (native speech required — not Expo Go). All data stays **local** (SQLite). Users pick one of **five language packs** in Settings; each pack bundles UI strings, voice parser rules, and currency formatting (en/USD, ko/KRW, my/MMK, km/KHR, zh/CNY).

**v1 is done when:** voice save works in all 5 languages, dashboard totals are correct, history supports edit/delete, and data survives app restart.

## Current State

| Area | Status |
|------|--------|
| Local DB (SQLite / localStorage) | ✅ CRUD, summaries, export |
| Dashboard & history | ✅ Totals work; history tap = delete only |
| Voice parser | ⚠️ English-only (`expenseParser.ts`) |
| i18n / language packs | ❌ Not started; hardcoded English + `en-US` currency |
| Native speech | ❌ Stubbed (`speech.ts` returns false) |
| Settings | ⚠️ Stubs ("coming soon") for currency, categories, cloud, voice training |
| Backend | Exists but **out of scope** — mobile never calls it |

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **Local-only, no backend** | Confirmed intent; cloud/sync explicitly out of scope |
| **Language pack = UI + parser + currency** | User picks one language in Settings; no auto-detect |
| **Canonical category IDs in DB** | Store stable IDs (`food`, `coffee`); display localized names from active pack |
| **Parser per locale (config-driven)** | Extend `expenseParser` pattern: locale-specific keywords + amount patterns in pack config; keep pure functions unit-testable in Node |
| **Native speech via dev build** | `expo-speech-recognition` or `@react-native-voice/voice`; pass BCP-47 locale from active pack (`en-US`, `ko-KR`, `my-MM`, `km-KH`, `zh-CN`) |
| **Expo Go = typed fallback only** | Document clearly; v1 success criteria require dev build |
| **Remove misleading stubs** | Replace "coming soon" with working features or remove the row |
| **Vertical slices** | Ship English pack end-to-end first to prove architecture, then add remaining 4 packs |

## Dependency Graph

```
Dev build + test harness
    │
Language pack types (LocalePack, LocaleCode)
    │
    ├── LocaleContext + useLocale + persisted setting
    │       │
    │       ├── Settings language picker
    │       ├── formatCurrency(locale) — all screens
    │       └── t(key) — all UI strings
    │
    ├── Locale-specific parser configs (×5)
    │       └── VoiceInputModal → parseExpenseCommand(text, locale)
    │
    └── Native speech (locale BCP-47 from pack)
            └── speech.ts (dev build)

Local DB (exists)
    │
    ├── Expense detail + edit screen
    ├── History: tap → detail (delete from detail)
    └── Receipt modal fixes (default category, backup flow)

Settings cleanup
    └── Remove cloud/notification/voice-training stubs
```

## Task List

### Phase 1: Foundation
- [ ] Task 1: Dev environment & test harness
- [ ] Task 2: Language pack architecture
- [ ] Task 3: English pack — vertical slice (UI + parser + USD)

### Checkpoint: Foundation
- [ ] `npm test` passes
- [ ] Settings can switch to English; amounts show as USD
- [ ] English voice command parses correctly in unit tests
- [ ] Review before Phase 2

### Phase 2: Remaining Language Packs
- [ ] Task 4: Myanmar pack (my/MMK)
- [ ] Task 5: Korean pack (ko/KRW)
- [ ] Task 6: Khmer pack (km/KHR)
- [ ] Task 7: Chinese pack (zh/CNY)

### Checkpoint: All Languages
- [ ] Unit test per locale parser (amount + category keywords)
- [ ] Settings switches UI + currency for each language
- [ ] Review before Phase 3

### Phase 3: Wire UI to i18n
- [ ] Task 8: Localize all screens (tabs, modals, dialogs)
- [ ] Task 9: Localize categories display (keep canonical IDs in DB)

### Checkpoint: Localized UI
- [ ] No hardcoded English user-facing strings in tab screens
- [ ] Review before Phase 4

### Phase 4: Native Voice (Primary Input)
- [ ] Task 10: Dev build setup & documentation
- [ ] Task 11: Native speech module (iOS + Android)
- [ ] Task 12: Wire speech locale + parser to active language pack
- [ ] Task 13: Wire `voiceEnabled` setting

### Checkpoint: Voice Works
- [ ] Dev build: speak in each of 5 languages → form prefills → save
- [ ] Review before Phase 5

### Phase 5: Core UX (Success Criteria 2–4)
- [ ] Task 14: Expense detail & edit screen
- [ ] Task 15: Receipt modal fixes (backup input)
- [ ] Task 16: Settings cleanup (remove stubs)

### Checkpoint: Complete v1
- [ ] All 4 success criteria from intent doc met
- [ ] iOS + Android dev build verified
- [ ] App restart preserves data
- [ ] README matches shipped behavior
- [ ] Ready for daily use

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Native speech quality varies by locale on device | High | Test each BCP-47 code on real devices; keep typed fallback |
| Myanmar/Khmer amount patterns complex (ထောင်, រៀល) | Med | Unit tests with real phrase samples per language |
| 5 full UI translations is large | Med | English slice first; use structured JSON string files; agents can parallelize Tasks 4–7 |
| Chinese locale ambiguity (CNY vs TWD vs HKD) | Low | Default `zh-CN` + CNY; document in open questions |
| `expo prebuild` friction for user | Med | Task 10 documents one-time setup; scripts in package.json exist |
| Category keywords don't translate 1:1 | Med | Map keywords to canonical category IDs, not English names |

## Open Questions

- **Chinese currency:** `zh-CN` + CNY confirmed unless user wants `zh-TW` + TWD — defaulting to Simplified Chinese + CNY.
- **Wake word "Nana":** Keep across all languages or locale-specific? Plan: keep "Nana" + allow locale phrases without wake word.
- **Receipt OCR in v1:** Intent lists receipt as backup (photo attach). Full OCR is not in success criteria; Task 15 covers attach + manual entry + paste-text parser only.

## Out of Scope (v1)

- Cloud sync / backup
- NestJS backend integration
- Push notifications
- Category CRUD
- Voice training
- Expo Go as voice target platform
- Auto-detect language from speech

## Success Metrics (from Intent)

| # | Criterion | Verified by |
|---|-----------|-------------|
| 1 | Voice save in all 5 languages | Dev build manual test + parser unit tests |
| 2 | Dashboard today/week/month totals correct | Unit tests + manual compare with history |
| 3 | History edit + delete | Task 14 + manual test |
| 4 | Data persists after restart | Task 15 checkpoint on iOS + Android |
