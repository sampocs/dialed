import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Course, Hole } from '../types';

interface ScorecardProps {
  course: Course;
}

const Scorecard: React.FC<ScorecardProps> = ({ course }) => {
  console.log('Course data received in Scorecard:', course);
  
  // Safety check for course data
  if (!course || !course.holes || !Array.isArray(course.holes)) {
    console.error('Invalid course data:', course);
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Unable to display scorecard</Text>
      </View>
    );
  }
  
  const frontNine = course.holes.slice(0, 9);
  const backNine = course.holes.slice(9);
  
  const calculateCumulativeScore = (holes: Hole[]) => {
    return holes.reduce((sum, hole) => sum + (hole.score || 0), 0);
  };

  const frontNineScore = calculateCumulativeScore(frontNine);
  const backNineScore = calculateCumulativeScore(backNine);
  const totalScore = frontNineScore + backNineScore;

  // Get completed holes (holes with a score)
  const completedHoles = course.holes.filter(hole => hole.score !== undefined);
  
  // Calculate total par for completed holes only
  const completedHolesPar = completedHoles.reduce((sum, hole) => sum + hole.par, 0);
  
  // Calculate total score for completed holes only
  const completedHolesScore = completedHoles.reduce((sum, hole) => sum + (hole.score || 0), 0);
  
  // Calculate differential based on completed holes only
  const differential = completedHolesScore - completedHolesPar;

  const renderTable = (holes: Hole[], title: string, totalLabel: string) => {
    // Calculate total score for this set of holes
    const totalScore = holes.reduce((sum, hole) => sum + (hole.score || 0), 0);
    
    return (
      <View style={styles.tableContainer}>
        <Text style={styles.tableTitle}>{title}</Text>
        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.row}>
            <View style={styles.headerLabelCell}>
              <Text style={styles.headerText}>#</Text>
            </View>
            {holes.map((hole) => (
              <View key={`header-${hole.number}`} style={styles.headerCell}>
                <Text style={styles.headerText}>{hole.number}</Text>
              </View>
            ))}
            <View style={styles.headerLastCell}>
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
            {holes.map((hole) => (
              <View key={`distance-${hole.number}`} style={styles.cell}>
                <Text style={styles.cellText}>{hole.distance}</Text>
              </View>
            ))}
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
            {holes.map((hole) => (
              <View key={`score-${hole.number}`} style={styles.cell}>
                <Text style={styles.cellText}>{hole.score || '-'}</Text>
              </View>
            ))}
            <View style={styles.lastCell}>
              <Text style={styles.cellText}>
                {totalScore > 0 ? totalScore : '-'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
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
    width: '100%', // Changed from fixed width to responsive
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#3D3D3D',
  },
  headerCell: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 2,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#3D3D3D',
    backgroundColor: '#3D3D3D',
  },
  headerLabelCell: {
    width: 55,
    paddingVertical: 5,
    paddingHorizontal: 2,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#3D3D3D',
    backgroundColor: '#3D3D3D',
  },
  headerLastCell: {
    width: 40,
    paddingVertical: 5,
    paddingHorizontal: 2,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#3D3D3D',
    backgroundColor: '#3D3D3D',
  },
  labelCell: {
    width: 55,
    paddingVertical: 5,
    paddingHorizontal: 2,
    alignItems: 'flex-start',
    borderRightWidth: 1,
    borderRightColor: '#3D3D3D',
    backgroundColor: '#3D3D3D',
  },
  cell: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 2,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#3D3D3D',
    backgroundColor: '#292929',
  },
  lastCell: {
    width: 40,
    paddingVertical: 5,
    paddingHorizontal: 2,
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
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  }
});

export default Scorecard; 