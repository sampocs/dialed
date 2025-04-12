import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface FilterTogglesProps {
  holeCountFilter: 9 | 18 | null;
  courseModeFilter: "Indoor" | "Outdoor" | null;
  setHoleCountFilter: (value: 9 | 18 | null) => void;
  setCourseModeFilter: (value: "Indoor" | "Outdoor" | null) => void;
  showBestRoundIndicator?: boolean;
  showAllOptions?: boolean;
  holeCountLabel?: string;
  courseModeLabel?: string;
}

export default function FilterToggles({
  holeCountFilter,
  courseModeFilter,
  setHoleCountFilter,
  setCourseModeFilter,
  showBestRoundIndicator = true,
  showAllOptions = true,
  holeCountLabel = "Holes",
  courseModeLabel = "Course Mode"
}: FilterTogglesProps) {
  return (
    <View style={styles.filterSection}>
      {/* Hole Count Toggle */}
      <Text style={styles.toggleLabel}>{holeCountLabel}</Text>
      <View style={styles.toggleContainer}>
        {showAllOptions && (
          <TouchableOpacity 
            style={[styles.toggleButton, holeCountFilter === null && styles.toggleButtonSelected]} 
            onPress={() => setHoleCountFilter(null)}
          >
            <Text style={[styles.toggleText, holeCountFilter === null && styles.toggleTextSelected]}>All</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.toggleButton, holeCountFilter === 9 && styles.toggleButtonSelected]} 
          onPress={() => setHoleCountFilter(9)}
        >
          <Text style={[styles.toggleText, holeCountFilter === 9 && styles.toggleTextSelected]}>9 Holes</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleButton, holeCountFilter === 18 && styles.toggleButtonSelected]} 
          onPress={() => setHoleCountFilter(18)}
        >
          <Text style={[styles.toggleText, holeCountFilter === 18 && styles.toggleTextSelected]}>18 Holes</Text>
        </TouchableOpacity>
      </View>
      
      {/* Course Mode Toggle */}
      <Text style={styles.toggleLabel}>{courseModeLabel}</Text>
      <View style={styles.toggleContainer}>
        {showAllOptions && (
          <TouchableOpacity 
            style={[styles.toggleButton, courseModeFilter === null && styles.toggleButtonSelected]} 
            onPress={() => setCourseModeFilter(null)}
          >
            <Text style={[styles.toggleText, courseModeFilter === null && styles.toggleTextSelected]}>All</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.toggleButton, courseModeFilter === "Indoor" && styles.toggleButtonSelected]} 
          onPress={() => setCourseModeFilter("Indoor")}
        >
          <Text style={[styles.toggleText, courseModeFilter === "Indoor" && styles.toggleTextSelected]}>Indoor</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleButton, courseModeFilter === "Outdoor" && styles.toggleButtonSelected]} 
          onPress={() => setCourseModeFilter("Outdoor")}
        >
          <Text style={[styles.toggleText, courseModeFilter === "Outdoor" && styles.toggleTextSelected]}>Outdoor</Text>
        </TouchableOpacity>
      </View>
      
      {/* Best round indicator - Optional */}
      {showBestRoundIndicator && (
        <View style={styles.bestRoundIndicator}>
          <View style={styles.bestRoundIndicatorDot}></View>
          <Text style={styles.bestRoundIndicatorText}>Green border indicates best round in each category</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  filterSection: {
    paddingBottom: 10,
    paddingHorizontal: 20,
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
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonSelected: {
    backgroundColor: '#93C757',
  },
  toggleText: {
    color: '#B0B0B0',
    fontSize: 14,
    fontWeight: '500',
  },
  toggleTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  bestRoundIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 5,
  },
  bestRoundIndicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#93C757',
    marginRight: 8,
  },
  bestRoundIndicatorText: {
    fontSize: 12,
    color: '#B0B0B0',
    fontStyle: 'italic',
  },
}); 