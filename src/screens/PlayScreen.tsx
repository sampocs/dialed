import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { isValidScore } from '../utils/gameLogic';
import Scorecard from '../components/Scorecard';

export default function PlayScreen() {
  const {
    gameState,
    currentRound,
    startNewGame,
    updateHoleScore,
    completeRound,
    quitGame,
  } = useApp();
  const [currentHole, setCurrentHole] = useState(1);
  const [showScorecard, setShowScorecard] = useState(false);

  const handleStartNewGame = () => {
    startNewGame();
  };

  const handleScoreSelect = (score: number) => {
    if (!currentRound) return;
    const hole = currentRound.course.holes[currentHole - 1];
    if (!isValidScore(hole.par, score)) return;

    updateHoleScore(currentHole, score);

    if (currentHole < 18) {
      setCurrentHole(currentHole + 1);
    }
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

  if (gameState === 'no-game') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Dialed</Text>
        <TouchableOpacity style={styles.button} onPress={handleStartNewGame}>
          <Text style={styles.buttonText}>New Game</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentRound) return null;

  const currentHoleData = currentRound.course.holes[currentHole - 1];
  const isLastHole = currentHole === 18;
  const hasScore = currentHoleData.score !== undefined;

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
          <Text style={styles.holeNumber}>Hole {currentHole}/18</Text>
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

      {showScorecard && currentRound && (
        <>
          {console.log('Current round being passed to Scorecard:', currentRound)}
          <ScrollView style={styles.scorecard} contentContainerStyle={styles.scorecardContent}>
            <Scorecard course={currentRound.course} />
          </ScrollView>
        </>
      )}
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
    marginBottom: 300,
    color: '#FFFFFF',
  },
  holeNumber: {
    fontSize: 54,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 40,
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
  scorecard: {
    flex: 1,
    marginTop: 20,
    width: '100%',
  },
  scorecardContent: {
    width: '100%',
    paddingHorizontal: 16,
  },
  overlayNavButton: {
    position: 'absolute',
    top: '55%',
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
}); 