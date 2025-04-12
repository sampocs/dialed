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
            <View style={styles.headerLabelCell}>
              <Text style={styles.headerText}>#</Text>
            </View>
            {holes.map((hole) => {
              console.log(`Rendering hole ${hole.number} with score:`, hole.score);
              return (
                <View key={`header-${hole.number}`} style={styles.headerCell}>
                  <Text style={styles.headerText}>{hole.number}</Text>
                </View>
              );
            })}
            <View style={styles.headerLastCell}>
              <Text style={styles.headerText}>{totalLabel}</Text>
            </View>
          </View>

          {/* Par Row */}
          <View style={styles.row}>
            <View style={styles.labelCell}>
              <Text style={styles.labelText}>Par</Text>
            </View>
            {holes.map((hole) => {
              console.log(`Rendering par for hole ${hole.number}:`, hole.par);
              return (
                <View key={`par-${hole.number}`} style={styles.cell}>
                  <Text style={styles.cellText}>{hole.par}</Text>
                </View>
              );
            })}
            <View style={styles.lastCell}>
              <Text style={styles.cellText}>
                {holes.reduce((sum, hole) => sum + hole.par, 0)}
              </Text>
            </View>
          </View>

          {/* Distance Row */}
          <View style={styles.row}>
            <View style={styles.labelCell}>
              <Text style={styles.labelText}>Length</Text>
            </View>
            {holes.map((hole) => {
              console.log(`Rendering distance for hole ${hole.number}:`, hole.distance);
              return (
                <View key={`distance-${hole.number}`} style={styles.cell}>
                  <Text style={styles.cellText}>{hole.distance}</Text>
                </View>
              );
            })}
            <View style={styles.lastCell}>
              <Text style={styles.cellText}>
                {holes.reduce((sum, hole) => sum + hole.distance, 0)}
              </Text>
            </View>
          </View>

          {/* Score Row */}
          <View style={styles.row}>
            <View style={styles.labelCell}>
              <Text style={styles.labelText}>Score</Text>
            </View>
            {holes.map((hole) => {
              console.log(`Rendering score for hole ${hole.number}:`, hole.score);
              return (
                <View key={`score-${hole.number}`} style={styles.cell}>
                  <Text style={styles.cellText}>{hole.score || '-'}</Text>
                </View>
              );
            })}
            <View style={styles.lastCell}>
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
    backgroundColor: 'transparent',
  },
  totalScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  tableContainer: {
    marginBottom: 24,
    width: '100%',
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  table: {
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 8,
    overflow: 'hidden',
    width: 365,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#3D3D3D',
  },
  headerCell: {
    width: 30,
    padding: 5,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#3D3D3D',
    backgroundColor: '#3D3D3D',
  },
  headerLabelCell: {
    width: 55,
    padding: 5,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#3D3D3D',
    backgroundColor: '#3D3D3D',
  },
  headerLastCell: {
    width: 40,
    padding: 5,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#3D3D3D',
    backgroundColor: '#3D3D3D',
  },
  labelCell: {
    width: 55,
    padding: 5,
    alignItems: 'flex-start',
    borderRightWidth: 1,
    borderRightColor: '#3D3D3D',
    backgroundColor: '#3D3D3D',
  },
  cell: {
    width: 30,
    padding: 5,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#3D3D3D',
    backgroundColor: '#292929',
  },
  lastCell: {
    width: 40,
    padding: 5,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#3D3D3D',
    backgroundColor: '#292929',
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  labelText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  cellText: {
    color: '#FFFFFF',
    fontSize: 13,
  },
});

export default Scorecard; 