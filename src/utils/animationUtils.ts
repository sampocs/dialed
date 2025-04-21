/**
 * Animation utility functions for use across the application
 * Provides common animation sequences and easing functions
 */
import { Animated, Easing } from "react-native";

/**
 * Fades in an element with optional scaling and translation
 *
 * @param opacity Animated.Value for opacity
 * @param scale Optional Animated.Value for scale
 * @param translateY Optional Animated.Value for vertical translation
 * @param duration Animation duration in milliseconds
 * @param callback Optional callback to run when animation completes
 */
export function fadeIn(
  opacity: Animated.Value,
  scale?: Animated.Value,
  translateY?: Animated.Value,
  duration: number = 300,
  callback?: () => void
) {
  const animations = [
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }),
  ];

  if (scale) {
    animations.push(
      Animated.timing(scale, {
        toValue: 1,
        duration,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      })
    );
  }

  if (translateY) {
    animations.push(
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    );
  }

  Animated.parallel(animations).start(callback);
}

/**
 * Fades out an element with optional scaling and translation
 *
 * @param opacity Animated.Value for opacity
 * @param scale Optional Animated.Value for scale
 * @param translateY Optional Animated.Value for vertical translation
 * @param duration Animation duration in milliseconds
 * @param callback Optional callback to run when animation completes
 */
export function fadeOut(
  opacity: Animated.Value,
  scale?: Animated.Value,
  translateY?: Animated.Value,
  duration: number = 300,
  callback?: () => void
) {
  const animations = [
    Animated.timing(opacity, {
      toValue: 0,
      duration,
      useNativeDriver: true,
    }),
  ];

  if (scale) {
    animations.push(
      Animated.timing(scale, {
        toValue: 0.5,
        duration,
        useNativeDriver: true,
      })
    );
  }

  if (translateY) {
    animations.push(
      Animated.timing(translateY, {
        toValue: 50,
        duration,
        useNativeDriver: true,
      })
    );
  }

  Animated.parallel(animations).start(callback);
}

/**
 * Creates an elastic pop-in animation, good for emphasizing UI elements
 *
 * @param opacity Animated.Value for opacity
 * @param scale Animated.Value for scale
 * @param duration Animation duration in milliseconds
 * @param callback Optional callback to run when animation completes
 */
export function popIn(
  opacity: Animated.Value,
  scale: Animated.Value,
  duration: number = 300,
  callback?: () => void
) {
  Animated.parallel([
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }),
    Animated.timing(scale, {
      toValue: 1,
      duration,
      easing: Easing.elastic(1.2),
      useNativeDriver: true,
    }),
  ]).start(callback);
}

/**
 * Sets initial values for a fade-in animation with vertical slide
 *
 * @param opacity Animated.Value for opacity
 * @param scale Animated.Value for scale
 * @param translateY Animated.Value for vertical translation
 * @param isMovingUp Whether the element should appear moving up (true) or down (false)
 */
export function setFadeInStartValues(
  opacity: Animated.Value,
  scale: Animated.Value,
  translateY: Animated.Value,
  isMovingUp: boolean = true
) {
  opacity.setValue(0);
  scale.setValue(0.7);
  translateY.setValue(isMovingUp ? 50 : -50);
}

/**
 * Animated sequence that fades between two elements
 * Fades out one element while fading in another
 *
 * @param fadeOutElem Animated.Value for the element to fade out
 * @param fadeInElem Animated.Value for the element to fade in
 * @param outDuration Duration of fade out animation
 * @param inDuration Duration of fade in animation
 * @param inDelay Delay before starting fade in
 * @param callback Optional callback to run when sequence completes
 */
export function crossFade(
  fadeOutElem: Animated.Value,
  fadeInElem: Animated.Value,
  outDuration: number = 200,
  inDuration: number = 300,
  inDelay: number = 100,
  callback?: () => void
) {
  Animated.sequence([
    Animated.timing(fadeOutElem, {
      toValue: 0,
      duration: outDuration,
      useNativeDriver: true,
    }),
    Animated.delay(inDelay),
    Animated.timing(fadeInElem, {
      toValue: 1,
      duration: inDuration,
      useNativeDriver: true,
    }),
  ]).start(callback);
}
