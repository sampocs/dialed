/**
 * Utility functions for working with scores and formatting scoring data
 * Used across multiple components in the application
 */

/**
 * Formats a score differential with appropriate sign (+ or -)
 *
 * @param diff The score differential to format
 * @returns Formatted string with sign, or 'E' for even par
 */
export function formatDifferential(diff: number): string {
  if (diff === 0) return "E";
  return diff > 0 ? `+${diff}` : `${diff}`;
}

/**
 * Gets the appropriate term for a score relative to par
 *
 * @param scoreDiff Score differential (score - par)
 * @returns String describing the score (Birdie, Eagle, etc.)
 */
export function getScoreResultText(scoreDiff: number): string {
  if (scoreDiff === 0) return "Par";
  if (scoreDiff === 1) return "Bogey";
  if (scoreDiff === 2) return "Double Bogey";
  if (scoreDiff > 2) return "Triple+";
  if (scoreDiff === -1) return "Birdie!";
  if (scoreDiff === -2) return "Eagle!";
  if (scoreDiff < -2) return "Albatross!";
  return "";
}

/**
 * Checks if a score represents a hole-in-one
 *
 * @param score The score value (should be 1)
 * @param par The par value for the hole
 * @returns True if this is a hole-in-one
 */
export function isHoleInOne(score: number, par: number): boolean {
  return score === 1 && par > 1;
}

/**
 * Checks if a score represents a birdie or better (but not a hole-in-one)
 *
 * @param score The score value
 * @param par The par value for the hole
 * @returns True if this is a birdie or better (but not a hole-in-one)
 */
export function isBirdieOrBetter(score: number, par: number): boolean {
  return score < par && !isHoleInOne(score, par);
}

/**
 * Calculate the remaining holes to be played
 *
 * @param completedHolesCount Number of holes with scores
 * @param totalHolesCount Total number of holes in the round
 * @returns Number of remaining holes to play
 */
export function getRemainingHolesCount(
  completedHolesCount: number,
  totalHolesCount: number
): number {
  return totalHolesCount - completedHolesCount;
}

/**
 * Formats a date for display in the UI
 *
 * @param timestamp Date timestamp in milliseconds
 * @returns Formatted date string in format 'MMM DD, YYYY'
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Calculate the total score for completed holes
 *
 * @param holes Array of holes with optional scores
 * @returns Total score for all completed holes
 */
export function calculateCompletedHolesScore(
  holes: Array<{ score?: number }>
): number {
  return holes.reduce((sum, hole) => sum + (hole.score || 0), 0);
}

/**
 * Calculate the total par for completed holes
 *
 * @param holes Array of holes with par values and optional scores
 * @returns Total par for all completed holes
 */
export function calculateCompletedHolesPar(
  holes: Array<{ par: number; score?: number }>
): number {
  return holes
    .filter((hole) => hole.score !== undefined)
    .reduce((sum, hole) => sum + hole.par, 0);
}

/**
 * Get a set of hole numbers that have been scored
 *
 * @param holes Array of holes with optional scores
 * @returns Set of hole numbers (1-based) that have been scored
 */
export function getScoredHolesSet(
  holes: Array<{ number: number; score?: number }>
): Set<number> {
  return new Set(
    holes.filter((hole) => hole.score !== undefined).map((hole) => hole.number)
  );
}
