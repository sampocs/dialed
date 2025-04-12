import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useApp } from '../context/AppContext';
import { isValidScore } from '../utils/gameLogic';
import Scorecard from '../components/Scorecard';
import { 
  useFonts,
  BebasNeue_400Regular 
} from '@expo-google-fonts/bebas-neue';

export default function PlayScreen() {
  const {
    gameState,
    currentRound,
    startNewGame,
    startRound,
    updateHoleScore,
    completeRound,
    quitGame,
  } = useApp();
  const [currentHole, setCurrentHole] = useState(1);
  const [showScorecard, setShowScorecard] = useState(false);
  const [courseMode, setCourseMode] = useState<"Indoor" | "Outdoor">("Indoor");
  const [holeCount, setHoleCount] = useState<9 | 18>(18);
  
  // Load the Bebas Neue font
  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
  });

  const handleStartNewGame = () => {
    startNewGame(courseMode, holeCount);
  };

  const handleStartRound = () => {
    startRound();
  };

  const handleScoreSelect = (score: number) => {
    if (!currentRound) return;
    const hole = currentRound.course.holes[currentHole - 1];
    
    // If the current score is already set to this value, unselect it
    if (hole.score === score) {
      updateHoleScore(currentHole, undefined);
      return;
    }
    
    if (!isValidScore(hole.par, score)) return;
    updateHoleScore(currentHole, score);
  };

  const handleNavigateHole = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentHole > 1) {
      setCurrentHole(currentHole - 1);
    } else if (direction === 'next' && currentHole < 18) {
      setCurrentHole(currentHole + 1);
    }
  };

  const handleQuit = () => {
    Alert.alert(
      'Quit the game?',
      'Are you sure you want to quit? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Quit', style: 'destructive', onPress: quitGame },
      ]
    );
  };

  const handleComplete = () => {
    Alert.alert(
      'Complete Round',
      'Are you sure you want to complete this round?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Complete', onPress: completeRound },
      ]
    );
  };

  // Function to calculate the current score details
  const calculateScoreDetails = () => {
    if (!currentRound) return { totalScore: 0, differential: 0 };
    
    // Get completed holes (holes with a score)
    const completedHoles = currentRound.course.holes.filter(hole => hole.score !== undefined);
    
    // Calculate total par for completed holes only
    const completedHolesPar = completedHoles.reduce((sum, hole) => sum + hole.par, 0);
    
    // Calculate total score for completed holes only
    const completedHolesScore = completedHoles.reduce((sum, hole) => sum + (hole.score || 0), 0);
    
    // Calculate differential based on completed holes only
    const differential = completedHolesScore - completedHolesPar;
    
    return { totalScore: completedHolesScore, differential };
  };

  if (gameState === 'no-game') {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, fontsLoaded && styles.titleWithCustomFont]}>DIALED</Text>
        
        {/* Mode Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleButton, courseMode === "Indoor" && styles.toggleButtonSelected]} 
            onPress={() => setCourseMode("Indoor")}
          >
            <Text style={[styles.toggleText, courseMode === "Indoor" && styles.toggleTextSelected]}>Indoor</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, courseMode === "Outdoor" && styles.toggleButtonSelected]} 
            onPress={() => setCourseMode("Outdoor")}
          >
            <Text style={[styles.toggleText, courseMode === "Outdoor" && styles.toggleTextSelected]}>Outdoor</Text>
          </TouchableOpacity>
        </View>
        
        {/* Hole Count Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleButton, holeCount === 9 && styles.toggleButtonSelected]} 
            onPress={() => setHoleCount(9)}
          >
            <Text style={[styles.toggleText, holeCount === 9 && styles.toggleTextSelected]}>9 Holes</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, holeCount === 18 && styles.toggleButtonSelected]} 
            onPress={() => setHoleCount(18)}
          >
            <Text style={[styles.toggleText, holeCount === 18 && styles.toggleTextSelected]}>18 Holes</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.button} onPress={handleStartNewGame}>
          <Text style={styles.buttonText}>New Game</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (gameState === 'game-ready' && currentRound) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.spacer} />
          <TouchableOpacity onPress={handleQuit} style={styles.quitButton}>
            <Text style={styles.quitButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.titleSmall}>{currentRound.courseName}</Text>
        
        <View style={styles.scorecardContainer}>
          <Scorecard course={currentRound.course} />
        </View>
        
        <TouchableOpacity style={[styles.button, styles.startRoundButton]} onPress={handleStartRound}>
          <Text style={styles.buttonText}>Start Round</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentRound) return null;

  const currentHoleData = currentRound.course.holes[currentHole - 1];
  const isLastHole = currentHole === 18;
  const hasScore = currentHoleData.score !== undefined;
  const { totalScore, differential } = calculateScoreDetails();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.spacer} />
        <TouchableOpacity onPress={handleQuit} style={styles.quitButton}>
          <Text style={styles.quitButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mainContentWrapper}>
        <View style={styles.scoreInfo}>
          <Text style={styles.holeNumber}>Hole #{currentHole}</Text>
          
          {/* Total Score Display - moved here */}
          <View style={styles.totalScoreContainer}>
            <Text style={styles.totalScoreText}>
              Total Score: {totalScore} ({differential >= 0 ? '+' : ''}{differential})
            </Text>
          </View>
          
          <Text style={styles.parText}>Par {currentHoleData.par}</Text>
          <Text style={styles.distanceText}>{currentHoleData.distance} ft</Text>
        </View>

        {currentHole > 1 && (
          <TouchableOpacity
            onPress={() => handleNavigateHole('prev')}
            style={[styles.overlayNavButton, styles.leftNavButton]}
          >
            <Text style={styles.navButtonText}>←</Text>
          </TouchableOpacity>
        )}
        
        {currentHole < 18 && (
          <TouchableOpacity
            onPress={() => handleNavigateHole('next')}
            style={[styles.overlayNavButton, styles.rightNavButton]}
          >
            <Text style={styles.navButtonText}>→</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.navigation}>
        <View style={styles.scoreButtons}>
          {Array.from({ length: currentHoleData.par === 3 ? 4 : 3 }).map(
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

      {isLastHole && hasScore && (
        <TouchableOpacity style={styles.submitButton} onPress={handleComplete}>
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
            
            <ScrollView style={styles.scorecardScrollView} contentContainerStyle={styles.scorecardContent}>
              {currentRound && <Scorecard course={currentRound.course} />}
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
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 50,
    color: '#FFFFFF',
  },
  titleWithCustomFont: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 84,
    letterSpacing: 6,
    marginBottom: 60,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    width: '80%',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 15,
    backgroundColor: '#3D3D3D',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    margin: 5,
  },
  toggleButtonSelected: {
    backgroundColor: '#93C757',
  },
  toggleText: {
    color: '#B0B0B0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleTextSelected: {
    color: '#FFFFFF',
  },
  holeNumber: {
    fontSize: 54,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
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
  button: {
    backgroundColor: '#93C757',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 20,
  },
  startRoundButton: {
    marginTop: 40,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
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
    top: '65%',
    marginTop: -30,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  leftNavButton: {
    left: 10,
  },
  rightNavButton: {
    right: 10,
  },
  navButtonText: {
    fontSize: 42,
    color: '#93C757',
  },
  titleSmall: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    color: '#FFFFFF',
  },
  scorecardContainer: {
    width: '90%',
    maxHeight: '70%',
    marginVertical: 20,
  },
}); 