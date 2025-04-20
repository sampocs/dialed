import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, StatusBar, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext';
import { calculateStats } from '../utils/gameLogic';
import Svg, { Path, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function StatsScreen() {
  const { rounds } = useApp();
  const insets = useSafeAreaInsets();
  const [graphHeight, setGraphHeight] = useState(200);
  
  // Filter state - initialize with defaults so one is always selected
  const [holeCountFilter, setHoleCountFilter] = useState<9 | 18>(18);
  const [courseModeFilter, setCourseModeFilter] = useState<"Indoor" | "Outdoor">("Indoor");

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

  const getGraphPoints = () => {
    if (sortedCompletedRounds.length === 0) return [];

    return sortedCompletedRounds.map((round, index) => ({
      x: index,
      y: round.totalScore,
    }));
  };

  const points = getGraphPoints();

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
      labels.push(i);
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
        tickLabels: numberOfRounds === 0 ? [] : [1],
        visibleTickIndices: numberOfRounds === 0 ? [] : [0]
      };
    }
    
    // More consistent approach with equal spacing
    const bufferPercentage = 0.1; // 10% buffer on each side
    const leftBuffer = graphWidth * bufferPercentage;
    const rightBuffer = graphWidth * bufferPercentage;
    const availableWidth = graphWidth - leftBuffer - rightBuffer;
    const xStep = availableWidth / (numberOfRounds - 1);
    
    // Determine tick granularity based on number of rounds
    let tickIncrement = 1;
    if (numberOfRounds > 20) {
      tickIncrement = 5;
    } else if (numberOfRounds > 10) {
      tickIncrement = 2;
    }
    
    // Generate x-axis labels
    const tickLabels = [];
    const visibleTickIndices = [];
    
    for (let i = 0; i < numberOfRounds; i++) {
      // Show first, last, and incremental points
      if (i === 0 || i === numberOfRounds - 1 || (i + 1) % tickIncrement === 0) {
        tickLabels.push(i + 1); // Add 1 to make it 1-indexed for display
        visibleTickIndices.push(i);
      }
    }
    
    return {
      xStep,
      leftBuffer,
      tickLabels,
      visibleTickIndices
    };
  };
  
  const { xStep, leftBuffer, tickLabels, visibleTickIndices } = getXAxisConfig();
  
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

      <View style={[styles.graphTitle, { marginTop: 8, marginBottom: 8 }]}>
        <Text style={styles.graphTitleText}>Total Score History</Text>
      </View>
      
      <View style={styles.graphContainer}>
        <View style={styles.yAxis}>
          {yAxisLabels.map((label, index) => {
            const position = normalizeY(label, graphHeight);
            return (
              <Text 
                key={index} 
                style={[
                  styles.axisLabel, 
                  { position: 'absolute', top: position - 6 }
                ]}
              >
                {label}
              </Text>
            );
          })}
        </View>
        <View style={styles.graph}>
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
            
            {/* Vertical grid lines - only for visible tick marks */}
            {visibleTickIndices.map((originalIndex, index) => (
              <Path
                key={`vgrid-${index}`}
                d={`M ${pointX(originalIndex)} 0 V ${graphHeight}`}
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
            {points.map((point, index) => (
              <Circle
                key={index}
                cx={pointX(index)}
                cy={normalizeY(point.y, graphHeight)}
                r="4"
                fill="#93C757"
              />
            ))}
          </Svg>
        </View>
      </View>
      
      <View style={styles.xAxis}>
        {tickLabels.map((label, index) => {
          const xPosition = pointX(visibleTickIndices[index]);
          return (
            <Text 
              key={index} 
              style={[
                styles.axisLabel,
                { 
                  position: 'absolute', 
                  left: xPosition - 10, 
                  width: 20, 
                  textAlign: 'center' 
                }
              ]}
            >
              {label}
            </Text>
          );
        })}
      </View>
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
    marginBottom: 20,
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
  graphTitle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  graphTitleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  yAxis: {
    width: 40,
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
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    position: 'relative',
    height: 30,
    marginLeft: 40,
    marginRight: 20,
  },
  axisLabel: {
    fontSize: 12,
    color: '#B0B0B0',
  },
  // Add new styles for filter section
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
}); 