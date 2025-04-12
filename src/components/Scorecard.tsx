import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Course, Hole } from '../types';

interface ScorecardProps {
  course: Course;
  showCourseMode?: boolean;
}

const Scorecard: React.FC<ScorecardProps> = ({ course, showCourseMode = true }) => {
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

  const totalDistance = course.totalDistance || frontNine.reduce((sum: number, hole: Hole) => sum + hole.distance, 0) + backNine.reduce((sum: number, hole: Hole) => sum + hole.distance, 0);
  const totalPar = course.totalPar || frontNine.reduce((sum: number, hole: Hole) => sum + hole.par, 0) + backNine.reduce((sum: number, hole: Hole) => sum + hole.par, 0);

  // Format the differential with a + or - sign
  const formatDifferential = (diff: number) => {
    if (diff === 0) return 'E';
    return diff > 0 ? `+${diff}` : `${diff}`;
  };

  // Create summary text based on completed score
  const renderSummary = () => {
    // Only show score information if there's at least one completed hole
    if (completedHoles.length === 0) {
      return (
        <View style={styles.summaryContainer}>
          {showCourseMode && (
            <Text style={styles.courseMode}>{course.courseMode}</Text>
          )}
          <Text style={styles.summaryText}>
            Length: {totalDistance} {course.courseMode === "Indoor" ? "ft" : "yd"}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.summaryContainer}>
        {showCourseMode && (
          <Text style={styles.courseMode}>{course.courseMode}</Text>
        )}
        <Text style={styles.summaryText}>
          Length: {totalDistance} {course.courseMode === "Indoor" ? "ft" : "yd"}
          {'         '}Score: {completedHolesScore} ({formatDifferential(differential)})
        </Text>
      </View>
    );
  };

  const renderTable = (holes: Hole[], totalLabel: string, title?: string) => {
    // Calculate total score for this set of holes
    const totalScore = holes.reduce((sum, hole) => sum + (hole.score || 0), 0);
    
    return (
      <View style={styles.tableContainer}>
        {title && <Text style={styles.tableTitle}>{title}</Text>}
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
            {holes.map((hole) => {
              // Skip rendering if no score
              if (hole.score === undefined) {
                return (
                  <View key={`score-${hole.number}`} style={styles.cell}>
                    <Text style={styles.cellText}>-</Text>
                  </View>
                );
              }
              
              // Calculate relation to par
              const relativeToPar = hole.score - hole.par;
              
              // For par (0), just show the number
              if (relativeToPar === 0) {
                return (
                  <View key={`score-${hole.number}`} style={styles.cell}>
                    <View style={styles.parIndicator}>
                      <Text style={styles.scoreIndicatorText}>{hole.score}</Text>
                    </View>
                  </View>
                );
              }
              
              // For birdie (-1), show in a circle
              else if (relativeToPar === -1) {
                return (
                  <View key={`score-${hole.number}`} style={styles.cell}>
                    <View style={styles.birdieIndicator}>
                      <Text style={styles.scoreIndicatorText}>{hole.score}</Text>
                    </View>
                  </View>
                );
              }
              
              // For eagle (-2), show in a double circle
              else if (relativeToPar <= -2) {
                return (
                  <View key={`score-${hole.number}`} style={styles.cell}>
                    <View style={styles.eagleIndicator}>
                      <Text style={styles.scoreIndicatorText}>{hole.score}</Text>
                    </View>
                  </View>
                );
              }
              
              // For bogey (+1), show in a square
              else if (relativeToPar === 1) {
                return (
                  <View key={`score-${hole.number}`} style={styles.cell}>
                    <View style={styles.bogeyIndicator}>
                      <Text style={styles.scoreIndicatorText}>{hole.score}</Text>
                    </View>
                  </View>
                );
              }
              
              // For double bogey (+2 or worse), show in a double square
              else {
                return (
                  <View key={`score-${hole.number}`} style={styles.cell}>
                    <View style={styles.doubleBogeyIndicator}>
                      <Text style={styles.scoreIndicatorText}>{hole.score}</Text>
                    </View>
                  </View>
                );
              }
            })}
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
      {course.holeCount === 9 ? (
        // For 9-hole courses, don't show a title
        renderTable(frontNine, 'T')
      ) : (
        // For 18-hole courses, don't show titles either
        <>
          {renderTable(frontNine, 'F')}
          {renderTable(backNine, 'B')}
        </>
      )}
      {renderSummary()}
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
    height: 30,
    paddingVertical: 5,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#3D3D3D',
    backgroundColor: '#3D3D3D',
  },
  headerLabelCell: {
    width: 55,
    height: 30,
    paddingVertical: 5,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#3D3D3D',
    backgroundColor: '#3D3D3D',
  },
  headerLastCell: {
    width: 40,
    height: 30,
    paddingVertical: 5,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#3D3D3D',
    backgroundColor: '#3D3D3D',
  },
  labelCell: {
    width: 55,
    height: 30,
    paddingVertical: 5,
    paddingHorizontal: 2,
    paddingLeft: 4,
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#3D3D3D',
    backgroundColor: '#3D3D3D',
  },
  cell: {
    flex: 1,
    height: 30,
    paddingVertical: 5,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#3D3D3D',
    backgroundColor: '#292929',
  },
  lastCell: {
    width: 40,
    height: 30,
    paddingVertical: 5,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  summaryContainer: {
    paddingHorizontal: 16,
    marginTop: 4,
    alignItems: 'center',
    width: '100%',
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  courseMode: {
    fontSize: 14,
    color: '#B0B0B0',
    textAlign: 'center',
    marginBottom: 8,
  },
  // Score indicators
  parIndicator: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  birdieIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#93C757',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eagleIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#93C757',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(147, 199, 87, 0.2)',
  },
  bogeyIndicator: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#93C757',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doubleBogeyIndicator: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#93C757',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(147, 199, 87, 0.2)',
  },
  scoreIndicatorText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
});

export default Scorecard; 