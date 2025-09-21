import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, FlatList } from 'react-native';
import { Card, Button, TextInput, Dialog, Portal, SegmentedButtons, Chip, IconButton, FAB } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncManager } from '../hooks/useSyncManager';

interface TacticalPlan {
  id: string;
  name: string;
  sport: 'judo' | 'karate' | 'boxing' | 'mma' | 'general';
  type: 'offensive' | 'defensive' | 'counter' | 'conditioning';
  description: string;
  objectives: string[];
  strategies: string[];
  keyPoints: string[];
  dateCreated: string;
  lastUsed?: string;
  effectiveness: 1 | 2 | 3 | 4 | 5;
  isFavorite: boolean;
}

interface OpponentAnalysis {
  id: string;
  name: string;
  sport: string;
  dateAnalyzed: string;
  strengths: string[];
  weaknesses: string[];
  preferredTechniques: string[];
  tacticalNotes: string;
  gameplan: string;
  result?: 'win' | 'loss' | 'draw' | 'pending';
}

interface TrainingDrill {
  id: string;
  name: string;
  category: 'tactical' | 'technical' | 'conditioning' | 'mental';
  description: string;
  duration: number; // en minutos
  intensity: 1 | 2 | 3 | 4 | 5;
  materials: string[];
  instructions: string[];
}

const TacticaDeportivaScreen = () => {
  const [tacticalPlans, setTacticalPlans] = useState<TacticalPlan[]>([]);
  const [opponentAnalyses, setOpponentAnalyses] = useState<OpponentAnalysis[]>([]);
  const [trainingDrills, setTrainingDrills] = useState<TrainingDrill[]>([]);
  const [activeTab, setActiveTab] = useState('planes');
  const [planDialogVisible, setPlanDialogVisible] = useState(false);
  const [opponentDialogVisible, setOpponentDialogVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TacticalPlan | OpponentAnalysis | null>(null);
  const [detailDialogVisible, setDetailDialogVisible] = useState(false);
  const { syncStatus, updateRemoteData } = useSyncManager();

  // Form states
  const [newPlan, setNewPlan] = useState<Partial<TacticalPlan>>({
    name: '',
    sport: 'general',
    type: 'offensive',
    description: '',
    objectives: [],
    strategies: [],
    keyPoints: [],
    effectiveness: 3,
    isFavorite: false
  });

  const [newOpponent, setNewOpponent] = useState<Partial<OpponentAnalysis>>({
    name: '',
    sport: '',
    strengths: [],
    weaknesses: [],
    preferredTechniques: [],
    tacticalNotes: '',
    gameplan: ''
  });

  // Sample tactical plans
  const samplePlans: TacticalPlan[] = [
    {
      id: '1',
      name: 'Ataque por Ashi-waza',
      sport: 'judo',
      type: 'offensive',
      description: 'Estrategia ofensiva centrada en técnicas de pierna',
      objectives: [
        'Desequilibrar al oponente hacia adelante',
        'Crear oportunidades para técnicas de pierna',
        'Mantener presión constante'
      ],
      strategies: [
        'Usar falsos ataques de mano para abrir la guardia',
        'Cambiar constantemente el ritmo del combate',
        'Buscar combinaciones de ashi-waza'
      ],
      keyPoints: [
        'Timing perfecto en las entradas',
        'Mantener el equilibrio propio',
        'Aprovechar el movimiento del oponente'
      ],
      dateCreated: new Date().toISOString(),
      effectiveness: 4,
      isFavorite: true
    },
    {
      id: '2',
      name: 'Defensa y Contraataque',
      sport: 'karate',
      type: 'counter',
      description: 'Plan defensivo con contraataques rápidos',
      objectives: [
        'Absorber la presión del oponente',
        'Crear aberturas para contraatacar',
        'Mantener la distancia óptima'
      ],
      strategies: [
        'Usar desplazamientos laterales',
        'Bloquear y contraatacar inmediatamente',
        'Variar la distancia constantemente'
      ],
      keyPoints: [
        'Lectura de las intenciones del oponente',
        'Velocidad en los contraataques',
        'Precisión en los golpes'
      ],
      dateCreated: new Date().toISOString(),
      effectiveness: 3,
      isFavorite: false
    }
  ];

  // Sample opponent analyses
  const sampleOpponents: OpponentAnalysis[] = [
    {
      id: '1',
      name: 'Competidor A',
      sport: 'judo',
      dateAnalyzed: new Date().toISOString(),
      strengths: [
        'Excelente técnica de mano',
        'Muy fuerte físicamente',
        'Buen ne-waza'
      ],
      weaknesses: [
        'Lento en los contraataques',
        'Problemas con ashi-waza',
        'Se cansa en combates largos'
      ],
      preferredTechniques: [
        'Seoi-nage',
        'Osoto-gari',
        'Osaekomi-waza'
      ],
      tacticalNotes: 'Tiende a atacar mucho al inicio. Evitar el agarre directo.',
      gameplan: 'Mantener distancia, usar ashi-waza, prolongar el combate.',
      result: 'win'
    }
  ];

  // Sample training drills
  const sampleDrills: TrainingDrill[] = [
    {
      id: '1',
      name: 'Drill de Cambio de Ritmo',
      category: 'tactical',
      description: 'Práctica de variación de ritmo en el combate',
      duration: 15,
      intensity: 3,
      materials: ['Compañero de entrenamiento', 'Cronómetro'],
      instructions: [
        'Comenzar con ritmo lento por 30 segundos',
        'Cambiar a ritmo explosivo por 10 segundos',
        'Volver a ritmo lento por 20 segundos',
        'Repetir la secuencia'
      ]
    },
    {
      id: '2',
      name: 'Simulación de Contraataque',
      category: 'tactical',
      description: 'Entrenamiento específico de contraataques',
      duration: 20,
      intensity: 4,
      materials: ['Pads', 'Compañero'],
      instructions: [
        'Compañero realiza ataque predefinido',
        'Defender y contraatacar inmediatamente',
        'Variar los tipos de ataque del compañero',
        'Enfocarse en la velocidad de reacción'
      ]
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plansData, opponentsData, drillsData] = await Promise.all([
        AsyncStorage.getItem('tactical-plans'),
        AsyncStorage.getItem('opponent-analyses'),
        AsyncStorage.getItem('tactical-drills')
      ]);

      if (plansData) {
        setTacticalPlans(JSON.parse(plansData));
      } else {
        setTacticalPlans(samplePlans);
        saveTacticalPlans(samplePlans);
      }

      if (opponentsData) {
        setOpponentAnalyses(JSON.parse(opponentsData));
      } else {
        setOpponentAnalyses(sampleOpponents);
        saveOpponentAnalyses(sampleOpponents);
      }

      if (drillsData) {
        setTrainingDrills(JSON.parse(drillsData));
      } else {
        setTrainingDrills(sampleDrills);
        saveTrainingDrills(sampleDrills);
      }
    } catch (error) {
      console.error('Error loading tactical data:', error);
    }
  };

  const saveTacticalPlans = async (plans: TacticalPlan[]) => {
    try {
      await AsyncStorage.setItem('tactical-plans', JSON.stringify(plans));
      setTacticalPlans(plans);
      
      if (syncStatus.isLinked) {
        updateRemoteData({ tacticalPlans: plans });
      }
    } catch (error) {
      console.error('Error saving tactical plans:', error);
    }
  };

  const saveOpponentAnalyses = async (analyses: OpponentAnalysis[]) => {
    try {
      await AsyncStorage.setItem('opponent-analyses', JSON.stringify(analyses));
      setOpponentAnalyses(analyses);
      
      if (syncStatus.isLinked) {
        updateRemoteData({ opponentAnalyses: analyses });
      }
    } catch (error) {
      console.error('Error saving opponent analyses:', error);
    }
  };

  const saveTrainingDrills = async (drills: TrainingDrill[]) => {
    try {
      await AsyncStorage.setItem('tactical-drills', JSON.stringify(drills));
      setTrainingDrills(drills);
      
      if (syncStatus.isLinked) {
        updateRemoteData({ tacticalDrills: drills });
      }
    } catch (error) {
      console.error('Error saving training drills:', error);
    }
  };

  const addTacticalPlan = () => {
    if (!newPlan.name || !newPlan.description) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    const plan: TacticalPlan = {
      id: Date.now().toString(),
      name: newPlan.name!,
      sport: newPlan.sport!,
      type: newPlan.type!,
      description: newPlan.description!,
      objectives: newPlan.objectives || [],
      strategies: newPlan.strategies || [],
      keyPoints: newPlan.keyPoints || [],
      dateCreated: new Date().toISOString(),
      effectiveness: newPlan.effectiveness!,
      isFavorite: newPlan.isFavorite!
    };

    const updatedPlans = [plan, ...tacticalPlans];
    saveTacticalPlans(updatedPlans);
    setPlanDialogVisible(false);
    resetPlanForm();

    Alert.alert('Éxito', 'Plan táctico creado correctamente');
  };

  const resetPlanForm = () => {
    setNewPlan({
      name: '',
      sport: 'general',
      type: 'offensive',
      description: '',
      objectives: [],
      strategies: [],
      keyPoints: [],
      effectiveness: 3,
      isFavorite: false
    });
  };

  const toggleFavorite = (planId: string) => {
    const updatedPlans = tacticalPlans.map(plan =>
      plan.id === planId ? { ...plan, isFavorite: !plan.isFavorite } : plan
    );
    saveTacticalPlans(updatedPlans);
  };

  const getTacticalStats = () => {
    const favorites = tacticalPlans.filter(p => p.isFavorite).length;
    const highEffectiveness = tacticalPlans.filter(p => p.effectiveness >= 4).length;
    const opponents = opponentAnalyses.length;
    const drills = trainingDrills.length;

    return { favorites, highEffectiveness, opponents, drills };
  };

  const renderTacticalPlanCard = ({ item }: { item: TacticalPlan }) => (
    <Card style={styles.card} onPress={() => {
      setSelectedItem(item);
      setDetailDialogVisible(true);
    }}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.planInfo}>
            <Text style={styles.planName}>{item.name}</Text>
            <Text style={styles.planMeta}>
              {item.sport} • {item.type}
            </Text>
          </View>
          <IconButton
            icon={item.isFavorite ? "heart" : "heart-outline"}
            iconColor={item.isFavorite ? "#EF4444" : "#9CA3AF"}
            onPress={() => toggleFavorite(item.id)}
          />
        </View>

        <Text style={styles.planDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.planStats}>
          <Chip style={styles.effectivenessChip}>
            <Text>Efectividad {item.effectiveness}/5</Text>
          </Chip>
          <Chip style={styles.dateChip}>
            <Text>{new Date(item.dateCreated).toLocaleDateString()}</Text>
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );

  const renderOpponentCard = ({ item }: { item: OpponentAnalysis }) => (
    <Card style={styles.card} onPress={() => {
      setSelectedItem(item);
      setDetailDialogVisible(true);
    }}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.opponentInfo}>
            <Text style={styles.opponentName}>{item.name}</Text>
            <Text style={styles.opponentMeta}>
              {item.sport} • {new Date(item.dateAnalyzed).toLocaleDateString()}
            </Text>
          </View>
          {item.result && (
            <Chip style={[
              styles.resultChip,
              { backgroundColor: 
                item.result === 'win' ? '#DCFCE7' : 
                item.result === 'loss' ? '#FEE2E2' : '#FEF3C7' 
              }
            ]}>
              <Text style={{
                color: 
                  item.result === 'win' ? '#166534' : 
                  item.result === 'loss' ? '#991B1B' : '#92400E'
              }}>
                {item.result === 'win' ? 'Victoria' : 
                 item.result === 'loss' ? 'Derrota' : 'Empate'}
              </Text>
            </Chip>
          )}
        </View>

        <Text style={styles.tacticalNotes} numberOfLines={2}>
          {item.tacticalNotes}
        </Text>

        <View style={styles.analysisStats}>
          <Chip style={styles.strengthsChip}>
            <Text>{item.strengths.length} fortalezas</Text>
          </Chip>
          <Chip style={styles.weaknessesChip}>
            <Text>{item.weaknesses.length} debilidades</Text>
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );

  const renderDrillCard = ({ item }: { item: TrainingDrill }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.drillName}>{item.name}</Text>
        <Text style={styles.drillDescription}>{item.description}</Text>
        
        <View style={styles.drillStats}>
          <Chip style={styles.durationChip}>
            <Text>{item.duration} min</Text>
          </Chip>
          <Chip style={styles.intensityChip}>
            <Text>Intensidad {item.intensity}/5</Text>
          </Chip>
          <Chip style={styles.categoryChip}>
            <Text>{item.category}</Text>
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );

  const renderPlanesView = () => {
    const stats = getTacticalStats();

    return (
      <View>
        {/* Stats Card */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Resumen Táctico</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{tacticalPlans.length}</Text>
                <Text style={styles.statLabel}>Planes</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.favorites}</Text>
                <Text style={styles.statLabel}>Favoritos</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.highEffectiveness}</Text>
                <Text style={styles.statLabel}>Efectivos</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.opponents}</Text>
                <Text style={styles.statLabel}>Rivales</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Plans List */}
        <FlatList
          data={tacticalPlans}
          renderItem={renderTacticalPlanCard}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  const renderRivalesView = () => (
    <View>
      {opponentAnalyses.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text style={styles.emptyText}>No hay análisis de rivales</Text>
            <Text style={styles.emptySubtext}>Agrega análisis de oponentes para mejorar tu estrategia</Text>
          </Card.Content>
        </Card>
      ) : (
        <FlatList
          data={opponentAnalyses}
          renderItem={renderOpponentCard}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );

  const renderDrillsView = () => (
    <View>
      <FlatList
        data={trainingDrills}
        renderItem={renderDrillCard}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />
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
            { value: 'planes', label: 'Planes' },
            { value: 'rivales', label: 'Rivales' },
            { value: 'drills', label: 'Ejercicios' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <ScrollView style={styles.scrollContainer}>
        {activeTab === 'planes' && renderPlanesView()}
        {activeTab === 'rivales' && renderRivalesView()}
        {activeTab === 'drills' && renderDrillsView()}
      </ScrollView>

      {/* Plan Dialog */}
      <Portal>
        <Dialog visible={planDialogVisible} onDismiss={() => setPlanDialogVisible(false)}>
          <Dialog.Title>Nuevo Plan Táctico</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Nombre del plan"
              value={newPlan.name || ''}
              onChangeText={(text) => setNewPlan({...newPlan, name: text})}
              style={styles.input}
            />
            <TextInput
              label="Descripción"
              value={newPlan.description || ''}
              onChangeText={(text) => setNewPlan({...newPlan, description: text})}
              multiline
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPlanDialogVisible(false)}>Cancelar</Button>
            <Button mode="contained" onPress={addTacticalPlan}>Crear</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Detail Dialog */}
      <Portal>
        <Dialog visible={detailDialogVisible} onDismiss={() => setDetailDialogVisible(false)}>
          <Dialog.Title>
            {selectedItem && 'name' in selectedItem ? selectedItem.name : 
             selectedItem && 'name' in selectedItem ? selectedItem.name : 'Detalle'}
          </Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogContent}>
            <ScrollView>
              {selectedItem && 'objectives' in selectedItem && (
                <View>
                  <Text style={styles.dialogDescription}>{selectedItem.description}</Text>
                  
                  <Text style={styles.sectionSubtitle}>Objetivos:</Text>
                  {selectedItem.objectives.map((obj, index) => (
                    <Text key={index} style={styles.listItem}>• {obj}</Text>
                  ))}
                  
                  <Text style={styles.sectionSubtitle}>Estrategias:</Text>
                  {selectedItem.strategies.map((strategy, index) => (
                    <Text key={index} style={styles.listItem}>• {strategy}</Text>
                  ))}
                  
                  <Text style={styles.sectionSubtitle}>Puntos Clave:</Text>
                  {selectedItem.keyPoints.map((point, index) => (
                    <Text key={index} style={styles.listItem}>• {point}</Text>
                  ))}
                </View>
              )}
              
              {selectedItem && 'strengths' in selectedItem && (
                <View>
                  <Text style={styles.dialogDescription}>{selectedItem.tacticalNotes}</Text>
                  
                  <Text style={styles.sectionSubtitle}>Fortalezas:</Text>
                  {selectedItem.strengths.map((strength, index) => (
                    <Text key={index} style={styles.listItem}>• {strength}</Text>
                  ))}
                  
                  <Text style={styles.sectionSubtitle}>Debilidades:</Text>
                  {selectedItem.weaknesses.map((weakness, index) => (
                    <Text key={index} style={styles.listItem}>• {weakness}</Text>
                  ))}
                  
                  <Text style={styles.sectionSubtitle}>Plan de Juego:</Text>
                  <Text style={styles.gameplanText}>{selectedItem.gameplan}</Text>
                </View>
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setDetailDialogVisible(false)}>Cerrar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          if (activeTab === 'planes') {
            setPlanDialogVisible(true);
          } else if (activeTab === 'rivales') {
            Alert.alert(
              "Análisis de Rival",
              "Esta funcionalidad estará disponible pronto para agregar análisis detallados de oponentes.",
              [{ text: 'Entendido', style: 'default' }]
            );
          } else {
            Alert.alert(
              "Ejercicio Táctico",
              "Esta funcionalidad estará disponible pronto para crear ejercicios táctticos personalizados.",
              [{ text: 'Entendido', style: 'default' }]
            );
          }
        }}
        label="Nuevo"
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
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#283750',
    marginTop: 16,
    marginBottom: 8,
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
  list: {
    flex: 1,
  },
  card: {
    margin: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#283750',
    marginBottom: 4,
  },
  planMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
  planDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  planStats: {
    flexDirection: 'row',
    gap: 8,
  },
  effectivenessChip: {
    backgroundColor: '#DBEAFE',
  },
  dateChip: {
    backgroundColor: '#F3F4F6',
  },
  opponentInfo: {
    flex: 1,
  },
  opponentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#283750',
    marginBottom: 4,
  },
  opponentMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
  tacticalNotes: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  analysisStats: {
    flexDirection: 'row',
    gap: 8,
  },
  strengthsChip: {
    backgroundColor: '#DCFCE7',
  },
  weaknessesChip: {
    backgroundColor: '#FEE2E2',
  },
  resultChip: {
    marginLeft: 8,
  },
  drillName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#283750',
    marginBottom: 8,
  },
  drillDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  drillStats: {
    flexDirection: 'row',
    gap: 8,
  },
  durationChip: {
    backgroundColor: '#FEF3C7',
  },
  intensityChip: {
    backgroundColor: '#DBEAFE',
  },
  categoryChip: {
    backgroundColor: '#F3E8FF',
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
  dialogContent: {
    maxHeight: 400,
  },
  dialogDescription: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 16,
  },
  listItem: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 6,
    paddingLeft: 8,
  },
  gameplanText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    fontStyle: 'italic',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
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

export default TacticaDeportivaScreen;