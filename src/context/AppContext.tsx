import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, Player, Round } from '../types';
import * as storage from '../utils/storage';
import { createNewRound, updateScore } from '../utils/gameLogic';

interface AppContextType extends AppState {
  setPlayer: (player: Player) => Promise<void>;
  startNewGame: (courseMode?: "Indoor" | "Outdoor", holeCount?: 9 | 18) => Promise<void>;
  startRound: () => Promise<void>;
  updateHoleScore: (holeNumber: number, score: number | undefined) => Promise<void>;
  completeRound: () => Promise<void>;
  quitGame: () => Promise<void>;
  deleteRound: (roundId: string) => Promise<void>;
  editRound: (roundId: string, updatedRound: Round) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    player: undefined,
    currentRound: null,
    rounds: [],
    gameState: 'no-game',
  });

  useEffect(() => {
    loadInitialState();
  }, []);

  const loadInitialState = async () => {
    const initialState = await storage.loadInitialState();
    
    // Set a default player if one doesn't exist
    if (!initialState.player) {
      const defaultPlayer = { name: "Player" };
      await storage.savePlayer(defaultPlayer);
      initialState.player = defaultPlayer;
    }
    
    setState(current => ({ ...current, ...initialState }));
  };

  const setPlayer = async (player: Player) => {
    await storage.savePlayer(player);
    setState(current => ({ ...current, player }));
  };

  const startNewGame = async (courseMode: "Indoor" | "Outdoor" = "Indoor", holeCount: 9 | 18 = 18) => {
    const newRound = createNewRound(courseMode, holeCount);
    await storage.saveCurrentRound(newRound);
    setState(current => ({
      ...current,
      currentRound: newRound,
      gameState: 'game-ready',
    }));
  };

  const startRound = async () => {
    if (!state.currentRound) return;
    
    setState(current => ({
      ...current,
      gameState: 'game-in-progress',
    }));
  };

  const updateHoleScore = async (holeNumber: number, score: number | undefined) => {
    if (!state.currentRound) return;

    const updatedRound = updateScore(state.currentRound, holeNumber, score);
    await storage.saveCurrentRound(updatedRound);
    setState(current => ({ ...current, currentRound: updatedRound }));
  };

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

  const quitGame = async () => {
    await storage.saveCurrentRound(null);
    setState(current => ({
      ...current,
      currentRound: null,
      gameState: 'no-game',
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