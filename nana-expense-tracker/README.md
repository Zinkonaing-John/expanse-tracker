# Nana - Voice-Activated Expense Tracker

A cross-platform expense tracking app with voice commands, receipt capture, and local data storage. Built with Expo (React Native), NestJS, and NativeWind (Tailwind CSS).

## Features

- **Manual Entry**: Quick expense entry with category picker and notes
- **Voice Input**: Speak "Lunch is $12.50" (live speech-to-text on web via the Web Speech API; typed commands everywhere) and the form is filled in for you
- **Receipt Capture**: Photograph a receipt (camera on device, image upload on web) and save it with the expense
- **Dashboard**: Spending summaries for today, this week, and this month
- **History**: Browse expenses by day/week/month/year; tap an expense to delete it
- **Export**: Download/share your data as CSV or JSON
- **Local Storage**: All data stored on-device — SQLite on iOS/Android, localStorage on web

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile Frontend | Expo SDK 54 (React Native) |
| Styling | NativeWind v4 + Tailwind CSS + StyleSheet |
| Backend (standalone API) | NestJS 11 |
| Local Database | expo-sqlite (native) / localStorage (web) |
| Voice | Web Speech API (web); typed-command fallback elsewhere |
| Camera | expo-camera + expo-image-picker |

## Project Structure

```
nana-expense-tracker/
├── apps/
│   ├── mobile/           # Expo React Native app
│   │   ├── app/          # Expo Router screens
│   │   ├── components/   # Reusable UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # Business logic & API
│   │   └── types/        # TypeScript types
│   └── backend/          # NestJS API server
│       └── src/
│           ├── expenses/
│           └── categories/
└── package.json          # Monorepo root
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- For iOS: macOS with Xcode
- For Android: Android Studio

### Installation

1. Clone the repository:
   ```bash
   cd nana-expense-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the mobile app:
   ```bash
   cd apps/mobile
   npm start        # then press "w" for web, or scan the QR code with Expo Go
   ```

4. Start the backend (optional — the app itself is local-first and does not require it):
   ```bash
   cd apps/backend
   npm run start:dev
   ```

### Running on Devices

#### Expo Go
```bash
npm start
# Scan QR code with Expo Go app
```

Note: live microphone speech-to-text works on web (Chrome/Edge/Safari). On iOS/Android, use the typed voice-command box, or create a development build and add a native speech module.

#### Development Build (Full Features)
```bash
# Generate native projects
npx expo prebuild

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
```

## Voice Commands

Open **Add Expense → Voice Input** and speak (or type) a command:

- "Lunch is $12.50"
- "Hey Nana, coffee $5"
- "spent 45 on groceries"

The parser extracts:
- **Amount**: dollar values from the phrase
- **Category**: detected from keywords (food, coffee, transport, etc.)
- **Description**: the remaining context

The parsed values prefill the Add Expense form for review before saving.

## Testing

Pure logic has Node unit tests, and the web app has Puppeteer end-to-end flows (uses your local Chrome):

```bash
# Unit tests (voice parser, receipt parser, export formats)
node --experimental-strip-types tools/parser.test.mjs
node --experimental-strip-types tools/receipt-parser.test.mjs
node --experimental-strip-types tools/export.test.mjs

# Browser end-to-end tests (start the web app first: cd apps/mobile && npx expo start --web)
node tools/flow-test.mjs      # add → dashboard → history → delete
node tools/voice-test.mjs     # voice command → prefill → save
node tools/receipt-test.mjs   # upload receipt → review → save
node tools/settings-test.mjs  # toggles persist, CSV export, clear data

# Backend tests
cd apps/backend && npm test
```

## API Endpoints (Backend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/expenses | List all expenses (with filters) |
| POST | /api/expenses | Create new expense |
| GET | /api/expenses/:id | Get expense by ID |
| PATCH | /api/expenses/:id | Update expense |
| DELETE | /api/expenses/:id | Delete expense |
| GET | /api/expenses/summary | Get expense summary |
| GET | /api/expenses/stats | Get today/week/month totals |
| GET | /api/categories | List all categories |

The backend is a standalone in-memory API; the mobile app stores data locally and does not depend on it.

## Categories

Default categories: Food, Coffee, Transport, Shopping, Entertainment, Bills, Health, Other (rendered with Material Community Icons).

## Configuration

### Environment Variables (Backend)

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3000 | API server port |

### App Configuration

Edit `apps/mobile/app.json` to customize:
- App name and slug
- Bundle identifiers
- Icons and splash screen
- Permissions

## Scripts

### Mobile App
```bash
npm start          # Start Expo dev server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run web        # Run in web browser
npm run prebuild   # Generate native projects
```

### Backend
```bash
npm run start:dev  # Start in development mode
npm run build      # Build for production
npm run start:prod # Start production server
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.

---

Built with ❤️ using Expo, NestJS, and NativeWind
