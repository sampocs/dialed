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
        <Text style={styles.holeNumber}>Hole {currentHole}/18</Text>
        <TouchableOpacity onPress={handleQuit} style={styles.quitButton}>
          <Text style={styles.quitButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.scoreInfo}>
        <Text style={styles.parText}>Par {currentHoleData.par}</Text>
        <Text style={styles.distanceText}>{currentHoleData.distance} ft</Text>
      </View>

      <View style={styles.navigation}>
        {currentHole > 1 && (
          <TouchableOpacity
            onPress={() => handleNavigateHole('prev')}
            style={styles.navButton}
          >
            <Text style={styles.navButtonText}>←</Text>
          </TouchableOpacity>
        )}
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
                <Text style={styles.scoreButtonText}>{index + 1}</Text>
              </TouchableOpacity>
            )
          )}
        </View>
        {currentHole < 18 && (
          <TouchableOpacity
            onPress={() => handleNavigateHole('next')}
            style={styles.navButton}
          >
            <Text style={styles.navButtonText}>→</Text>
          </TouchableOpacity>
        )}
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

      {showScorecard && (
        <ScrollView style={styles.scorecard}>
          {currentRound.course.holes.map((hole) => (
            <View key={hole.number} style={styles.scorecardRow}>
              <Text style={styles.scorecardText}>Hole {hole.number}</Text>
              <Text style={styles.scorecardText}>Par {hole.par}</Text>
              <Text style={styles.scorecardText}>{hole.distance} ft</Text>
              <Text style={styles.scorecardText}>
                {hole.score || '-'}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  holeNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  quitButton: {
    padding: 10,
  },
  quitButtonText: {
    fontSize: 24,
    color: '#FF3B30',
  },
  scoreInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  parText: {
    fontSize: 20,
    marginBottom: 8,
  },
  distanceText: {
    fontSize: 18,
    color: '#666666',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  navButton: {
    padding: 10,
  },
  navButtonText: {
    fontSize: 24,
    color: '#007AFF',
  },
  scoreButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  scoreButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreButtonSelected: {
    backgroundColor: '#007AFF',
  },
  scoreButtonText: {
    fontSize: 24,
    color: '#007AFF',
  },
  submitButton: {
    backgroundColor: '#34C759',
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
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginHorizontal: 20,
  },
  buttonText: {
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
    color: '#007AFF',
    fontSize: 16,
    textAlign: 'center',
  },
  scorecard: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  scorecardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  scorecardText: {
    fontSize: 14,
  },
}); 