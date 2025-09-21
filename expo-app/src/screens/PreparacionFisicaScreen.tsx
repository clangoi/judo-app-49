import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Dimensions } from 'react-native';
import { Card, Button, TextInput, Dialog, Portal, SegmentedButtons, Chip, IconButton, FAB } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useCrudStorage } from '../hooks/useCrudStorage';
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
}

const PreparacionFisicaScreen = () => {
  const { items: sessions, isLoading, create, update, remove } = useCrudStorage<WorkoutSession>({
    storageKey: 'expo:training:workouts.sessions',
    remotePayloadKey: 'workoutSessions'
  });
  
  const [activeTab, setActiveTab] = useState('rutinas');
  const [newSessionVisible, setNewSessionVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<WorkoutSession | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Form states
  const [formSession, setFormSession] = useState<Partial<WorkoutSession>>({
    type: 'full',
    exercises: [],
    intensity: 3,
    notes: '',
    duration: 0
  });

  // Predefined workouts
  const workoutTemplates = {
    upper: {
      name: 'Tren Superior',
      exercises: [
        { name: 'Flexiones', type: 'strength', sets: 3, reps: 15 },
        { name: 'Dominadas', type: 'strength', sets: 3, reps: 8 },
        { name: 'Fondos', type: 'strength', sets: 3, reps: 12 },
        { name: 'Plancha', type: 'core', duration: 1 },
      ]
    },
    lower: {
      name: 'Tren Inferior',
      exercises: [
        { name: 'Sentadillas', type: 'strength', sets: 4, reps: 20 },
        { name: 'Zancadas', type: 'strength', sets: 3, reps: 12 },
        { name: 'Elevación de talones', type: 'strength', sets: 3, reps: 15 },
        { name: 'Puentes', type: 'strength', sets: 3, reps: 15 },
      ]
    },
    cardio: {
      name: 'Cardiovascular',
      exercises: [
        { name: 'Carrera', type: 'cardio', duration: 20, distance: 3 },
        { name: 'Burpees', type: 'cardio', sets: 3, reps: 10 },
        { name: 'Jumping Jacks', type: 'cardio', duration: 2 },
        { name: 'Mountain Climbers', type: 'cardio', duration: 1 },
      ]
    },
    flexibility: {
      name: 'Flexibilidad',
      exercises: [
        { name: 'Estiramiento de piernas', type: 'flexibility', duration: 3 },
        { name: 'Estiramiento de brazos', type: 'flexibility', duration: 3 },
        { name: 'Yoga básico', type: 'flexibility', duration: 15 },
        { name: 'Movilidad articular', type: 'flexibility', duration: 5 },
      ]
    }
  };

  // No longer needed - useCrudStorage handles loading and saving

  const startWorkout = (type: keyof typeof workoutTemplates) => {
    const template = workoutTemplates[type];
    const exercises: Exercise[] = template.exercises.map((ex, index) => ({
      id: `${Date.now()}-${index}`,
      ...ex,
      completed: false
    } as Exercise));

    const newWorkout: Partial<WorkoutSession> = {
      date: new Date().toISOString(),
      type,
      exercises,
      duration: 0,
      intensity: 3
    };

    setFormSession(newWorkout);
    setSelectedSession(newWorkout as WorkoutSession);
    setEditMode(false);
    setNewSessionVisible(true);
  };

  const editSession = (session: WorkoutSession) => {
    setFormSession(session);
    setSelectedSession(session);
    setEditMode(true);
    setNewSessionVisible(true);
  };

  const deleteSession = (session: WorkoutSession) => {
    setSessionToDelete(session);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    if (sessionToDelete) {
      await remove(sessionToDelete.id);
      setSessionToDelete(null);
    }
  };

  const completeExercise = (exerciseId: string) => {
    if (!selectedSession || !formSession) return;

    const updatedExercises = selectedSession.exercises.map(ex =>
      ex.id === exerciseId ? { ...ex, completed: !ex.completed } : ex
    );

    const updatedSession = {
      ...selectedSession,
      exercises: updatedExercises
    };

    setSelectedSession(updatedSession);
    setFormSession({
      ...formSession,
      exercises: updatedExercises
    });
  };

  const saveWorkoutSession = async () => {
    if (!selectedSession || !formSession) return;

    try {
      const sessionData = {
        ...formSession,
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
        Alert.alert(
          '¡Entrenamiento Completado!',
          `Has terminado tu sesión de ${workoutTemplates[sessionData.type!].name}.`,
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

  const renderWorkoutTemplates = () => {
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

        {/* Workout Templates */}
        {Object.entries(workoutTemplates).map(([key, template]) => (
          <Card key={key} style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <MaterialIcons 
                  name={key === 'cardio' ? 'favorite' : key === 'flexibility' ? 'self-improvement' : 'fitness-center'} 
                  size={24} 
                  color="#283750" 
                />
                <Text style={styles.cardTitle}>{template.name}</Text>
              </View>
              
              <View style={styles.exerciseList}>
                {template.exercises.slice(0, 3).map((exercise, index) => (
                  <Text key={index} style={styles.exerciseText}>
                    • {exercise.name}
                    {exercise.sets ? ` (${exercise.sets} series)` : ''}
                    {exercise.duration ? ` (${exercise.duration} min)` : ''}
                  </Text>
                ))}
                {template.exercises.length > 3 && (
                  <Text style={styles.moreText}>+{template.exercises.length - 3} ejercicios más</Text>
                )}
              </View>

              <Button
                mode="contained"
                style={styles.startButton}
                buttonColor="#283750"
                onPress={() => startWorkout(key as keyof typeof workoutTemplates)}
                icon={({ size, color }) => (
                  <MaterialIcons name="play-arrow" size={size} color={color} />
                )}
              >
                Comenzar Entrenamiento
              </Button>
            </Card.Content>
          </Card>
        ))}
      </View>
    );
  };

  const renderHistory = () => {
    const listItems = sessions.map(session => ({
      id: session.id,
      title: workoutTemplates[session.type].name,
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
            const duplicateSession = {
              ...session,
              date: new Date().toISOString(),
              exercises: session.exercises.map(ex => ({ ...ex, completed: false, id: `${Date.now()}-${Math.random()}` }))
            };
            setFormSession(duplicateSession);
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
        {activeTab === 'rutinas' && renderWorkoutTemplates()}
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
        title={editMode ? 'Editar Entrenamiento' : (selectedSession ? workoutTemplates[selectedSession.type].name : 'Entrenamiento')}
        submitText={editMode ? 'Actualizar' : 'Finalizar'}
        submitDisabled={!selectedSession?.exercises.some(ex => ex.completed)}
      >
        <ScrollView style={styles.formScrollView}>
          {selectedSession?.exercises.map((exercise) => (
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
        message={`¿Estás seguro de que quieres eliminar el entrenamiento "${sessionToDelete ? workoutTemplates[sessionToDelete.type].name : ''}"? Esta acción no se puede deshacer.`}
      />

      {/* FAB */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => {
          Alert.alert(
            "Nuevo Entrenamiento",
            "Selecciona el tipo de entrenamiento:",
            [
              { text: "Cancelar", style: "cancel" },
              { text: "Tren Superior", onPress: () => startWorkout('upper') },
              { text: "Tren Inferior", onPress: () => startWorkout('lower') },
              { text: "Cardiovascular", onPress: () => startWorkout('cardio') },
              { text: "Flexibilidad", onPress: () => startWorkout('flexibility') }
            ]
          );
        }}
        label="Entrenar"
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
});

export default PreparacionFisicaScreen;