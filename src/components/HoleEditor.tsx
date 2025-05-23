import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  Animated,
  Easing,
  Dimensions
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Round } from '../types';
import Scorecard from './Scorecard';
import { 
  formatDifferential, 
  getScoreResultText, 
  isHoleInOne, 
  isBirdieOrBetter, 
  getRemainingHolesCount,
  getScoredHolesSet
} from '../utils/scoreUtils';

interface HoleEditorProps {
  round: Round;
  isEditMode?: boolean;
  onUpdateScore: (holeNumber: number, score: number | undefined) => void;
  onQuit: () => void;
  onComplete?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  hasChanges?: boolean;
}

/**
 * HoleEditor component for editing scores during a round
 * Provides UI for selecting scores, navigating between holes, and viewing the scorecard
 */
export default function HoleEditor({
  round,
  isEditMode = false,
  onUpdateScore,
  onQuit,
  onComplete,
  onSave,
  onCancel,
  hasChanges = false
}: HoleEditorProps) {
  const [currentHole, setCurrentHole] = useState(1);
  const [showScorecard, setShowScorecard] = useState(false);
  const [scoreResult, setScoreResult] = useState<string | null>(null);
  const [scoredHoles, setScoredHoles] = useState<Set<number>>(
    getScoredHolesSet(round.course.holes)
  );
  const [fireBirdieConfetti, setFireBirdieConfetti] = useState(false);
  const [fireHoleInOneConfetti, setFireHoleInOneConfetti] = useState(false);
  
  // References for confetti cannons
  const birdieConfettiRef = useRef<ConfettiCannon>(null);
  const holeInOneConfettiRef = useRef<ConfettiCannon>(null);
  
  // Animation values
  const popupOpacity = useRef(new Animated.Value(0)).current;
  const popupScale = useRef(new Animated.Value(0.5)).current;
  const parDistanceOpacity = useRef(new Animated.Value(1)).current;
  const holeNumberOpacity = useRef(new Animated.Value(1)).current;
  const holeNumberScale = useRef(new Animated.Value(1)).current;
  const holeNumberTranslateY = useRef(new Animated.Value(0)).current;
  
  // For tracking previous hole to determine animation direction
  const prevHoleRef = useRef(currentHole);
  
  // Animate hole number change when currentHole changes
  useEffect(() => {
    if (prevHoleRef.current === currentHole) return;
    
    const isForward = currentHole > prevHoleRef.current;
    const startValue = isForward ? 50 : -50;
    
    // Set starting values for animation
    holeNumberOpacity.setValue(0);
    holeNumberScale.setValue(0.7);
    holeNumberTranslateY.setValue(startValue);
    
    // Run entrance animation
    Animated.parallel([
      Animated.timing(holeNumberOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(holeNumberScale, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(holeNumberTranslateY, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    ]).start();
    
    prevHoleRef.current = currentHole;
  }, [currentHole]);

  // Check for skipped holes
  const checkForSkippedHoles = (holeNumber: number): number | null => {
    // Don't check in edit mode
    if (isEditMode) return null;
    
    // Check all previous holes to see if any were skipped
    for (let i = 1; i < holeNumber; i++) {
      if (!scoredHoles.has(i)) {
        return i;
      }
    }
    
    return null;
  };

  const handleScoreSelect = (score: number) => {
    const hole = round.course.holes[currentHole - 1];
    
    // Check for skipped holes
    const skippedHole = checkForSkippedHoles(currentHole);
    if (skippedHole !== null) {
      // Error haptic feedback for skipped hole alert
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      Alert.alert(
        'Skipped Hole',
        `You need to score hole #${skippedHole} before continuing.`,
        [{ text: 'OK' }]
      );
      setCurrentHole(skippedHole);
      return;
    }
    
    // Check if this is the first time scoring this hole
    const isFirstTimeScoring = !scoredHoles.has(currentHole);
    
    // If the current score is already set to this value, unselect it
    if (hole.score === score) {
      // Light haptic feedback for deselection
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      onUpdateScore(currentHole, undefined);
      // Remove from scored holes
      const newScoredHoles = new Set(scoredHoles);
      newScoredHoles.delete(currentHole);
      setScoredHoles(newScoredHoles);
      return;
    }
    
    // Set the score
    onUpdateScore(currentHole, score);
    
    // Add to scored holes
    const newScoredHoles = new Set(scoredHoles);
    newScoredHoles.add(currentHole);
    setScoredHoles(newScoredHoles);
    
    // Determine the score result text
    const scoreDiff = score - hole.par;
    const resultText = getScoreResultText(scoreDiff);
    
    // Check for special achievements
    const isHoleInOneAchievement = isHoleInOne(score, hole.par);
    const isBirdie = isBirdieOrBetter(score, hole.par);
    
    // Set confetti flags
    if (isHoleInOneAchievement) {
      // Extra intense haptic feedback for hole in one
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 300);
      setFireHoleInOneConfetti(true);
    } else if (isBirdie) {
      setFireBirdieConfetti(true);
    }
    
    // Provide appropriate haptic feedback based on score
    if (scoreDiff < 0 && !isHoleInOneAchievement) {
      // Success feedback for under par
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (scoreDiff === 0) {
      // Medium impact for par
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      // Light impact for over par
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Display score result
    setScoreResult(resultText);
    
    // Reset confetti flags after a delay
    setTimeout(() => {
      setFireBirdieConfetti(false);
      setFireHoleInOneConfetti(false);
    }, 2000);
    
    // Start animations - fade out par and distance text, fade in popup
    popupOpacity.setValue(0);
    popupScale.setValue(0.5);
    
    Animated.parallel([
      // Fade out par and distance
      Animated.timing(parDistanceOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      // Fade in and scale up popup
      Animated.timing(popupOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(popupScale, {
        toValue: 1,
        duration: 300,
        easing: Easing.elastic(1.2),
        useNativeDriver: true,
      })
    ]).start();
    
    // Fade out animation after 1 second
    setTimeout(() => {
      Animated.parallel([
        // Fade out popup
        Animated.timing(popupOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        // Fade in par and distance
        Animated.timing(parDistanceOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        setScoreResult(null);
        
        // Auto-navigate to next hole ONLY if this is the first time scoring this hole
        // and we're not in edit mode and we're not on the last hole
        if (isFirstTimeScoring && !isEditMode && currentHole < round.course.holeCount) {
          setCurrentHole(currentHole + 1);
        }
      });
    }, 1000);
  };

  const handleNavigateHole = (direction: 'prev' | 'next') => {
    const maxHole = round.course.holeCount;
    
    // First animate current hole number out
    Animated.parallel([
      Animated.timing(holeNumberOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(holeNumberScale, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(holeNumberTranslateY, {
        toValue: direction === 'next' ? -50 : 50,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      // Then update the hole number state
      if (direction === 'prev' && currentHole > 1) {
        setCurrentHole(currentHole - 1);
      } else if (direction === 'next' && currentHole < maxHole) {
        setCurrentHole(currentHole + 1);
      }
    });
  };

  const handleQuit = () => {
    if (isEditMode && hasChanges && onCancel) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: onCancel },
        ]
      );
    } else if (!isEditMode) {
      Alert.alert(
        'Quit the game?',
        'Your progress will be lost.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Quit', style: 'destructive', onPress: onQuit },
        ]
      );
    } else {
      onQuit();
    }
  };

  const handleSave = () => {
    if (isEditMode && hasChanges && onSave) {
      Alert.alert(
        'Save Changes',
        'Save changes to this round?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save', onPress: onSave },
        ]
      );
    } else if (isEditMode && onCancel) {
      onCancel(); // Just exit without saving if no changes
    }
  };

  const calculateScoreDetails = () => {
    // Get completed holes (holes with a score)
    const completedHoles = round.course.holes.filter(hole => hole.score !== undefined);
    
    // Calculate remaining holes
    const remainingHoles = getRemainingHolesCount(completedHoles.length, round.course.holeCount);
    
    // Get the total par for all holes
    const totalPar = round.course.totalPar;
    
    // Calculate total score so far
    let totalScore = 0;
    let totalCompletedPar = 0;
    
    completedHoles.forEach(hole => {
      totalScore += hole.score || 0;
      totalCompletedPar += hole.par;
    });
    
    // Calculate current differential
    const differential = totalScore - totalCompletedPar;
    
    return {
      totalScore,
      differential,
      completedHoles: completedHoles.length,
      remainingHoles,
      formattedDifferential: formatDifferential(differential)
    };
  };

  const currentHoleData = round.course.holes[currentHole - 1];
  const hasScore = currentHoleData.score !== undefined;
  const { totalScore, differential } = calculateScoreDetails();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {isEditMode ? (
          <>
            <TouchableOpacity onPress={handleQuit} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>✕</Text>
            </TouchableOpacity>
            <View style={styles.spacer} />
            <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>✓</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.spacer} />
            <TouchableOpacity onPress={handleQuit} style={styles.quitButton}>
              <Text style={styles.quitButtonText}>✕</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.mainContentWrapper}>
        <View style={styles.scoreInfo}>
          {/* Animated Hole Number */}
          <Animated.View
            style={{
              opacity: holeNumberOpacity,
              transform: [
                { scale: holeNumberScale },
                { translateY: holeNumberTranslateY }
              ]
            }}
          >
            <Text style={styles.holeNumber}>Hole #{currentHole}</Text>
          </Animated.View>
          
          {/* Total Score Display */}
          <View style={styles.totalScoreContainer}>
            <Text style={styles.totalScoreText}>
              Total Score: {totalScore} ({differential >= 0 ? '+' : ''}{differential})
            </Text>
          </View>
          
          {/* Par and distance text that fades out during animation */}
          <Animated.View style={{ opacity: parDistanceOpacity, alignItems: 'center' }}>
            <Text style={styles.parText}>Par {currentHoleData.par}</Text>
            <Text style={styles.distanceText}>
              {currentHoleData.distance} {round.course.courseMode === "Indoor" ? "ft" : "yd"}
            </Text>
          </Animated.View>
        </View>

        {/* Score Result Popup Animation */}
        {scoreResult && (
          <Animated.View 
            style={[
              styles.scoreResultPopup,
              {
                opacity: popupOpacity,
                transform: [{ scale: popupScale }]
              }
            ]}
          >
            <Text style={styles.scoreResultText}>{scoreResult}</Text>
          </Animated.View>
        )}

        {currentHole > 1 && (
          <TouchableOpacity
            onPress={() => handleNavigateHole('prev')}
            style={[styles.overlayNavButton, styles.leftNavButton]}
          >
            <Text style={[styles.navButtonIcon, styles.leftNavIcon, styles.navButtonText]}>←</Text>
          </TouchableOpacity>
        )}
        
        {currentHole < round.course.holeCount && (
          <TouchableOpacity
            onPress={() => handleNavigateHole('next')}
            style={[styles.overlayNavButton, styles.rightNavButton]}
          >
            <Text style={[styles.navButtonIcon, styles.rightNavIcon, styles.navButtonText]}>→</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.navigation}>
        <View style={styles.scoreButtons}>
          {Array.from({ length: currentHoleData.par === 1 ? 3 : 4 }).map(
            (_, index) => (
              <TouchableOpacity
                key={index + 1}
                style={[
                  styles.scoreButton,
                  currentHoleData.score === index + 1 && styles.scoreButtonSelected,
                ]}
                onPress={() => handleScoreSelect(index + 1)}
              >
                <Text style={[
                  styles.scoreButtonText,
                  currentHoleData.score === index + 1 && styles.scoreButtonTextSelected,
                ]}>
                  {index + 1}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </View>

      {!isEditMode && currentHole === round.course.holeCount && hasScore && onComplete && (
        <TouchableOpacity style={styles.submitButton} onPress={onComplete}>
          <Text style={styles.submitButtonText}>Complete Round</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.scorecardButton}
        onPress={() => setShowScorecard(!showScorecard)}
      >
        <Text style={styles.scorecardButtonText}>
          {showScorecard ? 'Hide Scorecard' : 'View Scorecard'}
        </Text>
      </TouchableOpacity>

      {/* Birdie Confetti */}
      {fireBirdieConfetti && (
        <ConfettiCannon
          ref={birdieConfettiRef}
          count={100}
          origin={{ x: Dimensions.get('window').width / 2, y: 0 }}
          autoStart={true}
          fadeOut={true}
          fallSpeed={2500}
          colors={['#93C757', '#FFFFFF', '#303030', '#4A8114', '#354F24']}
        />
      )}
      
      {/* Hole in One Confetti - more intense! */}
      {fireHoleInOneConfetti && (
        <ConfettiCannon
          ref={holeInOneConfettiRef}
          count={200}
          origin={{ x: Dimensions.get('window').width / 2, y: 0 }}
          autoStart={true}
          explosionSpeed={350}
          fallSpeed={3000}
          fadeOut={true}
          colors={['#93C757', '#A6D77B', '#FFFFFF', '#303030', '#4D4D4D']}
        />
      )}

      {/* Scorecard Modal with BlurView */}
      <Modal
        visible={showScorecard}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowScorecard(false)}
      >
        <View style={styles.modalContainer}>
          <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark" />
          
          <View style={styles.scorecardModalContent}>
            <View style={styles.scorecardHeader}>
              <Text style={styles.scorecardTitle}>Scorecard</Text>
              <TouchableOpacity 
                onPress={() => setShowScorecard(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.scorecardScrollView} contentContainerStyle={styles.scorecardContent} scrollEnabled={false}>
              <Scorecard course={round.course} showCourseMode={false} showScores={true} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#292929',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    width: '100%',
    position: 'absolute',
    top: 50,
  },
  spacer: {
    width: 40,
  },
  headerButton: {
    padding: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  quitButton: {
    padding: 10,
  },
  quitButtonText: {
    fontSize: 24,
    color: '#B0B0B0',
  },
  mainContentWrapper: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
    marginTop: 100,
    marginBottom: 30,
  },
  scoreInfo: {
    alignItems: 'center',
    marginBottom: 50,
  },
  holeNumber: {
    fontSize: 54,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  totalScoreContainer: {
    marginBottom: 60,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#3D3D3D',
  },
  totalScoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  parText: {
    fontSize: 42,
    marginBottom: 20,
    color: '#FFFFFF',
  },
  distanceText: {
    fontSize: 36,
    color: '#B0B0B0',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
    width: '100%',
  },
  scoreButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  scoreButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#93C757',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreButtonSelected: {
    backgroundColor: '#93C757',
  },
  scoreButtonText: {
    fontSize: 28,
    color: '#93C757',
  },
  scoreButtonTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#93C757',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scorecardButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginHorizontal: 20,
  },
  scorecardButtonText: {
    color: '#93C757',
    fontSize: 16,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scorecardModalContent: {
    width: '95%',
    maxHeight: '80%',
    backgroundColor: '#292929',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  scorecardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3D3D3D',
  },
  scorecardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#93C757',
  },
  scorecardScrollView: {
    width: '100%',
  },
  scorecardContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  overlayNavButton: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '25%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  leftNavButton: {
    left: 0,
  },
  rightNavButton: {
    right: 0,
  },
  navButtonIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftNavIcon: {
    position: 'absolute',
    left: 40,
    top: '71%',
    marginTop: -30,
  },
  rightNavIcon: {
    position: 'absolute',
    right: 40,
    top: '71%',
    marginTop: -30,
  },
  navButtonText: {
    fontSize: 42,
    color: '#93C757',
  },
  scoreResultPopup: {
    position: 'absolute',
    top: '59%',  // Fine-tuned position
    backgroundColor: 'rgba(147, 199, 87, 0.9)',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 100,
  },
  scoreResultText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
}); 