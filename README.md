# Dialed - Putting Game Mobile App

A React Native mobile application for tracking scores in a putting game.

[Screen Shots](./screenshots/)

## The Game

Dialed is a practice game designed to sharpen your short game skills. Play it alongside your practice sessions at an indoor putting mat or an outdoor short game area.

Begin by selecting your course length (9 or 18 holes) and environment (indoor or outdoor).

The app generates a unique course layout with specific distances for each hole. Set up your ball at the indicated distance and try to sink it in as few strokes as possible, with the maximum strokes capped as shown in the app.

### Outdoor Mode

In outdoor mode, each 9-hole section features 2 Par 2 holes, 6 Par 3 holes, and 1 Par 4 hole. Distances are randomly assigned based on par:

- Par 2 holes: 10 or 15 yards
- Par 3 holes: 20, 25, 30, or 35 yards
- Par 4 holes: 40 yards

For each hole, select a target flag and place your ball approximately at the specified distance. You can pace out your distance, but precision isn't strictly necessary - reasonable approximations work well. Always start from off the green (unless space is limited on shorter Par 2 holes).

### Indoor Mode

Indoor mode creates a course with 2 Par 1's, 5 Par 2's, and 2 Par 3's for each 9-hole section. Distances vary by par:

- Par 1 holes: 2.5, 3, or 3.5 feet (putter only)
- Par 2 holes: 4 to 7.5 feet in 0.5-foot increments (putter only)
- Par 3 holes: 10 feet (start with a wedge)

It's recommended to use a practice green with distance markings like the Perfect Putting mat for more accurate distance setups. Otherwise, you can simply eyeball the distances.

Indoor rules:

- Missed putts: Move the ball 1 foot closer and try again
- Chips: If you land within 1 foot of the hole, finish with a 4-foot putt. Otherwise, attempt a 7.5-foot putt
- Errant chips: Incur a 1-stroke penalty

## Features

- Track scores for 9 or 18-hole putting courses
- Automatically generated courses with varying par and distance, depending on whether playing indoor or out
- Interactive animations and haptic feedback when scoring
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
git clone https://github.com/sampocs/dialed.git
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

## Development Commands

For convenience, the project includes several useful npm scripts:

```bash
# Start the Metro bundler without launching the app (useful for manual launches)
npm start

# Standard command to run your iOS app
npm run ios

# Clean the build folder and rebuild (use when changing app icon, name, etc.)
npm run ios:clean

# Reinstall CocoaPods dependencies (after adding new dependencies)
npm run ios:pods

# Full clean build using Xcode's clean command (for stubborn build issues)
npm run rebuild:ios
```

These commands can help troubleshoot various development scenarios:

- For normal development: `npm run ios`
- To start Metro bundler only: `npm start` (then launch app from simulator/device manually)
- When you change app resources (icon, name): `npm run ios:clean`
- When experiencing build errors: `npm run rebuild:ios`
- After adding new native dependencies: Run `npm run ios:pods` followed by `npm run ios`

## Deploying New Builds

- Increment the version number and app.json, then:

```bash
# Regenerate native code to have updated version
npm run prebuild:ios

# Create a new production build for iOS
npm run build:ios

# Submit the latest build to TestFlight
npm run submit:ios
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
