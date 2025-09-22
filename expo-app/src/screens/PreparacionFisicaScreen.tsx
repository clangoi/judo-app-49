import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Dimensions } from 'react-native';
import { Card, Button, TextInput, Dialog, Portal, SegmentedButtons, Chip, IconButton, FAB, Modal } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useCrudStorage } from '../hooks/useCrudStorage';
import { transformLegacyWorkoutSession } from '../utils/legacyTransformations';
import EntryList from '../components/EntryList';
import EntryFormModal from '../components/EntryFormModal';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog';

interface Exercise {
  id: string;
  name: string;
  type: 'strength' | 'cardio' | 'flexibility' | 'core';
  duration?: number; // en minutos
  sets?: number;
  reps?: number;
  weight?: number; // en kg
  distance?: number; // en km
  notes?: string;
  completed: boolean;
}

interface WorkoutSession {
  id: string;
  createdAt: string;
  updatedAt: string;
  date: string;
  type: 'upper' | 'lower' | 'full' | 'cardio' | 'flexibility';
  exercises: Exercise[];
  duration: number;
  notes?: string;
  intensity: 1 | 2 | 3 | 4 | 5;
  templateId?: string;
  templateName?: string;
}

// Available exercises database - can be selected when creating workouts
const availableExercises = [
  // Strength exercises
  { id: 'flex', name: 'Flexiones', type: 'strength', defaultSets: 3, defaultReps: 15 },
  { id: 'dom', name: 'Dominadas', type: 'strength', defaultSets: 3, defaultReps: 8 },
  { id: 'fond', name: 'Fondos', type: 'strength', defaultSets: 3, defaultReps: 12 },
  { id: 'sent', name: 'Sentadillas', type: 'strength', defaultSets: 4, defaultReps: 20 },
  { id: 'zanc', name: 'Zancadas', type: 'strength', defaultSets: 3, defaultReps: 12 },
  { id: 'talones', name: 'Elevación de talones', type: 'strength', defaultSets: 3, defaultReps: 15 },
  { id: 'puentes', name: 'Puentes', type: 'strength', defaultSets: 3, defaultReps: 15 },
  
  // Core exercises
  { id: 'plancha', name: 'Plancha', type: 'core', defaultDuration: 60 },
  { id: 'abs', name: 'Abdominales', type: 'core', defaultSets: 3, defaultReps: 20 },
  
  // Cardio exercises
  { id: 'carrera', name: 'Carrera', type: 'cardio', defaultDuration: 20, defaultDistance: 3 },
  { id: 'burpees', name: 'Burpees', type: 'cardio', defaultSets: 3, defaultReps: 10 },
  { id: 'jumping', name: 'Jumping Jacks', type: 'cardio', defaultDuration: 120 },
  { id: 'mountain', name: 'Mountain Climbers', type: 'cardio', defaultDuration: 60 },
  
  // Flexibility exercises
  { id: 'est_piernas', name: 'Estiramiento de piernas', type: 'flexibility', defaultDuration: 180 },
  { id: 'est_brazos', name: 'Estiramiento de brazos', type: 'flexibility', defaultDuration: 180 },
  { id: 'yoga', name: 'Yoga básico', type: 'flexibility', defaultDuration: 900 },
  { id: 'movilidad', name: 'Movilidad articular', type: 'flexibility', defaultDuration: 300 },
];

const PreparacionFisicaScreen = () => {
  const { items: sessions, isLoading, create, update, remove } = useCrudStorage<WorkoutSession>({
    storageKey: 'expo:fisica:sessions',
    remotePayloadKey: 'workoutSessions',
    transformLegacyItem: transformLegacyWorkoutSession
  });

  // No more templates - only custom workouts
  
  const [activeTab, setActiveTab] = useState('rutinas');
  const [newSessionVisible, setNewSessionVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<WorkoutSession | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [exerciseSelectorVisible, setExerciseSelectorVisible] = useState(false);

  // Form states
  const [formSession, setFormSession] = useState<Partial<WorkoutSession>>({
    type: 'full',
    exercises: [],
    intensity: 3,
    notes: '',
    duration: 0
  });
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);

  const startNewWorkout = () => {
    const newWorkout: Partial<WorkoutSession> = {
      date: new Date().toISOString(),
      type: 'full',
      exercises: [],
      duration: 0,
      intensity: 3,
      notes: ''
    };

    setFormSession(newWorkout);
    setSelectedSession(newWorkout as WorkoutSession);
    setSelectedExercises([]);
    setEditMode(false);
    setNewSessionVisible(true);
  };

  const editSession = (session: WorkoutSession) => {
    setFormSession(session);
    setSelectedSession(session);
    setSelectedExercises(session.exercises || []);
    setEditMode(true);
    setNewSessionVisible(true);
  };

  const deleteSession = (session: WorkoutSession) => {
    setSessionToDelete(session);
    setDeleteDialogVisible(true);
  };

  const addExerciseToWorkout = (exerciseTemplate: any) => {
    const newExercise: Exercise = {
      id: `${Date.now()}-${Math.random()}`,
      name: exerciseTemplate.name,
      type: exerciseTemplate.type,
      sets: exerciseTemplate.defaultSets,
      reps: exerciseTemplate.defaultReps,
      duration: exerciseTemplate.defaultDuration,
      distance: exerciseTemplate.defaultDistance,
      weight: 0,
      notes: '',
      completed: false
    };

    const updatedExercises = [...selectedExercises, newExercise];
    setSelectedExercises(updatedExercises);
    setFormSession(prev => ({ ...prev, exercises: updatedExercises }));
  };

  const removeExerciseFromWorkout = (exerciseId: string) => {
    const updatedExercises = selectedExercises.filter(ex => ex.id !== exerciseId);
    setSelectedExercises(updatedExercises);
    setFormSession(prev => ({ ...prev, exercises: updatedExercises }));
  };

  const updateExerciseInWorkout = (exerciseId: string, updates: Partial<Exercise>) => {
    const updatedExercises = selectedExercises.map(ex => 
      ex.id === exerciseId ? { ...ex, ...updates } : ex
    );
    setSelectedExercises(updatedExercises);
    setFormSession(prev => ({ ...prev, exercises: updatedExercises }));
  };

  const confirmDelete = async () => {
    if (sessionToDelete) {
      await remove(sessionToDelete.id);
      setSessionToDelete(null);
    }
  };

  const completeExercise = (exerciseId: string) => {
    const updatedExercises = selectedExercises.map(ex =>
      ex.id === exerciseId ? { ...ex, completed: !ex.completed } : ex
    );

    setSelectedExercises(updatedExercises);
    setFormSession(prev => ({ ...prev, exercises: updatedExercises }));
  };

  const saveWorkoutSession = async () => {
    if (!selectedSession || !formSession) return;

    try {
      const sessionData = {
        ...formSession,
        date: formSession.date || new Date().toISOString(),
        duration: formSession.duration || Math.floor(Math.random() * 60) + 30 // Placeholder duration
      };

      if (editMode && selectedSession.id) {
        await update(selectedSession.id, sessionData);
        Alert.alert(
          '¡Entrenamiento Actualizado!',
          'Los cambios han sido guardados exitosamente.',
          [{ text: 'Excelente!', style: 'default' }]
        );
      } else {
        await create(sessionData);
        const workoutTypeName = sessionData.type === 'full' ? 'Entrenamiento Completo' : String(sessionData.type);
        Alert.alert(
          '¡Entrenamiento Completado!',
          `Has terminado tu sesión de ${workoutTypeName}.`,
          [{ text: 'Excelente!', style: 'default' }]
        );
      }

      setSelectedSession(null);
      setFormSession({
        type: 'full',
        exercises: [],
        intensity: 3,
        notes: '',
        duration: 0
      });
      setSelectedExercises([]);
      setNewSessionVisible(false);
      setEditMode(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el entrenamiento. Inténtalo de nuevo.');
    }
  };

  const getWorkoutStats = () => {
    const thisWeek = sessions.filter(session => {
      const sessionDate = new Date(session.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return sessionDate > weekAgo;
    });

    return {
      thisWeek: thisWeek.length,
      totalTime: thisWeek.reduce((sum, session) => sum + session.duration, 0),
      avgIntensity: thisWeek.length > 0 
        ? (thisWeek.reduce((sum, session) => sum + session.intensity, 0) / thisWeek.length).toFixed(1)
        : '0'
    };
  };

  const renderWorkoutCreation = () => {
    const stats = getWorkoutStats();

    return (
      <View>
        {/* Stats Card */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Esta Semana</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.thisWeek}</Text>
                <Text style={styles.statLabel}>Entrenamientos</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalTime}min</Text>
                <Text style={styles.statLabel}>Tiempo Total</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.avgIntensity}</Text>
                <Text style={styles.statLabel}>Intensidad Media</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Create New Workout Card */}
        <Card style={styles.createCard} onPress={startNewWorkout}>
          <Card.Content style={styles.createContent}>
            <MaterialIcons name="add" size={32} color="#283750" />
            <View style={styles.createTextContainer}>
              <Text style={styles.createTitle}>Crear Entrenamiento Personalizado</Text>
              <Text style={styles.createSubtitle}>Elige tus ejercicios y arma tu rutina desde cero</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#283750" />
          </Card.Content>
        </Card>

        {/* Available Exercises Preview */}
        <Card style={styles.exercisesCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Ejercicios Disponibles</Text>
            <Text style={styles.exercisesSubtitle}>Estos ejercicios están disponibles para crear tus entrenamientos:</Text>
            <View style={styles.exerciseCategories}>
              <View style={styles.categoryRow}>
                <MaterialIcons name="fitness-center" size={20} color="#283750" />
                <Text style={styles.categoryText}>Fuerza: {availableExercises.filter(ex => ex.type === 'strength').length} ejercicios</Text>
              </View>
              <View style={styles.categoryRow}>
                <MaterialIcons name="favorite" size={20} color="#283750" />
                <Text style={styles.categoryText}>Cardio: {availableExercises.filter(ex => ex.type === 'cardio').length} ejercicios</Text>
              </View>
              <View style={styles.categoryRow}>
                <MaterialIcons name="self-improvement" size={20} color="#283750" />
                <Text style={styles.categoryText}>Flexibilidad: {availableExercises.filter(ex => ex.type === 'flexibility').length} ejercicios</Text>
              </View>
              <View style={styles.categoryRow}>
                <MaterialIcons name="accessibility" size={20} color="#283750" />
                <Text style={styles.categoryText}>Core: {availableExercises.filter(ex => ex.type === 'core').length} ejercicios</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>
    );
  };

  const renderHistory = () => {
    const getWorkoutTypeTitle = (sessionType: string) => {
      switch(sessionType) {
        case 'upper': return 'Tren Superior';
        case 'lower': return 'Tren Inferior';
        case 'cardio': return 'Cardiovascular';
        case 'flexibility': return 'Flexibilidad';
        case 'full': return 'Entrenamiento Completo';
        default: return sessionType.charAt(0).toUpperCase() + sessionType.slice(1);
      }
    };

    const listItems = sessions.map(session => ({
      id: session.id,
      title: getWorkoutTypeTitle(session.type),
      subtitle: new Date(session.date).toLocaleDateString(),
      description: `${session.duration} min • Intensidad ${session.intensity}/5 • ${session.exercises.filter(ex => ex.completed).length}/${session.exercises.length} ejercicios${session.notes ? ` • ${session.notes}` : ''}`,
      leftIcon: session.type === 'cardio' ? 'favorite' : session.type === 'flexibility' ? 'self-improvement' : 'fitness-center',
      rightText: `${session.duration}min`
    }));

    return (
      <EntryList
        items={listItems}
        onItemPress={(item) => {
          const session = sessions.find(s => s.id === item.id);
          if (session) editSession(session);
        }}
        onEdit={(item) => {
          const session = sessions.find(s => s.id === item.id);
          if (session) editSession(session);
        }}
        onDelete={(item) => {
          const session = sessions.find(s => s.id === item.id);
          if (session) deleteSession(session);
        }}
        onDuplicate={(item) => {
          const session = sessions.find(s => s.id === item.id);
          if (session) {
            const { id, ...sessionWithoutId } = session;
            const duplicateSession = {
              ...sessionWithoutId,
              date: new Date().toISOString(),
              exercises: session.exercises.map(ex => ({ ...ex, completed: false, id: `${Date.now()}-${Math.random()}` }))
            };
            setFormSession(duplicateSession);
            setSelectedExercises(duplicateSession.exercises);
            setSelectedSession(duplicateSession as WorkoutSession);
            setEditMode(false);
            setNewSessionVisible(true);
          }
        }}
        emptyStateText="No hay entrenamientos registrados"
        emptyStateSubtext="Comienza tu primer entrenamiento para ver el historial aquí"
        loading={isLoading}
      />
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
            { value: 'rutinas', label: 'Rutinas' },
            { value: 'historial', label: 'Historial' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <ScrollView style={styles.scrollContainer}>
        {activeTab === 'rutinas' && renderWorkoutCreation()}
        {activeTab === 'historial' && renderHistory()}
      </ScrollView>

      {/* Workout Session Modal */}
      <EntryFormModal
        visible={newSessionVisible}
        onDismiss={() => {
          setNewSessionVisible(false);
          setSelectedSession(null);
          setFormSession({
            type: 'full',
            exercises: [],
            intensity: 3,
            notes: '',
            duration: 0
          });
          setEditMode(false);
        }}
        onSubmit={saveWorkoutSession}
        title={editMode ? 'Editar Entrenamiento' : 'Nuevo Entrenamiento Personalizado'}
        submitText={editMode ? 'Actualizar' : 'Finalizar'}
        submitDisabled={selectedExercises.length === 0 || (editMode && !selectedExercises.some(ex => ex.completed))}
      >
        <ScrollView style={styles.formScrollView}>
          {/* Add Exercise Button */}
          {!editMode && (
            <Card style={styles.addExerciseCard} onPress={() => setExerciseSelectorVisible(true)}>
              <Card.Content style={styles.addExerciseContent}>
                <MaterialIcons name="add" size={24} color="#283750" />
                <Text style={styles.addExerciseText}>Agregar Ejercicio</Text>
              </Card.Content>
            </Card>
          )}

          {selectedExercises.map((exercise) => (
            <View key={exercise.id} style={styles.exerciseItem}>
              <View style={styles.exerciseHeader}>
                <IconButton
                  icon={exercise.completed ? "check-circle" : "circle-outline"}
                  iconColor={exercise.completed ? "#10B981" : "#9CA3AF"}
                  onPress={() => completeExercise(exercise.id)}
                />
                <View style={styles.exerciseInfo}>
                  <Text style={[
                    styles.exerciseName,
                    exercise.completed && styles.exerciseCompleted
                  ]}>
                    {exercise.name}
                  </Text>
                  <Text style={styles.exerciseDetails}>
                    {exercise.sets && `${exercise.sets} series`}
                    {exercise.reps && ` × ${exercise.reps} reps`}
                    {exercise.duration && `${exercise.duration} minutos`}
                    {exercise.distance && ` - ${exercise.distance} km`}
                  </Text>
                </View>
                {!editMode && (
                  <IconButton
                    icon="close"
                    iconColor="#EF4444"
                    onPress={() => removeExerciseFromWorkout(exercise.id)}
                  />
                )}
              </View>
            </View>
          ))}
          
          {editMode && (
            <View style={styles.formFields}>
              <TextInput
                mode="outlined"
                label="Duración (minutos)"
                value={formSession.duration?.toString() || ''}
                onChangeText={(text) => setFormSession(prev => ({ ...prev, duration: parseInt(text) || 0 }))}
                keyboardType="numeric"
                style={styles.formInput}
              />
              
              <TextInput
                mode="outlined"
                label="Notas"
                value={formSession.notes || ''}
                onChangeText={(text) => setFormSession(prev => ({ ...prev, notes: text }))}
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
        title="Eliminar Entrenamiento"
        message={`¿Estás seguro de que quieres eliminar este entrenamiento? Esta acción no se puede deshacer.`}
      />

      {/* Exercise Selector Modal */}
      <Portal>
        <Modal
          visible={exerciseSelectorVisible}
          onDismiss={() => setExerciseSelectorVisible(false)}
          contentContainerStyle={styles.exerciseSelectorModal}
        >
        <View style={styles.exerciseSelectorContent}>
          <Text style={styles.exerciseSelectorTitle}>Seleccionar Ejercicio</Text>
          
          <ScrollView style={styles.exerciseSelectorScroll}>
            {availableExercises.map((exercise) => (
              <Card 
                key={exercise.id} 
                style={styles.exerciseOption} 
                onPress={() => {
                  addExerciseToWorkout(exercise);
                  setExerciseSelectorVisible(false);
                }}
              >
                <Card.Content style={styles.exerciseOptionContent}>
                  <View style={styles.exerciseOptionHeader}>
                    <MaterialIcons 
                      name={exercise.type === 'cardio' ? 'favorite' : exercise.type === 'flexibility' ? 'self-improvement' : 'fitness-center'} 
                      size={24} 
                      color="#283750" 
                    />
                    <View style={styles.exerciseOptionInfo}>
                      <Text style={styles.exerciseOptionName}>{exercise.name}</Text>
                      <Text style={styles.exerciseOptionType}>
                        {exercise.type === 'strength' ? 'Fuerza' : 
                         exercise.type === 'cardio' ? 'Cardio' :
                         exercise.type === 'flexibility' ? 'Flexibilidad' : 'Core'}
                      </Text>
                    </View>
                    <MaterialIcons name="add" size={20} color="#283750" />
                  </View>
                  
                  <Text style={styles.exerciseOptionDetails}>
                    {exercise.defaultSets && exercise.defaultReps && `${exercise.defaultSets} series × ${exercise.defaultReps} reps`}
                    {exercise.defaultDuration && ` - ${exercise.defaultDuration} min`}
                    {exercise.defaultDistance && ` - ${exercise.defaultDistance} km`}
                  </Text>
                </Card.Content>
              </Card>
            ))}
          </ScrollView>
          
          <Button
            mode="outlined"
            onPress={() => setExerciseSelectorVisible(false)}
            style={styles.exerciseSelectorCloseButton}
          >
            Cerrar
          </Button>
        </View>
        </Modal>
      </Portal>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#283750',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#283750',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  card: {
    margin: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  managerCard: {
    margin: 8,
    backgroundColor: '#F0F9FF',
    elevation: 1,
    borderColor: '#283750',
    borderWidth: 1,
  },
  managerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  managerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283750',
    flex: 1,
    marginLeft: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#283750',
    marginLeft: 12,
  },
  exerciseList: {
    marginBottom: 16,
  },
  exerciseText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  moreText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  startButton: {
    borderRadius: 8,
  },
  emptyCard: {
    margin: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
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
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#283750',
  },
  historyDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  historyStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    backgroundColor: '#F3F4F6',
  },
  sessionNotes: {
    fontSize: 14,
    color: '#374151',
    fontStyle: 'italic',
    marginTop: 8,
  },
  dialog: {
    maxHeight: '80%',
  },
  dialogContent: {
    maxHeight: 400,
  },
  exerciseItem: {
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
    marginLeft: 8,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#283750',
  },
  exerciseCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#283750',
  },
  formScrollView: {
    maxHeight: 300,
  },
  formFields: {
    gap: 16,
    marginTop: 16,
  },
  formInput: {
    marginBottom: 8,
  },
  createCard: {
    margin: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  createContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  createTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  createTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#283750',
  },
  createSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  exercisesCard: {
    margin: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  exercisesSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  exerciseCategories: {
    gap: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#374151',
  },
  addExerciseCard: {
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
  },
  addExerciseContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  addExerciseText: {
    fontSize: 16,
    color: '#283750',
    fontWeight: '500',
  },
  exerciseSelectorModal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  exerciseSelectorContent: {
    padding: 20,
  },
  exerciseSelectorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#283750',
    marginBottom: 16,
    textAlign: 'center',
  },
  exerciseSelectorScroll: {
    maxHeight: 400,
    marginBottom: 16,
  },
  exerciseOption: {
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    elevation: 1,
  },
  exerciseOptionContent: {
    paddingVertical: 8,
  },
  exerciseOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  exerciseOptionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  exerciseOptionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#283750',
  },
  exerciseOptionType: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  exerciseOptionDetails: {
    fontSize: 14,
    color: '#374151',
    marginTop: 4,
  },
  exerciseSelectorCloseButton: {
    marginTop: 8,
  },
});

export default PreparacionFisicaScreen;