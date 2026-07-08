# Nana - Voice-Activated Expense Tracker

A cross-platform expense tracking app with voice commands, receipt OCR scanning, and local data storage. Built with Expo (React Native), NestJS, and NativeWind (Tailwind CSS).

## Features

- **Voice Commands**: Say "Hey Nana, lunch is $12.50" to log expenses hands-free
- **Receipt Scanning**: Take photos of receipts and automatically extract prices with OCR
- **Manual Entry**: Quick expense entry with category picker
- **Dashboard**: View spending summaries for today, this week, and this month
- **History**: Browse and filter past expenses by date range
- **Export**: Export your data as CSV or JSON
- **Local Storage**: All data stored locally using SQLite

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile Frontend | Expo SDK 54 (React Native) |
| Styling | NativeWind v4 + Tailwind CSS |
| Backend | NestJS 11 |
| Local Database | expo-sqlite |
| Voice | expo-sherpa-onnx (requires dev build) |
| OCR | expo-ocr-kit (requires dev build) |
| Camera | expo-camera |

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
   npm start
   ```

4. Start the backend (optional, for cloud sync):
   ```bash
   cd apps/backend
   npm run start:dev
   ```

### Running on Devices

#### Expo Go (Limited Features)
```bash
npm start
# Scan QR code with Expo Go app
```

Note: Voice and OCR features require a development build.

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

The app listens for the wake word "Hey Nana" followed by an expense description:

- "Hey Nana, lunch is $12.50"
- "Hey Nana, coffee $5"
- "Hey Nana, I spent $45 on groceries"

The app parses the command and extracts:
- **Amount**: Dollar values from the speech
- **Category**: Detected from keywords (food, coffee, transport, etc.)
- **Description**: Additional context from the command

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

## Categories

Default categories:
- 🍔 Food
- ☕ Coffee
- 🚗 Transport
- 🛍️ Shopping
- 🎬 Entertainment
- 📄 Bills
- 💊 Health
- 📦 Other

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
