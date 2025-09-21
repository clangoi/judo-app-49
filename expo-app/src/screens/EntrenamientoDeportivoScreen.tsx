import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Dimensions } from 'react-native';
import { Card, Button, TextInput, Dialog, Portal, SegmentedButtons, Chip, IconButton, FAB, RadioButton } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useCrudStorage } from '../hooks/useCrudStorage';
import { transformLegacySportsSession } from '../utils/legacyTransformations';
import EntryList from '../components/EntryList';
import EntryFormModal from '../components/EntryFormModal';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog';

interface TrainingDrill {
  id: string;
  name: string;
  type: 'technique' | 'sparring' | 'conditioning' | 'tactical';
  duration: number; // en minutos
  intensity: 1 | 2 | 3 | 4 | 5;
  description: string;
  completed: boolean;
  notes?: string;
}

interface SportsSession {
  id: string;
  createdAt: string;
  updatedAt: string;
  date: string;
  sessionType: 'training' | 'sparring' | 'competition' | 'seminar';
  sport: string;
  drills: TrainingDrill[];
  duration: number;
  intensity: 1 | 2 | 3 | 4 | 5;
  partner?: string;
  opponent?: string;
  result?: 'win' | 'loss' | 'draw';
  notes?: string;
  injuries?: string[];
}

const EntrenamientoDeportivoScreen = () => {
  const { items: sessions, isLoading, create, update, remove } = useCrudStorage<SportsSession>({
    storageKey: 'expo:deportivo:sessions',
    remotePayloadKey: 'sportsSessions',
    transformLegacyItem: transformLegacySportsSession
  });
  
  const [activeTab, setActiveTab] = useState('entrenamientos');
  const [newSessionVisible, setNewSessionVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SportsSession | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<SportsSession | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Form states
  const [formSession, setFormSession] = useState<Partial<SportsSession>>({
    sessionType: 'training',
    sport: 'judo',
    drills: [],
    intensity: 3,
    notes: '',
    duration: 0
  });

  // Sports types
  const sportsTypes = [
    { label: 'Judo', value: 'judo' },
    { label: 'Karate', value: 'karate' },
    { label: 'Taekwondo', value: 'taekwondo' },
    { label: 'Boxeo', value: 'boxing' },
    { label: 'MMA', value: 'mma' },
    { label: 'Otro', value: 'other' }
  ];

  // Predefined training drills
  const trainingTemplates = {
    judo: {
      name: 'Entrenamiento de Judo',
      drills: [
        { name: 'Calentamiento y Ukemi', type: 'conditioning', duration: 10, intensity: 2, description: 'Caídas y acondicionamiento básico' },
        { name: 'Uchi-komi (Repetición técnica)', type: 'technique', duration: 15, intensity: 3, description: 'Práctica de entrada de técnicas' },
        { name: 'Nage-komi (Técnicas de proyección)', type: 'technique', duration: 20, intensity: 4, description: 'Proyecciones completas' },
        { name: 'Randori (Combate libre)', type: 'sparring', duration: 15, intensity: 5, description: 'Combate libre controlado' },
        { name: 'Ne-waza (Técnicas de suelo)', type: 'technique', duration: 10, intensity: 3, description: 'Trabajo en el suelo' },
      ]
    },
    karate: {
      name: 'Entrenamiento de Karate',
      drills: [
        { name: 'Calentamiento', type: 'conditioning', duration: 10, intensity: 2, description: 'Estiramiento y movilidad articular' },
        { name: 'Kihon (Técnicas básicas)', type: 'technique', duration: 20, intensity: 3, description: 'Práctica de técnicas fundamentales' },
        { name: 'Kata', type: 'technique', duration: 15, intensity: 3, description: 'Formas y secuencias técnicas' },
        { name: 'Kumite (Combate)', type: 'sparring', duration: 15, intensity: 4, description: 'Combate controlado' },
        { name: 'Acondicionamiento', type: 'conditioning', duration: 10, intensity: 4, description: 'Fortalecimiento específico' },
      ]
    },
    boxing: {
      name: 'Entrenamiento de Boxeo',
      drills: [
        { name: 'Calentamiento', type: 'conditioning', duration: 10, intensity: 2, description: 'Cuerda y movilidad' },
        { name: 'Shadow Boxing', type: 'technique', duration: 15, intensity: 3, description: 'Boxeo contra la sombra' },
        { name: 'Trabajo de Pads', type: 'technique', duration: 20, intensity: 4, description: 'Entrenamiento con manoplas' },
        { name: 'Sparring', type: 'sparring', duration: 15, intensity: 5, description: 'Combate controlado' },
        { name: 'Acondicionamiento', type: 'conditioning', duration: 10, intensity: 4, description: 'Fortalecimiento y resistencia' },
      ]
    }
  };

  // No longer needed - useCrudStorage handles loading and saving

  const startTrainingSession = (sport: keyof typeof trainingTemplates) => {
    const template = trainingTemplates[sport];
    const drills: TrainingDrill[] = template.drills.map((drill, index) => ({
      id: `${Date.now()}-${index}`,
      ...drill,
      completed: false
    } as TrainingDrill));

    const newSession: Partial<SportsSession> = {
      date: new Date().toISOString(),
      sessionType: 'training',
      sport,
      drills,
      duration: 0,
      intensity: 3
    };

    setFormSession(newSession);
    setSelectedSession(newSession as SportsSession);
    setEditMode(false);
    setNewSessionVisible(true);
  };

  const editSession = (session: SportsSession) => {
    setFormSession(session);
    setSelectedSession(session);
    setEditMode(true);
    setNewSessionVisible(true);
  };

  const deleteSession = (session: SportsSession) => {
    setSessionToDelete(session);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    if (sessionToDelete) {
      await remove(sessionToDelete.id);
      setSessionToDelete(null);
    }
  };

  const completeDrill = (drillId: string) => {
    if (!selectedSession || !formSession) return;

    const updatedDrills = selectedSession.drills.map(drill =>
      drill.id === drillId ? { ...drill, completed: !drill.completed } : drill
    );

    const updatedSession = {
      ...selectedSession,
      drills: updatedDrills
    };

    setSelectedSession(updatedSession);
    setFormSession({
      ...formSession,
      drills: updatedDrills
    });
  };

  const saveSession = async () => {
    if (!selectedSession || !formSession) return;

    try {
      const sessionData = {
        ...formSession,
        duration: formSession.duration || selectedSession.drills.reduce((sum, drill) => sum + drill.duration, 0)
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
          `Has completado tu sesión de ${trainingTemplates[sessionData.sport as keyof typeof trainingTemplates]?.name || sessionData.sport}.`,
          [{ text: 'Excelente!', style: 'default' }]
        );
      }

      setSelectedSession(null);
      setFormSession({
        sessionType: 'training',
        sport: 'judo',
        drills: [],
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

  const getSessionStats = () => {
    const thisWeek = sessions.filter(session => {
      const sessionDate = new Date(session.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return sessionDate > weekAgo;
    });

    const totalSparring = thisWeek.filter(s => s.sessionType === 'sparring' || s.drills.some(d => d.type === 'sparring')).length;
    const totalTechnique = thisWeek.filter(s => s.drills.some(d => d.type === 'technique')).length;

    return {
      thisWeek: thisWeek.length,
      totalTime: thisWeek.reduce((sum, session) => sum + session.duration, 0),
      sparring: totalSparring,
      technique: totalTechnique
    };
  };

  const renderTrainingTemplates = () => {
    const stats = getSessionStats();

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
                <Text style={styles.statNumber}>{stats.sparring}</Text>
                <Text style={styles.statLabel}>Sparring</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.technique}</Text>
                <Text style={styles.statLabel}>Técnica</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Training Templates */}
        {Object.entries(trainingTemplates).map(([key, template]) => (
          <Card key={key} style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <MaterialIcons 
                  name={key === 'judo' ? 'sports-martial-arts' : key === 'karate' ? 'sports' : 'sports'} 
                  size={24} 
                  color="#283750" 
                />
                <Text style={styles.cardTitle}>{template.name}</Text>
              </View>
              
              <View style={styles.drillsList}>
                {template.drills.slice(0, 3).map((drill, index) => (
                  <Text key={index} style={styles.drillText}>
                    • {drill.name} ({drill.duration} min)
                  </Text>
                ))}
                {template.drills.length > 3 && (
                  <Text style={styles.moreText}>+{template.drills.length - 3} ejercicios más</Text>
                )}
              </View>

              <View style={styles.templateStats}>
                <Chip style={styles.chip}>
                  <Text>{template.drills.reduce((sum, drill) => sum + drill.duration, 0)} min total</Text>
                </Chip>
                <Chip style={styles.chip}>
                  <Text>{template.drills.length} ejercicios</Text>
                </Chip>
              </View>

              <Button
                mode="contained"
                style={styles.startButton}
                buttonColor="#283750"
                onPress={() => startTrainingSession(key as keyof typeof trainingTemplates)}
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
      title: trainingTemplates[session.sport as keyof typeof trainingTemplates]?.name || `Entrenamiento de ${session.sport}`,
      subtitle: new Date(session.date).toLocaleDateString(),
      description: `${session.duration} min • Intensidad ${session.intensity}/5 • ${session.drills.filter(d => d.completed).length}/${session.drills.length} ejercicios${session.sessionType === 'sparring' ? ' • Sparring' : ''}${session.partner ? ` • Con: ${session.partner}` : ''}${session.notes ? ` • ${session.notes}` : ''}`,
      leftIcon: session.sport === 'judo' ? 'sports-martial-arts' : session.sport === 'karate' ? 'sports' : 'sports',
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
              drills: session.drills.map(drill => ({ ...drill, completed: false, id: `${Date.now()}-${Math.random()}` }))
            };
            setFormSession(duplicateSession);
            setSelectedSession(duplicateSession as SportsSession);
            setEditMode(false);
            setNewSessionVisible(true);
          }
        }}
        emptyStateText="No hay entrenamientos registrados"
        emptyStateSubtext="Comienza tu primer entrenamiento deportivo para ver el historial aquí"
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
            { value: 'entrenamientos', label: 'Entrenamientos' },
            { value: 'historial', label: 'Historial' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <ScrollView style={styles.scrollContainer}>
        {activeTab === 'entrenamientos' && renderTrainingTemplates()}
        {activeTab === 'historial' && renderHistory()}
      </ScrollView>

      {/* Training Session Modal */}
      <EntryFormModal
        visible={newSessionVisible}
        onDismiss={() => {
          setNewSessionVisible(false);
          setSelectedSession(null);
          setFormSession({
            sessionType: 'training',
            sport: 'judo',
            drills: [],
            intensity: 3,
            notes: '',
            duration: 0
          });
          setEditMode(false);
        }}
        onSubmit={saveSession}
        title={editMode ? 'Editar Entrenamiento' : (selectedSession ? trainingTemplates[selectedSession.sport as keyof typeof trainingTemplates]?.name || 'Entrenamiento' : 'Entrenamiento')}
        submitText={editMode ? 'Actualizar' : 'Finalizar'}
        submitDisabled={!selectedSession?.drills.some(d => d.completed)}
      >
        <ScrollView style={styles.formScrollView}>
          {selectedSession?.drills.map((drill) => (
            <View key={drill.id} style={styles.drillItem}>
              <View style={styles.drillHeader}>
                <IconButton
                  icon={drill.completed ? "check-circle" : "circle-outline"}
                  iconColor={drill.completed ? "#10B981" : "#9CA3AF"}
                  onPress={() => completeDrill(drill.id)}
                />
                <View style={styles.drillInfo}>
                  <Text style={[
                    styles.drillName,
                    drill.completed && styles.drillCompleted
                  ]}>
                    {drill.name}
                  </Text>
                  <Text style={styles.drillDetails}>
                    {drill.duration} min • Intensidad {drill.intensity}/5 • {drill.type}
                  </Text>
                  <Text style={styles.drillDescription}>
                    {drill.description}
                  </Text>
                </View>
              </View>
            </View>
          ))}
          
          {editMode && (
            <View style={styles.formFields}>
              <TextInput
                mode="outlined"
                label="Compañero de entrenamiento"
                value={formSession.partner || ''}
                onChangeText={(text) => setFormSession(prev => ({ ...prev, partner: text }))}
                style={styles.formInput}
              />
              
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
        message={`¿Estás seguro de que quieres eliminar el entrenamiento "${sessionToDelete ? trainingTemplates[sessionToDelete.sport as keyof typeof trainingTemplates]?.name || sessionToDelete.sport : ''}"? Esta acción no se puede deshacer.`}
      />

      {/* FAB */}
      <FAB
        icon="sports-martial-arts"
        style={styles.fab}
        onPress={() => {
          Alert.alert(
            "Nuevo Entrenamiento",
            "Selecciona el tipo de entrenamiento deportivo:",
            [
              { text: "Cancelar", style: "cancel" },
              { text: "Judo", onPress: () => startTrainingSession('judo') },
              { text: "Karate", onPress: () => startTrainingSession('karate') },
              { text: "Boxeo", onPress: () => startTrainingSession('boxing') }
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#283750',
  },
  statLabel: {
    fontSize: 11,
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
  drillsList: {
    marginBottom: 12,
  },
  drillText: {
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
  templateStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: '#F3F4F6',
  },
  sparringChip: {
    backgroundColor: '#FEF3C7',
  },
  sparringText: {
    color: '#92400E',
    fontWeight: 'bold',
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
    flex: 1,
  },
  historyDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  historyStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  sessionNotes: {
    fontSize: 14,
    color: '#374151',
    fontStyle: 'italic',
    marginTop: 8,
  },
  partnerText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  dialog: {
    maxHeight: '80%',
  },
  dialogContent: {
    maxHeight: 400,
  },
  drillItem: {
    marginBottom: 16,
  },
  drillHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  drillInfo: {
    flex: 1,
    marginLeft: 8,
  },
  drillName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#283750',
    marginBottom: 4,
  },
  drillCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  drillDetails: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  drillDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 18,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#283750',
  },
  formScrollView: {
    maxHeight: 350,
  },
  formFields: {
    gap: 16,
    marginTop: 16,
  },
  formInput: {
    marginBottom: 8,
  },
});

export default EntrenamientoDeportivoScreen;