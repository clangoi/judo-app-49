import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Dimensions } from 'react-native';
import { Card, Button, TextInput, Dialog, Portal, SegmentedButtons, Chip, IconButton, FAB } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useCrudStorage } from '../hooks/useCrudStorage';
import EntryList from '../components/EntryList';
import EntryFormModal from '../components/EntryFormModal';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog';

interface WeightEntry {
  id: string;
  createdAt: string;
  updatedAt: string;
  date: string;
  weight: number; // en kg
  bodyFat?: number; // porcentaje
  muscleMass?: number; // en kg
  notes?: string;
}

interface WeightGoal {
  id: string;
  createdAt: string;
  updatedAt: string;
  targetWeight: number;
  targetDate: string;
  reason: string;
  isActive: boolean;
}

interface NutritionEntry {
  id: string;
  createdAt: string;
  updatedAt: string;
  date: string;
  calories: number;
  protein: number; // en gramos
  carbs: number; // en gramos
  fats: number; // en gramos
  water: number; // en litros
  notes?: string;
}

const ControlPesoScreen = () => {
  const { items: weightEntries, isLoading: weightLoading, create: createWeight, update: updateWeight, remove: removeWeight } = useCrudStorage<WeightEntry>({
    storageKey: 'expo:weight:entries',
    remotePayloadKey: 'weightEntries'
  });
  
  const { items: weightGoals, isLoading: goalsLoading, create: createGoal, update: updateGoal, remove: removeGoal } = useCrudStorage<WeightGoal>({
    storageKey: 'expo:weight:goals',
    remotePayloadKey: 'weightGoals'
  });
  
  const { items: nutritionEntries, isLoading: nutritionLoading, create: createNutrition, update: updateNutrition, remove: removeNutrition } = useCrudStorage<NutritionEntry>({
    storageKey: 'expo:weight:nutrition',
    remotePayloadKey: 'nutritionEntries'
  });

  const [activeTab, setActiveTab] = useState('peso');
  
  // CRUD states
  const [formVisible, setFormVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'weight' | 'goal' | 'nutrition'; name: string } | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<WeightEntry | WeightGoal | NutritionEntry | null>(null);
  const [currentFormType, setCurrentFormType] = useState<'weight' | 'goal' | 'nutrition'>('weight');

  // Form states
  const [formWeight, setFormWeight] = useState<Partial<WeightEntry>>({
    date: new Date().toISOString().split('T')[0],
    weight: 0,
    bodyFat: 0,
    muscleMass: 0,
    notes: ''
  });

  const [formGoal, setFormGoal] = useState<Partial<WeightGoal>>({
    targetWeight: 0,
    targetDate: new Date().toISOString().split('T')[0],
    reason: '',
    isActive: true
  });

  const [formNutrition, setFormNutrition] = useState<Partial<NutritionEntry>>({
    date: new Date().toISOString().split('T')[0],
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    water: 2.0,
    notes: ''
  });

  const screenData = Dimensions.get('window');

  // Initialize sample data if needed
  const initializeSampleData = async () => {
    if (weightEntries.length === 0 && !weightLoading) {
      const sampleWeightEntries: Omit<WeightEntry, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          date: new Date().toISOString(),
          weight: 70.5,
          bodyFat: 15.2,
          muscleMass: 32.1,
          notes: 'Pesaje inicial'
        }
      ];

      for (const entry of sampleWeightEntries) {
        await createWeight(entry);
      }
    }
  };

  useEffect(() => {
    initializeSampleData();
  }, [weightEntries.length, weightLoading]);

  // CRUD Operations
  const handleCreate = (type: 'weight' | 'goal' | 'nutrition') => {
    setEditMode(false);
    setEditingItem(null);
    setCurrentFormType(type);
    
    if (type === 'weight') {
      setFormWeight({
        date: new Date().toISOString().split('T')[0],
        weight: 0,
        bodyFat: 0,
        muscleMass: 0,
        notes: ''
      });
    } else if (type === 'goal') {
      setFormGoal({
        targetWeight: 0,
        targetDate: new Date().toISOString().split('T')[0],
        reason: '',
        isActive: true
      });
    } else {
      setFormNutrition({
        date: new Date().toISOString().split('T')[0],
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        water: 2.0,
        notes: ''
      });
    }
    
    setFormVisible(true);
  };

  const handleEdit = (item: WeightEntry | WeightGoal | NutritionEntry) => {
    setEditMode(true);
    setEditingItem(item);
    
    if ('weight' in item) {
      setFormWeight(item);
      setCurrentFormType('weight');
    } else if ('targetWeight' in item) {
      setFormGoal(item);
      setCurrentFormType('goal');
    } else {
      setFormNutrition(item);
      setCurrentFormType('nutrition');
    }
    
    setFormVisible(true);
  };

  const handleDelete = (item: WeightEntry | WeightGoal | NutritionEntry) => {
    const type = 'weight' in item ? 'weight' : 'targetWeight' in item ? 'goal' : 'nutrition';
    const name = 'weight' in item ? `Peso ${item.weight}kg` : 'targetWeight' in item ? `Meta ${item.targetWeight}kg` : `Nutrición ${item.calories}cal`;
    setItemToDelete({ id: item.id, type, name });
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    if (itemToDelete.type === 'weight') {
      await removeWeight(itemToDelete.id);
    } else if (itemToDelete.type === 'goal') {
      await removeGoal(itemToDelete.id);
    } else {
      await removeNutrition(itemToDelete.id);
    }
    
    setItemToDelete(null);
    setDeleteDialogVisible(false);
  };

  const handleSave = async () => {
    try {
      if (currentFormType === 'weight') {
        // Weight Entry
        if (!formWeight.weight || formWeight.weight <= 0) {
          Alert.alert('Error', 'El peso es obligatorio y debe ser mayor que 0.');
          return;
        }

        const weightData = {
          ...formWeight,
          date: formWeight.date || new Date().toISOString(),
          weight: formWeight.weight || 0
        };

        if (editMode && editingItem?.id) {
          await updateWeight(editingItem.id, weightData);
          Alert.alert('¡Registro Actualizado!', 'Los cambios han sido guardados exitosamente.');
        } else {
          await createWeight(weightData);
          Alert.alert('¡Peso Registrado!', 'El nuevo registro ha sido agregado.');
        }
      } else if (currentFormType === 'goal') {
        // Weight Goal
        if (!formGoal.targetWeight || formGoal.targetWeight <= 0) {
          Alert.alert('Error', 'El peso objetivo es obligatorio y debe ser mayor que 0.');
          return;
        }

        // Deactivate other goals if this one is active
        if (formGoal.isActive) {
          const activeGoals = weightGoals.filter(g => g.isActive && g.id !== editingItem?.id);
          for (const goal of activeGoals) {
            await updateGoal(goal.id, { isActive: false });
          }
        }

        const goalData = {
          ...formGoal,
          targetWeight: formGoal.targetWeight || 0,
          targetDate: formGoal.targetDate || new Date().toISOString().split('T')[0],
          reason: formGoal.reason || '',
          isActive: formGoal.isActive || false
        };

        if (editMode && editingItem?.id) {
          await updateGoal(editingItem.id, goalData);
          Alert.alert('¡Meta Actualizada!', 'Los cambios han sido guardados exitosamente.');
        } else {
          await createGoal(goalData);
          Alert.alert('¡Meta Establecida!', 'La nueva meta ha sido agregada.');
        }
      } else {
        // Nutrition Entry
        if (!formNutrition.calories || formNutrition.calories <= 0) {
          Alert.alert('Error', 'Las calorías son obligatorias y deben ser mayor que 0.');
          return;
        }

        const nutritionData = {
          ...formNutrition,
          date: formNutrition.date || new Date().toISOString(),
          calories: formNutrition.calories || 0,
          protein: formNutrition.protein || 0,
          carbs: formNutrition.carbs || 0,
          fats: formNutrition.fats || 0,
          water: formNutrition.water || 0
        };

        if (editMode && editingItem?.id) {
          await updateNutrition(editingItem.id, nutritionData);
          Alert.alert('¡Nutrición Actualizada!', 'Los cambios han sido guardados exitosamente.');
        } else {
          await createNutrition(nutritionData);
          Alert.alert('¡Nutrición Registrada!', 'El nuevo registro nutricional ha sido agregado.');
        }
      }

      setFormVisible(false);
      setEditMode(false);
      setEditingItem(null);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar los datos. Inténtalo de nuevo.');
    }
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
              <Button mode="text" onPress={() => handleCreate('weight')}>
                Agregar
              </Button>
            </View>
            
            <EntryList
              items={weightEntries.slice(0, 5).map(entry => ({
                id: entry.id,
                title: `${entry.weight.toFixed(1)} kg`,
                subtitle: new Date(entry.date).toLocaleDateString(),
                description: `${entry.bodyFat ? `${entry.bodyFat.toFixed(1)}% grasa` : ''}${entry.muscleMass ? ` • ${entry.muscleMass.toFixed(1)}kg músculo` : ''}${entry.notes ? ` • ${entry.notes}` : ''}`,
                leftIcon: 'scale',
                rightText: new Date(entry.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
              }))}
              onItemPress={() => {}}
              onEdit={(item) => {
                const entry = weightEntries.find(e => e.id === item.id);
                if (entry) handleEdit(entry);
              }}
              onDelete={(item) => {
                const entry = weightEntries.find(e => e.id === item.id);
                if (entry) handleDelete(entry);
              }}
              emptyStateText="No hay registros de peso"
              emptyStateSubtext="Agrega tu primer registro de peso"
              loading={weightLoading}
            />
          </Card.Content>
        </Card>

        {/* Active Goal */}
        {weightGoals.find(g => g.isActive) && (
          <Card style={styles.goalCard}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text style={styles.sectionTitle}>Meta Activa</Text>
                <Button mode="text" onPress={() => handleCreate('goal')}>
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

  const renderNutritionView = () => {
    const todayNutrition = nutritionEntries.filter(entry => 
      new Date(entry.date).toDateString() === new Date().toDateString()
    );
    
    const todayCalories = todayNutrition.reduce((sum, entry) => sum + entry.calories, 0);
    const todayProtein = todayNutrition.reduce((sum, entry) => sum + entry.protein, 0);
    const todayCarbs = todayNutrition.reduce((sum, entry) => sum + entry.carbs, 0);
    const todayFats = todayNutrition.reduce((sum, entry) => sum + entry.fats, 0);
    const todayWater = todayNutrition.reduce((sum, entry) => sum + entry.water, 0);

    const listItems = nutritionEntries.map(entry => ({
      id: entry.id,
      title: `${entry.calories} calorías`,
      subtitle: new Date(entry.date).toLocaleDateString(),
      description: `Proteínas: ${entry.protein}g • Carbohidratos: ${entry.carbs}g • Grasas: ${entry.fats}g • Agua: ${entry.water}L${entry.notes ? ` • ${entry.notes}` : ''}`,
      leftIcon: 'food-apple',
      rightText: `${entry.protein}P`
    }));

    return (
      <View>
        {/* Daily Summary */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Resumen de Hoy</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{todayCalories}</Text>
                <Text style={styles.statLabel}>Calorías</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{todayProtein.toFixed(1)}g</Text>
                <Text style={styles.statLabel}>Proteínas</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{todayCarbs.toFixed(1)}g</Text>
                <Text style={styles.statLabel}>Carbohidratos</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{todayWater.toFixed(1)}L</Text>
                <Text style={styles.statLabel}>Agua</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Nutrition Entries */}
        <Card style={styles.entriesCard}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>Registros Nutricionales</Text>
              <Button mode="text" onPress={() => handleCreate('nutrition')}>
                Agregar
              </Button>
            </View>
            
            <EntryList
              items={listItems}
              onItemPress={() => {}}
              onEdit={(item) => {
                const entry = nutritionEntries.find(e => e.id === item.id);
                if (entry) handleEdit(entry);
              }}
              onDelete={(item) => {
                const entry = nutritionEntries.find(e => e.id === item.id);
                if (entry) handleDelete(entry);
              }}
              emptyStateText="No hay registros nutricionales"
              emptyStateSubtext="Agrega tu primera comida o registro nutricional"
              loading={nutritionLoading}
            />
          </Card.Content>
        </Card>
      </View>
    );
  };

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

      {/* Form Modal */}
      <EntryFormModal
        visible={formVisible}
        onDismiss={() => {
          setFormVisible(false);
          setEditMode(false);
          setEditingItem(null);
        }}
        onSubmit={handleSave}
        title={
          editMode 
            ? currentFormType === 'weight' ? 'Editar Registro de Peso'
              : currentFormType === 'goal' ? 'Editar Meta'
              : 'Editar Registro Nutricional'
            : currentFormType === 'weight' ? 'Nuevo Registro de Peso'
              : currentFormType === 'goal' ? 'Nueva Meta'
              : 'Nuevo Registro Nutricional'
        }
        submitText={editMode ? 'Actualizar' : 'Guardar'}
        submitDisabled={
          (currentFormType === 'weight' && (!formWeight.weight || formWeight.weight <= 0)) ||
          (currentFormType === 'goal' && (!formGoal.targetWeight || formGoal.targetWeight <= 0)) ||
          (currentFormType === 'nutrition' && (!formNutrition.calories || formNutrition.calories <= 0))
        }
      >
        <ScrollView style={styles.formScrollView}>
          {currentFormType === 'weight' && (
            <View style={styles.formFields}>
              <TextInput
                mode="outlined"
                label="Fecha"
                value={formWeight.date || ''}
                onChangeText={(text) => setFormWeight(prev => ({ ...prev, date: text }))}
                style={styles.formInput}
              />
              
              <TextInput
                mode="outlined"
                label="Peso (kg) *"
                value={formWeight.weight?.toString() || ''}
                onChangeText={(text) => setFormWeight(prev => ({ ...prev, weight: parseFloat(text) || 0 }))}
                keyboardType="numeric"
                style={styles.formInput}
              />

              <TextInput
                mode="outlined"
                label="Grasa corporal (%)"
                value={formWeight.bodyFat?.toString() || ''}
                onChangeText={(text) => setFormWeight(prev => ({ ...prev, bodyFat: parseFloat(text) || 0 }))}
                keyboardType="numeric"
                style={styles.formInput}
              />

              <TextInput
                mode="outlined"
                label="Masa muscular (kg)"
                value={formWeight.muscleMass?.toString() || ''}
                onChangeText={(text) => setFormWeight(prev => ({ ...prev, muscleMass: parseFloat(text) || 0 }))}
                keyboardType="numeric"
                style={styles.formInput}
              />

              <TextInput
                mode="outlined"
                label="Notas"
                value={formWeight.notes || ''}
                onChangeText={(text) => setFormWeight(prev => ({ ...prev, notes: text }))}
                multiline
                numberOfLines={3}
                style={styles.formInput}
              />
            </View>
          )}

          {currentFormType === 'goal' && (
            <View style={styles.formFields}>
              <TextInput
                mode="outlined"
                label="Peso objetivo (kg) *"
                value={formGoal.targetWeight?.toString() || ''}
                onChangeText={(text) => setFormGoal(prev => ({ ...prev, targetWeight: parseFloat(text) || 0 }))}
                keyboardType="numeric"
                style={styles.formInput}
              />
              
              <TextInput
                mode="outlined"
                label="Fecha objetivo"
                value={formGoal.targetDate || ''}
                onChangeText={(text) => setFormGoal(prev => ({ ...prev, targetDate: text }))}
                style={styles.formInput}
              />

              <TextInput
                mode="outlined"
                label="Razón/Motivación"
                value={formGoal.reason || ''}
                onChangeText={(text) => setFormGoal(prev => ({ ...prev, reason: text }))}
                multiline
                numberOfLines={3}
                style={styles.formInput}
              />

              <View style={styles.row}>
                <Chip
                  selected={formGoal.isActive}
                  onPress={() => setFormGoal(prev => ({ ...prev, isActive: !prev.isActive }))}
                  style={styles.selectionChip}
                >
                  Meta Activa
                </Chip>
              </View>
            </View>
          )}

          {currentFormType === 'nutrition' && (
            <View style={styles.formFields}>
              <TextInput
                mode="outlined"
                label="Fecha"
                value={formNutrition.date || ''}
                onChangeText={(text) => setFormNutrition(prev => ({ ...prev, date: text }))}
                style={styles.formInput}
              />
              
              <TextInput
                mode="outlined"
                label="Calorías *"
                value={formNutrition.calories?.toString() || ''}
                onChangeText={(text) => setFormNutrition(prev => ({ ...prev, calories: parseFloat(text) || 0 }))}
                keyboardType="numeric"
                style={styles.formInput}
              />

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <TextInput
                    mode="outlined"
                    label="Proteínas (g)"
                    value={formNutrition.protein?.toString() || ''}
                    onChangeText={(text) => setFormNutrition(prev => ({ ...prev, protein: parseFloat(text) || 0 }))}
                    keyboardType="numeric"
                    style={styles.formInput}
                  />
                </View>
                
                <View style={styles.halfWidth}>
                  <TextInput
                    mode="outlined"
                    label="Carbohidratos (g)"
                    value={formNutrition.carbs?.toString() || ''}
                    onChangeText={(text) => setFormNutrition(prev => ({ ...prev, carbs: parseFloat(text) || 0 }))}
                    keyboardType="numeric"
                    style={styles.formInput}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <TextInput
                    mode="outlined"
                    label="Grasas (g)"
                    value={formNutrition.fats?.toString() || ''}
                    onChangeText={(text) => setFormNutrition(prev => ({ ...prev, fats: parseFloat(text) || 0 }))}
                    keyboardType="numeric"
                    style={styles.formInput}
                  />
                </View>
                
                <View style={styles.halfWidth}>
                  <TextInput
                    mode="outlined"
                    label="Agua (L)"
                    value={formNutrition.water?.toString() || ''}
                    onChangeText={(text) => setFormNutrition(prev => ({ ...prev, water: parseFloat(text) || 0 }))}
                    keyboardType="numeric"
                    style={styles.formInput}
                  />
                </View>
              </View>

              <TextInput
                mode="outlined"
                label="Notas"
                value={formNutrition.notes || ''}
                onChangeText={(text) => setFormNutrition(prev => ({ ...prev, notes: text }))}
                multiline
                numberOfLines={3}
                style={styles.formInput}
              />
            </View>
          )}
        </ScrollView>
      </EntryFormModal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        visible={deleteDialogVisible}
        onDismiss={() => setDeleteDialogVisible(false)}
        onConfirm={confirmDelete}
        title={`Eliminar ${itemToDelete?.type === 'weight' ? 'Registro' : itemToDelete?.type === 'goal' ? 'Meta' : 'Registro Nutricional'}`}
        message={`¿Estás seguro de que quieres eliminar "${itemToDelete?.name}"? Esta acción no se puede deshacer.`}
      />

      {/* FAB */}
      <FAB
        icon={activeTab === 'peso' ? 'scale' : 'food-apple'}
        style={styles.fab}
        onPress={() => {
          if (activeTab === 'peso') {
            handleCreate('weight');
          } else {
            handleCreate('nutrition');
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
  formScrollView: {
    maxHeight: 400,
  },
  formFields: {
    gap: 16,
  },
  formInput: {
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#283750',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  selectionChip: {
    marginRight: 8,
    marginBottom: 4,
  },
});

export default ControlPesoScreen;