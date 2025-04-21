/**
 * UI utility functions for responsive layouts and common UI operations
 */
import { Dimensions, Platform, PixelRatio, ScaledSize } from "react-native";

/**
 * Device window dimensions
 */
export const WINDOW = Dimensions.get("window");

/**
 * Screen dimensions
 */
export const SCREEN = Dimensions.get("screen");

/**
 * App design guideline sizes
 */
const BASE_DIMENSIONS = {
  /** Base width from design (iPhone 12 width in points) */
  WIDTH: 390,
  /** Base height from design (iPhone 12 height in points) */
  HEIGHT: 844,
};

/**
 * Scales a size based on the screen width
 *
 * @param size Size in design points to scale
 * @returns Scaled size
 */
export function widthPercentageToDP(size: number): number {
  const screenWidth = WINDOW.width;
  const widthPercent = (size / BASE_DIMENSIONS.WIDTH) * 100;
  return PixelRatio.roundToNearestPixel((screenWidth * widthPercent) / 100);
}

/**
 * Scales a size based on the screen height
 *
 * @param size Size in design points to scale
 * @returns Scaled size
 */
export function heightPercentageToDP(size: number): number {
  const screenHeight = WINDOW.height;
  const heightPercent = (size / BASE_DIMENSIONS.HEIGHT) * 100;
  return PixelRatio.roundToNearestPixel((screenHeight * heightPercent) / 100);
}

/**
 * Scales a size proportionally for both dimensions
 *
 * @param size Size in design points to scale
 * @returns Scaled size
 */
export function responsiveSize(size: number): number {
  const scale = Math.min(
    WINDOW.width / BASE_DIMENSIONS.WIDTH,
    WINDOW.height / BASE_DIMENSIONS.HEIGHT
  );
  return Math.round(size * scale);
}

/**
 * Responsive font size calculation
 *
 * @param size Font size in design points
 * @returns Responsive font size
 */
export function responsiveFontSize(size: number): number {
  const scale = Math.min(
    WINDOW.width / BASE_DIMENSIONS.WIDTH,
    WINDOW.height / BASE_DIMENSIONS.HEIGHT
  );
  const newSize = size * scale;

  // Cap the font scaling on smaller devices
  if (Platform.OS === "ios") {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
}

/**
 * Checks if the device is an iPad
 *
 * @returns True if the device is an iPad
 */
export function isIpad(): boolean {
  const { width, height } = SCREEN;
  return (
    Platform.OS === "ios" && !Platform.isPad && (width > 750 || height > 750)
  );
}

/**
 * Checks if the device is a tablet based on screen size
 *
 * @returns True if the device is a tablet
 */
export function isTablet(): boolean {
  const { width, height } = SCREEN;
  const screenSize = Math.sqrt(width * height) / 160;
  return screenSize >= 7;
}

/**
 * Checks if the device is in landscape orientation
 *
 * @returns True if the device is in landscape orientation
 */
export function isLandscape(): boolean {
  return WINDOW.width > WINDOW.height;
}

/**
 * Subscribes to dimension changes
 *
 * @param callback Function to call when dimensions change
 * @returns Subscription object that should be removed on cleanup
 */
export function listenToOrientationChanges(
  callback: (dimensions: { window: ScaledSize; screen: ScaledSize }) => void
) {
  return Dimensions.addEventListener("change", ({ window, screen }) => {
    callback({ window, screen });
  });
}

/**
 * Formats a number for display with specified precision
 *
 * @param value Number to format
 * @param precision Number of decimal places (default: 1)
 * @returns Formatted number as string
 */
export function formatNumber(value: number, precision: number = 1): string {
  return value.toFixed(precision);
}
