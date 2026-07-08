# Expense Tracker

Voice-activated expense tracker with receipt OCR. Built with Expo (React Native) for mobile and NestJS for the backend API.

The project lives in the [`nana-expense-tracker/`](./nana-expense-tracker) npm workspaces monorepo:

```
nana-expense-tracker/
├── apps/
│   ├── mobile/     # Expo React Native app
│   └── backend/    # NestJS API server
└── package.json    # Monorepo root (workspaces)
```

## Prerequisites

- Node.js 18+
- npm
- For mobile: the [Expo Go](https://expo.dev/go) app, or Xcode (iOS) / Android Studio (Android) for native builds

## Setup

Install all dependencies once from the monorepo root:

```bash
cd nana-expense-tracker
npm install
```

## Start the backend

From `nana-expense-tracker/`:

```bash
npm run backend
```

This starts the NestJS API in watch mode on **http://localhost:3000/api**.

Set a custom port with the `PORT` environment variable, e.g. `PORT=4000 npm run backend`.

## Start the mobile app

From `nana-expense-tracker/`, start the Expo dev server:

```bash
npm run mobile
```

Then scan the QR code with Expo Go, or launch a simulator/emulator directly:

```bash
npm run mobile:ios       # iOS simulator
npm run mobile:android   # Android emulator
npm run mobile:web       # Web browser
```

> Voice and OCR features require a development build (`npx expo prebuild` + `expo run:ios`/`run:android`), not Expo Go.

## Run both together

Open two terminals from `nana-expense-tracker/`:

```bash
# Terminal 1 — API
npm run backend

# Terminal 2 — mobile app
npm run mobile
```
# expanse-tracker
