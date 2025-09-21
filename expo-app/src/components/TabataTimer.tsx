import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Button, TextInput, Switch, Chip, IconButton, Dialog, Portal, RadioButton } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useTimerContext } from '../hooks/useTimerContext';

const TabataTimer = () => {
  const { state, actions } = useTimerContext();
  
  // Estados locales para diálogos
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [sequenceVisible, setSequenceVisible] = useState(false);
  
  // Estados locales para secuencias
  const [newTabataName, setNewTabataName] = useState('');
  const [newTabataConfig, setNewTabataConfig] = useState({
    workTime: '20',
    restTime: '10',
    cycles: '8',
    sets: '1',
    restBetweenSets: '60'
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Helper functions
  const handleToggleTimer = () => {
    if (state.isRunning) {
      actions.pauseTimer();
    } else {
      actions.startTimer();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentDisplayTime = () => {
    if (state.mode === 'stopwatch') {
      return formatTime(state.stopwatchTime);
    } else {
      return formatTime(state.timeLeft);
    }
  };

  const getPhaseText = () => {
    if (state.isCompleted) {
      return state.mode === 'timer' ? '¡Tiempo terminado!' : '¡Completado!';
    }
    
    if (state.mode === 'stopwatch') {
      return 'CRONÓMETRO';
    } else if (state.mode === 'timer') {
      return 'TEMPORIZADOR';
    } else if (state.mode === 'tabata') {
      if (state.isSetRest) return 'Descanso entre sets';
      return state.isWorkPhase ? 'TRABAJO' : 'DESCANSO';
    }
    
    return '';
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

  const getModeTitle = () => {
    switch (state.mode) {
      case 'tabata': return 'Timer Tabata';
      case 'timer': return 'Temporizador';
      case 'stopwatch': return 'Cronómetro';
      default: return 'Timer';
    }
  };

  const getModeDescription = () => {
    switch (state.mode) {
      case 'tabata': 
        if (state.isSequenceMode && state.tabataSequence.length > 0) {
          return `Secuencia ${state.currentTabataIndex + 1}/${state.tabataSequence.length}`;
        }
        return 'Entrenamiento por intervalos';
      case 'timer': return 'Cuenta regresiva personalizable';
      case 'stopwatch': return 'Cronómetro';
      default: return '';
    }
  };

  // Funciones para manejar secuencias
  const handleAddTabataToSequence = () => {
    const tabataConfig = {
      workTime: parseInt(newTabataConfig.workTime) || 20,
      restTime: parseInt(newTabataConfig.restTime) || 10,
      cycles: parseInt(newTabataConfig.cycles) || 8,
      sets: parseInt(newTabataConfig.sets) || 1,
      restBetweenSets: parseInt(newTabataConfig.restBetweenSets) || 60,
      name: newTabataName || `Tabata ${state.tabataSequence.length + 1}`
    };
    actions.addTabataToSequence(tabataConfig);
    
    // Reset form
    setNewTabataName('');
    setNewTabataConfig({
      workTime: '20',
      restTime: '10',
      cycles: '8',
      sets: '1',
      restBetweenSets: '60'
    });
  };

  const handleUpdateTabataInSequence = () => {
    if (editingIndex !== null) {
      const tabataConfig = {
        workTime: parseInt(newTabataConfig.workTime) || 20,
        restTime: parseInt(newTabataConfig.restTime) || 10,
        cycles: parseInt(newTabataConfig.cycles) || 8,
        sets: parseInt(newTabataConfig.sets) || 1,
        restBetweenSets: parseInt(newTabataConfig.restBetweenSets) || 60,
        name: newTabataName || `Tabata ${editingIndex + 1}`
      };
      actions.updateTabataInSequence(editingIndex, tabataConfig);
      setEditingIndex(null);
      setNewTabataName('');
      setNewTabataConfig({
        workTime: '20',
        restTime: '10',
        cycles: '8',
        sets: '1',
        restBetweenSets: '60'
      });
    }
  };

  const handleEditTabata = (index: number) => {
    const tabata = state.tabataSequence[index];
    setEditingIndex(index);
    setNewTabataName(tabata.name || '');
    setNewTabataConfig({
      workTime: tabata.workTime.toString(),
      restTime: tabata.restTime.toString(),
      cycles: tabata.cycles.toString(),
      sets: tabata.sets.toString(),
      restBetweenSets: tabata.restBetweenSets.toString()
    });
    setSequenceVisible(true);
  };

  const handleRemoveTabata = (index: number) => {
    Alert.alert(
      'Eliminar Tabata',
      '¿Estás seguro de que quieres eliminar este Tabata de la secuencia?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => actions.removeTabataFromSequence(index) }
      ]
    );
  };

  return (
    <Card style={styles.card}>
      {/* Header */}
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialIcons name="fitness-center" size={24} color="#283750" />
            <Text style={styles.title}>{getModeTitle()}</Text>
          </View>
          <IconButton 
            icon={({ size, color }) => (
              <MaterialIcons name="settings" size={size} color={color} />
            )}
            onPress={() => setSettingsVisible(true)} 
          />
        </View>
        
        <Text style={styles.description}>{getModeDescription()}</Text>
        
        {/* Phase indicator */}
        <View style={styles.phaseContainer}>
          <Text style={[styles.phaseText, { color: getPhaseColor() }]}>
            {getPhaseText()}
          </Text>
        </View>
        
        {/* Timer display */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{getCurrentDisplayTime()}</Text>
        </View>
        
        {/* Tabata info */}
        {state.mode === 'tabata' && (
          <View style={styles.tabataInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ciclo:</Text>
              <Text style={styles.infoValue}>{state.currentCycle} / {state.tabataConfig.cycles}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Set:</Text>
              <Text style={styles.infoValue}>{state.currentSet} / {state.tabataConfig.sets}</Text>
            </View>
            {state.isSequenceMode && state.tabataSequence.length > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tabata:</Text>
                <Text style={styles.infoValue}>{state.currentTabataIndex + 1} / {state.tabataSequence.length}</Text>
              </View>
            )}
          </View>
        )}
        
        {/* Controls */}
        <View style={styles.controls}>
          <Button
            mode={state.isRunning ? "outlined" : "contained"}
            onPress={handleToggleTimer}
            icon={({ size, color }) => (
              <MaterialIcons 
                name={state.isRunning ? "pause" : "play-arrow"} 
                size={size} 
                color={color} 
              />
            )}
            style={styles.controlButton}
          >
            {state.isRunning ? 'Pausar' : (state.isPaused ? 'Reanudar' : 'Iniciar')}
          </Button>
          <Button
            mode="outlined"
            onPress={actions.resetTimer}
            icon={({ size, color }) => (
              <MaterialIcons name="restart-alt" size={size} color={color} />
            )}
            style={styles.controlButton}
          >
            Reiniciar
          </Button>
        </View>
      </Card.Content>

      {/* Settings Dialog */}
      <Portal>
        <Dialog visible={settingsVisible} onDismiss={() => setSettingsVisible(false)}>
          <Dialog.Title>Configuración del Timer</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              {/* Mode selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Modo de Timer</Text>
                <RadioButton.Group
                  onValueChange={(value) => actions.setMode(value as any)}
                  value={state.mode}
                >
                  <RadioButton.Item label="Tabata" value="tabata" />
                  <RadioButton.Item label="Temporizador" value="timer" />
                  <RadioButton.Item label="Cronómetro" value="stopwatch" />
                </RadioButton.Group>
              </View>

              {/* Tabata config */}
              {state.mode === 'tabata' && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Configuración Tabata</Text>
                  <View style={styles.inputRow}>
                    <View style={styles.inputContainer}>
                      <Text>Trabajo (seg)</Text>
                      <TextInput
                        mode="outlined"
                        value={state.tabataConfig.workTime.toString()}
                        onChangeText={(text) => actions.updateTabataConfig({
                          ...state.tabataConfig,
                          workTime: parseInt(text) || 20
                        })}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <Text>Descanso (seg)</Text>
                      <TextInput
                        mode="outlined"
                        value={state.tabataConfig.restTime.toString()}
                        onChangeText={(text) => actions.updateTabataConfig({
                          ...state.tabataConfig,
                          restTime: parseInt(text) || 10
                        })}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                  <View style={styles.inputRow}>
                    <View style={styles.inputContainer}>
                      <Text>Ciclos</Text>
                      <TextInput
                        mode="outlined"
                        value={state.tabataConfig.cycles.toString()}
                        onChangeText={(text) => actions.updateTabataConfig({
                          ...state.tabataConfig,
                          cycles: parseInt(text) || 8
                        })}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <Text>Sets</Text>
                      <TextInput
                        mode="outlined"
                        value={state.tabataConfig.sets.toString()}
                        onChangeText={(text) => actions.updateTabataConfig({
                          ...state.tabataConfig,
                          sets: parseInt(text) || 1
                        })}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                  <View style={styles.inputContainer}>
                    <Text>Descanso entre sets (seg)</Text>
                    <TextInput
                      mode="outlined"
                      value={state.tabataConfig.restBetweenSets.toString()}
                      onChangeText={(text) => actions.updateTabataConfig({
                        ...state.tabataConfig,
                        restBetweenSets: parseInt(text) || 60
                      })}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              )}

              {/* Timer config */}
              {state.mode === 'timer' && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Configuración Timer</Text>
                  <View style={styles.inputRow}>
                    <View style={styles.inputContainer}>
                      <Text>Minutos</Text>
                      <TextInput
                        mode="outlined"
                        value={state.timerConfig.minutes.toString()}
                        onChangeText={(text) => actions.updateTimerConfig({
                          ...state.timerConfig,
                          minutes: parseInt(text) || 0
                        })}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <Text>Segundos</Text>
                      <TextInput
                        mode="outlined"
                        value={state.timerConfig.seconds.toString()}
                        onChangeText={(text) => actions.updateTimerConfig({
                          ...state.timerConfig,
                          seconds: parseInt(text) || 0
                        })}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.section}>
                <Button onPress={() => setSequenceVisible(true)} mode="outlined">
                  Gestionar Secuencias
                </Button>
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setSettingsVisible(false)}>Cerrar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Sequence Dialog */}
      <Portal>
        <Dialog visible={sequenceVisible} onDismiss={() => setSequenceVisible(false)}>
          <Dialog.Title>Secuencias Tabata</Dialog.Title>
          <Dialog.ScrollArea style={styles.sequenceDialog}>
            <ScrollView>
              {/* Sequence mode toggle */}
              <View style={styles.section}>
                <View style={styles.switchRow}>
                  <Text>Modo Secuencia</Text>
                  <Switch
                    value={state.isSequenceMode}
                    onValueChange={actions.enableSequenceMode}
                  />
                </View>
              </View>

              {/* Current sequence */}
              {state.tabataSequence.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Secuencia Actual ({state.tabataSequence.length})</Text>
                  {state.tabataSequence.map((tabata, index) => (
                    <View key={index} style={[
                      styles.sequenceItem,
                      state.isSequenceMode && state.currentTabataIndex === index && styles.currentSequenceItem
                    ]}>
                      <View style={styles.sequenceItemContent}>
                        <Text style={styles.sequenceItemTitle}>{tabata.name || `Tabata ${index + 1}`}</Text>
                        <Text style={styles.sequenceItemDetail}>
                          {tabata.workTime}s / {tabata.restTime}s × {tabata.cycles} × {tabata.sets}
                        </Text>
                      </View>
                      <View style={styles.sequenceItemActions}>
                        <IconButton 
                          icon={({ size, color }) => (
                            <MaterialIcons name="edit" size={size} color={color} />
                          )}
                          size={16} 
                          onPress={() => handleEditTabata(index)} 
                        />
                        <IconButton 
                          icon={({ size, color }) => (
                            <MaterialIcons name="delete" size={size} color={color} />
                          )}
                          size={16} 
                          onPress={() => handleRemoveTabata(index)} 
                        />
                      </View>
                    </View>
                  ))}
                  <Button
                    mode="outlined"
                    onPress={actions.clearTabataSequence}
                    style={styles.clearButton}
                  >
                    Limpiar Secuencia
                  </Button>
                </View>
              )}

              {/* Add/Edit form */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {editingIndex !== null ? 'Editar Tabata' : 'Agregar Nuevo Tabata'}
                </Text>
                
                <TextInput
                  mode="outlined"
                  label="Nombre del Tabata"
                  value={newTabataName}
                  onChangeText={setNewTabataName}
                  placeholder="Ej: Calentamiento, Principal"
                  style={styles.input}
                />
                
                <View style={styles.inputRow}>
                  <View style={styles.inputContainer}>
                    <Text>Trabajo (seg)</Text>
                    <TextInput
                      mode="outlined"
                      value={newTabataConfig.workTime}
                      onChangeText={(text) => setNewTabataConfig({...newTabataConfig, workTime: text})}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Text>Descanso (seg)</Text>
                    <TextInput
                      mode="outlined"
                      value={newTabataConfig.restTime}
                      onChangeText={(text) => setNewTabataConfig({...newTabataConfig, restTime: text})}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                
                <View style={styles.inputRow}>
                  <View style={styles.inputContainer}>
                    <Text>Ciclos</Text>
                    <TextInput
                      mode="outlined"
                      value={newTabataConfig.cycles}
                      onChangeText={(text) => setNewTabataConfig({...newTabataConfig, cycles: text})}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Text>Sets</Text>
                    <TextInput
                      mode="outlined"
                      value={newTabataConfig.sets}
                      onChangeText={(text) => setNewTabataConfig({...newTabataConfig, sets: text})}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                
                <TextInput
                  mode="outlined"
                  label="Descanso entre sets (seg)"
                  value={newTabataConfig.restBetweenSets}
                  onChangeText={(text) => setNewTabataConfig({...newTabataConfig, restBetweenSets: text})}
                  keyboardType="numeric"
                  style={styles.input}
                />
                
                <View style={styles.formButtons}>
                  {editingIndex !== null ? (
                    <>
                      <Button mode="contained" onPress={handleUpdateTabataInSequence} style={styles.formButton}>
                        Actualizar
                      </Button>
                      <Button mode="outlined" onPress={() => setEditingIndex(null)} style={styles.formButton}>
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <Button mode="contained" onPress={handleAddTabataToSequence} style={styles.formButton}>
                      Agregar Tabata
                    </Button>
                  )}
                </View>
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setSequenceVisible(false)}>Cerrar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 8,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#283750',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  phaseContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  phaseText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: '#283750',
  },
  tabataInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  infoRow: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#283750',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  controlButton: {
    minWidth: 120,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#283750',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sequenceDialog: {
    maxHeight: 400,
  },
  sequenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    marginBottom: 4,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  currentSequenceItem: {
    backgroundColor: '#EBF8FF',
    borderColor: '#3B82F6',
    borderWidth: 1,
  },
  sequenceItemContent: {
    flex: 1,
  },
  sequenceItemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#283750',
  },
  sequenceItemDetail: {
    fontSize: 12,
    color: '#6B7280',
  },
  sequenceItemActions: {
    flexDirection: 'row',
  },
  clearButton: {
    marginTop: 8,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  formButton: {
    flex: 1,
  },
});

export default TabataTimer;