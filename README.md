# Dialed - Putting Game Mobile App

A React Native mobile application for tracking scores in a putting game.

## The Game

Dialed is a practice game designed to sharpen your short game skills. Play it alongside your practice sessions at an indoor putting mat or an outdoor short game area.

Begin by selecting your course length (9 or 18 holes) and environment (indoor or outdoor).

The app generates a unique course layout with specific distances for each hole. Set up your ball at the indicated distance and try to sink it in as few strokes as possible, with the maximum strokes capped as shown in the app.

### Outdoor Mode

In outdoor mode, each 9-hole section features 7 Par 2 holes and 2 Par 3 holes. Distances are randomly assigned based on par:

- Par 2 holes: 10 or 15 yards
- Par 3 holes: 20, 30, or 40 yards

For each hole, select a target flag and place your ball approximately at the specified distance. Always start from off the green (unless space is limited on shorter Par 2 holes).

### Indoor Mode

Indoor mode creates a course with 2 Par 1's, 5 Par 2's, and 2 Par 3's for each 9-hole section. Distances vary by par:

- Par 1 holes: 2.5, 3, or 3.5 feet (putter only)
- Par 2 holes: 4 to 7.5 feet in 0.5-foot increments (putter only)
- Par 3 holes: 10 feet (start with a wedge)

Indoor rules:

- Missed putts: Move the ball 1 foot closer and try again
- Chips: If you land within 1 foot of the hole, finish with a 4-foot putt. Otherwise, attempt a 7.5-foot putt
- Errant chips: Incur a 1-stroke penalty

## Features

- Track scores for 9 or 18-hole putting courses
- Automatically generated courses with varying par and distance, depending on whether playing indoor or out
- View round history with detailed scorecards
- Performance metrics and trend visualization

## Technical Info

### Requirements

- Node.js 18.18.0
- npm or yarn
- iOS Simulator (for iOS development)
- Xcode (for iOS development)

### Tech Stack

- React Native
- Expo
- React Navigation
- AsyncStorage
- TypeScript

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/dialed.git
cd dialed
```

2. Ensure you're on node `v18.18.0`

```bash
nvm use v18.18.0
```

3. Install dependencies:

```bash
npm install
```

4. Make sure EAS is installed globally

```bash
npm list -g eas-cli | grep eas-cli
```

## Running the App

- Start with simulator

```bash
npx expo run:ios
```

## Deploying New Builds

- Create new build

```bash
eas build --platform ios --profile production
```

- Deploy to TestFlight

```bash
eas submit --platform ios --latest
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
