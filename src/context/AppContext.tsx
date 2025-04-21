import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { AppState, Player, Round, RoundEdit } from '../types';
import * as storage from '../utils/storage';
import { createNewRound, updateScore } from '../utils/gameLogic';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { AppState as RNAppState, AppStateStatus } from 'react-native';

/**
 * Interface defining all the methods available in the AppContext
 * Extends the base AppState with functions to manipulate the state
 */
interface AppContextType extends AppState {
  /** Set the current player */
  setPlayer: (player: Player) => Promise<void>;
  /** Start a new game with optional configuration */
  startNewGame: (courseMode?: "Indoor" | "Outdoor", holeCount?: 9 | 18, courseName?: string) => Promise<void>;
  /** Start playing a round */
  startRound: () => Promise<void>;
  /** Update a hole's score */
  updateHoleScore: (holeNumber: number, score: number | undefined) => Promise<void>;
  /** Mark the current round as complete */
  completeRound: () => Promise<void>;
  /** Quit the current game */
  quitGame: () => Promise<void>;
  /** Delete a specific round by ID */
  deleteRound: (roundId: string) => Promise<void>;
  /** Edit a round with updated data */
  editRound: (roundId: string, updatedRound: Round) => Promise<void>;
  /** Start edit mode for a round */
  startEditMode: (roundId: string) => Promise<void>;
  /** Save changes made in edit mode */
  saveRoundEdit: () => Promise<void>;
  /** Cancel changes made in edit mode */
  cancelRoundEdit: () => Promise<void>;
  /** Check if there are unsaved changes in edit mode */
  hasEditChanges: () => boolean;
  /** Switch to a different course */
  switchCourse: (courseName: string) => Promise<void>;
}

/**
 * Main app context
 * Provides game state and methods to components in the app
 */
const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * AppProvider component that manages the global state of the application
 * Handles persistence, game state, and screen locking functionality
 */
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    player: undefined,
    currentRound: null,
    rounds: [],
    gameState: 'no-game',
    editState: null,
  });
  
  // Ref to track the screen lock timer
  const screenLockTimerRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef<AppStateStatus>(RNAppState.currentState);

  /**
   * Initialize the app and set up event listeners
   */
  useEffect(() => {
    const setup = async () => {
      await loadInitialState();
      
      // Keep screen awake when app loads
      await activateKeepAwakeAsync();
      
      // Start timer to allow screen lock after 2 minutes
      startScreenLockTimer();
    };
    
    setup();
    
    // Monitor app state changes (foreground/background)
    const subscription = RNAppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      // Clean up when component unmounts
      if (screenLockTimerRef.current) {
        clearTimeout(screenLockTimerRef.current);
      }
      deactivateKeepAwake();
      subscription.remove();
    };
  }, []);
  
  /**
   * Handle app state changes (foreground/background)
   * Manages screen wake lock according to app state
   */
  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
      // App has come to the foreground
      await activateKeepAwakeAsync();
      startScreenLockTimer();
    } else if (nextAppState.match(/inactive|background/)) {
      // App has gone to the background
      if (screenLockTimerRef.current) {
        clearTimeout(screenLockTimerRef.current);
      }
      deactivateKeepAwake();
    }
    
    appStateRef.current = nextAppState;
  };
  
  /**
   * Start a timer to allow the screen to lock after 2 minutes
   * Prevents the screen from staying on indefinitely
   */
  const startScreenLockTimer = () => {
    // Clear any existing timer
    if (screenLockTimerRef.current) {
      clearTimeout(screenLockTimerRef.current);
    }
    
    // Set timer to allow screen to lock after 2 minutes (120000ms)
    screenLockTimerRef.current = setTimeout(() => {
      deactivateKeepAwake();
    }, 120000);
  };

  /**
   * Load the initial state from storage when the app starts
   */
  const loadInitialState = async () => {
    const initialState = await storage.loadInitialState();
    
    // Set a default player if one doesn't exist
    if (!initialState.player) {
      const defaultPlayer = { name: "Player" };
      await storage.savePlayer(defaultPlayer);
      initialState.player = defaultPlayer;
    }
    
    // TIP: To use dummy data for testing or demos, change USE_DUMMY_DATA to true in src/utils/storage.ts
    
    setState(current => ({ ...current, ...initialState }));
  };

  /**
   * Update the player information
   */
  const setPlayer = async (player: Player) => {
    await storage.savePlayer(player);
    setState(current => ({ ...current, player }));
  };

  /**
   * Create a new game with the specified settings
   */
  const startNewGame = async (courseMode: "Indoor" | "Outdoor" = "Indoor", holeCount: 9 | 18 = 18, courseName?: string) => {
    const newRound = createNewRound(courseMode, holeCount, courseName);
    await storage.saveCurrentRound(newRound);
    setState(current => ({
      ...current,
      currentRound: newRound,
      gameState: 'game-ready',
    }));
  };

  /**
   * Begin playing the current round
   */
  const startRound = async () => {
    if (!state.currentRound) return;
    
    setState(current => ({
      ...current,
      gameState: 'game-in-progress',
    }));
  };

  /**
   * Start editing an existing round
   */
  const startEditMode = async (roundId: string) => {
    const roundToEdit = state.rounds.find(round => round.id === roundId);
    if (!roundToEdit) return;

    // Create a copy of the round to edit
    const roundCopy = JSON.parse(JSON.stringify(roundToEdit));
    
    // Store original scores to track changes
    const originalScores: Record<number, number | undefined> = {};
    roundCopy.course.holes.forEach((hole: { number: number; score: number | undefined }) => {
      originalScores[hole.number] = hole.score;
    });

    await storage.saveCurrentRound(roundCopy);
    setState(current => ({
      ...current,
      currentRound: roundCopy,
      gameState: 'edit-mode',
      editState: {
        roundId,
        originalScores,
        hasChanges: false,
      }
    }));
  };

  /**
   * Update the score for a specific hole
   */
  const updateHoleScore = async (holeNumber: number, score: number | undefined) => {
    if (!state.currentRound) return;

    const updatedRound = updateScore(state.currentRound, holeNumber, score);
    await storage.saveCurrentRound(updatedRound);
    
    // If in edit mode, check if there are changes
    if (state.gameState === 'edit-mode' && state.editState) {
      const hasChanges = Object.keys(state.editState.originalScores).some(holeNum => {
        const holeNumber = parseInt(holeNum);
        const originalScore = state.editState?.originalScores[holeNumber];
        const currentScore = updatedRound.course.holes.find(h => h.number === holeNumber)?.score;
        return originalScore !== currentScore;
      });
      
      setState(current => ({ 
        ...current, 
        currentRound: updatedRound,
        editState: {
          ...current.editState!,
          hasChanges
        }
      }));
    } else {
      setState(current => ({ ...current, currentRound: updatedRound }));
    }
  };

  /**
   * Complete the current round and save it to history
   */
  const completeRound = async () => {
    if (!state.currentRound) return;

    const completedRound = { ...state.currentRound, completed: true };
    const updatedRounds = [...state.rounds, completedRound];
    
    // Save the completed round to storage
    await Promise.all([
      storage.saveRounds(updatedRounds),
      storage.saveCurrentRound(completedRound),
    ]);

    // Update state to show the completed round
    setState(current => ({
      ...current,
      rounds: updatedRounds,
      currentRound: completedRound,
      gameState: 'game-complete',
    }));
  };

  /**
   * Save changes made in edit mode
   */
  const saveRoundEdit = async () => {
    if (!state.currentRound || !state.editState) return;
    
    // Find the original round and update it
    const originalRoundIndex = state.rounds.findIndex(round => round.id === state.editState?.roundId);
    if (originalRoundIndex === -1) return;
    
    const updatedRounds = [...state.rounds];
    updatedRounds[originalRoundIndex] = state.currentRound;
    
    await storage.saveRounds(updatedRounds);
    await storage.saveCurrentRound(null);
    
    setState(current => ({
      ...current,
      rounds: updatedRounds,
      currentRound: null,
      gameState: 'no-game',
      editState: null
    }));
  };

  /**
   * Cancel all changes made in edit mode
   */
  const cancelRoundEdit = async () => {
    await storage.saveCurrentRound(null);
    setState(current => ({
      ...current,
      currentRound: null,
      gameState: 'no-game',
      editState: null
    }));
  };

  /**
   * Check if there are unsaved changes in edit mode
   */
  const hasEditChanges = () => {
    return state.editState?.hasChanges || false;
  };

  /**
   * Quit the current game without saving
   */
  const quitGame = async () => {
    await storage.saveCurrentRound(null);
    setState(current => ({
      ...current,
      currentRound: null,
      gameState: 'no-game',
      editState: null
    }));
  };

  const deleteRound = async (roundId: string) => {
    const updatedRounds = state.rounds.filter(round => round.id !== roundId);
    await storage.saveRounds(updatedRounds);
    setState(current => ({ ...current, rounds: updatedRounds }));
  };

  const editRound = async (roundId: string, updatedRound: Round) => {
    const updatedRounds = state.rounds.map(round =>
      round.id === roundId ? updatedRound : round
    );
    await storage.saveRounds(updatedRounds);
    setState(current => ({ ...current, rounds: updatedRounds }));
  };

  const switchCourse = async (courseName: string) => {
    if (!state.currentRound) return;
    
    // Create a new round with the same properties but different course
    const newRound = createNewRound(
      state.currentRound.course.courseMode, 
      state.currentRound.course.holeCount, 
      courseName
    );
    
    // Preserve the same ID to maintain history
    newRound.id = state.currentRound.id;
    newRound.date = state.currentRound.date;
    
    await storage.saveCurrentRound(newRound);
    setState(current => ({
      ...current,
      currentRound: newRound,
      gameState: 'game-ready',
    }));
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        setPlayer,
        startNewGame,
        startRound,
        updateHoleScore,
        completeRound,
        quitGame,
        deleteRound,
        editRound,
        startEditMode,
        saveRoundEdit,
        cancelRoundEdit,
        hasEditChanges,
        switchCourse,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
} 