import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useApp } from '../context/AppContext';
import { calculateStats } from '../utils/gameLogic';

export default function MetricsScreen() {
  const { rounds } = useApp();
  const [showDifferential, setShowDifferential] = useState(true);

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
      <View style={styles.container}>
        <Text style={styles.emptyText}>
          Play some rounds to see your performance metrics
        </Text>
      </View>
    );
  }

  const minY = Math.min(...points.map((p) => p.y));
  const maxY = Math.max(...points.map((p) => p.y));
  const graphHeight = 200;
  const graphWidth = Dimensions.get('window').width - 40;
  const xStep = graphWidth / (points.length - 1);

  const normalizeY = (y: number) => {
    const range = maxY - minY;
    return graphHeight - ((y - minY) / range) * graphHeight;
  };

  const pathData = points
    .map(
      (point, index) =>
        `${index === 0 ? 'M' : 'L'} ${index * xStep} ${normalizeY(point.y)}`
    )
    .join(' ');

  return (
    <View style={styles.container}>
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
          <svg width={graphWidth} height={graphHeight}>
            <path
              d={pathData}
              stroke="#007AFF"
              strokeWidth="2"
              fill="none"
            />
            {points.map((point, index) => (
              <circle
                key={index}
                cx={index * xStep}
                cy={normalizeY(point.y)}
                r="4"
                fill="#007AFF"
              />
            ))}
          </svg>
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
    fontSize: 24,
    fontWeight: 'bold',
  },
  toggleButton: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  toggleButtonText: {
    fontSize: 14,
    color: '#007AFF',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666666',
    marginTop: 40,
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
    color: '#666666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
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
    color: '#666666',
  },
}); 