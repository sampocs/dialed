import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Animated,
  ToastAndroid,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useApp } from '../context/AppContext';
import { Round } from '../types';
import Scorecard from '../components/Scorecard';

export default function RoundsScreen() {
  const { rounds, deleteRound } = useApp();
  const [expandedRoundId, setExpandedRoundId] = useState<string | null>(null);
  const [selectedRound, setSelectedRound] = useState<Round | null>(null);
  const [showScorecardModal, setShowScorecardModal] = useState(false);
  const highlightAnim = useRef(new Animated.Value(0)).current;
  const [hasShowTip, setHasShowTip] = useState(false);
  
  // Filter state
  const [holeCountFilter, setHoleCountFilter] = useState<9 | 18 | null>(null);
  const [courseModeFilter, setCourseModeFilter] = useState<"Indoor" | "Outdoor" | null>(null);

  useEffect(() => {
    // Show tip about long press to delete on first render if there are rounds
    if (rounds.length > 0 && !hasShowTip) {
      setHasShowTip(true);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Tip: Long press a round to delete it', ToastAndroid.SHORT);
      } else {
        // For iOS we'll just add a tip at the top
        Alert.alert(
          'Tip',
          'Long press a round to delete it',
          [{ text: 'Got it' }],
          { cancelable: true }
        );
      }
    }
  }, [rounds.length, hasShowTip]);

  const handleDeleteRound = (roundId: string) => {
    Alert.alert(
      'Delete Round',
      'Are you sure you want to delete this round?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteRound(roundId),
        },
      ]
    );
  };

  const handleViewScorecard = (round: Round) => {
    setSelectedRound(round);
    setShowScorecardModal(true);
    
    // Animate highlight effect
    highlightAnim.setValue(0);
    Animated.timing(highlightAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const getBestRound = () => {
    if (rounds.length === 0) return null;
    return rounds.reduce((best, current) =>
      !best || current.differential < best.differential ? current : best
    );
  };

  const bestRound = getBestRound();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getHighlightStyle = (roundId: string) => {
    if (selectedRound?.id === roundId && showScorecardModal) {
      return {
        opacity: highlightAnim.interpolate({
          inputRange: [0, 0.3, 0.7, 1],
          outputRange: [0, 0.6, 0.3, 0]
        })
      };
    }
    return { opacity: 0 };
  };

  // Filter rounds based on selected filters
  const filteredRounds = rounds.filter(round => {
    // Apply hole count filter
    if (holeCountFilter !== null && round.course.holeCount !== holeCountFilter) {
      return false;
    }
    
    // Apply course mode filter
    if (courseModeFilter !== null && round.course.courseMode !== courseModeFilter) {
      return false;
    }
    
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Fixed filter section */}
      <View style={styles.filterSection}>
        {/* Hole Count Toggle */}
        <Text style={styles.toggleLabel}>Holes</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleButton, holeCountFilter === null && styles.toggleButtonSelected]} 
            onPress={() => setHoleCountFilter(null)}
          >
            <Text style={[styles.toggleText, holeCountFilter === null && styles.toggleTextSelected]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, holeCountFilter === 9 && styles.toggleButtonSelected]} 
            onPress={() => setHoleCountFilter(9)}
          >
            <Text style={[styles.toggleText, holeCountFilter === 9 && styles.toggleTextSelected]}>9 Holes</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, holeCountFilter === 18 && styles.toggleButtonSelected]} 
            onPress={() => setHoleCountFilter(18)}
          >
            <Text style={[styles.toggleText, holeCountFilter === 18 && styles.toggleTextSelected]}>18 Holes</Text>
          </TouchableOpacity>
        </View>
        
        {/* Course Mode Toggle */}
        <Text style={styles.toggleLabel}>Course Mode</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleButton, courseModeFilter === null && styles.toggleButtonSelected]} 
            onPress={() => setCourseModeFilter(null)}
          >
            <Text style={[styles.toggleText, courseModeFilter === null && styles.toggleTextSelected]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, courseModeFilter === "Indoor" && styles.toggleButtonSelected]} 
            onPress={() => setCourseModeFilter("Indoor")}
          >
            <Text style={[styles.toggleText, courseModeFilter === "Indoor" && styles.toggleTextSelected]}>Indoor</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, courseModeFilter === "Outdoor" && styles.toggleButtonSelected]} 
            onPress={() => setCourseModeFilter("Outdoor")}
          >
            <Text style={[styles.toggleText, courseModeFilter === "Outdoor" && styles.toggleTextSelected]}>Outdoor</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable content section */}
      <View style={styles.contentSection}>
        {filteredRounds.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {rounds.length === 0 ? 'No rounds played yet' : 'No rounds match the selected filters'}
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.roundsList}>
            {filteredRounds
              .sort((a, b) => b.date - a.date)
              .map((round) => (
                <View key={round.id} style={styles.roundItem}>
                  <TouchableOpacity
                    onPress={() => handleViewScorecard(round)}
                    onLongPress={() => handleDeleteRound(round.id)}
                    delayLongPress={500}
                  >
                    <View style={styles.roundHeader}>
                      <View>
                        <Text style={styles.dateText}>
                          {formatDate(round.date)}
                        </Text>
                        <Text style={styles.courseNameText}>
                          {round.courseName} • {round.course.courseMode} • {round.course.holeCount} holes
                        </Text>
                      </View>
                      <View style={styles.roundHeaderRight}>
                        {bestRound?.id === round.id && (
                          <Text style={styles.starIcon}>⭐</Text>
                        )}
                        <Text style={styles.scoreText}>
                          {round.totalScore > 0 ? round.totalScore : '-'} ({round.differential > 0 ? '+' : ''}
                          {round.differential})
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                  <Animated.View 
                    style={[
                      styles.highlightOverlay,
                      getHighlightStyle(round.id)
                    ]}
                  />
                </View>
              ))}
          </ScrollView>
        )}
      </View>

      {/* Scorecard Modal with BlurView */}
      <Modal
        visible={showScorecardModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowScorecardModal(false)}
      >
        <View style={styles.modalContainer}>
          <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark" />
          
          <View style={styles.scorecardModalContent}>
            <View style={styles.scorecardHeader}>
              <View style={styles.scorecardTitleContainer}>
                <Text style={styles.scorecardTitle}>Scorecard</Text>
                {selectedRound && (
                  <Text style={styles.scorecardSubtitle}>
                    {selectedRound.courseName} • {formatDate(selectedRound.date)}
                  </Text>
                )}
              </View>
              <TouchableOpacity 
                onPress={() => setShowScorecardModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.scorecardScrollView} contentContainerStyle={styles.scorecardContent}>
              {selectedRound && <Scorecard course={selectedRound.course} />}
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
  },
  filterSection: {
    paddingTop: 60,
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3D3D3D',
    backgroundColor: '#292929',
    zIndex: 10,
  },
  contentSection: {
    flex: 1,
  },
  toggleLabel: {
    color: '#B0B0B0',
    fontSize: 14,
    marginBottom: 6,
    textAlign: 'left',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#3D3D3D',
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonSelected: {
    backgroundColor: '#93C757',
  },
  toggleText: {
    color: '#B0B0B0',
    fontSize: 14,
    fontWeight: '500',
  },
  toggleTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  roundsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#B0B0B0',
    fontSize: 18,
    fontWeight: '500',
  },
  roundItem: {
    marginBottom: 20,
    backgroundColor: '#3D3D3D',
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    padding: 16,
    position: 'relative',
  },
  roundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roundHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    marginBottom: 4,
    color: '#FFFFFF',
  },
  courseNameText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 4,
    color: '#B0B0B0',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    padding: 8,
  },
  starIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 14,
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
  scorecardTitleContainer: {
    flex: 1,
  },
  scorecardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  scorecardSubtitle: {
    fontSize: 14,
    color: '#B0B0B0',
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
  highlightOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#93C757',
    borderRadius: 8,
    zIndex: -1,
  },
}); 