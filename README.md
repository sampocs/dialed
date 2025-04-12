# Dialed - Putting Game Mobile App

A React Native mobile application for tracking scores in a putting game. The app works entirely locally without requiring a database or API service, using AsyncStorage for data persistence.

## Features

- Track scores for 18-hole putting courses
- Automatically generated courses with varying par and distance
- View round history with detailed scorecards
- Performance metrics and trend visualization
- Local data storage with no server requirements

## Requirements

- Node.js 18 or later
- npm or yarn
- iOS Simulator (for iOS development)
- Android Studio and Android SDK (for Android development)
- Xcode (for iOS development)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/dialed.git
   cd dialed
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the App

### iOS

```bash
npm run ios
```

### Android

```bash
npm run android
```

### Development

```bash
npm start
```

This will start the Metro bundler. You can then:

- Press `i` to open in iOS simulator
- Press `a` to open in Android emulator
- Scan the QR code with the Expo Go app to run on a physical device

## Game Rules

- Each course has 18 holes
- Par distribution:
  - 4 par 1s (2 in front nine, 2 in back nine)
  - 4 par 2s (2 in front nine, 2 in back nine)
  - 10 par 3s (5 in front nine, 5 in back nine)
- Distances:
  - Par 1: 2.5-4 ft
  - Par 2: 4.5-7.5 ft
  - Par 3: 10 ft

## Tech Stack

- React Native
- Expo
- React Navigation
- AsyncStorage
- TypeScript

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
