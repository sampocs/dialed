# Dialed - Putting Game Mobile App Specification

## Overview

TDialed is a mobile application designed to help track scores for a putting game. The app works entirely locally without requiring a database or API service, using only JSON local storage. It will be developed using React Native.

## Technical Requirements

- Framework: React Native
- Data Storage: AsyncStorage (React Native's local storage solution)
- Deployment: Export as .ipa file for iOS (may require ejecting from React Native to Xcode)
- Navigation: React Navigation (Tab-based navigation)

## Application Structure

The app will consist of three main tabs:

1. **Play** - For creating and playing rounds
2. **Rounds** - For viewing past round history
3. **Metrics** - For visualizing performance over time

## User Flow

### First-time Launch

Upon first launch, the app will prompt the user to enter their name. This name will be stored locally and used for all subsequent scorecards.

### Tab 1: Play

#### State 1: No Game in Progress

- Simple screen with a centered "New Game" button
- Clean, minimal interface with app title at the top
- Pressing "New Game" transitions to State 2

#### State 2: Game Ready

- Displays a generated course with 18 holes
- Course generation rules:
  - 18 holes total
  - 4 par 1s, 10 par 2s, and 4 par 3s
  - Front nine: 2 par 1s, 5 par 2s, 2 par 3s
  - Back nine: 2 par 1s, 5 par 2s, 2 par 3s
  - Par 1s and par 2s placed randomly throughout the course
- Distance generation rules:
  - Par 1s: Randomly selected from 2.5, 3, 3.5, or 4 ft
  - Par 2s: Randomly selected from 4.5, 5, 5.5, 6, 6.5, 7, or 7.5 ft
  - Par 3s: Always 10 ft
- Scorecard display:
  - Table with columns for hole numbers (1-18)
  - Par value for each hole
  - Distance for each hole
  - Cumulative par and distance for front nine, back nine, and total
  - Empty fields for scores (to be filled during play)
- Button to generate a new course at the bottom
- Prominent "Start Round" button to begin play

#### State 3: Game in Progress

- Header shows current hole number (e.g., "2/18")
- Navigation arrows to move between holes (left/right)
  - No left arrow on hole 1
  - No right arrow on hole 18
- Current score display:
  - Total strokes so far
  - Differential to par (e.g., "3 (-1)")
- Score input buttons:
  - For par 1 and par 2 holes: buttons for scores 1, 2, and 3
  - For par 3 holes: buttons for scores 1, 2, 3, and 4
  - Selected score button appears solid/filled
- "X" button in the top right corner
  - When pressed, displays "Quit the game?" confirmation dialog
  - "Yes" returns to State 1
  - "No" dismisses the dialog
- Option to view scorecard:
  - User can tap a button to view the current scorecard
  - Scorecard appears as an overlay with blurred background
  - Shows progress so far with completed holes
  - "Close" button to dismiss the overlay
- On hole 18, after score selection, a "Submit" button appears
  - Pressing "Submit" transitions to State 4

#### State 4: Game Complete

- Full scorecard display with all scores filled in
- Displays final score and differential to par
- "X" button in the top right corner returns directly to State 1
- Score is automatically saved to round history

### Tab 2: Rounds

- Displays "{PlayerName}'s Rounds" as a header
  - Long press on header shows dialog to change player name
- Infinite scrolling list of past rounds, sorted by date (newest first)
- Each round entry shows:
  - Date and time played
  - Total score
  - Differential to par
  - Total course distance
  - Star icon next to the best round (lowest score relative to par)
- Each entry has:
  - Expandable/collapsible arrow to show/hide the full scorecard
  - Three-dot menu with options:
    - "Edit" - Opens scorecard editing interface
    - "Delete" - Prompts confirmation before deleting

#### Round Editing

- Similar interface to "Game in Progress" state
- Shows hole navigation and score selection
- Current scores are pre-selected
- "Save" button in the top right (instead of "X")
- Confirmation dialog before saving changes
- No "Submit" button on hole 18

### Tab 3: Metrics

- Performance graph showing scores over time
  - X-axis: Round number
  - Y-axis: Score (relative to par)
- Option to toggle between absolute score and differential to par
- Visual indication of trend line

## Data Model

### Player

```typescript
interface Player {
  name: string;
}
```

### Hole

```typescript
interface Hole {
  number: number;
  par: 1 | 2 | 3;
  distance: number;
  score?: number;
}
```

### Course

```typescript
interface Course {
  holes: Hole[];
  totalPar: number;
  totalDistance: number;
  frontNinePar: number;
  frontNineDistance: number;
  backNinePar: number;
  backNineDistance: number;
}
```

### Round

```typescript
interface Round {
  id: string;
  date: number; // timestamp
  course: Course;
  totalScore: number;
  differential: number;
  completed: boolean;
}
```

### AppState

```typescript
interface AppState {
  player: Player;
  currentRound: Round | null;
  rounds: Round[];
  gameState: "no-game" | "game-ready" | "game-in-progress" | "game-complete";
}
```

## Screens and Components

### Components

1. **Header**

   - App title
   - Navigation elements

2. **Scorecard**

   - Table display of course and scores
   - Front nine summary
   - Back nine summary
   - Total summary

3. **RoundListItem**

   - Round summary information
   - Expandable scorecard
   - Edit/delete actions

4. **ScoreInputButtons**

   - Dynamically generated based on par
   - Visual selection state

5. **HoleNavigation**

   - Current hole display
   - Previous/next navigation

6. **ConfirmationDialog**

   - Generic dialog for confirmations
   - Yes/No buttons

7. **PerformanceGraph**
   - Line chart for score visualization
   - Trend line

### Screens

1. **PlayScreen**

   - Handles all game states
   - Course generation
   - Score input
   - Game flow control

2. **RoundsScreen**

   - Round history list
   - Round detail expansion
   - Round editing

3. **MetricsScreen**

   - Performance visualization
   - Statistics display

4. **NameInputModal**
   - First-time setup

## Core Functionality

### Course Generation

- Generate a balanced course according to specified parameters
- Ensure proper distribution of par values across front and back nine
- Randomize distances within specified ranges
- Calculate total distances and pars

### Score Tracking

- Record scores for each hole
- Calculate running total and differential to par
- Update display in real-time as scores are entered

### Data Persistence

- Store all data in local AsyncStorage
- Save rounds automatically upon completion
- Load history on app launch

### Round Management

- View round details
- Edit past rounds with confirmation
- Delete rounds with confirmation

### Performance Metrics

- Track score progression over time
- Identify best round

## UI/UX Design Guidelines

### Color Scheme

- Primary Background: #1E1E1E (Charcoal Gray)
- Secondary Background: #2D2D2D (Dark Gray)
- Primary Accent: #4CAF50 (Green)
- Secondary Accent: #8BC34A (Light Green)
- Highlight: #FFFFFF (White, used sparingly)
- Text Primary: #FFFFFF (White)
- Text Secondary: #B0B0B0 (Light Gray)
- Success: #66BB6A (Green)
- Error: #EF5350 (Red)
- Inactive: #757575 (Medium Gray)

### Typography

- Primary Font: System default (San Francisco on iOS)
- Header Size: 20pt bold
- Subheader Size: 16pt semi-bold
- Body Text Size: 14pt regular
- Button Text: 16pt semi-bold

### Layout

- Tab bar at bottom of screen
- Content area with appropriate padding (16pt)
- Cards with 8pt rounded corners
- Consistent spacing between elements

## Implementation Notes

### React Native Setup

- Use React Native CLI or Expo (with potential ejection)
- Set up navigation using React Navigation
- Configure AsyncStorage for data persistence

### Ejecting Process

1. If using Expo, run `expo eject` to get native code
2. If using React Native CLI, the native code is already available
3. Open the iOS project in Xcode
4. Configure signing and capabilities
5. Build for device or export .ipa file
6. Alternative: Use TestFlight for distribution

### Performance Considerations

- Optimize list rendering for Rounds tab
- Minimize unnecessary re-renders
- Use memoization for complex calculations

## Testing Guidelines

- Test course generation logic thoroughly
- Verify score calculation accuracy
- Test data persistence across app restarts
- Verify UI rendering on different device sizes

## Future Enhancement Possibilities

- Multiple player support
- Custom course creation
- Social sharing of scores
- Cloud backup of round history
- Additional statistical analysis
