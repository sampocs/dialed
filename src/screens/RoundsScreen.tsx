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
import { Round } from '../types';

export default function RoundsScreen() {
  const { rounds, player, deleteRound, setPlayer } = useApp();
  const [expandedRoundId, setExpandedRoundId] = useState<string | null>(null);

  const handleLongPressHeader = () => {
    Alert.prompt(
      'Change Name',
      'Enter your new name',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: (newName) => {
            if (newName?.trim()) {
              setPlayer({ name: newName.trim() });
            }
          },
        },
      ],
      'plain-text',
      player?.name
    );
  };

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

  return (
    <View style={styles.container}>
      <TouchableOpacity onLongPress={handleLongPressHeader}>
        <Text style={styles.header}>{player?.name}'s Rounds</Text>
      </TouchableOpacity>

      <ScrollView style={styles.roundsList}>
        {rounds.length === 0 ? (
          <Text style={styles.emptyText}>No rounds played yet</Text>
        ) : (
          rounds
            .sort((a, b) => b.date - a.date)
            .map((round) => (
              <View key={round.id} style={styles.roundItem}>
                <TouchableOpacity
                  onPress={() =>
                    setExpandedRoundId(
                      expandedRoundId === round.id ? null : round.id
                    )
                  }
                >
                  <View style={styles.roundHeader}>
                    <View>
                      <Text style={styles.dateText}>
                        {formatDate(round.date)}
                      </Text>
                      <Text style={styles.courseNameText}>
                        {round.courseName}
                      </Text>
                      <Text style={styles.scoreText}>
                        Score: {round.totalScore > 0 ? round.totalScore : '-'} ({round.differential > 0 ? '+' : ''}
                        {round.differential !== 0 ? round.differential : '-'})
                      </Text>
                    </View>
                    <View style={styles.roundHeaderRight}>
                      {bestRound?.id === round.id && (
                        <Text style={styles.starIcon}>⭐</Text>
                      )}
                      <TouchableOpacity
                        onPress={() => handleDeleteRound(round.id)}
                        style={styles.deleteButton}
                      >
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>

                {expandedRoundId === round.id && (
                  <View style={styles.scorecard}>
                    <View style={styles.scorecardHeader}>
                      <Text style={styles.scorecardHeaderText}>Hole</Text>
                      <Text style={styles.scorecardHeaderText}>Par</Text>
                      <Text style={styles.scorecardHeaderText}>Distance</Text>
                      <Text style={styles.scorecardHeaderText}>Score</Text>
                    </View>
                    {round.course.holes.map((hole) => (
                      <View key={hole.number} style={styles.scorecardRow}>
                        <Text style={styles.scorecardText}>{hole.number}</Text>
                        <Text style={styles.scorecardText}>{hole.par}</Text>
                        <Text style={styles.scorecardText}>
                          {hole.distance} ft
                        </Text>
                        <Text style={styles.scorecardText}>{hole.score || '-'}</Text>
                      </View>
                    ))}
                    <View style={styles.scorecardSummary}>
                      <Text style={styles.summaryText}>
                        Total Par: {round.course.totalPar}
                      </Text>
                      <Text style={styles.summaryText}>
                        Total Distance: {round.course.totalDistance.toFixed(1)} ft
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#292929',
    paddingTop: 60,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#FFFFFF',
  },
  roundsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#B0B0B0',
    marginTop: 40,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
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
  scorecard: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#3D3D3D',
    paddingTop: 16,
  },
  scorecardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#3D3D3D',
  },
  scorecardHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  scorecardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#3D3D3D',
  },
  scorecardText: {
    fontSize: 14,
    flex: 1,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  scorecardSummary: {
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#3D3D3D',
  },
  summaryText: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 4,
  },
}); 