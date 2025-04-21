import AsyncStorage from "@react-native-async-storage/async-storage";
import { Player, Round, AppState } from "../types";

// Flag to control whether dummy data should be generated
export const USE_DUMMY_DATA = false;

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
    return null;
  }
}

export async function savePlayer(player: Player): Promise<boolean> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PLAYER, JSON.stringify(player));
    return true;
  } catch (error) {
    return false;
  }
}

export async function getRounds(): Promise<Round[]> {
  try {
    const roundsJson = await AsyncStorage.getItem(STORAGE_KEYS.ROUNDS);
    return roundsJson ? JSON.parse(roundsJson) : [];
  } catch (error) {
    return [];
  }
}

export async function saveRounds(rounds: Round[]): Promise<boolean> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ROUNDS, JSON.stringify(rounds));
    return true;
  } catch (error) {
    return false;
  }
}

export async function getCurrentRound(): Promise<Round | null> {
  try {
    const roundJson = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_ROUND);
    return roundJson ? JSON.parse(roundJson) : null;
  } catch (error) {
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
    return false;
  }
}

export async function loadInitialState(): Promise<Partial<AppState>> {
  const [player, rounds, currentRound] = await Promise.all([
    getPlayer(),
    getRounds(),
    getCurrentRound(),
  ]);

  let gameState: "no-game" | "game-ready" | "game-in-progress" = "no-game";

  // Handle data migration for rounds without courseName
  const migratedRounds =
    rounds?.map((round) => {
      if (!round.courseName) {
        // Add a random course name from the COURSES array if not present
        const { COURSES } = require("./gameLogic");
        const randomIndex = Math.floor(Math.random() * COURSES.length);
        return { ...round, courseName: COURSES[randomIndex] };
      }
      return round;
    }) || [];

  // Only generate dummy rounds if there are no rounds AND the flag is enabled
  let finalRounds = migratedRounds;
  if (migratedRounds.length === 0 && USE_DUMMY_DATA) {
    const { generateDummyRounds } = require("./gameLogic");
    finalRounds = generateDummyRounds();

    // Save the generated dummy rounds
    await saveRounds(finalRounds);
  }

  // Handle data migration for current round without courseName
  let migratedCurrentRound = currentRound;
  if (currentRound && !currentRound.courseName) {
    const { COURSES } = require("./gameLogic");
    const randomIndex = Math.floor(Math.random() * COURSES.length);
    migratedCurrentRound = {
      ...currentRound,
      courseName: COURSES[randomIndex],
    };
    // Save the migrated current round
    await saveCurrentRound(migratedCurrentRound);
  }

  if (migratedCurrentRound) {
    // Determine if this is a saved game in progress or a new game ready to start
    // If there are any scores recorded, it's a game in progress
    const hasScores = migratedCurrentRound.course.holes.some(
      (hole) => hole.score !== undefined
    );
    gameState = hasScores ? "game-in-progress" : "game-ready";
  }

  // Save migrated rounds if we had to update any
  if (
    rounds &&
    migratedRounds.length > 0 &&
    JSON.stringify(rounds) !== JSON.stringify(migratedRounds) &&
    finalRounds === migratedRounds // Only save if we didn't already save dummy rounds
  ) {
    await saveRounds(migratedRounds);
  }

  return {
    player: player || undefined,
    rounds: finalRounds,
    currentRound: migratedCurrentRound || null,
    gameState,
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
    return false;
  }
}
