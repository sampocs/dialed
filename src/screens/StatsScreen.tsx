import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, StatusBar, ScrollView, PanResponder, Animated } from 'react-native';
import { useApp } from '../context/AppContext';
import { calculateStats } from '../utils/gameLogic';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';

export default function StatsScreen() {
  const { rounds } = useApp();
  const insets = useSafeAreaInsets();
  const [graphHeight, setGraphHeight] = useState(200);
  
  // Filter state - initialize with defaults so one is always selected
  const [holeCountFilter, setHoleCountFilter] = useState<9 | 18>(18);
  const [courseModeFilter, setCourseModeFilter] = useState<"Indoor" | "Outdoor">("Indoor");
  
  // State for selected point when user interacts with chart
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const pan = useRef(new Animated.Value(0)).current;
  
  // Controls if popup uses dynamic positioning or fixed position
  // Set to true for dynamic positioning (popup moves based on point location)
  // Set to false for fixed positioning (popup always in same place)
  const useDynamicPopupPosition = true;

  // Current page for the horizontal scroll view
  const [currentPage, setCurrentPage] = useState(0);

  // Calculate available space for the graph
  useEffect(() => {
    // Get window height and subtract estimated space for other components
    const windowHeight = Dimensions.get('window').height;
    const headerHeight = 50; // Approximate
    const filterSectionHeight = 150; // Approximate
    const statsHeight = 80; // Approximate
    const tabBarHeight = 80; // Increased to account for tab bar
    const bottomInset = insets.bottom;
    
    // Add more buffer space (80px instead of 60px)
    const availableHeight = windowHeight - headerHeight - filterSectionHeight - 
                            statsHeight - tabBarHeight - bottomInset - insets.top - 80;
    
    // Ensure minimum height
    setGraphHeight(Math.max(availableHeight, 150));
  }, [insets]);

  // Filter rounds based on selected filters
  const filteredRounds = rounds.filter(round => {
    // Apply hole count filter (always applied)
    if (round.course.holeCount !== holeCountFilter) {
      return false;
    }
    
    // Apply course mode filter (always applied)
    if (round.course.courseMode !== courseModeFilter) {
      return false;
    }
    
    return true;
  });

  const stats = useMemo(() => calculateStats(filteredRounds), [filteredRounds]);
  const completedRounds = filteredRounds.filter((round) => round.completed);
  const sortedCompletedRounds = useMemo(() => 
    [...completedRounds].sort((a, b) => a.date - b.date), 
    [completedRounds]
  );

  // Get the par value from the rounds data
  const getParForCurrentFilter = () => {
    // If we have rounds that match the current filter, use their par value
    if (filteredRounds.length > 0) {
      return filteredRounds[0].course.totalPar;
    }
    
    // Fallback par calculations based on the course mode and hole count
    // (Note: These match the logic in the gameLogic.ts generateCourse function)
    if (courseModeFilter === "Indoor") {
      // Indoor courses have 2 par 1s, 5 par 2s, and 2 par 3s per 9 holes
      const nineHolePar = (2 * 1) + (5 * 2) + (2 * 3) // = 19
      return holeCountFilter === 9 ? nineHolePar : nineHolePar * 2;
    } else {
      // Outdoor courses have 2 par 2s and 7 par 3s per 9 holes
      const nineHolePar = (2 * 2) + (7 * 3) // = 25
      return holeCountFilter === 9 ? nineHolePar : nineHolePar * 2;
    }
  };

  const parForCurrentFilter = getParForCurrentFilter();

  const getGraphPoints = () => {
    if (sortedCompletedRounds.length === 0) return [];

    return sortedCompletedRounds.map((round, index) => ({
      x: index,
      y: round.totalScore,
    }));
  };

  const points = getGraphPoints();

  // Handle scroll event to update current page
  const handleScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const pageWidth = Dimensions.get('window').width;
    const currentPage = Math.floor((offsetX + (pageWidth / 2)) / pageWidth);
    setCurrentPage(currentPage);
  };

  // Render the chart section based on the current filter settings
  const renderChartSection = () => {
    if (points.length === 0) return null;
    
    return (
      <View style={styles.graphContainer}>
        <View style={styles.yAxis}>
          {yAxisLabels.map((label, index) => {
            const position = normalizeY(label.score, graphHeight);
            return (
              <Text 
                key={index} 
                style={[
                  styles.axisLabel, 
                  { position: 'absolute', top: position - 6, width: 70, textAlign: 'right' }
                ]}
              >
                {label.display}
              </Text>
            );
          })}
        </View>
        <View 
          style={styles.graph}
          {...panResponder.panHandlers}
        >
          <Svg width={graphWidth} height={graphHeight}>
            {/* Horizontal grid lines - for every integer value */}
            {horizontalGridLines.map((value, index) => (
              <Path
                key={`hgrid-${index}`}
                d={`M 0 ${normalizeY(value, graphHeight)} H ${graphWidth}`}
                stroke="#3D3D3D"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
            ))}
            
            {points.length > 1 && (
              <Path
                d={getPathData(graphHeight)}
                stroke="#93C757"
                strokeWidth="2"
                fill="none"
              />
            )}
            
            {/* Show all points */}
            {points.map((point, index) => (
              <Circle
                key={index}
                cx={pointX(index)}
                cy={normalizeY(point.y, graphHeight)}
                r={selectedPointIndex === index ? "6" : "4"}
                fill={selectedPointIndex === index ? "#FFFFFF" : "#93C757"}
              />
            ))}
            
            {/* Show vertical line at selected point */}
            {selectedPointIndex !== null && (
              <Line
                x1={pointX(selectedPointIndex)}
                y1="0"
                x2={pointX(selectedPointIndex)}
                y2={graphHeight}
                stroke="#FFFFFF"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
            )}
          </Svg>
          
          {/* Render selected point details as an overlay */}
          {selectedPointIndex !== null && renderSelectedPointDetails()}
        </View>
      </View>
    );
  };

  // Render a second page that's blank for now
  const renderSecondSection = () => {
    return (
      <View style={styles.blankPageContainer}>
        <Text style={styles.blankPageText}>Future chart will go here</Text>
      </View>
    );
  };

  if (points.length === 0) {
    return (
      <View style={styles.container}>
        {/* Header with Performance title and toggle */}
        <View style={styles.header}>
          <Text style={styles.title}>Stats</Text>
        </View>
        
        {/* Fixed filter section */}
        <View style={styles.filterSection}>
          {/* Hole Count Toggle */}
          <Text style={styles.toggleLabel}>Holes</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[styles.filterToggleButton, holeCountFilter === 9 && styles.filterToggleButtonSelected]} 
              onPress={() => setHoleCountFilter(9)}
            >
              <Text style={[styles.filterToggleText, holeCountFilter === 9 && styles.filterToggleTextSelected]}>9 Holes</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterToggleButton, holeCountFilter === 18 && styles.filterToggleButtonSelected]} 
              onPress={() => setHoleCountFilter(18)}
            >
              <Text style={[styles.filterToggleText, holeCountFilter === 18 && styles.filterToggleTextSelected]}>18 Holes</Text>
            </TouchableOpacity>
          </View>
          
          {/* Course Mode Toggle */}
          <Text style={styles.toggleLabel}>Course Mode</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[styles.filterToggleButton, courseModeFilter === "Indoor" && styles.filterToggleButtonSelected]} 
              onPress={() => setCourseModeFilter("Indoor")}
            >
              <Text style={[styles.filterToggleText, courseModeFilter === "Indoor" && styles.filterToggleTextSelected]}>Indoor</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterToggleButton, courseModeFilter === "Outdoor" && styles.filterToggleButtonSelected]} 
              onPress={() => setCourseModeFilter("Outdoor")}
            >
              <Text style={[styles.filterToggleText, courseModeFilter === "Outdoor" && styles.filterToggleTextSelected]}>Outdoor</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No rounds played yet
          </Text>
        </View>
      </View>
    );
  }

  const minY = Math.min(...points.map((p) => p.y));
  const maxY = Math.max(...points.map((p) => p.y));
  const paddedMinY = minY - 2; // 2 strokes below min
  const paddedMaxY = maxY + 2; // 2 strokes above max
  const yRange = paddedMaxY - paddedMinY;
  const graphWidth = Dimensions.get('window').width - 80;
  
  // Calculate y-axis labels with appropriate increments
  const getYAxisLabels = () => {
    // Determine if we need increments of 1 or 2
    const totalRange = Math.ceil(paddedMaxY) - Math.floor(paddedMinY);
    const increment = totalRange > 10 ? 2 : 1;
    
    // Ensure we start with an even number if increment is 2
    let start = Math.floor(paddedMinY);
    if (increment === 2 && start % 2 !== 0) {
      start = start - 1; // Go one lower to get an even number
    }
    
    // Generate the labels
    const labels = [];
    for (let i = start; i <= Math.ceil(paddedMaxY); i += increment) {
      // Calculate differential for this score
      const differential = i - parForCurrentFilter;
      const differentialDisplay = differential > 0 ? `+${differential}` : differential;
      
      // Store both the score and differential
      labels.push({
        score: i,
        display: `${i} (${differentialDisplay})`
      });
    }
    
    return labels;
  };
  
  const yAxisLabels = getYAxisLabels();
  
  // Calculate x-axis spacing and labels
  const getXAxisConfig = () => {
    const numberOfRounds = points.length;
    
    // Handle special case of a single data point
    if (numberOfRounds <= 1) {
      return {
        xStep: 0,
        leftBuffer: graphWidth / 2, // Center the single point
      };
    }
    
    // More consistent approach with equal spacing
    const bufferPercentage = 0.1; // 10% buffer on each side
    const leftBuffer = graphWidth * bufferPercentage;
    const rightBuffer = graphWidth * bufferPercentage;
    const availableWidth = graphWidth - leftBuffer - rightBuffer;
    const xStep = availableWidth / (numberOfRounds - 1);
    
    return {
      xStep,
      leftBuffer,
    };
  };
  
  const { xStep, leftBuffer } = getXAxisConfig();
  
  // Modify normalizeY to still work with our updated x-axis
  const normalizeY = (y: number, height: number) => {
    return height - ((y - paddedMinY) / yRange) * height;
  };
  
  // Calculate the x position for each data point with the expanded axis
  const pointX = (index: number) => {
    if (points.length <= 1) {
      return graphWidth / 2; // Center the single point
    }
    return leftBuffer + (index * xStep);
  };

  const getPathData = (height: number) => {
    if (points.length <= 1) return '';
    
    return points
      .map(
        (point, index) =>
          `${index === 0 ? 'M' : 'L'} ${pointX(index)} ${normalizeY(point.y, height)}`
      )
      .join(' ');
  };

  // Calculate horizontal grid lines for every integer value
  const getHorizontalGridLines = () => {
    const start = Math.floor(paddedMinY);
    const end = Math.ceil(paddedMaxY);
    const gridLines = [];
    
    for (let i = start; i <= end; i++) {
      gridLines.push(i);
    }
    
    return gridLines;
  };
  
  const horizontalGridLines = getHorizontalGridLines();

  // Function to find the closest point to the touch x position
  const findClosestPointIndex = (touchX: number) => {
    if (points.length === 0) return null;
    
    // Calculate distances to each point
    const distances = points.map((_, index) => Math.abs(pointX(index) - touchX));
    
    // Find the index of the minimum distance
    return distances.indexOf(Math.min(...distances));
  };
  
  // Create pan responder for touch interaction
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          const touchX = evt.nativeEvent.locationX;
          setSelectedPointIndex(findClosestPointIndex(touchX));
        },
        onPanResponderMove: (evt) => {
          const touchX = evt.nativeEvent.locationX;
          setSelectedPointIndex(findClosestPointIndex(touchX));
        },
        onPanResponderRelease: () => {
          // Keep showing the selected point after release
        },
      }),
    [points]
  );

  // Display a popup with round details when a point is selected
  const renderSelectedPointDetails = () => {
    if (selectedPointIndex === null || !sortedCompletedRounds[selectedPointIndex]) return null;
    
    const selectedRound = sortedCompletedRounds[selectedPointIndex];
    const differential = selectedRound.totalScore - parForCurrentFilter;
    const differentialDisplay = differential > 0 ? `+${differential}` : differential.toString();
    const formattedDate = format(new Date(selectedRound.date), 'MMM d, yyyy');
    
    // Choose between dynamic or fixed positioning based on preference
    if (useDynamicPopupPosition) {
      // Dynamic positioning: popup appears near selected point
      // Define custom ranges for horizontal sections (not equal thirds)
      const leftThreshold = graphWidth * 0.33; // 33% from left
      const rightThreshold = graphWidth * 0.55; // 55% from left
      
      const pointXPosition = pointX(selectedPointIndex);
      const isInLeftSection = pointXPosition < leftThreshold;
      const isInRightSection = pointXPosition > rightThreshold;
      const isInMiddleSection = !isInLeftSection && !isInRightSection;
      
      // Calculate if we're in the top or bottom half of the graph
      const pointYPosition = normalizeY(points[selectedPointIndex].y, graphHeight);
      const isInTopHalf = pointYPosition < graphHeight / 2;
      
      // Define vertical offsets - increase the offset for bottom points
      const topOffset = 20; // Standard offset below points
      const bottomOffset = 40; // Increased offset above points (was 20)
      
      // Determine appropriate popup position based on point location
      let popupPosition;
      
      if (isInMiddleSection) {
        // For middle section, only position vertically (above or below) without horizontal adjustment
        popupPosition = {
          // Center horizontally over the point
          left: pointXPosition - 100, // Center popup (half of 200px width)
          // If in top half, show below; if in bottom half, show above with increased offset
          top: isInTopHalf ? pointYPosition + topOffset : undefined,
          bottom: !isInTopHalf ? graphHeight - pointYPosition + bottomOffset : undefined
        };
      } else {
        // For left/right sections, keep original positioning logic
        popupPosition = {
          left: isInRightSection ? undefined : pointXPosition - 20,
          right: isInRightSection ? graphWidth - pointXPosition - 20 : undefined,
          // Apply the same vertical offset logic
          top: isInTopHalf ? pointYPosition + topOffset : undefined,
          bottom: !isInTopHalf ? graphHeight - pointYPosition + bottomOffset : undefined
        };
      }
      
      return (
        <View style={[styles.detailsPopup, popupPosition]}>
          <Text style={styles.detailsDate}>{formattedDate}</Text>
          <Text style={styles.detailsCourseName}>{selectedRound.courseName}</Text>
          <View style={styles.detailsScoreRow}>
            <Text style={styles.detailsScore}>{selectedRound.totalScore}</Text>
            <Text style={styles.detailsDifferential}>({differentialDisplay})</Text>
          </View>
        </View>
      );
    } else {
      // Fixed position approach: popup always at the bottom of the graph
      return (
        <View style={[styles.detailsPopup, styles.fixedPopup]}>
          <Text style={styles.detailsDate}>{formattedDate}</Text>
          <Text style={styles.detailsCourseName}>{selectedRound.courseName}</Text>
          <View style={styles.detailsScoreRow}>
            <Text style={styles.detailsScore}>{selectedRound.totalScore}</Text>
            <Text style={styles.detailsDifferential}>({differentialDisplay})</Text>
          </View>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Performance title and toggle */}
      <View style={styles.header}>
        <Text style={styles.title}>Stats</Text>
      </View>

      {/* Fixed filter section */}
      <View style={styles.filterSection}>
        {/* Hole Count Toggle */}
        <Text style={styles.toggleLabel}>Holes</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.filterToggleButton, holeCountFilter === 9 && styles.filterToggleButtonSelected]} 
            onPress={() => setHoleCountFilter(9)}
          >
            <Text style={[styles.filterToggleText, holeCountFilter === 9 && styles.filterToggleTextSelected]}>9 Holes</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterToggleButton, holeCountFilter === 18 && styles.filterToggleButtonSelected]} 
            onPress={() => setHoleCountFilter(18)}
          >
            <Text style={[styles.filterToggleText, holeCountFilter === 18 && styles.filterToggleTextSelected]}>18 Holes</Text>
          </TouchableOpacity>
        </View>
        
        {/* Course Mode Toggle */}
        <Text style={styles.toggleLabel}>Course Mode</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.filterToggleButton, courseModeFilter === "Indoor" && styles.filterToggleButtonSelected]} 
            onPress={() => setCourseModeFilter("Indoor")}
          >
            <Text style={[styles.filterToggleText, courseModeFilter === "Indoor" && styles.filterToggleTextSelected]}>Indoor</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterToggleButton, courseModeFilter === "Outdoor" && styles.filterToggleButtonSelected]} 
            onPress={() => setCourseModeFilter("Outdoor")}
          >
            <Text style={[styles.filterToggleText, courseModeFilter === "Outdoor" && styles.filterToggleTextSelected]}>Outdoor</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Handicap</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.statValue}>
              {stats.handicap > 0 ? '+' : ''}{stats.handicap}
            </Text>
          </View>
        </View>

        {stats.bestRound && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Best Round</Text>
            <View style={styles.scoreContainer}>
              <Text style={styles.statValue}>{stats.bestRound.totalScore}</Text>
              <Text style={styles.differentialText}>
                ({stats.bestRound.differential > 0 ? '+' : ''}{stats.bestRound.differential})
              </Text>
            </View>
          </View>
        )}

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Average Score</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.statValue}>{Math.round(stats.averageTotal * 10) / 10}</Text>
            <Text style={styles.differentialText}>
              ({stats.averageScore > 0 ? '+' : ''}{Math.round(stats.averageScore * 10) / 10})
            </Text>
          </View>
        </View>
      </View>

      {/* Dividing line */}
      <View style={styles.divider} />

      {/* Graph title bar with page indicator */}
      <View style={styles.graphTitleBar}>
        <Text style={styles.graphTitleText}>
          {currentPage === 0 ? "Score by Round" : "Future Chart"}
        </Text>
        <View style={styles.pageIndicator}>
          <View style={[styles.pageIndicatorDot, currentPage === 0 && styles.pageIndicatorDotActive]} />
          <View style={[styles.pageIndicatorDot, currentPage === 1 && styles.pageIndicatorDotActive]} />
        </View>
      </View>

      {/* Horizontal scroll view for the chart section */}
      <ScrollView 
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.horizontalScrollView}
      >
        {/* First page - Score chart */}
        <View style={{width: Dimensions.get('window').width}}>
          {renderChartSection()}
        </View>
        
        {/* Second page - Blank for now */}
        <View style={{width: Dimensions.get('window').width}}>
          {renderSecondSection()}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#292929',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
    backgroundColor: '#292929',
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#B0B0B0',
    fontSize: 18,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 15, // Reduced from 20 to account for divider
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // Add spacing between score and differential
  },
  differentialText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#B0B0B0',
  },
  graphContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  graphTitleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 8,
  },
  graphTitleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  pageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3D3D3D',
    marginHorizontal: 4,
  },
  pageIndicatorDotActive: {
    backgroundColor: '#93C757',
  },
  yAxis: {
    width: 70,
    position: 'relative',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingRight: 5,
    alignItems: 'flex-end',
  },
  graph: {
    flex: 1,
    paddingRight: 20,
  },
  axisLabel: {
    fontSize: 12,
    color: '#B0B0B0',
  },
  filterSection: {
    paddingTop: 5,
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3D3D3D',
    backgroundColor: '#292929',
    zIndex: 10,
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
  filterToggleButton: {
    flex: 1,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  filterToggleButtonSelected: {
    backgroundColor: '#93C757',
  },
  filterToggleText: {
    color: '#B0B0B0',
    fontSize: 14,
    fontWeight: '500',
  },
  filterToggleTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#3D3D3D',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  detailsPopup: {
    position: 'absolute',
    width: 200,
    backgroundColor: 'rgba(61, 61, 61, 0.9)',
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10,
  },
  detailsDate: {
    color: '#B0B0B0',
    fontSize: 14,
    textAlign: 'center',
  },
  detailsCourseName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  },
  detailsScoreRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  detailsScore: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  detailsDifferential: {
    color: '#B0B0B0',
    fontSize: 16,
    marginLeft: 4,
  },
  fixedPopup: {
    bottom: 10,
    left: '50%',
    marginLeft: -100, // Center horizontally (half of width)
  },
  horizontalScrollView: {
    flex: 1,
  },
  blankPageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blankPageText: {
    color: '#B0B0B0',
    fontSize: 18,
    fontWeight: '500',
  },
}); 