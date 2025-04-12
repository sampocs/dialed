import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, StatusBar } from 'react-native';
import { useApp } from '../context/AppContext';
import { calculateStats } from '../utils/gameLogic';
import Svg, { Path, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MetricsScreen() {
  const { rounds } = useApp();
  const [showDifferential, setShowDifferential] = useState(true);
  const insets = useSafeAreaInsets();

  const stats = useMemo(() => calculateStats(rounds), [rounds]);
  const completedRounds = rounds.filter((round) => round.completed);

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
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}>
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
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}>
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
    marginBottom: 20,
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
}); 