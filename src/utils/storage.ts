import AsyncStorage from "@react-native-async-storage/async-storage";
import { Player, Round, AppState } from "../types";

const STORAGE_KEYS = {
  PLAYER: "@dialed:player",
  ROUNDS: "@dialed:rounds",
  CURRENT_ROUND: "@dialed:currentRound",
};

export async function getPlayer(): Promise<Player | null> {
  try {
    const playerJson = await AsyncStorage.getItem(STORAGE_KEYS.PLAYER);
    return playerJson ? JSON.parse(playerJson) : null;
  } catch (error) {
    console.error("Error getting player:", error);
    return null;
  }
}

export async function savePlayer(player: Player): Promise<boolean> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PLAYER, JSON.stringify(player));
    return true;
  } catch (error) {
    console.error("Error saving player:", error);
    return false;
  }
}

export async function getRounds(): Promise<Round[]> {
  try {
    const roundsJson = await AsyncStorage.getItem(STORAGE_KEYS.ROUNDS);
    return roundsJson ? JSON.parse(roundsJson) : [];
  } catch (error) {
    console.error("Error getting rounds:", error);
    return [];
  }
}

export async function saveRounds(rounds: Round[]): Promise<boolean> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ROUNDS, JSON.stringify(rounds));
    return true;
  } catch (error) {
    console.error("Error saving rounds:", error);
    return false;
  }
}

export async function getCurrentRound(): Promise<Round | null> {
  try {
    const roundJson = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_ROUND);
    return roundJson ? JSON.parse(roundJson) : null;
  } catch (error) {
    console.error("Error getting current round:", error);
    return null;
  }
}

export async function saveCurrentRound(round: Round | null): Promise<boolean> {
  try {
    if (round === null) {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_ROUND);
    } else {
      await AsyncStorage.setItem(
        STORAGE_KEYS.CURRENT_ROUND,
        JSON.stringify(round)
      );
    }
    return true;
  } catch (error) {
    console.error("Error saving current round:", error);
    return false;
  }
}

export async function loadInitialState(): Promise<Partial<AppState>> {
  const [player, rounds, currentRound] = await Promise.all([
    getPlayer(),
    getRounds(),
    getCurrentRound(),
  ]);

  return {
    player: player || undefined,
    rounds: rounds || [],
    currentRound: currentRound || null,
    gameState: currentRound ? "game-in-progress" : "no-game",
  };
}

export async function clearAllData(): Promise<boolean> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.PLAYER,
      STORAGE_KEYS.ROUNDS,
      STORAGE_KEYS.CURRENT_ROUND,
    ]);
    return true;
  } catch (error) {
    console.error("Error clearing data:", error);
    return false;
  }
}
