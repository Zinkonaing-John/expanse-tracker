# Confirmed Intent: Nana Expense Tracker

**Confirmed:** 2026-07-09  
**Method:** interview-me skill (explicit "ဟုတ်တယ်")

## Outcome

Android + iOS ဖုန်းပေါ်မှာ နေ့စဉ် သုံးလို့ရတဲ့ personal expense tracker — အသံနဲ့ အမြန်ဆုံး log လုပ်လို့ရမယ်။

## User

ကိုယ်တိုင် — ကောင်တာမှာ ငွေပေးပြီးတာနဲ့ ဖုန်းထဲ ထည့်ချင်တယ်။

## Why Now

လက်ရှိ app က stub / "coming soon" တွေ များပြီး နေ့စဉ်သုံးလို့ မရသေးဘူး။ "Actually working" ဆိုတာ portfolio polish မဟုတ် — ကိုယ်ပိုင် သုံးစွဲဖို့ ဖြစ်တယ်။

## Success Criteria

1. **Voice input** — ဘာသာ ၅ ခုလုံးမှာ အသံနဲ့ ပြောပြီး expense save ဖြစ်တယ်
2. **Dashboard** — ဒီနေ့ / ဒီအပ် / ဒီလ စုစုပေါင်း မှန်တယ်
3. **History** — ပြင်လို့ / ဖျက်လို့ ရတယ်
4. **Persistence** — App restart လုပ်ရင်လည်း ဒေတာ မပျောက်ဘူး (local only)

## Constraints

| Constraint | Detail |
|------------|--------|
| Platform | iOS + Android (both), dev build required for native voice (not Expo Go) |
| Data | 100% local — no cloud, no backend sync |
| Primary input | Voice (spoken right after paying) |
| Backup input | Receipt photo, manual entry |
| Languages | 5 language packs in v1: English, Korean, Myanmar, Cambodia, Chinese |
| Language model | Settings မှာ primary language တစ်ခု ရွေးမယ် — UI + voice parser + currency တွဲထားမယ် |
| Auto-detect | No — user picks language in Settings, speaks in that language |

## Language Packs (v1)

| Language | Currency (bundled) |
|----------|-------------------|
| English | USD |
| Korean | KRW |
| Myanmar | MMK |
| Cambodia | KHR |
| Chinese | CNY (or regional — TBD at implementation) |

## Out of Scope (v1)

- Cloud sync / backup
- Backend integration (NestJS API unused)
- Push notifications
- Category CRUD
- "Coming soon" stubs left in UI
- Expo Go as target platform for voice

## Input Priority

1. **Voice** — primary, must work on dev build (both platforms)
2. **Receipt photo** — backup
3. **Manual entry** — backup

## Downstream

Previous plan at `tasks/plan.md` assumed offline-first v1 with phased languages and optional Phase 3 backend. **This intent supersedes that plan** — rewrite plan/todo against this document before implementation.
