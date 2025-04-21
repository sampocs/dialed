import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useApp } from '../context/AppContext';
import { isValidScore, INDOOR_COURSES, OUTDOOR_COURSES, PRE_GENERATED_COURSES } from '../utils/gameLogic';
import Scorecard from '../components/Scorecard';
import HoleEditor from '../components/HoleEditor';
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
    switchCourse,
  } = useApp();
  const [showScorecard, setShowScorecard] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [courseMode, setCourseMode] = useState<"Indoor" | "Outdoor">("Indoor");
  const [holeCount, setHoleCount] = useState<9 | 18>(18);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<string[]>([]);
  const [isChangingCourse, setIsChangingCourse] = useState(false);
  
  // Load the Bebas Neue font
  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
  });

  // Add an animation value for fading
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Update available courses when course mode changes
  useEffect(() => {
    setAvailableCourses(courseMode === "Indoor" ? INDOOR_COURSES : OUTDOOR_COURSES);
  }, [courseMode]);

  const handleStartNewGame = () => {
    startNewGame(courseMode, holeCount);
  };

  const handleStartRound = () => {
    startRound();
  };

  const handleSelectCourse = async (courseName: string) => {
    if (currentRound && currentRound.courseName !== courseName) {
      // Provide visual feedback during the change
      setIsChangingCourse(true);
      setShowCourseDropdown(false);
      
      // Fade out animation
      Animated.timing(fadeAnim, {
        toValue: 0.4,
        duration: 200,
        useNativeDriver: true,
      }).start();
      
      // Use the new switchCourse function which provides a smoother transition
      await switchCourse(courseName);
      
      // Reset loading state and fade back in after a short delay
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setIsChangingCourse(false);
        });
      }, 300);
    } else {
      setShowCourseDropdown(false);
    }
  };

  // Rule content based on the selected mode
  const getRulesContent = () => {
    if (courseMode === "Indoor") {
      return (
        <>
          <Text style={styles.rulesTitle}>Indoor Putting Game Rules</Text>
          <Text style={styles.rulesSubtitle}>Game Setup</Text>
          <Text style={styles.rulesText}>
            Indoor mode creates a course with 2 Par 1's, 5 Par 2's, and 2 Par 3's for each 9-hole section. 
            The placement of the holes is randomized for each new course.
          </Text>
          
          <Text style={styles.rulesSubtitle}>Distances</Text>
          <Text style={styles.rulesText}>
            • Par 1 holes: 2.5 to 4 feet in 0.5-foot increments (putter only){'\n'}
            • Par 2 holes: 4.5 to 7.5 feet in 0.5-foot increments (putter only){'\n'}
            • Par 3 holes: 10 feet (start with a wedge)
          </Text>
          
          <Text style={styles.rulesSubtitle}>Playing Rules</Text>
          <Text style={styles.rulesText}>
            • Use a putting mat with distance markings if possible{'\n'}
            • Missed putts: Move the ball 1 foot closer and try again{'\n'}
            • Chips: If landing within 1 foot of the hole, attempt a 4-foot putt next. Otherwise, attempt a 7.5-foot putt{'\n'}
            • Errant chips: Incur a 1-stroke penalty
          </Text>
          
          <Text style={styles.rulesSubtitle}>Scoring</Text>
          <Text style={styles.rulesText}>
            • Par: The expected number of strokes to complete a hole{'\n'}
            • Birdie: One stroke under par{'\n'}
            • Eagle: Two strokes under par{'\n'}
            • Bogey: One stroke over par{'\n'}
            • Double bogey: Two strokes over par
          </Text>
          
          <Text style={styles.rulesSubtitle}>Make It Your Own</Text>
          <Text style={styles.rulesText}>
            Feel free to adapt these rules to your own setup and preferences. You can adjust distances based on the space available, create your own custom challenges, or add house rules to make the game more fun for your situation. The goal is to enjoy yourself while improving your putting skills!
          </Text>
        </>
      );
    } else {
      return (
        <>
          <Text style={styles.rulesTitle}>Outdoor Putting Game Rules</Text>
          <Text style={styles.rulesSubtitle}>Game Setup</Text>
          <Text style={styles.rulesText}>
            Outdoor mode creates a course with 7 Par 2 holes and 2 Par 3 holes for each 9-hole section.
            The placement of the holes is randomized for each new course.
          </Text>
          
          <Text style={styles.rulesSubtitle}>Distances</Text>
          <Text style={styles.rulesText}>
            • Par 2 holes: 10 or 15 yards{'\n'}
            • Par 3 holes: 20, 30, or 40 yards
          </Text>
          
          <Text style={styles.rulesSubtitle}>Playing Rules</Text>
          <Text style={styles.rulesText}>
            • Select a target flag and place your ball at the specified distance{'\n'}
            • Pacing out distances is fine - precision isn't strictly necessary{'\n'}
            • Always start from off the green (unless space is limited on shorter Par 2 holes){'\n'}
            • Play the ball as it lies{'\n'}
            • If your ball goes more than 10 feet from the putting area, take a one-stroke penalty and place it back within the area
          </Text>
          
          <Text style={styles.rulesSubtitle}>Scoring</Text>
          <Text style={styles.rulesText}>
            • Par: The expected number of strokes to complete a hole{'\n'}
            • Birdie: One stroke under par{'\n'}
            • Eagle: Two strokes under par{'\n'}
            • Bogey: One stroke over par{'\n'}
            • Double bogey: Two strokes over par
          </Text>
          
          <Text style={styles.rulesSubtitle}>Make It Your Own</Text>
          <Text style={styles.rulesText}>
            Customize the experience to your practice area by mixing up target holes and varying the amount of green to work with on each shot. Create challenges with different amounts of break, uphill/downhill lies, or shots that must carry hazards.
          </Text>
        </>
      );
    }
  };

  // The game in progress screen is now handled by the HoleEditor component
  if (gameState === 'game-in-progress' && currentRound) {
    return (
      <HoleEditor
        round={currentRound}
        onUpdateScore={updateHoleScore}
        onQuit={quitGame}
        onComplete={completeRound}
      />
    );
  }

  if (gameState === 'no-game') {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, fontsLoaded && styles.titleWithCustomFont]}>DIALED</Text>
        
        {/* Mode Toggle */}
        <Text style={styles.toggleLabel}>Course Mode</Text>
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
        <Text style={styles.toggleLabel}>Round Length</Text>
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
        
        <TouchableOpacity style={styles.rulesButton} onPress={() => setShowRules(true)}>
          <Text style={styles.rulesButtonText}>Game Rules</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.newGameButton} onPress={handleStartNewGame}>
          <Text style={styles.newGameButtonText}>New Game</Text>
        </TouchableOpacity>
        
        {/* Rules Modal */}
        <Modal
          visible={showRules}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowRules(false)}
        >
          <View style={styles.modalContainer}>
            <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark" />
            
            <View style={styles.rulesModalContent}>
              <View style={styles.rulesHeader}>
                <Text style={styles.rulesHeaderTitle}>Game Rules</Text>
                <TouchableOpacity 
                  onPress={() => setShowRules(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.rulesScrollView} contentContainerStyle={styles.rulesContent}>
                {getRulesContent()}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  if (gameState === 'game-ready' && currentRound) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.spacer} />
          <TouchableOpacity onPress={quitGame} style={styles.quitButton}>
            <Text style={styles.quitButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.courseNameContainer} 
          onPress={() => !isChangingCourse && setShowCourseDropdown(true)}
          disabled={isChangingCourse}
        >
          <View style={styles.titleSmallContainer}>
            <Text style={styles.titleSmall}>
              {isChangingCourse ? "Loading..." : currentRound.courseName}
            </Text>
          </View>
          {!isChangingCourse && <Text style={styles.dropdownArrow}>▼</Text>}
        </TouchableOpacity>
        
        <Text style={styles.courseTypeText}>{currentRound.course.courseMode}</Text>
        
        <Animated.View 
          style={[
            styles.scorecardContainer,
            { opacity: fadeAnim }
          ]}
        >
          <Scorecard course={currentRound.course} showCourseMode={false} showScores={false} />
        </Animated.View>
        
        <TouchableOpacity 
          style={[styles.button, styles.startRoundButton]} 
          onPress={handleStartRound}
          disabled={isChangingCourse}
        >
          <Text style={styles.buttonText}>Start Round</Text>
        </TouchableOpacity>
        
        {/* Course Selection Modal */}
        <Modal
          visible={showCourseDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowCourseDropdown(false)}
        >
          <View style={styles.modalContainer}>
            <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark" />
            
            <View style={styles.courseDropdownContent}>
              <View style={styles.dropdownHeader}>
                <Text style={styles.dropdownHeaderTitle}>Select Course</Text>
                <TouchableOpacity 
                  onPress={() => setShowCourseDropdown(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={availableCourses}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[
                      styles.courseItem, 
                      currentRound?.courseName === item && styles.courseItemSelected
                    ]} 
                    onPress={() => handleSelectCourse(item)}
                  >
                    <Text style={[
                      styles.courseItemText,
                      currentRound?.courseName === item && styles.courseItemTextSelected
                    ]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
                style={styles.courseList}
              />
            </View>
          </View>
        </Modal>
        
        {/* Rules Modal */}
        <Modal
          visible={showRules}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowRules(false)}
        >
          <View style={styles.modalContainer}>
            <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark" />
            
            <View style={styles.rulesModalContent}>
              <View style={styles.rulesHeader}>
                <Text style={styles.rulesHeaderTitle}>Game Rules</Text>
                <TouchableOpacity 
                  onPress={() => setShowRules(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.rulesScrollView} contentContainerStyle={styles.rulesContent}>
                {getRulesContent()}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  if (gameState === 'game-complete' && currentRound) {
    // Calculate the total score and differential
    const totalScore = currentRound.totalScore;
    const differential = currentRound.differential;
    
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.spacer} />
          <TouchableOpacity onPress={quitGame} style={styles.quitButton}>
            <Text style={styles.quitButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.roundSummary}>
          <Text style={styles.courseNameLarge}>{currentRound.courseName}</Text>
          <Text style={styles.courseTypeText}>{currentRound.course.courseMode}</Text>
          <Text style={[styles.scoreText, styles.scoreTextSpaced]}>
            Final Score: {totalScore} ({differential >= 0 ? '+' : ''}{differential})
          </Text>
        </View>
        
        <View style={styles.scorecardContainer}>
          <Scorecard course={currentRound.course} showCourseMode={false} showScores={true} />
        </View>
      </View>
    );
  }

  return null;
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
    marginBottom: 60,
    color: '#FFFFFF',
  },
  titleWithCustomFont: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 84,
    letterSpacing: 6,
    marginBottom: 80,
  },
  toggleLabel: {
    color: '#B0B0B0',
    fontSize: 14,
    marginBottom: 6,
    width: '80%',
    textAlign: 'left',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 25,
    width: '80%',
    backgroundColor: '#3D3D3D',
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonSelected: {
    backgroundColor: '#93C757',
  },
  toggleText: {
    color: '#B0B0B0',
    fontSize: 16,
    fontWeight: '500',
  },
  toggleTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
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
  newGameButton: {
    backgroundColor: '#93C757',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 40,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  newGameButtonText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rulesButton: {
    marginTop: 2,
    paddingVertical: 2,
    paddingHorizontal: 24,
  },
  rulesButtonText: {
    color: '#93C757',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  rulesButtonOutlined: {
    marginTop: 15,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#93C757',
    borderRadius: 8,
  },
  rulesButtonOutlinedText: {
    color: '#93C757',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
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
  rulesModalContent: {
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
  rulesHeader: {
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
  rulesHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  rulesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  rulesSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#93C757',
    marginTop: 20,
    marginBottom: 10,
  },
  rulesText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
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
  rulesScrollView: {
    width: '100%',
  },
  rulesContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingBottom: 40,
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
  titleSmall: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFFFFF',
    marginVertical: 0,
    paddingVertical: 0,
  },
  titleSmallContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  courseNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownArrow: {
    color: '#93C757',
    fontSize: 16,
    marginLeft: 8,
    marginTop: 2,
  },
  courseDropdownContent: {
    width: '90%',
    maxHeight: '70%',
    backgroundColor: '#292929',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3D3D3D',
  },
  dropdownHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  courseList: {
    width: '100%',
  },
  courseItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3D3D3D',
  },
  courseItemSelected: {
    backgroundColor: '#3D3D3D',
  },
  courseItemText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  courseItemTextSelected: {
    color: '#93C757',
    fontWeight: 'bold',
  },
  scorecardContainer: {
    width: '90%',
    maxHeight: '70%',
    marginVertical: 20,
  },
  roundSummary: {
    alignItems: 'center',
    marginBottom: 10,
  },
  courseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  courseNameLarge: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  courseTypeText: {
    fontSize: 16,
    color: '#B0B0B0',
    marginBottom: 12,
  },
  scoreText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  scoreTextSpaced: {
    marginTop: 10,
  },
}); 