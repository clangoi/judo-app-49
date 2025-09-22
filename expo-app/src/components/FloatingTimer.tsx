import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Dimensions } from 'react-native';
import { IconButton, Surface } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useTimerContext } from '../hooks/useTimerContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface FloatingTimerProps {
  visible: boolean;
  onClose: () => void;
}

const FloatingTimer: React.FC<FloatingTimerProps> = ({ visible, onClose }) => {
  const { state, actions } = useTimerContext();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Position state for dragging
  const pan = useRef(new Animated.ValueXY({
    x: screenWidth - 100, // Default position: top right
    y: 80
  })).current;
  
  // Pan responder for dragging
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (evt, gestureState) => {
        pan.flattenOffset();
        
        // Keep timer within screen bounds
        const newX = Math.max(10, Math.min(screenWidth - 80, pan.x._value));
        const newY = Math.max(50, Math.min(screenHeight - 100, pan.y._value));
        
        Animated.spring(pan, {
          toValue: { x: newX, y: newY },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getCurrentTime = () => {
    if (state.mode === 'stopwatch') {
      return formatTime(state.stopwatchTime);
    } else {
      return formatTime(state.timeLeft);
    }
  };
  
  const getPhaseColor = () => {
    if (state.isCompleted) return '#10B981'; // green
    
    if (state.mode === 'stopwatch') {
      return '#3B82F6'; // blue
    } else if (state.mode === 'timer') {
      return '#F59E0B'; // orange
    } else if (state.mode === 'tabata') {
      if (state.isSetRest) return '#3B82F6'; // blue
      return state.isWorkPhase ? '#EF4444' : '#F59E0B'; // red : yellow
    }
    
    return '#6B7280'; // gray
  };
  
  const getPhaseText = () => {
    if (state.isCompleted) {
      return state.mode === 'timer' ? '¡Terminado!' : '¡Completado!';
    }
    
    if (state.mode === 'stopwatch') {
      return 'CRONÓMETRO';
    } else if (state.mode === 'timer') {
      return 'TIMER';
    } else if (state.mode === 'tabata') {
      if (state.isSetRest) return 'DESCANSO SET';
      return state.isWorkPhase ? 'TRABAJO' : 'DESCANSO';
    }
    
    return '';
  };
  
  const handleToggleTimer = () => {
    if (state.isRunning) {
      actions.pauseTimer();
    } else {
      actions.startTimer();
    }
  };
  
  if (!visible) return null;
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <Surface style={[
        styles.bubble,
        isExpanded && styles.expandedBubble,
        { borderColor: getPhaseColor() }
      ]}>
        {/* Compact view */}
        {!isExpanded && (
          <View style={styles.compactContent}>
            <Text style={styles.compactTime}>{getCurrentTime()}</Text>
            <View style={styles.compactControls}>
              <IconButton
                icon={({ size, color }) => (
                  <MaterialIcons 
                    name={state.isRunning ? "pause" : "play-arrow"} 
                    size={16} 
                    color={color} 
                  />
                )}
                size={16}
                onPress={handleToggleTimer}
                style={styles.compactButton}
              />
              <IconButton
                icon={({ size, color }) => (
                  <MaterialIcons name="expand-more" size={16} color={color} />
                )}
                size={16}
                onPress={() => setIsExpanded(true)}
                style={styles.compactButton}
              />
            </View>
          </View>
        )}
        
        {/* Expanded view */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.header}>
              <Text style={[styles.phaseText, { color: getPhaseColor() }]}>
                {getPhaseText()}
              </Text>
              <IconButton
                icon={({ size, color }) => (
                  <MaterialIcons name="expand-less" size={size} color={color} />
                )}
                size={20}
                onPress={() => setIsExpanded(false)}
                style={styles.headerButton}
              />
            </View>
            
            <Text style={styles.expandedTime}>{getCurrentTime()}</Text>
            
            {/* Tabata info */}
            {state.mode === 'tabata' && (
              <View style={styles.tabataInfo}>
                <Text style={styles.infoText}>
                  Ciclo {state.currentCycle}/{state.tabataConfig.cycles}
                </Text>
                <Text style={styles.infoText}>
                  Set {state.currentSet}/{state.tabataConfig.sets}
                </Text>
              </View>
            )}
            
            <View style={styles.expandedControls}>
              <IconButton
                icon={({ size, color }) => (
                  <MaterialIcons 
                    name={state.isRunning ? "pause" : "play-arrow"} 
                    size={size} 
                    color={color} 
                  />
                )}
                mode="contained"
                onPress={handleToggleTimer}
                style={styles.controlButton}
              />
              <IconButton
                icon={({ size, color }) => (
                  <MaterialIcons name="restart-alt" size={size} color={color} />
                )}
                mode="outlined"
                onPress={actions.resetTimer}
                style={styles.controlButton}
              />
              <IconButton
                icon={({ size, color }) => (
                  <MaterialIcons name="close" size={size} color={color} />
                )}
                mode="outlined"
                onPress={onClose}
                style={styles.controlButton}
              />
            </View>
          </View>
        )}
      </Surface>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
  },
  bubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    borderWidth: 2,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  expandedBubble: {
    borderRadius: 16,
    minWidth: 200,
  },
  compactContent: {
    padding: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  compactTime: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: '#283750',
    marginBottom: 4,
  },
  compactControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactButton: {
    margin: 0,
    padding: 2,
  },
  expandedContent: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  phaseText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerButton: {
    margin: 0,
    padding: 0,
  },
  expandedTime: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: '#283750',
    textAlign: 'center',
    marginBottom: 8,
  },
  tabataInfo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 10,
    color: '#6B7280',
  },
  expandedControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  controlButton: {
    margin: 0,
  },
});

export default FloatingTimer;