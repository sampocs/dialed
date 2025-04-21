import { Course, Hole, Round } from "../types";
import coursesDataRaw from "./courses.json";

// Type assertion to ensure the JSON data matches our Course type
const coursesData: { [courseName: string]: Course } = Object.entries(
  coursesDataRaw
).reduce((acc, [name, course]) => {
  // Ensure the par property in each hole is properly typed as 1 | 2 | 3
  const typedCourse: Course = {
    ...course,
    holes: course.holes.map((hole) => ({
      ...hole,
      par: hole.par as 1 | 2 | 3,
    })),
    courseMode: course.courseMode as "Indoor" | "Outdoor",
    holeCount: course.holeCount as 9 | 18,
  };

  acc[name] = typedCourse;
  return acc;
}, {} as { [courseName: string]: Course });

// Indoor distances (in feet)
const INDOOR_PAR_1_DISTANCES = [2.5, 3, 3.5, 4];
const INDOOR_PAR_2_DISTANCES = [4.5, 5, 5.5, 6, 6.5, 7, 7.5];
const INDOOR_PAR_3_DISTANCE = 10;

// Outdoor distances (in yards)
const OUTDOOR_PAR_2_DISTANCES = [10, 15];
const OUTDOOR_PAR_3_DISTANCES = [20, 30, 40];

export const OUTDOOR_COURSES = [
  "Augusta National",
  "Pebble Beach",
  "TPC Sawgrass",
  "Torrey Pines",
  "Ojai Valley",
  "PGA West",
  "Shadow Creek",
  "Coeur d'Alene",
  "Greywalls",
  "Sand Valley",
];

export const INDOOR_COURSES = [
  "Moonlight Basin",
  "Black Desert Stone",
  "Pinehurst No. 2",
  "Pine Valley",
  "Whistling Straits",
  "Bethpage Black",
  "Valhalla",
  "St. Andrews",
  "Erin Hills",
  "Royal Melbourne",
];

// Map to store pre-generated courses
export const PRE_GENERATED_COURSES: {
  [courseName: string]: Course;
} = coursesData;

// Function to initialize all the courses with fixed layouts
export function initializeAllCourses(): void {
  console.log("All courses have been loaded from courses.json");
  console.log(`Loaded ${Object.keys(PRE_GENERATED_COURSES).length} courses`);

  // Log brief details of each course for verification
  Object.entries(PRE_GENERATED_COURSES).forEach(([name, course]) => {
    console.log(
      `${name}: ${course.courseMode}, ${course.totalPar} par, ${
        course.totalDistance
      } ${course.courseMode === "Indoor" ? "feet" : "yards"}`
    );
  });
}

// Call initializeAllCourses on module load
initializeAllCourses();

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// The following functions are now only used for testing or creating new course templates
// They are not used during normal gameplay since courses are loaded from courses.json

function getRandomIndoorDistance(par: number): number {
  if (par === 3) return INDOOR_PAR_3_DISTANCE;
  const distances = par === 1 ? INDOOR_PAR_1_DISTANCES : INDOOR_PAR_2_DISTANCES;
  return distances[Math.floor(Math.random() * distances.length)];
}

function getRandomOutdoorDistance(par: number): number {
  const distances =
    par === 2 ? OUTDOOR_PAR_2_DISTANCES : OUTDOOR_PAR_3_DISTANCES;
  return distances[Math.floor(Math.random() * distances.length)];
}

function generateIndoorNineTemplate(): number[] {
  return [
    ...Array(2).fill(1), // 2 par 1s
    ...Array(5).fill(2), // 5 par 2s
    ...Array(2).fill(3), // 2 par 3s
  ];
}

function generateOutdoorNineTemplate(): number[] {
  return [
    ...Array(2).fill(2), // 2 par 2s
    ...Array(7).fill(3), // 7 par 3s
  ];
}

// This function is now primarily used for testing or creating new course templates
// It is not used during normal gameplay since courses are loaded from courses.json
export function generateCourse(
  holeCount: 9 | 18 = 18,
  courseMode: "Indoor" | "Outdoor" = "Indoor"
): Course {
  // Generate hole distribution for front nine based on course mode
  const frontNineTemplate =
    courseMode === "Indoor"
      ? generateIndoorNineTemplate()
      : generateOutdoorNineTemplate();

  // For 18 holes we need the back nine, otherwise just use front nine
  const backNineTemplate = holeCount === 18 ? [...frontNineTemplate] : [];

  // Shuffle the nine(s)
  const frontNine = shuffleArray(frontNineTemplate);
  const backNine = holeCount === 18 ? shuffleArray(backNineTemplate) : [];

  // Generate holes with distances based on course mode
  const getDistance =
    courseMode === "Indoor"
      ? getRandomIndoorDistance
      : getRandomOutdoorDistance;

  // Generate holes with distances
  const holes: Hole[] = [...frontNine, ...backNine].map((par, index) => ({
    number: index + 1,
    par: par as 1 | 2 | 3,
    distance: getDistance(par),
  }));

  // Calculate totals
  const frontNineHoles = holes.slice(0, 9);
  const backNineHoles = holeCount === 18 ? holes.slice(9) : [];

  const frontNinePar = frontNineHoles.reduce((sum, hole) => sum + hole.par, 0);
  const backNinePar =
    backNineHoles.length > 0
      ? backNineHoles.reduce((sum, hole) => sum + hole.par, 0)
      : 0;

  const frontNineDistance = frontNineHoles.reduce(
    (sum, hole) => sum + hole.distance,
    0
  );

  const backNineDistance =
    backNineHoles.length > 0
      ? backNineHoles.reduce((sum, hole) => sum + hole.distance, 0)
      : 0;

  return {
    holes,
    totalPar: frontNinePar + backNinePar,
    totalDistance: frontNineDistance + backNineDistance,
    frontNinePar,
    frontNineDistance,
    backNinePar,
    backNineDistance,
    courseMode: courseMode,
    holeCount: holeCount,
  };
}

export function createNewRound(
  courseMode: "Indoor" | "Outdoor" = "Indoor",
  holeCount: 9 | 18 = 18,
  specificCourseName?: string
): Round {
  // Get a course name - either the specified one or a random one
  let courseName: string;

  if (specificCourseName) {
    // Use the specified course name if provided
    courseName = specificCourseName;
  } else {
    // Get a random course name based on course mode
    const courses = courseMode === "Indoor" ? INDOOR_COURSES : OUTDOOR_COURSES;
    const randomIndex = Math.floor(Math.random() * courses.length);
    courseName = courses[randomIndex];
  }

  // Get the pre-generated course
  const preGeneratedCourse = PRE_GENERATED_COURSES[courseName];

  let course: Course;

  if (holeCount === 18) {
    // Use the full 18-hole course
    course = { ...preGeneratedCourse };
  } else {
    // Use only the front 9 holes
    const frontNineHoles = preGeneratedCourse.holes.slice(0, 9);

    course = {
      holes: frontNineHoles,
      totalPar: preGeneratedCourse.frontNinePar,
      totalDistance: preGeneratedCourse.frontNineDistance,
      frontNinePar: preGeneratedCourse.frontNinePar,
      frontNineDistance: preGeneratedCourse.frontNineDistance,
      backNinePar: 0,
      backNineDistance: 0,
      courseMode: preGeneratedCourse.courseMode,
      holeCount: 9,
    };
  }

  // Create a unique ID by combining timestamp with a random string
  const uniqueId = `${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 10)}`;

  return {
    id: uniqueId,
    date: Date.now(),
    course,
    totalScore: 0,
    differential: 0,
    completed: false,
    courseName,
  };
}

export function updateScore(
  round: Round,
  holeNumber: number,
  score: number | undefined
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
  if (par === 1) return score >= 1 && score <= 3;
  return score >= 1 && score <= 4; // For par 2 and par 3
}

export function calculateStats(rounds: Round[]) {
  if (rounds.length === 0) {
    return {
      averageScore: 0,
      averageTotal: 0,
      bestRound: null,
      recentTrend: 0,
      handicap: 0,
    };
  }

  const completedRounds = rounds.filter((round) => round.completed);

  if (completedRounds.length === 0) {
    return {
      averageScore: 0,
      averageTotal: 0,
      bestRound: null,
      recentTrend: 0,
      handicap: 0,
    };
  }

  const averageScore =
    completedRounds.reduce((sum, round) => sum + round.differential, 0) /
    completedRounds.length;

  const averageTotal =
    completedRounds.reduce((sum, round) => sum + round.totalScore, 0) /
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

  // Calculate handicap based on best 8 of last 20 rounds (or fewer if not enough rounds)
  const sortedByDate = [...completedRounds].sort((a, b) => b.date - a.date);
  const last20Rounds = sortedByDate.slice(0, 20);
  const sortedByDifferential = [...last20Rounds].sort(
    (a, b) => a.differential - b.differential
  );

  // Take best 8 rounds (or all if fewer than 8)
  const countToUse = Math.min(8, sortedByDifferential.length);
  const bestRounds = sortedByDifferential.slice(0, countToUse);

  // Calculate average differential of best rounds (this is the handicap)
  const handicap =
    bestRounds.length > 0
      ? Math.round(
          (bestRounds.reduce((sum, round) => sum + round.differential, 0) /
            bestRounds.length) *
            10
        ) / 10
      : 0;

  return {
    averageScore,
    averageTotal,
    bestRound,
    recentTrend,
    handicap,
  };
}

/**
 * Generates a set of dummy rounds for testing and demo purposes.
 *
 * IMPORTANT: This function will only be used when the USE_DUMMY_DATA flag
 * in src/utils/storage.ts is set to true. By default, it's set to false.
 *
 * To enable dummy data generation:
 * 1. Open src/utils/storage.ts
 * 2. Change USE_DUMMY_DATA from false to true
 * 3. Restart the app
 *
 * This will generate 40 rounds total:
 * - 10 Indoor 9-hole rounds
 * - 10 Indoor 18-hole rounds
 * - 10 Outdoor 9-hole rounds
 * - 10 Outdoor 18-hole rounds
 *
 * @returns {Round[]} An array of generated dummy rounds
 */
export function generateDummyRounds(): Round[] {
  const rounds: Round[] = [];

  // Generate 10 rounds for each of the 4 combinations (40 total)
  // 1. Indoor 9 holes - 10 rounds
  const indoor9Rounds = generateRoundsWithConfig(
    "Indoor",
    9,
    10,
    Date.now() - 40 * 24 * 60 * 60 * 1000
  );

  // 2. Indoor 18 holes - 10 rounds
  const indoor18Rounds = generateRoundsWithConfig(
    "Indoor",
    18,
    10,
    Date.now() - 30 * 24 * 60 * 60 * 1000
  );

  // 3. Outdoor 9 holes - 10 rounds
  const outdoor9Rounds = generateRoundsWithConfig(
    "Outdoor",
    9,
    10,
    Date.now() - 20 * 24 * 60 * 60 * 1000
  );

  // 4. Outdoor 18 holes - 10 rounds
  const outdoor18Rounds = generateRoundsWithConfig(
    "Outdoor",
    18,
    10,
    Date.now() - 10 * 24 * 60 * 60 * 1000
  );

  // Combine all rounds
  rounds.push(
    ...indoor9Rounds,
    ...indoor18Rounds,
    ...outdoor9Rounds,
    ...outdoor18Rounds
  );

  // Sort rounds by date (newest first)
  return rounds.sort((a, b) => b.date - a.date);
}

// Helper function to generate a weighted random score difference from par
// Using the exact percentages: 55% par, 20% birdie, 15% bogey, 5% albatross, 5% double bogey
function getWeightedRandomScoreDiff(courseMode: "Indoor" | "Outdoor"): number {
  const rand = Math.random();

  // Use the same distribution for both Indoor and Outdoor now
  if (rand < 0.05) return -2; // 5% chance of albatross (2 under par)
  if (rand < 0.25) return -1; // 20% chance of birdie (1 under par)
  if (rand < 0.8) return 0; // 55% chance of par
  if (rand < 0.95) return 1; // 15% chance of bogey (1 over par)
  return 2; // 5% chance of double bogey (2 over par)
}

function generateRoundsWithConfig(
  courseMode: "Indoor" | "Outdoor",
  holeCount: 9 | 18,
  count: number,
  startDate: number
): Round[] {
  const rounds: Round[] = [];

  for (let i = 0; i < count; i++) {
    // Space rounds out by 1 day each to prevent bunching
    const dayOffset = i;
    const date = startDate + dayOffset * 24 * 60 * 60 * 1000;

    // Create a new round using the pre-generated courses
    const round = createNewRound(courseMode, holeCount);

    // Set the date
    round.date = date;

    // If we're using a historical date for the round, make sure the ID is still unique
    // by keeping the random part but using the historical date
    round.id = `${date}_${round.id.split("_")[1]}`;

    // Add realistic scores to each hole
    let totalScore = 0;
    round.course.holes.forEach((hole) => {
      // Generate a score based on hole par and course mode
      const scoreDiff = getWeightedRandomScoreDiff(courseMode);
      const score = Math.max(1, hole.par + scoreDiff);

      // Update the hole score
      hole.score = score;
      totalScore += score;
    });

    // Update round totals
    round.totalScore = totalScore;
    round.differential = totalScore - round.course.totalPar;
    round.completed = true;

    rounds.push(round);
  }

  return rounds;
}
