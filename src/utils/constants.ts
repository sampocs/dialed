/**
 * Application constants for use throughout the app
 * Centralizes configuration values to make them easier to maintain
 */

/**
 * Timing constants for animations and transitions
 */
export const TIMING = {
  /** Standard animation duration (300ms) */
  STANDARD_ANIMATION: 300,
  /** Fast animation duration (200ms) */
  FAST_ANIMATION: 200,
  /** Slow animation duration (500ms) */
  SLOW_ANIMATION: 500,
  /** Very slow animation duration (800ms) */
  VERY_SLOW_ANIMATION: 800,
  /** Score popup display duration (1000ms) */
  SCORE_POPUP_DURATION: 1000,
  /** Screen lock timeout duration (2 minutes) */
  SCREEN_LOCK_TIMEOUT: 120000,
};

/**
 * Distances for different par values in indoor mode (feet)
 */
export const INDOOR_DISTANCES = {
  /** Distances for par 1 holes (2.5-4 feet) */
  PAR_1: [2.5, 3, 3.5, 4],
  /** Distances for par 2 holes (4.5-7.5 feet) */
  PAR_2: [4.5, 5, 5.5, 6, 6.5, 7, 7.5],
  /** Distance for par 3 holes (10 feet) */
  PAR_3: 10,
};

/**
 * Distances for different par values in outdoor mode (yards)
 */
export const OUTDOOR_DISTANCES = {
  /** Distances for par 2 holes (10-15 yards) */
  PAR_2: [10, 15],
  /** Distances for par 3 holes (20-35 yards) */
  PAR_3: [20, 25, 30, 35],
  /** Distance for par 4 holes (40 yards) */
  PAR_4: 40,
};

/**
 * Score result text for different differentials
 */
export const SCORE_RESULTS = {
  /** Text for different score differentials */
  TEXTS: {
    "-3": "Albatross!",
    "-2": "Eagle!",
    "-1": "Birdie!",
    "0": "Par",
    "1": "Bogey",
    "2": "Double Bogey",
    "3+": "Triple+",
  },
  /** Classes for different score types */
  TYPES: {
    HOLE_IN_ONE: "hole-in-one",
    EAGLE_OR_BETTER: "eagle-or-better",
    BIRDIE: "birdie",
    PAR: "par",
    BOGEY: "bogey",
    DOUBLE_BOGEY_OR_WORSE: "double-bogey-or-worse",
  },
};

/**
 * Course configuration values
 */
export const COURSE_CONFIG = {
  /** Default course mode */
  DEFAULT_MODE: "Indoor" as "Indoor" | "Outdoor",
  /** Default hole count */
  DEFAULT_HOLE_COUNT: 18 as 9 | 18,
  /** Number of holes in front nine */
  FRONT_NINE_COUNT: 9,
  /** Indoor par distribution for 9 holes */
  INDOOR_NINE_TEMPLATE: [
    ...Array(2).fill(1), // 2 par 1s
    ...Array(5).fill(2), // 5 par 2s
    ...Array(2).fill(3), // 2 par 3s
  ],
  /** Outdoor par distribution for 9 holes */
  OUTDOOR_NINE_TEMPLATE: [
    ...Array(2).fill(2), // 2 par 2s
    ...Array(6).fill(3), // 6 par 3s
    ...Array(1).fill(4), // 1 par 4
  ],
};

/**
 * Statistics configuration
 */
export const STATS_CONFIG = {
  /** Number of recent rounds to use for trend calculation */
  TREND_ROUND_COUNT: 5,
  /** Maximum number of rounds to consider for handicap */
  HANDICAP_MAX_ROUNDS: 20,
  /** Number of best rounds to use when calculating handicap */
  HANDICAP_BEST_COUNT: 8,
};
