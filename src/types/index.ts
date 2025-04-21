export interface Player {
  name: string;
}

export interface Hole {
  number: number;
  par: 1 | 2 | 3 | 4;
  distance: number;
  score?: number;
}

export interface Course {
  holes: Hole[];
  totalPar: number;
  totalDistance: number;
  frontNinePar: number;
  frontNineDistance: number;
  backNinePar: number;
  backNineDistance: number;
  courseMode: "Indoor" | "Outdoor";
  holeCount: 9 | 18;
}

export interface Round {
  id: string;
  date: number;
  course: Course;
  totalScore: number;
  differential: number;
  completed: boolean;
  courseName: string;
}

export type GameState =
  | "no-game"
  | "game-ready"
  | "game-in-progress"
  | "game-complete"
  | "edit-mode";

export interface RoundEdit {
  roundId: string;
  originalScores: Record<number, number | undefined>;
  hasChanges: boolean;
}

export interface AppState {
  player: Player | undefined;
  currentRound: Round | null;
  rounds: Round[];
  gameState: GameState;
  editState: RoundEdit | null;
}
