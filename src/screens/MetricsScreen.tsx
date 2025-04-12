import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, StatusBar, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext';
import { calculateStats } from '../utils/gameLogic';
import Svg, { Path, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MetricsScreen() {
  const { rounds } = useApp();
  const [showDifferential, setShowDifferential] = useState(true);
  const insets = useSafeAreaInsets();
  
  // Filter state - initialize with defaults so one is always selected
  const [holeCountFilter, setHoleCountFilter] = useState<9 | 18>(9);
  const [courseModeFilter, setCourseModeFilter] = useState<"Indoor" | "Outdoor">("Indoor");

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

  const getGraphPoints = () => {
    if (completedRounds.length === 0) return [];

    const sortedRounds = [...completedRounds].sort((a, b) => a.date - b.date);
    return sortedRounds.map((round, index) => ({
      x: index,
      y: showDifferential ? round.differential : round.totalScore,
    }));
  };

  const points = getGraphPoints();

  if (points.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header with Performance title and toggle */}
        <View style={styles.header}>
          <Text style={styles.title}>Performance</Text>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowDifferential(!showDifferential)}
          >
            <Text style={styles.toggleButtonText}>
              Show {showDifferential ? 'Total Score' : 'Differential'}
            </Text>
          </TouchableOpacity>
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
  const yRange = maxY === minY ? 1 : maxY - minY;
  const graphHeight = 200;
  const graphWidth = Dimensions.get('window').width - 60;
  
  const xStep = points.length > 1 ? graphWidth / (points.length - 1) : graphWidth;

  const normalizeY = (y: number) => {
    return graphHeight - ((y - minY) / yRange) * graphHeight;
  };

  const pathData = points.length > 1 
    ? points
        .map(
          (point, index) =>
            `${index === 0 ? 'M' : 'L'} ${index * xStep} ${normalizeY(point.y)}`
        )
        .join(' ')
    : '';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header with Performance title and toggle */}
      <View style={styles.header}>
        <Text style={styles.title}>Performance</Text>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowDifferential(!showDifferential)}
        >
          <Text style={styles.toggleButtonText}>
            Show {showDifferential ? 'Total Score' : 'Differential'}
          </Text>
        </TouchableOpacity>
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
          <Text style={styles.statLabel}>Average Score</Text>
          <Text style={styles.statValue}>
            {stats.averageScore > 0 ? '+' : ''}
            {stats.averageScore.toFixed(1)}
          </Text>
        </View>

        {stats.bestRound && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Best Round</Text>
            <Text style={styles.statValue}>
              {stats.bestRound.differential > 0 ? '+' : ''}
              {stats.bestRound.differential}
            </Text>
          </View>
        )}

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Recent Trend</Text>
          <Text
            style={[
              styles.statValue,
              {
                color:
                  stats.recentTrend === 0
                    ? '#666666'
                    : stats.recentTrend < 0
                    ? '#34C759'
                    : '#FF3B30',
              },
            ]}
          >
            {stats.recentTrend > 0 ? '+' : ''}
            {stats.recentTrend.toFixed(1)}
          </Text>
        </View>
      </View>

      <View style={styles.graphContainer}>
        <View style={styles.yAxis}>
          <Text style={styles.axisLabel}>{Math.ceil(maxY)}</Text>
          <Text style={styles.axisLabel}>{Math.floor(minY)}</Text>
        </View>
        <View style={styles.graph}>
          <Svg width={graphWidth} height={graphHeight}>
            {points.length > 1 && (
              <Path
                d={pathData}
                stroke="#007AFF"
                strokeWidth="2"
                fill="none"
              />
            )}
            {points.map((point, index) => (
              <Circle
                key={index}
                cx={index * xStep}
                cy={normalizeY(point.y)}
                r="4"
                fill="#007AFF"
              />
            ))}
          </Svg>
          <View style={styles.xAxis}>
            {points.map((_, index) => (
              <Text key={index} style={styles.axisLabel}>
                {index + 1}
              </Text>
            ))}
          </View>
        </View>
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
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: '#292929',
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  toggleButton: {
    backgroundColor: '#3D3D3D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  toggleButtonText: {
    fontSize: 14,
    color: '#93C757',
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
    marginBottom: 30,
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
  graphContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    height: 250,
  },
  yAxis: {
    width: 40,
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  graph: {
    flex: 1,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
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