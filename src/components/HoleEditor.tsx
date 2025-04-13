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
  Easing
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Round } from '../types';
import Scorecard from './Scorecard';

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
  
  // Animation values
  const popupOpacity = useRef(new Animated.Value(0)).current;
  const popupScale = useRef(new Animated.Value(0.5)).current;
  const parDistanceOpacity = useRef(new Animated.Value(1)).current;

  const handleScoreSelect = (score: number) => {
    const hole = round.course.holes[currentHole - 1];
    
    // If the current score is already set to this value, unselect it
    if (hole.score === score) {
      onUpdateScore(currentHole, undefined);
      return;
    }
    
    // Set the score
    onUpdateScore(currentHole, score);
    
    // Determine the score result text
    const scoreDiff = score - hole.par;
    let resultText = '';
    
    if (scoreDiff === 0) resultText = 'Par';
    else if (scoreDiff === 1) resultText = 'Bogey';
    else if (scoreDiff === 2) resultText = 'Double Bogey';
    else if (scoreDiff > 2) resultText = 'Triple+';
    else if (scoreDiff === -1) resultText = 'Birdie';
    else if (scoreDiff === -2) resultText = 'Eagle';
    else if (scoreDiff < -2) resultText = 'Albatross';
    
    // Display score result
    setScoreResult(resultText);
    
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
        
        // Auto-navigate to next hole if not on the last hole
        if (!isEditMode && currentHole < round.course.holeCount) {
          handleNavigateHole('next');
        }
      });
    }, 1200);
  };

  const handleNavigateHole = (direction: 'prev' | 'next') => {
    const maxHole = round.course.holeCount;
    
    if (direction === 'prev' && currentHole > 1) {
      setCurrentHole(currentHole - 1);
    } else if (direction === 'next' && currentHole < maxHole) {
      setCurrentHole(currentHole + 1);
    }
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

  // Calculate the total score and differential
  const calculateScoreDetails = () => {
    // Get completed holes (holes with a score)
    const completedHoles = round.course.holes.filter(hole => hole.score !== undefined);
    
    // Calculate total par for completed holes only
    const completedHolesPar = completedHoles.reduce((sum, hole) => sum + hole.par, 0);
    
    // Calculate total score for completed holes only
    const completedHolesScore = completedHoles.reduce((sum, hole) => sum + (hole.score || 0), 0);
    
    // Calculate differential based on completed holes only
    const differential = completedHolesScore - completedHolesPar;
    
    return { totalScore: completedHolesScore, differential };
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
          <Text style={styles.holeNumber}>Hole #{currentHole}</Text>
          
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