import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Animated,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useApp } from '../context/AppContext';
import { Round } from '../types';
import Scorecard from '../components/Scorecard';
import HoleEditor from '../components/HoleEditor';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

// Define the navigation param list type
type RootTabParamList = {
  Play: undefined;
  Rounds: undefined;
  Metrics: undefined;
};

// Define the navigation prop type
type RootTabNavigationProp = BottomTabNavigationProp<RootTabParamList>;

export default function RoundsScreen() {
  const { 
    rounds, 
    deleteRound, 
    startEditMode, 
    gameState, 
    currentRound,
    updateHoleScore,
    saveRoundEdit,
    cancelRoundEdit,
    hasEditChanges 
  } = useApp();
  const [expandedRoundId, setExpandedRoundId] = useState<string | null>(null);
  const [selectedRound, setSelectedRound] = useState<Round | null>(null);
  const [showScorecardModal, setShowScorecardModal] = useState(false);
  const highlightAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<RootTabNavigationProp>();
  
  // Filter state
  const [holeCountFilter, setHoleCountFilter] = useState<9 | 18 | null>(null);
  const [courseModeFilter, setCourseModeFilter] = useState<"Indoor" | "Outdoor" | null>(null);

  const handleDeleteRound = (roundId: string) => {
    Alert.alert(
      'Delete Round',
      'Are you sure you want to delete this round?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteRound(roundId);
            if (selectedRound?.id === roundId) {
              setShowScorecardModal(false);
            }
          },
        },
      ]
    );
  };

  const handleEditRound = async (round: Round) => {
    // Start edit mode for the selected round
    await startEditMode(round.id);
    // Close the modal if it's open
    setShowScorecardModal(false);
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

  // Find best rounds for each category
  const bestRoundsByCategory = useMemo(() => {
    const categories = {
      '9-Indoor': { best: null as Round | null, differential: Infinity },
      '9-Outdoor': { best: null as Round | null, differential: Infinity },
      '18-Indoor': { best: null as Round | null, differential: Infinity },
      '18-Outdoor': { best: null as Round | null, differential: Infinity }
    };

    rounds.forEach(round => {
      const holeCount = round.course.holeCount;
      const courseMode = round.course.courseMode;
      const key = `${holeCount}-${courseMode}` as keyof typeof categories;
      
      if (categories[key] && round.differential < categories[key].differential) {
        categories[key].best = round;
        categories[key].differential = round.differential;
      }
    });

    return categories;
  }, [rounds]);

  // Check if a round is the best in its category
  const isBestInCategory = (round: Round) => {
    const key = `${round.course.holeCount}-${round.course.courseMode}` as keyof typeof bestRoundsByCategory;
    return bestRoundsByCategory[key]?.best?.id === round.id;
  };

  // Show the edit screen when in edit mode
  if (gameState === 'edit-mode' && currentRound) {
    return (
      <HoleEditor
        round={currentRound}
        isEditMode={true}
        onUpdateScore={updateHoleScore}
        onQuit={cancelRoundEdit}
        onSave={saveRoundEdit}
        onCancel={cancelRoundEdit}
        hasChanges={hasEditChanges()}
      />
    );
  }

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
        
        {/* Best round indicator */}
        <View style={styles.bestRoundIndicator}>
          <View style={styles.bestRoundIndicatorDot}></View>
          <Text style={styles.bestRoundIndicatorText}>Green border indicates best round in each category</Text>
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
                <View 
                  key={round.id} 
                  style={[
                    styles.roundItem,
                    isBestInCategory(round) && styles.bestRoundItem
                  ]}
                >
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
                          {round.course.courseMode}-{round.course.holeCount} • {round.courseName}
                        </Text>
                      </View>
                      <View style={styles.roundHeaderRight}>
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
                {selectedRound && (
                  <>
                    <Text style={styles.scorecardDate}>
                      {formatDate(selectedRound.date)}
                    </Text>
                    <Text style={styles.scorecardSubtitle}>
                      {selectedRound.course.courseMode}-{selectedRound.course.holeCount} • {selectedRound.courseName}
                    </Text>
                  </>
                )}
              </View>
              
              <View style={styles.scorecardActions}>
                <TouchableOpacity 
                  onPress={() => setShowScorecardModal(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <ScrollView style={styles.scorecardScrollView} contentContainerStyle={styles.scorecardContent} scrollEnabled={false}>
              {/* Apply custom styling to reduce space between table and summary */}
              <View style={styles.scorecardWrapper}>
                {selectedRound && <Scorecard course={selectedRound.course} showCourseMode={false} />}
              </View>
            </ScrollView>
          </View>
          
          {/* Action buttons moved outside the modal content */}
          {selectedRound && (
            <View style={styles.floatingActionButtonsContainer}>
              <TouchableOpacity 
                onPress={() => handleEditRound(selectedRound)}
                style={styles.floatingActionButton}
              >
                <MaterialCommunityIcons name="pencil" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => handleDeleteRound(selectedRound.id)}
                style={styles.floatingActionButton}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
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
    borderWidth: 2,
    borderColor: 'transparent',
  },
  bestRoundItem: {
    borderColor: '#93C757',
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
    position: 'relative',
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
  scorecardDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  scorecardSubtitle: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  scorecardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  closeButton: {
    padding: 8,
    marginLeft: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#93C757',
  },
  scorecardScrollView: {
    width: '100%',
  },
  scorecardWrapper: {
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
  bestRoundIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 5,
  },
  bestRoundIndicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#93C757',
    marginRight: 8,
  },
  bestRoundIndicatorText: {
    fontSize: 12,
    color: '#B0B0B0',
    fontStyle: 'italic',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 20,
  },
  inlineActionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 4,
  },
  floatingActionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 20,
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
  },
  floatingActionButton: {
    padding: 12,
    marginHorizontal: 12,
    backgroundColor: 'rgba(147, 199, 87, 0.8)',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
}); 