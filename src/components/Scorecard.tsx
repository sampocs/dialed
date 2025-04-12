import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Course, Hole } from '../types';

interface ScorecardProps {
  course: Course;
}

const Scorecard: React.FC<ScorecardProps> = ({ course }) => {
  console.log('Course data:', course);
  const frontNine = course.holes.slice(0, 9);
  console.log('Front nine:', frontNine);
  const backNine = course.holes.slice(9);
  console.log('Back nine:', backNine);
  
  const calculateCumulativeScore = (holes: Hole[]) => {
    return holes.reduce((sum, hole) => sum + (hole.score || 0), 0);
  };

  const frontNineScore = calculateCumulativeScore(frontNine);
  const backNineScore = calculateCumulativeScore(backNine);
  const totalScore = frontNineScore + backNineScore;

  const renderTable = (holes: Hole[], title: string, totalLabel: string) => {
    console.log(`Rendering ${title} table with holes:`, holes);
    return (
      <View style={styles.tableContainer}>
        <Text style={styles.tableTitle}>{title}</Text>
        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.row}>
            <View style={styles.headerCell}>
              <Text style={styles.headerText}>#</Text>
            </View>
            {holes.map((hole) => (
              <View key={`header-${hole.number}`} style={styles.headerCell}>
                <Text style={styles.headerText}>{hole.number}</Text>
              </View>
            ))}
            <View style={styles.headerCell}>
              <Text style={styles.headerText}>{totalLabel}</Text>
            </View>
          </View>

          {/* Par Row */}
          <View style={styles.row}>
            <View style={styles.labelCell}>
              <Text style={styles.labelText}>Par</Text>
            </View>
            {holes.map((hole) => (
              <View key={`par-${hole.number}`} style={styles.cell}>
                <Text style={styles.cellText}>{hole.par}</Text>
              </View>
            ))}
            <View style={styles.cell}>
              <Text style={styles.cellText}>
                {holes.reduce((sum, hole) => sum + hole.par, 0)}
              </Text>
            </View>
          </View>

          {/* Distance Row */}
          <View style={styles.row}>
            <View style={styles.labelCell}>
              <Text style={styles.labelText}>Distance</Text>
            </View>
            {holes.map((hole) => (
              <View key={`distance-${hole.number}`} style={styles.cell}>
                <Text style={styles.cellText}>{hole.distance}ft</Text>
              </View>
            ))}
            <View style={styles.cell}>
              <Text style={styles.cellText}>
                {holes.reduce((sum, hole) => sum + hole.distance, 0)}ft
              </Text>
            </View>
          </View>

          {/* Score Row */}
          <View style={styles.row}>
            <View style={styles.labelCell}>
              <Text style={styles.labelText}>Score</Text>
            </View>
            {holes.map((hole) => (
              <View key={`score-${hole.number}`} style={styles.cell}>
                <Text style={styles.cellText}>{hole.score || '-'}</Text>
              </View>
            ))}
            <View style={styles.cell}>
              <Text style={styles.cellText}>
                {holes.reduce((sum, hole) => sum + (hole.score || 0), 0)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.totalScore}>
        Total Score: {totalScore} ({totalScore - course.totalPar > 0 ? '+' : ''}{totalScore - course.totalPar})
      </Text>
      {renderTable(frontNine, 'Front Nine', 'F')}
      {renderTable(backNine, 'Back Nine', 'B')}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
    width: '100%',
  },
  totalScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  tableContainer: {
    marginBottom: 24,
    width: '100%',
    paddingHorizontal: 0,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B0B0B0',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  table: {
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 8,
    overflow: 'hidden',
    width: '100%',
    marginHorizontal: 0,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#3D3D3D',
  },
  headerCell: {
    flex: 1,
    minWidth: 0,
    padding: 12,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#3D3D3D',
    backgroundColor: '#3D3D3D',
  },
  labelCell: {
    flex: 1,
    minWidth: 0,
    padding: 12,
    alignItems: 'flex-start',
    borderRightWidth: 1,
    borderRightColor: '#3D3D3D',
    backgroundColor: '#3D3D3D',
  },
  cell: {
    flex: 1,
    minWidth: 0,
    padding: 12,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#3D3D3D',
    backgroundColor: '#292929',
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  labelText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cellText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});

export default Scorecard; 