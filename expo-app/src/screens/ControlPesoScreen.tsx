import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Dimensions } from 'react-native';
import { Card, Button, TextInput, Dialog, Portal, SegmentedButtons, Chip, IconButton, FAB } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncManager } from '../hooks/useSyncManager';

interface WeightEntry {
  id: string;
  date: string;
  weight: number; // en kg
  bodyFat?: number; // porcentaje
  muscleMass?: number; // en kg
  notes?: string;
}

interface WeightGoal {
  id: string;
  targetWeight: number;
  targetDate: string;
  reason: string;
  isActive: boolean;
}

interface NutritionEntry {
  id: string;
  date: string;
  calories: number;
  protein: number; // en gramos
  carbs: number; // en gramos
  fats: number; // en gramos
  water: number; // en litros
  notes?: string;
}

const ControlPesoScreen = () => {
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [weightGoals, setWeightGoals] = useState<WeightGoal[]>([]);
  const [nutritionEntries, setNutritionEntries] = useState<NutritionEntry[]>([]);
  const [activeTab, setActiveTab] = useState('peso');
  const [entryDialogVisible, setEntryDialogVisible] = useState(false);
  const [goalDialogVisible, setGoalDialogVisible] = useState(false);
  const { syncStatus, updateRemoteData } = useSyncManager();

  // Form states
  const [newWeightEntry, setNewWeightEntry] = useState<Partial<WeightEntry>>({
    weight: 0,
    bodyFat: 0,
    muscleMass: 0,
    notes: ''
  });

  const [newGoal, setNewGoal] = useState<Partial<WeightGoal>>({
    targetWeight: 0,
    targetDate: new Date().toISOString().split('T')[0],
    reason: '',
    isActive: true
  });

  const [newNutrition, setNewNutrition] = useState<Partial<NutritionEntry>>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    water: 2.0,
    notes: ''
  });

  const screenData = Dimensions.get('window');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [weightData, goalsData, nutritionData] = await Promise.all([
        AsyncStorage.getItem('weight-entries'),
        AsyncStorage.getItem('weight-goals'),
        AsyncStorage.getItem('nutrition-entries')
      ]);

      if (weightData) setWeightEntries(JSON.parse(weightData));
      if (goalsData) setWeightGoals(JSON.parse(goalsData));
      if (nutritionData) setNutritionEntries(JSON.parse(nutritionData));
    } catch (error) {
      console.error('Error loading weight data:', error);
    }
  };

  const saveWeightEntries = async (entries: WeightEntry[]) => {
    try {
      await AsyncStorage.setItem('weight-entries', JSON.stringify(entries));
      setWeightEntries(entries);
      
      if (syncStatus.isLinked) {
        updateRemoteData({ weightEntries: entries });
      }
    } catch (error) {
      console.error('Error saving weight entries:', error);
    }
  };

  const saveWeightGoals = async (goals: WeightGoal[]) => {
    try {
      await AsyncStorage.setItem('weight-goals', JSON.stringify(goals));
      setWeightGoals(goals);
      
      if (syncStatus.isLinked) {
        updateRemoteData({ weightGoals: goals });
      }
    } catch (error) {
      console.error('Error saving weight goals:', error);
    }
  };

  const saveNutritionEntries = async (entries: NutritionEntry[]) => {
    try {
      await AsyncStorage.setItem('nutrition-entries', JSON.stringify(entries));
      setNutritionEntries(entries);
      
      if (syncStatus.isLinked) {
        updateRemoteData({ nutritionEntries: entries });
      }
    } catch (error) {
      console.error('Error saving nutrition entries:', error);
    }
  };

  const addWeightEntry = () => {
    if (!newWeightEntry.weight || newWeightEntry.weight <= 0) {
      Alert.alert('Error', 'Por favor ingresa un peso válido');
      return;
    }

    const entry: WeightEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      weight: newWeightEntry.weight!,
      bodyFat: newWeightEntry.bodyFat,
      muscleMass: newWeightEntry.muscleMass,
      notes: newWeightEntry.notes
    };

    const updatedEntries = [entry, ...weightEntries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    saveWeightEntries(updatedEntries);
    setEntryDialogVisible(false);
    setNewWeightEntry({ weight: 0, bodyFat: 0, muscleMass: 0, notes: '' });

    Alert.alert('Éxito', 'Peso registrado correctamente');
  };

  const addGoal = () => {
    if (!newGoal.targetWeight || newGoal.targetWeight <= 0) {
      Alert.alert('Error', 'Por favor ingresa un peso objetivo válido');
      return;
    }

    const goal: WeightGoal = {
      id: Date.now().toString(),
      targetWeight: newGoal.targetWeight!,
      targetDate: newGoal.targetDate!,
      reason: newGoal.reason!,
      isActive: true
    };

    // Deactivate other goals
    const updatedGoals = weightGoals.map(g => ({ ...g, isActive: false }));
    updatedGoals.unshift(goal);

    saveWeightGoals(updatedGoals);
    setGoalDialogVisible(false);
    setNewGoal({ targetWeight: 0, targetDate: new Date().toISOString().split('T')[0], reason: '', isActive: true });

    Alert.alert('Éxito', 'Meta establecida correctamente');
  };

  const getWeightChartData = () => {
    if (weightEntries.length === 0) {
      return {
        labels: [''],
        datasets: [{ data: [0] }]
      };
    }

    const sortedEntries = [...weightEntries]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-10); // Last 10 entries

    return {
      labels: sortedEntries.map(entry => 
        new Date(entry.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
      ),
      datasets: [{
        data: sortedEntries.map(entry => entry.weight),
        strokeWidth: 2,
        color: (opacity = 1) => `rgba(40, 55, 80, ${opacity})`,
      }]
    };
  };

  const getWeightStats = () => {
    if (weightEntries.length === 0) return { current: 0, change: 0, goal: 0 };

    const current = weightEntries[0]?.weight || 0;
    const previous = weightEntries[1]?.weight || current;
    const change = current - previous;
    const activeGoal = weightGoals.find(g => g.isActive);

    return {
      current,
      change,
      goal: activeGoal?.targetWeight || 0,
      progress: activeGoal ? Math.abs(current - activeGoal.targetWeight) : 0
    };
  };

  const getBMI = () => {
    // Assuming average height of 170cm for calculation - in a real app this would be configurable
    const height = 1.70; // meters
    const currentWeight = weightEntries[0]?.weight || 0;
    if (currentWeight === 0) return 0;
    
    return (currentWeight / (height * height)).toFixed(1);
  };

  const getBMICategory = () => {
    const bmi = parseFloat(getBMI());
    if (bmi < 18.5) return { category: 'Bajo peso', color: '#3B82F6' };
    if (bmi < 25) return { category: 'Normal', color: '#10B981' };
    if (bmi < 30) return { category: 'Sobrepeso', color: '#F59E0B' };
    return { category: 'Obesidad', color: '#EF4444' };
  };

  const renderWeightView = () => {
    const stats = getWeightStats();
    const bmiInfo = getBMICategory();

    return (
      <View>
        {/* Current Stats */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Estado Actual</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.current.toFixed(1)}kg</Text>
                <Text style={styles.statLabel}>Peso Actual</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: stats.change >= 0 ? '#EF4444' : '#10B981' }]}>
                  {stats.change >= 0 ? '+' : ''}{stats.change.toFixed(1)}kg
                </Text>
                <Text style={styles.statLabel}>Cambio</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{getBMI()}</Text>
                <Text style={[styles.statLabel, { color: bmiInfo.color }]}>{bmiInfo.category}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.goal.toFixed(1)}kg</Text>
                <Text style={styles.statLabel}>Meta</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Weight Chart */}
        {weightEntries.length > 1 && (
          <Card style={styles.chartCard}>
            <Card.Content>
              <Text style={styles.chartTitle}>Progreso de Peso</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <LineChart
                  data={getWeightChartData()}
                  width={Math.max(screenData.width - 60, 350)}
                  height={220}
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(40, 55, 80, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                    propsForDots: {
                      r: "4",
                      strokeWidth: "2",
                      stroke: "#283750"
                    }
                  }}
                  bezier
                  style={styles.chart}
                />
              </ScrollView>
            </Card.Content>
          </Card>
        )}

        {/* Recent Entries */}
        <Card style={styles.entriesCard}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>Registros Recientes</Text>
              <Button mode="text" onPress={() => setEntryDialogVisible(true)}>
                Agregar
              </Button>
            </View>
            
            {weightEntries.length === 0 ? (
              <Text style={styles.emptyText}>No hay registros de peso</Text>
            ) : (
              weightEntries.slice(0, 5).map((entry) => (
                <View key={entry.id} style={styles.entryItem}>
                  <View style={styles.entryDate}>
                    <Text style={styles.entryDateText}>
                      {new Date(entry.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.entryData}>
                    <Text style={styles.entryWeight}>{entry.weight.toFixed(1)} kg</Text>
                    {entry.bodyFat && (
                      <Text style={styles.entryDetail}>{entry.bodyFat.toFixed(1)}% grasa</Text>
                    )}
                  </View>
                </View>
              ))
            )}
          </Card.Content>
        </Card>

        {/* Active Goal */}
        {weightGoals.find(g => g.isActive) && (
          <Card style={styles.goalCard}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text style={styles.sectionTitle}>Meta Activa</Text>
                <Button mode="text" onPress={() => setGoalDialogVisible(true)}>
                  Cambiar
                </Button>
              </View>
              
              {(() => {
                const activeGoal = weightGoals.find(g => g.isActive)!;
                const progress = ((stats.current - activeGoal.targetWeight) / stats.current * 100);
                
                return (
                  <View>
                    <Text style={styles.goalText}>
                      Objetivo: {activeGoal.targetWeight}kg
                    </Text>
                    <Text style={styles.goalReason}>
                      {activeGoal.reason}
                    </Text>
                    <Text style={styles.goalDate}>
                      Fecha límite: {new Date(activeGoal.targetDate).toLocaleDateString()}
                    </Text>
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill, 
                            { width: `${Math.min(Math.abs(progress), 100)}%` }
                          ]} 
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {Math.abs(stats.current - activeGoal.targetWeight).toFixed(1)}kg restantes
                      </Text>
                    </View>
                  </View>
                );
              })()}
            </Card.Content>
          </Card>
        )}
      </View>
    );
  };

  const renderNutritionView = () => (
    <View>
      <Card style={styles.emptyCard}>
        <Card.Content>
          <Text style={styles.emptyText}>Seguimiento Nutricional</Text>
          <Text style={styles.emptySubtext}>Esta funcionalidad estará disponible pronto para registrar calorías, macronutrientes y hidratación</Text>
        </Card.Content>
      </Card>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={setActiveTab}
          buttons={[
            { value: 'peso', label: 'Peso' },
            { value: 'nutricion', label: 'Nutrición' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <ScrollView style={styles.scrollContainer}>
        {activeTab === 'peso' && renderWeightView()}
        {activeTab === 'nutricion' && renderNutritionView()}
      </ScrollView>

      {/* Weight Entry Dialog */}
      <Portal>
        <Dialog visible={entryDialogVisible} onDismiss={() => setEntryDialogVisible(false)}>
          <Dialog.Title>Registrar Peso</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Peso (kg)"
              value={newWeightEntry.weight?.toString() || ''}
              onChangeText={(text) => setNewWeightEntry({...newWeightEntry, weight: parseFloat(text) || 0})}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              label="Grasa corporal (%) - Opcional"
              value={newWeightEntry.bodyFat?.toString() || ''}
              onChangeText={(text) => setNewWeightEntry({...newWeightEntry, bodyFat: parseFloat(text) || 0})}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              label="Masa muscular (kg) - Opcional"
              value={newWeightEntry.muscleMass?.toString() || ''}
              onChangeText={(text) => setNewWeightEntry({...newWeightEntry, muscleMass: parseFloat(text) || 0})}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              label="Notas"
              value={newWeightEntry.notes || ''}
              onChangeText={(text) => setNewWeightEntry({...newWeightEntry, notes: text})}
              multiline
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEntryDialogVisible(false)}>Cancelar</Button>
            <Button mode="contained" onPress={addWeightEntry}>Guardar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Goal Dialog */}
      <Portal>
        <Dialog visible={goalDialogVisible} onDismiss={() => setGoalDialogVisible(false)}>
          <Dialog.Title>Establecer Meta</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Peso objetivo (kg)"
              value={newGoal.targetWeight?.toString() || ''}
              onChangeText={(text) => setNewGoal({...newGoal, targetWeight: parseFloat(text) || 0})}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              label="Fecha objetivo (YYYY-MM-DD)"
              value={newGoal.targetDate || ''}
              onChangeText={(text) => setNewGoal({...newGoal, targetDate: text})}
              style={styles.input}
            />
            <TextInput
              label="Razón/Motivación"
              value={newGoal.reason || ''}
              onChangeText={(text) => setNewGoal({...newGoal, reason: text})}
              multiline
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setGoalDialogVisible(false)}>Cancelar</Button>
            <Button mode="contained" onPress={addGoal}>Establecer</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* FAB */}
      <FAB
        icon={activeTab === 'peso' ? 'scale' : 'food-apple'}
        style={styles.fab}
        onPress={() => {
          if (activeTab === 'peso') {
            setEntryDialogVisible(true);
          } else {
            Alert.alert(
              "Nutrición",
              "Esta funcionalidad estará disponible pronto",
              [{ text: 'Entendido', style: 'default' }]
            );
          }
        }}
        label={activeTab === 'peso' ? 'Pesar' : 'Comida'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  tabContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  segmentedButtons: {
    backgroundColor: '#F3F4F6',
  },
  scrollContainer: {
    flex: 1,
    padding: 8,
  },
  statsCard: {
    margin: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  chartCard: {
    margin: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  entriesCard: {
    margin: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  goalCard: {
    margin: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  emptyCard: {
    margin: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#283750',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#283750',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#283750',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  entryDate: {
    flex: 1,
  },
  entryDateText: {
    fontSize: 14,
    color: '#6B7280',
  },
  entryData: {
    alignItems: 'flex-end',
  },
  entryWeight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#283750',
  },
  entryDetail: {
    fontSize: 12,
    color: '#6B7280',
  },
  goalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#283750',
    marginBottom: 4,
  },
  goalReason: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  goalDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#283750',
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  input: {
    marginBottom: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#283750',
  },
});

export default ControlPesoScreen;