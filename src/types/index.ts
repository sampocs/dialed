/**
 * Represents a player in the game
 */
export interface Player {
  name: string;
}

/**
 * Represents a single hole in a disc golf course
 */
export interface Hole {
  /** Hole number (1-18) */
  number: number;
  /** Par value for the hole */
  par: 1 | 2 | 3 | 4;
  /** Distance of the hole in feet (indoor) or yards (outdoor) */
  distance: number;
  /** Player's score for this hole, undefined if not yet played */
  score?: number;
}

/**
 * Represents a complete disc golf course
 */
export interface Course {
  /** Array of holes that make up the course */
  holes: Hole[];
  /** Total par for the entire course */
  totalPar: number;
  /** Total distance for the entire course */
  totalDistance: number;
  /** Total par for the front nine holes */
  frontNinePar: number;
  /** Total distance for the front nine holes */
  frontNineDistance: number;
  /** Total par for the back nine holes */
  backNinePar: number;
  /** Total distance for the back nine holes */
  backNineDistance: number;
  /** Whether the course is indoor or outdoor */
  courseMode: "Indoor" | "Outdoor";
  /** Number of holes in the course (9 or 18) */
  holeCount: 9 | 18;
}

/**
 * Represents a complete round of disc golf
 */
export interface Round {
  /** Unique identifier for the round */
  id: string;
  /** Timestamp when the round was created */
  date: number;
  /** The course played during this round */
  course: Course;
  /** Total score for the round */
  totalScore: number;
  /** Score differential (relative to par) */
  differential: number;
  /** Whether the round has been completed */
  completed: boolean;
  /** Name of the course played */
  courseName: string;
}

/**
 * Possible states for the game
 */
export type GameState =
  | "no-game" // No active game
  | "game-ready" // Game is ready to start
  | "game-in-progress" // Game is currently being played
  | "game-complete" // Game has been completed
  | "edit-mode"; // Editing a previously completed round

/**
 * Represents the edit state of a round
 */
export interface RoundEdit {
  /** ID of the round being edited */
  roundId: string;
  /** Record of original scores before edits */
  originalScores: Record<number, number | undefined>;
  /** Whether any changes have been made */
  hasChanges: boolean;
}

/**
 * Global application state
 */
export interface AppState {
  /** Current player */
  player: Player | undefined;
  /** Currently active round, if any */
  currentRound: Round | null;
  /** List of all completed rounds */
  rounds: Round[];
  /** Current state of the game */
  gameState: GameState;
  /** Current edit state, if in edit mode */
  editState: RoundEdit | null;
}
