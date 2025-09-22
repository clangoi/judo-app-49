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

interface DrillTemplate {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  type: 'technique' | 'sparring' | 'conditioning' | 'tactical';
  defaultDuration: number; // en minutos
  defaultIntensity: 1 | 2 | 3 | 4 | 5;
  description?: string;
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

// Sports types
const sportsTypes = [
  { label: 'Judo', value: 'judo' },
  { label: 'Karate', value: 'karate' },
  { label: 'Taekwondo', value: 'taekwondo' },
  { label: 'Boxeo', value: 'boxing' },
  { label: 'MMA', value: 'mma' },
  { label: 'Otro', value: 'other' }
];

// Available training drills library
const availableDrills = [
  // Conditioning drills
  { name: 'Calentamiento general', type: 'conditioning', intensity: 2, description: 'Estiramiento y movilidad articular' },
  { name: 'Cardio', type: 'conditioning', intensity: 4, description: 'Ejercicios cardiovasculares' },
  { name: 'Fuerza funcional', type: 'conditioning', intensity: 3, description: 'Ejercicios de fortalecimiento corporal' },
  { name: 'Flexibilidad', type: 'conditioning', intensity: 2, description: 'Ejercicios de estiramiento y flexibilidad' },
  
  // Technique drills
  { name: 'Técnicas básicas', type: 'technique', intensity: 3, description: 'Práctica de movimientos fundamentales' },
  { name: 'Combinaciones', type: 'technique', intensity: 4, description: 'Secuencias de técnicas encadenadas' },
  { name: 'Defensa personal', type: 'technique', intensity: 3, description: 'Técnicas de defensa y contraataque' },
  { name: 'Trabajo de precisión', type: 'technique', intensity: 3, description: 'Ejercicios de precisión y control' },
  
  // Sparring drills
  { name: 'Sparring ligero', type: 'sparring', intensity: 4, description: 'Combate controlado de baja intensidad' },
  { name: 'Sparring completo', type: 'sparring', intensity: 5, description: 'Combate libre de alta intensidad' },
  { name: 'Sparring por puntos', type: 'sparring', intensity: 4, description: 'Combate con sistema de puntuación' },
  
  // Tactical drills
  { name: 'Estrategia de combate', type: 'tactical', intensity: 3, description: 'Planificación y táctica de enfrentamiento' },
  { name: 'Análisis de oponente', type: 'tactical', intensity: 2, description: 'Estudio de estilos y debilidades del rival' },
  { name: 'Situaciones específicas', type: 'tactical', intensity: 3, description: 'Práctica de escenarios tácticos específicos' }
];


const EntrenamientoDeportivoScreen = () => {
  const { items: sessions, isLoading, create, update, remove } = useCrudStorage<SportsSession>({
    storageKey: 'expo:deportivo:sessions',
    remotePayloadKey: 'sportsSessions',
    transformLegacyItem: transformLegacySportsSession
  });

  const { 
    items: customDrills, 
    isLoading: isDrillsLoading, 
    create: createDrill, 
    update: updateDrill, 
    remove: removeDrill 
  } = useCrudStorage<DrillTemplate>({
    storageKey: 'expo:deportivo:customDrills',
    remotePayloadKey: 'customSportsDrills'
  });

  
  const [activeTab, setActiveTab] = useState('entrenamientos');
  const [newSessionVisible, setNewSessionVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SportsSession | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<SportsSession | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showDrillSelector, setShowDrillSelector] = useState(false);
  const [drillFormVisible, setDrillFormVisible] = useState(false);
  const [editingDrill, setEditingDrill] = useState<DrillTemplate | null>(null);

  // Form states
  const [formSession, setFormSession] = useState<Partial<SportsSession>>({
    sessionType: 'training',
    sport: 'judo',
    drills: [],
    intensity: 3,
    notes: '',
    duration: 0
  });

  const [formDrill, setFormDrill] = useState<Partial<DrillTemplate>>({
    name: '',
    type: 'technique',
    defaultDuration: 15,
    defaultIntensity: 3,
    description: ''
  });

  const startCustomTraining = () => {
    const newSession: Partial<SportsSession> = {
      date: new Date().toISOString(),
      sessionType: 'training',
      sport: 'judo',
      drills: [],
      duration: 0,
      intensity: 3
    };

    setFormSession(newSession);
    setSelectedSession(newSession as SportsSession);
    setEditMode(true); // Always in edit mode for custom training
    setNewSessionVisible(true);
  };

  const addDrillToSession = (drill: any) => {
    if (!selectedSession || !formSession) return;

    const newDrill: TrainingDrill = {
      id: `${Date.now()}-${Math.random()}`,
      name: drill.name,
      type: drill.type,
      duration: 15, // Default duration
      intensity: drill.intensity,
      description: drill.description,
      completed: false
    };

    const updatedDrills = [...selectedSession.drills, newDrill];
    const updatedSession = {
      ...selectedSession,
      drills: updatedDrills
    };

    setSelectedSession(updatedSession);
    setFormSession({
      ...formSession,
      drills: updatedDrills
    });
    setShowDrillSelector(false);
  };

  const removeDrillFromSession = (drillId: string) => {
    if (!selectedSession || !formSession) return;

    const updatedDrills = selectedSession.drills.filter(drill => drill.id !== drillId);
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
          `Has completado tu sesión de entrenamiento deportivo.`,
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

  const renderTrainingView = () => {
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

        {/* Create New Training */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialIcons name="add-circle" size={24} color="#283750" />
              <Text style={styles.cardTitle}>Crear Entrenamiento Personalizado</Text>
            </View>
            
            <Text style={styles.createDescription}>
              Diseña tu entrenamiento desde cero seleccionando ejercicios de nuestra biblioteca.
            </Text>

            <Button
              mode="contained"
              style={styles.startButton}
              buttonColor="#283750"
              onPress={startCustomTraining}
              icon={({ size, color }) => (
                <MaterialIcons name="fitness-center" size={size} color={color} />
              )}
            >
              Crear Nuevo Entrenamiento
            </Button>
          </Card.Content>
        </Card>

        {/* Recent Sessions Preview */}
        {sessions.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <MaterialIcons name="history" size={24} color="#283750" />
                <Text style={styles.cardTitle}>Entrenamientos Recientes</Text>
              </View>
              
              {sessions.slice(0, 3).map((session) => (
                <View key={session.id} style={styles.recentSessionItem}>
                  <Text style={styles.recentSessionTitle}>
                    Entrenamiento de {session.sport}
                  </Text>
                  <Text style={styles.recentSessionDetails}>
                    {new Date(session.date).toLocaleDateString()} • {session.duration} min • {session.drills.length} ejercicios
                  </Text>
                </View>
              ))}
              
              <Button
                mode="outlined"
                style={styles.viewAllButton}
                onPress={() => setActiveTab('historial')}
              >
                Ver Todos los Entrenamientos
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Empty State */}
        {sessions.length === 0 && (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>No tienes entrenamientos aún</Text>
              <Text style={styles.emptySubtext}>
                Crea tu primer entrenamiento deportivo personalizado usando el botón de arriba.
              </Text>
            </Card.Content>
          </Card>
        )}
      </View>
    );
  };

  const renderHistory = () => {
    const listItems = sessions.map(session => ({
      id: session.id,
      title: `Entrenamiento de ${session.sport}`,
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
        {activeTab === 'entrenamientos' && renderTrainingView()}
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
        title={editMode ? 'Editar Entrenamiento' : 'Entrenamiento Deportivo'}
        submitText={editMode ? 'Guardar Entrenamiento' : 'Finalizar'}
        submitDisabled={!selectedSession?.drills || selectedSession.drills.length === 0}
      >
        <ScrollView style={styles.formScrollView}>
          {/* Add Exercise Button */}
          <Button
            mode="outlined"
            style={styles.addDrillButton}
            onPress={() => setShowDrillSelector(true)}
            icon={({ size, color }) => (
              <MaterialIcons name="add" size={size} color={color} />
            )}
          >
            Agregar Ejercicio
          </Button>

          {/* Selected Drills */}
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
                <IconButton
                  icon="delete"
                  iconColor="#EF4444"
                  onPress={() => removeDrillFromSession(drill.id)}
                />
              </View>
            </View>
          ))}

          {/* Empty state for drills */}
          {(!selectedSession?.drills || selectedSession.drills.length === 0) && (
            <View style={styles.emptyDrills}>
              <Text style={styles.emptyDrillsText}>No hay ejercicios aún</Text>
              <Text style={styles.emptyDrillsSubtext}>Agrega ejercicios usando el botón de arriba</Text>
            </View>
          )}
          
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

      {/* Drill Selector Modal */}
      <Portal>
        <Dialog
          visible={showDrillSelector}
          onDismiss={() => setShowDrillSelector(false)}
          style={styles.drillSelectorDialog}
        >
          <Dialog.Title>Seleccionar Ejercicio</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView style={styles.drillSelectorContent}>
              {availableDrills.map((drill, index) => (
                <Card key={index} style={styles.drillSelectorCard}>
                  <Card.Content>
                    <View style={styles.drillSelectorHeader}>
                      <Text style={styles.drillSelectorName}>{drill.name}</Text>
                      <Chip style={{
                        backgroundColor: drill.type === 'technique' ? '#E0F2FE' :
                                       drill.type === 'sparring' ? '#FEF3C7' :
                                       drill.type === 'conditioning' ? '#F0FDF4' : '#F3E8FF'
                      }}>
                        <Text style={{
                          color: drill.type === 'technique' ? '#0369A1' :
                                drill.type === 'sparring' ? '#92400E' :
                                drill.type === 'conditioning' ? '#166534' : '#7C3AED'
                        }}>{drill.type}</Text>
                      </Chip>
                    </View>
                    <Text style={styles.drillSelectorDescription}>{drill.description}</Text>
                    <View style={styles.drillSelectorStats}>
                      <Text style={styles.drillSelectorIntensity}>Intensidad: {drill.intensity}/5</Text>
                    </View>
                    <Button
                      mode="contained"
                      style={styles.addButton}
                      buttonColor="#283750"
                      onPress={() => addDrillToSession(drill)}
                    >
                      Agregar
                    </Button>
                  </Card.Content>
                </Card>
              ))}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowDrillSelector(false)}>Cerrar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        visible={deleteDialogVisible}
        onDismiss={() => setDeleteDialogVisible(false)}
        onConfirm={confirmDelete}
        title="Eliminar Entrenamiento"
        message={`¿Estás seguro de que quieres eliminar este entrenamiento? Esta acción no se puede deshacer.`}
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
  createDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  recentSessionItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  recentSessionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#283750',
  },
  recentSessionDetails: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  viewAllButton: {
    marginTop: 12,
    borderColor: '#283750',
  },
  addDrillButton: {
    marginBottom: 16,
    borderColor: '#283750',
  },
  emptyDrills: {
    padding: 24,
    alignItems: 'center',
  },
  emptyDrillsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 4,
  },
  emptyDrillsSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  drillSelectorDialog: {
    maxHeight: '80%',
  },
  drillSelectorContent: {
    maxHeight: 400,
  },
  drillSelectorCard: {
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  drillSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  drillSelectorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#283750',
    flex: 1,
    marginRight: 8,
  },
  drillSelectorDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  drillSelectorStats: {
    marginBottom: 12,
  },
  drillSelectorIntensity: {
    fontSize: 12,
    color: '#374151',
  },
  addButton: {
    borderRadius: 6,
  },
});

export default EntrenamientoDeportivoScreen;