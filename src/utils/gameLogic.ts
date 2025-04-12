import { Course, Hole, Round } from "../types";

const PAR_1_DISTANCES = [2.5, 3, 3.5, 4];
const PAR_2_DISTANCES = [4.5, 5, 5.5, 6, 6.5, 7, 7.5];
const PAR_3_DISTANCE = 10;

export const COURSES = [
  "Moonlight Basin",
  "Black Desert Stone",
  "Augusta National",
  "Pebble Beach",
  "TPC Sawgrass",
  "Torrey Pines",
  "Pinehurst No. 2",
  "Royal Troon",
  "St. Andrews",
  "Whispering Pines",
  "Crystal Springs",
  "Sunset Done",
  "Diamond Ridge",
  "Misty Harbor",
  "Royal Highlands",
  "Whistling Straights",
  "Greywalls",
  "George Dunne",
  "Coyote Run",
  "Chevy Chase",
  "Mount Prospect",
  "Schaumburg",
  "Arboretum Club",
  "Villiage Links",
  "Oak Meadows",
];

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function getRandomDistance(par: number): number {
  if (par === 3) return PAR_3_DISTANCE;
  const distances = par === 1 ? PAR_1_DISTANCES : PAR_2_DISTANCES;
  return distances[Math.floor(Math.random() * distances.length)];
}

export function generateCourse(): Course {
  // Generate hole distribution for front nine and back nine
  const frontNineTemplate = [
    ...Array(2).fill(1), // 2 par 1s
    ...Array(2).fill(2), // 2 par 2s
    ...Array(5).fill(3), // 5 par 3s
  ];
  const backNineTemplate = [...frontNineTemplate];

  // Shuffle both nines
  const frontNine = shuffleArray(frontNineTemplate);
  const backNine = shuffleArray(backNineTemplate);

  // Generate holes with distances
  const holes: Hole[] = [...frontNine, ...backNine].map((par, index) => ({
    number: index + 1,
    par: par as 1 | 2 | 3,
    distance: getRandomDistance(par),
  }));

  // Calculate totals
  const frontNineHoles = holes.slice(0, 9);
  const backNineHoles = holes.slice(9);

  const frontNinePar = frontNineHoles.reduce((sum, hole) => sum + hole.par, 0);
  const backNinePar = backNineHoles.reduce((sum, hole) => sum + hole.par, 0);
  const frontNineDistance = frontNineHoles.reduce(
    (sum, hole) => sum + hole.distance,
    0
  );
  const backNineDistance = backNineHoles.reduce(
    (sum, hole) => sum + hole.distance,
    0
  );

  return {
    holes,
    totalPar: frontNinePar + backNinePar,
    totalDistance: frontNineDistance + backNineDistance,
    frontNinePar,
    frontNineDistance,
    backNinePar,
    backNineDistance,
  };
}

export function createNewRound(): Round {
  // Get a random course name from the COURSES array
  const randomIndex = Math.floor(Math.random() * COURSES.length);
  const courseName = COURSES[randomIndex];

  return {
    id: Date.now().toString(),
    date: Date.now(),
    course: generateCourse(),
    totalScore: 0,
    differential: 0,
    completed: false,
    courseName,
  };
}

export function updateScore(
  round: Round,
  holeNumber: number,
  score: number
): Round {
  const updatedHoles = round.course.holes.map((hole) =>
    hole.number === holeNumber ? { ...hole, score } : hole
  );

  const totalScore = updatedHoles.reduce(
    (sum, hole) => sum + (hole.score || 0),
    0
  );
  const differential = totalScore - round.course.totalPar;

  return {
    ...round,
    course: {
      ...round.course,
      holes: updatedHoles,
    },
    totalScore,
    differential,
  };
}

export function isValidScore(par: number, score: number): boolean {
  if (par === 3) return score >= 1 && score <= 4;
  return score >= 1 && score <= 3;
}

export function calculateStats(rounds: Round[]) {
  if (rounds.length === 0) {
    return {
      averageScore: 0,
      bestRound: null,
      recentTrend: 0,
    };
  }

  const completedRounds = rounds.filter((round) => round.completed);

  if (completedRounds.length === 0) {
    return {
      averageScore: 0,
      bestRound: null,
      recentTrend: 0,
    };
  }

  const averageScore =
    completedRounds.reduce((sum, round) => sum + round.differential, 0) /
    completedRounds.length;

  const bestRound = completedRounds.reduce((best, current) =>
    !best || current.differential < best.differential ? current : best
  );

  // Calculate trend using last 5 rounds
  const recentRounds = completedRounds
    .sort((a, b) => b.date - a.date)
    .slice(0, 5);

  const recentTrend =
    recentRounds.length > 1
      ? (recentRounds[0].differential -
          recentRounds[recentRounds.length - 1].differential) /
        recentRounds.length
      : 0;

  return {
    averageScore,
    bestRound,
    recentTrend,
  };
}
