import { Course, Hole, Round } from "../types";
import coursesDataRaw from "./courses.json";
import {
  INDOOR_DISTANCES,
  OUTDOOR_DISTANCES,
  COURSE_CONFIG,
  STATS_CONFIG,
} from "./constants";

/**
 * Type assertion to ensure the JSON data matches our Course type
 * This converts raw course data from JSON to properly typed Course objects
 */
const coursesData: { [courseName: string]: Course } = Object.entries(
  coursesDataRaw
).reduce((acc, [name, course]) => {
  // Ensure the par property in each hole is properly typed as 1 | 2 | 3 | 4
  const typedCourse: Course = {
    ...course,
    holes: course.holes.map((hole) => ({
      ...hole,
      par: hole.par as 1 | 2 | 3 | 4,
    })),
    courseMode: course.courseMode as "Indoor" | "Outdoor",
    holeCount: course.holeCount as 9 | 18,
  };

  acc[name] = typedCourse;
  return acc;
}, {} as { [courseName: string]: Course });

/** List of all available outdoor course names */
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

/** List of all available indoor course names */
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

/** Map to store pre-generated courses loaded from JSON */
export const PRE_GENERATED_COURSES: {
  [courseName: string]: Course;
} = coursesData;

/**
 * Initializes all courses with fixed layouts from the courses.json file
 * Logs verification info to console
 */
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

/**
 * Creates a shuffled copy of an array
 * @param array The array to shuffle
 * @returns A new shuffled array
 */
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

/**
 * Gets a random distance for an indoor hole based on par
 * @param par The par value for the hole
 * @returns A random appropriate distance in feet
 */
function getRandomIndoorDistance(par: number): number {
  if (par === 3) return INDOOR_DISTANCES.PAR_3;
  const distances = par === 1 ? INDOOR_DISTANCES.PAR_1 : INDOOR_DISTANCES.PAR_2;
  return distances[Math.floor(Math.random() * distances.length)];
}

/**
 * Gets a random distance for an outdoor hole based on par
 * @param par The par value for the hole
 * @returns A random appropriate distance in yards
 */
function getRandomOutdoorDistance(par: number): number {
  if (par === 4) return OUTDOOR_DISTANCES.PAR_4;
  const distances =
    par === 2 ? OUTDOOR_DISTANCES.PAR_2 : OUTDOOR_DISTANCES.PAR_3;
  return distances[Math.floor(Math.random() * distances.length)];
}

/**
 * Generates a template for an indoor 9-hole section
 * @returns An array of par values for 9 holes
 */
function generateIndoorNineTemplate(): number[] {
  return COURSE_CONFIG.INDOOR_NINE_TEMPLATE;
}

/**
 * Generates a template for an outdoor 9-hole section
 * @returns An array of par values for 9 holes
 */
function generateOutdoorNineTemplate(): number[] {
  return COURSE_CONFIG.OUTDOOR_NINE_TEMPLATE;
}

/**
 * Generates a new course with randomly arranged holes
 * Note: This function is primarily used for testing or creating new course templates
 * and is not used during normal gameplay since courses are loaded from courses.json
 *
 * @param holeCount Number of holes in the course (9 or 18)
 * @param courseMode Whether the course is indoor or outdoor
 * @returns A new Course object
 */
export function generateCourse(
  holeCount: 9 | 18 = COURSE_CONFIG.DEFAULT_HOLE_COUNT,
  courseMode: "Indoor" | "Outdoor" = COURSE_CONFIG.DEFAULT_MODE
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
    par: par as 1 | 2 | 3 | 4,
    distance: getDistance(par),
  }));

  // Calculate totals
  const frontNineHoles = holes.slice(0, COURSE_CONFIG.FRONT_NINE_COUNT);
  const backNineHoles =
    holeCount === 18 ? holes.slice(COURSE_CONFIG.FRONT_NINE_COUNT) : [];

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

/**
 * Creates a new round with either a specific course or a random one
 *
 * @param courseMode Whether to use an indoor or outdoor course
 * @param holeCount Number of holes to play (9 or 18)
 * @param specificCourseName Optional name of a specific course to use
 * @returns A new Round object ready to be played
 */
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

/**
 * Updates the score for a specific hole in a round
 *
 * @param round The round to update
 * @param holeNumber The hole number to update the score for
 * @param score The new score value, or undefined to clear the score
 * @returns A new Round object with the updated score and recalculated totals
 */
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

/**
 * Validates if a score is within reasonable limits for a given par
 *
 * @param par The par value of the hole
 * @param score The score to validate
 * @returns True if the score is valid for the given par
 */
export function isValidScore(par: number, score: number): boolean {
  if (par === 1) return score >= 1 && score <= 3;
  if (par === 4) return score >= 1 && score <= 6; // For par 4, allow up to double bogey
  return score >= 1 && score <= 4; // For par 2 and par 3
}

/**
 * Calculates various statistics from a collection of rounds
 *
 * @param rounds Array of rounds to analyze
 * @returns Object containing average score, best round, trends, and handicap
 */
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

  // Calculate trend using last N rounds
  const recentRounds = completedRounds
    .sort((a, b) => b.date - a.date)
    .slice(0, STATS_CONFIG.TREND_ROUND_COUNT);

  const recentTrend =
    recentRounds.length > 1
      ? (recentRounds[0].differential -
          recentRounds[recentRounds.length - 1].differential) /
        recentRounds.length
      : 0;

  // Calculate handicap based on best rounds from recent rounds
  const sortedByDate = [...completedRounds].sort((a, b) => b.date - a.date);
  const recentRoundsForHandicap = sortedByDate.slice(
    0,
    STATS_CONFIG.HANDICAP_MAX_ROUNDS
  );
  const sortedByDifferential = [...recentRoundsForHandicap].sort(
    (a, b) => a.differential - b.differential
  );

  // Take best N rounds (or all if fewer than N)
  const countToUse = Math.min(
    STATS_CONFIG.HANDICAP_BEST_COUNT,
    sortedByDifferential.length
  );
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

/**
 * Generates a random score differential based on course mode
 * Used for creating realistic dummy data
 *
 * @param courseMode The course mode (Indoor/Outdoor)
 * @returns A weighted random score differential
 */
function getWeightedRandomScoreDiff(courseMode: "Indoor" | "Outdoor"): number {
  // Different score distribution based on course mode
  const weights =
    courseMode === "Indoor"
      ? [0.05, 0.1, 0.25, 0.3, 0.2, 0.1] // Indoor weight distribution
      : [0.02, 0.08, 0.15, 0.3, 0.3, 0.15]; // Outdoor weight distribution

  const values = [-2, -1, 0, 1, 2, 3]; // Possible score differentials (per hole)

  // Random selection based on weights
  const random = Math.random();
  let cumulativeWeight = 0;

  for (let i = 0; i < weights.length; i++) {
    cumulativeWeight += weights[i];
    if (random < cumulativeWeight) {
      return values[i];
    }
  }

  return values[values.length - 1]; // Default to last value if something goes wrong
}

/**
 * Generates a set of rounds with specific configuration
 * Helper function for generateDummyRounds
 *
 * @param courseMode Indoor or Outdoor
 * @param holeCount 9 or 18 holes
 * @param count Number of rounds to generate
 * @param startDate Starting timestamp for the generated rounds
 * @returns Array of generated rounds
 */
function generateRoundsWithConfig(
  courseMode: "Indoor" | "Outdoor",
  holeCount: 9 | 18,
  count: number,
  startDate: number
): Round[] {
  const rounds: Round[] = [];
  const dayInMs = 24 * 60 * 60 * 1000;

  // Get all courses for this mode
  const courseNames =
    courseMode === "Indoor" ? INDOOR_COURSES : OUTDOOR_COURSES;

  for (let i = 0; i < count; i++) {
    // Use a different course for each round, cycling through available courses
    const courseName = courseNames[i % courseNames.length];

    // Create a new round
    const round = createNewRound(courseMode, holeCount, courseName);

    // Set date (spread out over time)
    round.date = startDate + i * dayInMs;

    // Randomly generate scores for each hole
    let totalScore = 0;
    round.course.holes.forEach((hole) => {
      // Generate a random score differential for this hole
      const scoreDiff = getWeightedRandomScoreDiff(courseMode);
      const score = hole.par + scoreDiff;

      // Ensure score is at least 1
      const finalScore = Math.max(1, score);

      // Update the hole's score
      hole.score = finalScore;
      totalScore += finalScore;
    });

    // Update round totals
    round.totalScore = totalScore;
    round.differential = totalScore - round.course.totalPar;
    round.completed = true;

    rounds.push(round);
  }

  return rounds;
}
