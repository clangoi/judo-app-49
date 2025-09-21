import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, FlatList } from 'react-native';
import { Card, Button, TextInput, Dialog, Portal, SegmentedButtons, Chip, IconButton, FAB } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useCrudStorage } from '../hooks/useCrudStorage';
import EntryList from '../components/EntryList';
import EntryFormModal from '../components/EntryFormModal';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog';

interface TacticalPlan {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  sport: 'judo' | 'karate' | 'boxing' | 'mma' | 'general';
  type: 'offensive' | 'defensive' | 'counter' | 'conditioning';
  description: string;
  objectives: string[];
  strategies: string[];
  keyPoints: string[];
  lastUsed?: string;
  effectiveness: 1 | 2 | 3 | 4 | 5;
  isFavorite: boolean;
}

interface OpponentAnalysis {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  sport: string;
  strengths: string[];
  weaknesses: string[];
  preferredTechniques: string[];
  tacticalNotes: string;
  gameplan: string;
  result?: 'win' | 'loss' | 'draw' | 'pending';
}

interface TrainingDrill {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  category: 'tactical' | 'technical' | 'conditioning' | 'mental';
  description: string;
  duration: number; // en minutos
  intensity: 1 | 2 | 3 | 4 | 5;
  materials: string[];
  instructions: string[];
}

const TacticaDeportivaScreen = () => {
  const { items: tacticalPlans, isLoading: plansLoading, create: createPlan, update: updatePlan, remove: removePlan } = useCrudStorage<TacticalPlan>({
    storageKey: 'expo:tactics:plans',
    remotePayloadKey: 'tacticalPlans'
  });
  
  const { items: opponentAnalyses, isLoading: opponentsLoading, create: createOpponent, update: updateOpponent, remove: removeOpponent } = useCrudStorage<OpponentAnalysis>({
    storageKey: 'expo:tactics:opponents',
    remotePayloadKey: 'opponentAnalyses'
  });
  
  const { items: trainingDrills, isLoading: drillsLoading, create: createDrill, update: updateDrill, remove: removeDrill } = useCrudStorage<TrainingDrill>({
    storageKey: 'expo:tactics:drills',
    remotePayloadKey: 'tacticalDrills'
  });

  const [activeTab, setActiveTab] = useState('planes');
  const [selectedItem, setSelectedItem] = useState<TacticalPlan | OpponentAnalysis | null>(null);
  const [detailDialogVisible, setDetailDialogVisible] = useState(false);
  
  // CRUD states
  const [formVisible, setFormVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'plan' | 'opponent' | 'drill'; name: string } | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<TacticalPlan | OpponentAnalysis | TrainingDrill | null>(null);

  // Form states
  const [formPlan, setFormPlan] = useState<Partial<TacticalPlan>>({
    name: '',
    sport: 'general',
    type: 'offensive',
    description: '',
    objectives: [''],
    strategies: [''],
    keyPoints: [''],
    effectiveness: 3,
    isFavorite: false
  });

  const [formOpponent, setFormOpponent] = useState<Partial<OpponentAnalysis>>({
    name: '',
    sport: '',
    strengths: [''],
    weaknesses: [''],
    preferredTechniques: [''],
    tacticalNotes: '',
    gameplan: ''
  });
  
  const [formDrill, setFormDrill] = useState<Partial<TrainingDrill>>({
    name: '',
    category: 'tactical',
    description: '',
    duration: 15,
    intensity: 3,
    materials: [''],
    instructions: ['']
  });

  // Initialize sample data
  const initializeSampleData = async () => {
    if (tacticalPlans.length === 0 && !plansLoading) {
      const samplePlans: Omit<TacticalPlan, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
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
          effectiveness: 4,
          isFavorite: true
        }
      ];

      for (const plan of samplePlans) {
        await createPlan(plan);
      }
    }

    if (opponentAnalyses.length === 0 && !opponentsLoading) {
      const sampleOpponents: Omit<OpponentAnalysis, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          name: 'Competidor A',
          sport: 'judo',
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

      for (const opponent of sampleOpponents) {
        await createOpponent(opponent);
      }
    }

    if (trainingDrills.length === 0 && !drillsLoading) {
      const sampleDrills: Omit<TrainingDrill, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
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
        }
      ];

      for (const drill of sampleDrills) {
        await createDrill(drill);
      }
    }
  };

  useEffect(() => {
    initializeSampleData();
  }, [tacticalPlans.length, opponentAnalyses.length, trainingDrills.length, plansLoading, opponentsLoading, drillsLoading]);

  // CRUD Operations
  const handleCreate = (type: 'plan' | 'opponent' | 'drill') => {
    setEditMode(false);
    setEditingItem(null);
    
    if (type === 'plan') {
      setFormPlan({
        name: '',
        sport: 'general',
        type: 'offensive',
        description: '',
        objectives: [''],
        strategies: [''],
        keyPoints: [''],
        effectiveness: 3,
        isFavorite: false
      });
    } else if (type === 'opponent') {
      setFormOpponent({
        name: '',
        sport: '',
        strengths: [''],
        weaknesses: [''],
        preferredTechniques: [''],
        tacticalNotes: '',
        gameplan: ''
      });
    } else {
      setFormDrill({
        name: '',
        category: 'tactical',
        description: '',
        duration: 15,
        intensity: 3,
        materials: [''],
        instructions: ['']
      });
    }
    
    setFormVisible(true);
  };

  const handleEdit = (item: TacticalPlan | OpponentAnalysis | TrainingDrill) => {
    setEditMode(true);
    setEditingItem(item);
    
    if ('objectives' in item) {
      setFormPlan(item);
    } else if ('strengths' in item) {
      setFormOpponent(item);
    } else {
      setFormDrill(item);
    }
    
    setFormVisible(true);
  };

  const handleDelete = (item: TacticalPlan | OpponentAnalysis | TrainingDrill) => {
    const type = 'objectives' in item ? 'plan' : 'strengths' in item ? 'opponent' : 'drill';
    setItemToDelete({ id: item.id, type, name: item.name });
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    if (itemToDelete.type === 'plan') {
      await removePlan(itemToDelete.id);
    } else if (itemToDelete.type === 'opponent') {
      await removeOpponent(itemToDelete.id);
    } else {
      await removeDrill(itemToDelete.id);
    }
    
    setItemToDelete(null);
  };

  const handleSave = async () => {
    try {
      if (editingItem && 'objectives' in editingItem) {
        // Tactical Plan
        if (!formPlan.name || !formPlan.description) {
          Alert.alert('Error', 'El nombre y descripción son obligatorios.');
          return;
        }

        const planData = {
          ...formPlan,
          objectives: formPlan.objectives?.filter(obj => obj.trim() !== '') || [],
          strategies: formPlan.strategies?.filter(str => str.trim() !== '') || [],
          keyPoints: formPlan.keyPoints?.filter(kp => kp.trim() !== '') || []
        };

        if (editMode && editingItem.id) {
          await updatePlan(editingItem.id, planData);
          Alert.alert('¡Plan Actualizado!', 'Los cambios han sido guardados exitosamente.');
        } else {
          await createPlan(planData);
          Alert.alert('¡Plan Creado!', 'El nuevo plan táctico ha sido agregado.');
        }
      } else if (editingItem && 'strengths' in editingItem) {
        // Opponent Analysis
        if (!formOpponent.name || !formOpponent.sport) {
          Alert.alert('Error', 'El nombre y deporte son obligatorios.');
          return;
        }

        const opponentData = {
          ...formOpponent,
          strengths: formOpponent.strengths?.filter(str => str.trim() !== '') || [],
          weaknesses: formOpponent.weaknesses?.filter(w => w.trim() !== '') || [],
          preferredTechniques: formOpponent.preferredTechniques?.filter(pt => pt.trim() !== '') || []
        };

        if (editMode && editingItem.id) {
          await updateOpponent(editingItem.id, opponentData);
          Alert.alert('¡Análisis Actualizado!', 'Los cambios han sido guardados exitosamente.');
        } else {
          await createOpponent(opponentData);
          Alert.alert('¡Análisis Creado!', 'El nuevo análisis de oponente ha sido agregado.');
        }
      } else {
        // Training Drill
        if (!formDrill.name || !formDrill.description) {
          Alert.alert('Error', 'El nombre y descripción son obligatorios.');
          return;
        }

        const drillData = {
          ...formDrill,
          materials: formDrill.materials?.filter(m => m.trim() !== '') || [],
          instructions: formDrill.instructions?.filter(i => i.trim() !== '') || []
        };

        if (editMode && editingItem?.id) {
          await updateDrill(editingItem.id, drillData);
          Alert.alert('¡Ejercicio Actualizado!', 'Los cambios han sido guardados exitosamente.');
        } else {
          await createDrill(drillData);
          Alert.alert('¡Ejercicio Creado!', 'El nuevo ejercicio táctico ha sido agregado.');
        }
      }

      setFormVisible(false);
      setEditMode(false);
      setEditingItem(null);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar los datos. Inténtalo de nuevo.');
    }
  };

  const toggleFavorite = async (planId: string) => {
    const plan = tacticalPlans.find(p => p.id === planId);
    if (!plan) return;

    await updatePlan(planId, { isFavorite: !plan.isFavorite });
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

  const renderRivalesView = () => {
    const listItems = opponentAnalyses.map(opponent => ({
      id: opponent.id,
      title: opponent.name,
      subtitle: opponent.sport,
      description: `${opponent.tacticalNotes} • ${opponent.strengths.length} fortalezas • ${opponent.weaknesses.length} debilidades${opponent.result ? ` • ${opponent.result === 'win' ? 'Victoria' : opponent.result === 'loss' ? 'Derrota' : 'Empate'}` : ''}`,
      leftIcon: 'account-search',
      rightText: opponent.result === 'win' ? 'V' : opponent.result === 'loss' ? 'D' : opponent.result === 'draw' ? 'E' : ''
    }));

    return (
      <EntryList
        items={listItems}
        onItemPress={(item) => {
          const opponent = opponentAnalyses.find(o => o.id === item.id);
          if (opponent) {
            setSelectedItem(opponent);
            setDetailDialogVisible(true);
          }
        }}
        onEdit={(item) => {
          const opponent = opponentAnalyses.find(o => o.id === item.id);
          if (opponent) handleEdit(opponent);
        }}
        onDelete={(item) => {
          const opponent = opponentAnalyses.find(o => o.id === item.id);
          if (opponent) handleDelete(opponent);
        }}
        emptyStateText="No hay análisis de rivales"
        emptyStateSubtext="Agrega análisis de oponentes para mejorar tu estrategia"
        loading={opponentsLoading}
      />
    );
  };

  const renderDrillsView = () => {
    const listItems = trainingDrills.map(drill => ({
      id: drill.id,
      title: drill.name,
      subtitle: drill.category,
      description: `${drill.description} • ${drill.duration} min • Intensidad ${drill.intensity}/5 • ${drill.materials.length} materiales`,
      leftIcon: 'dumbbell',
      rightText: `${drill.duration}min`
    }));

    return (
      <EntryList
        items={listItems}
        onItemPress={(item) => {
          const drill = trainingDrills.find(d => d.id === item.id);
          if (drill) {
            setSelectedItem(drill as any);
            setDetailDialogVisible(true);
          }
        }}
        onEdit={(item) => {
          const drill = trainingDrills.find(d => d.id === item.id);
          if (drill) handleEdit(drill);
        }}
        onDelete={(item) => {
          const drill = trainingDrills.find(d => d.id === item.id);
          if (drill) handleDelete(drill);
        }}
        emptyStateText="No hay ejercicios tácticos"
        emptyStateSubtext="Agrega ejercicios específicos para mejorar tu táctica"
        loading={drillsLoading}
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
            ? editingItem && 'objectives' in editingItem ? 'Editar Plan Táctico'
              : editingItem && 'strengths' in editingItem ? 'Editar Análisis de Rival'
              : 'Editar Ejercicio Táctico'
            : editingItem && 'objectives' in editingItem ? 'Nuevo Plan Táctico'
              : editingItem && 'strengths' in editingItem ? 'Nuevo Análisis de Rival'
              : 'Nuevo Ejercicio Táctico'
        }
        submitText={editMode ? 'Actualizar' : 'Crear'}
        submitDisabled={
          (editingItem && 'objectives' in editingItem && (!formPlan.name || !formPlan.description)) ||
          (editingItem && 'strengths' in editingItem && (!formOpponent.name || !formOpponent.sport)) ||
          (editingItem && !('objectives' in editingItem) && !('strengths' in editingItem) && (!formDrill.name || !formDrill.description))
        }
      >
        <ScrollView style={styles.formScrollView}>
          {editingItem && 'objectives' in editingItem && (
            <View style={styles.formFields}>
              <TextInput
                mode="outlined"
                label="Nombre del plan *"
                value={formPlan.name || ''}
                onChangeText={(text) => setFormPlan(prev => ({ ...prev, name: text }))}
                style={styles.formInput}
              />
              
              <TextInput
                mode="outlined"
                label="Descripción *"
                value={formPlan.description || ''}
                onChangeText={(text) => setFormPlan(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={3}
                style={styles.formInput}
              />

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.fieldLabel}>Deporte</Text>
                  <View style={styles.chipContainer}>
                    {['general', 'judo', 'karate', 'boxing', 'mma'].map((sport) => (
                      <Chip
                        key={sport}
                        selected={formPlan.sport === sport}
                        onPress={() => setFormPlan(prev => ({ ...prev, sport: sport as any }))}
                        style={styles.selectionChip}
                      >
                        {sport.charAt(0).toUpperCase() + sport.slice(1)}
                      </Chip>
                    ))}
                  </View>
                </View>
                
                <View style={styles.halfWidth}>
                  <Text style={styles.fieldLabel}>Tipo</Text>
                  <View style={styles.chipContainer}>
                    {['offensive', 'defensive', 'counter', 'conditioning'].map((type) => (
                      <Chip
                        key={type}
                        selected={formPlan.type === type}
                        onPress={() => setFormPlan(prev => ({ ...prev, type: type as any }))}
                        style={styles.selectionChip}
                      >
                        {type === 'offensive' ? 'Ofensivo' : type === 'defensive' ? 'Defensivo' : type === 'counter' ? 'Contraataque' : 'Acondicionamiento'}
                      </Chip>
                    ))}
                  </View>
                </View>
              </View>

              <Text style={styles.fieldLabel}>Efectividad: {formPlan.effectiveness}/5</Text>
              <View style={styles.difficultyContainer}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <Chip
                    key={level}
                    selected={formPlan.effectiveness === level}
                    onPress={() => setFormPlan(prev => ({ ...prev, effectiveness: level as any }))}
                    style={styles.difficultyChip}
                  >
                    {level}
                  </Chip>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Objetivos</Text>
              {formPlan.objectives?.map((objective, index) => (
                <View key={index} style={styles.stepInputContainer}>
                  <TextInput
                    mode="outlined"
                    label={`Objetivo ${index + 1}`}
                    value={objective}
                    onChangeText={(text) => {
                      const newObjectives = [...(formPlan.objectives || [])];
                      newObjectives[index] = text;
                      setFormPlan(prev => ({ ...prev, objectives: newObjectives }));
                    }}
                    style={styles.stepInput}
                  />
                  {formPlan.objectives && formPlan.objectives.length > 1 && (
                    <IconButton
                      icon="delete"
                      onPress={() => {
                        const newObjectives = formPlan.objectives?.filter((_, i) => i !== index);
                        setFormPlan(prev => ({ ...prev, objectives: newObjectives }));
                      }}
                    />
                  )}
                </View>
              ))}
              <Button
                mode="outlined"
                onPress={() => {
                  const newObjectives = [...(formPlan.objectives || []), ''];
                  setFormPlan(prev => ({ ...prev, objectives: newObjectives }));
                }}
                style={styles.addButton}
              >
                Agregar Objetivo
              </Button>

              <Text style={styles.fieldLabel}>Estrategias</Text>
              {formPlan.strategies?.map((strategy, index) => (
                <View key={index} style={styles.stepInputContainer}>
                  <TextInput
                    mode="outlined"
                    label={`Estrategia ${index + 1}`}
                    value={strategy}
                    onChangeText={(text) => {
                      const newStrategies = [...(formPlan.strategies || [])];
                      newStrategies[index] = text;
                      setFormPlan(prev => ({ ...prev, strategies: newStrategies }));
                    }}
                    style={styles.stepInput}
                  />
                  {formPlan.strategies && formPlan.strategies.length > 1 && (
                    <IconButton
                      icon="delete"
                      onPress={() => {
                        const newStrategies = formPlan.strategies?.filter((_, i) => i !== index);
                        setFormPlan(prev => ({ ...prev, strategies: newStrategies }));
                      }}
                    />
                  )}
                </View>
              ))}
              <Button
                mode="outlined"
                onPress={() => {
                  const newStrategies = [...(formPlan.strategies || []), ''];
                  setFormPlan(prev => ({ ...prev, strategies: newStrategies }));
                }}
                style={styles.addButton}
              >
                Agregar Estrategia
              </Button>

              <Text style={styles.fieldLabel}>Puntos Clave</Text>
              {formPlan.keyPoints?.map((keyPoint, index) => (
                <View key={index} style={styles.stepInputContainer}>
                  <TextInput
                    mode="outlined"
                    label={`Punto Clave ${index + 1}`}
                    value={keyPoint}
                    onChangeText={(text) => {
                      const newKeyPoints = [...(formPlan.keyPoints || [])];
                      newKeyPoints[index] = text;
                      setFormPlan(prev => ({ ...prev, keyPoints: newKeyPoints }));
                    }}
                    style={styles.stepInput}
                  />
                  {formPlan.keyPoints && formPlan.keyPoints.length > 1 && (
                    <IconButton
                      icon="delete"
                      onPress={() => {
                        const newKeyPoints = formPlan.keyPoints?.filter((_, i) => i !== index);
                        setFormPlan(prev => ({ ...prev, keyPoints: newKeyPoints }));
                      }}
                    />
                  )}
                </View>
              ))}
              <Button
                mode="outlined"
                onPress={() => {
                  const newKeyPoints = [...(formPlan.keyPoints || []), ''];
                  setFormPlan(prev => ({ ...prev, keyPoints: newKeyPoints }));
                }}
                style={styles.addButton}
              >
                Agregar Punto Clave
              </Button>
            </View>
          )}

          {editingItem && 'strengths' in editingItem && (
            <View style={styles.formFields}>
              <TextInput
                mode="outlined"
                label="Nombre del rival *"
                value={formOpponent.name || ''}
                onChangeText={(text) => setFormOpponent(prev => ({ ...prev, name: text }))}
                style={styles.formInput}
              />
              
              <TextInput
                mode="outlined"
                label="Deporte *"
                value={formOpponent.sport || ''}
                onChangeText={(text) => setFormOpponent(prev => ({ ...prev, sport: text }))}
                style={styles.formInput}
              />

              <TextInput
                mode="outlined"
                label="Notas tácticas"
                value={formOpponent.tacticalNotes || ''}
                onChangeText={(text) => setFormOpponent(prev => ({ ...prev, tacticalNotes: text }))}
                multiline
                numberOfLines={3}
                style={styles.formInput}
              />

              <TextInput
                mode="outlined"
                label="Plan de juego"
                value={formOpponent.gameplan || ''}
                onChangeText={(text) => setFormOpponent(prev => ({ ...prev, gameplan: text }))}
                multiline
                numberOfLines={3}
                style={styles.formInput}
              />

              <Text style={styles.fieldLabel}>Fortalezas</Text>
              {formOpponent.strengths?.map((strength, index) => (
                <View key={index} style={styles.stepInputContainer}>
                  <TextInput
                    mode="outlined"
                    label={`Fortaleza ${index + 1}`}
                    value={strength}
                    onChangeText={(text) => {
                      const newStrengths = [...(formOpponent.strengths || [])];
                      newStrengths[index] = text;
                      setFormOpponent(prev => ({ ...prev, strengths: newStrengths }));
                    }}
                    style={styles.stepInput}
                  />
                  {formOpponent.strengths && formOpponent.strengths.length > 1 && (
                    <IconButton
                      icon="delete"
                      onPress={() => {
                        const newStrengths = formOpponent.strengths?.filter((_, i) => i !== index);
                        setFormOpponent(prev => ({ ...prev, strengths: newStrengths }));
                      }}
                    />
                  )}
                </View>
              ))}
              <Button
                mode="outlined"
                onPress={() => {
                  const newStrengths = [...(formOpponent.strengths || []), ''];
                  setFormOpponent(prev => ({ ...prev, strengths: newStrengths }));
                }}
                style={styles.addButton}
              >
                Agregar Fortaleza
              </Button>

              <Text style={styles.fieldLabel}>Debilidades</Text>
              {formOpponent.weaknesses?.map((weakness, index) => (
                <View key={index} style={styles.stepInputContainer}>
                  <TextInput
                    mode="outlined"
                    label={`Debilidad ${index + 1}`}
                    value={weakness}
                    onChangeText={(text) => {
                      const newWeaknesses = [...(formOpponent.weaknesses || [])];
                      newWeaknesses[index] = text;
                      setFormOpponent(prev => ({ ...prev, weaknesses: newWeaknesses }));
                    }}
                    style={styles.stepInput}
                  />
                  {formOpponent.weaknesses && formOpponent.weaknesses.length > 1 && (
                    <IconButton
                      icon="delete"
                      onPress={() => {
                        const newWeaknesses = formOpponent.weaknesses?.filter((_, i) => i !== index);
                        setFormOpponent(prev => ({ ...prev, weaknesses: newWeaknesses }));
                      }}
                    />
                  )}
                </View>
              ))}
              <Button
                mode="outlined"
                onPress={() => {
                  const newWeaknesses = [...(formOpponent.weaknesses || []), ''];
                  setFormOpponent(prev => ({ ...prev, weaknesses: newWeaknesses }));
                }}
                style={styles.addButton}
              >
                Agregar Debilidad
              </Button>
            </View>
          )}

          {editingItem && !('objectives' in editingItem) && !('strengths' in editingItem) && (
            <View style={styles.formFields}>
              <TextInput
                mode="outlined"
                label="Nombre del ejercicio *"
                value={formDrill.name || ''}
                onChangeText={(text) => setFormDrill(prev => ({ ...prev, name: text }))}
                style={styles.formInput}
              />
              
              <TextInput
                mode="outlined"
                label="Descripción *"
                value={formDrill.description || ''}
                onChangeText={(text) => setFormDrill(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={3}
                style={styles.formInput}
              />

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <TextInput
                    mode="outlined"
                    label="Duración (minutos)"
                    value={formDrill.duration?.toString() || ''}
                    onChangeText={(text) => setFormDrill(prev => ({ ...prev, duration: parseInt(text) || 0 }))}
                    keyboardType="numeric"
                    style={styles.formInput}
                  />
                </View>
                
                <View style={styles.halfWidth}>
                  <Text style={styles.fieldLabel}>Intensidad: {formDrill.intensity}/5</Text>
                  <View style={styles.difficultyContainer}>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <Chip
                        key={level}
                        selected={formDrill.intensity === level}
                        onPress={() => setFormDrill(prev => ({ ...prev, intensity: level as any }))}
                        style={styles.difficultyChip}
                      >
                        {level}
                      </Chip>
                    ))}
                  </View>
                </View>
              </View>

              <Text style={styles.fieldLabel}>Categoría</Text>
              <View style={styles.chipContainer}>
                {['tactical', 'technical', 'conditioning', 'mental'].map((category) => (
                  <Chip
                    key={category}
                    selected={formDrill.category === category}
                    onPress={() => setFormDrill(prev => ({ ...prev, category: category as any }))}
                    style={styles.selectionChip}
                  >
                    {category === 'tactical' ? 'Táctico' : category === 'technical' ? 'Técnico' : category === 'conditioning' ? 'Acondicionamiento' : 'Mental'}
                  </Chip>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Materiales</Text>
              {formDrill.materials?.map((material, index) => (
                <View key={index} style={styles.stepInputContainer}>
                  <TextInput
                    mode="outlined"
                    label={`Material ${index + 1}`}
                    value={material}
                    onChangeText={(text) => {
                      const newMaterials = [...(formDrill.materials || [])];
                      newMaterials[index] = text;
                      setFormDrill(prev => ({ ...prev, materials: newMaterials }));
                    }}
                    style={styles.stepInput}
                  />
                  {formDrill.materials && formDrill.materials.length > 1 && (
                    <IconButton
                      icon="delete"
                      onPress={() => {
                        const newMaterials = formDrill.materials?.filter((_, i) => i !== index);
                        setFormDrill(prev => ({ ...prev, materials: newMaterials }));
                      }}
                    />
                  )}
                </View>
              ))}
              <Button
                mode="outlined"
                onPress={() => {
                  const newMaterials = [...(formDrill.materials || []), ''];
                  setFormDrill(prev => ({ ...prev, materials: newMaterials }));
                }}
                style={styles.addButton}
              >
                Agregar Material
              </Button>

              <Text style={styles.fieldLabel}>Instrucciones</Text>
              {formDrill.instructions?.map((instruction, index) => (
                <View key={index} style={styles.stepInputContainer}>
                  <TextInput
                    mode="outlined"
                    label={`Instrucción ${index + 1}`}
                    value={instruction}
                    onChangeText={(text) => {
                      const newInstructions = [...(formDrill.instructions || [])];
                      newInstructions[index] = text;
                      setFormDrill(prev => ({ ...prev, instructions: newInstructions }));
                    }}
                    style={styles.stepInput}
                  />
                  {formDrill.instructions && formDrill.instructions.length > 1 && (
                    <IconButton
                      icon="delete"
                      onPress={() => {
                        const newInstructions = formDrill.instructions?.filter((_, i) => i !== index);
                        setFormDrill(prev => ({ ...prev, instructions: newInstructions }));
                      }}
                    />
                  )}
                </View>
              ))}
              <Button
                mode="outlined"
                onPress={() => {
                  const newInstructions = [...(formDrill.instructions || []), ''];
                  setFormDrill(prev => ({ ...prev, instructions: newInstructions }));
                }}
                style={styles.addButton}
              >
                Agregar Instrucción
              </Button>
            </View>
          )}
        </ScrollView>
      </EntryFormModal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        visible={deleteDialogVisible}
        onDismiss={() => setDeleteDialogVisible(false)}
        onConfirm={confirmDelete}
        title={`Eliminar ${itemToDelete?.type === 'plan' ? 'Plan Táctico' : itemToDelete?.type === 'opponent' ? 'Análisis de Rival' : 'Ejercicio'}`}
        message={`¿Estás seguro de que quieres eliminar "${itemToDelete?.name}"? Esta acción no se puede deshacer.`}
      />

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
            setEditingItem({ objectives: [] } as TacticalPlan);
            handleCreate('plan');
          } else if (activeTab === 'rivales') {
            setEditingItem({ strengths: [] } as OpponentAnalysis);
            handleCreate('opponent');
          } else {
            setEditingItem({ materials: [] } as TrainingDrill);
            handleCreate('drill');
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
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  selectionChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  difficultyChip: {
    minWidth: 40,
  },
  stepInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  stepInput: {
    flex: 1,
  },
  addButton: {
    marginVertical: 8,
  },
});

export default TacticaDeportivaScreen;