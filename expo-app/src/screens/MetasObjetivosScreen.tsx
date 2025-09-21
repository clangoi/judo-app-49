import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, FlatList } from 'react-native';
import { Card, Button, TextInput, Dialog, Portal, SegmentedButtons, Chip, IconButton, FAB, ProgressBar } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncManager } from '../hooks/useSyncManager';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'fitness' | 'technique' | 'competition' | 'weight' | 'general';
  priority: 'low' | 'medium' | 'high';
  targetDate: string;
  currentProgress: number; // 0-100
  isCompleted: boolean;
  milestones: Milestone[];
  createdDate: string;
  completedDate?: string;
  notes?: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  isCompleted: boolean;
  completedDate?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  earnedDate: string;
  icon: string;
  points: number;
}

const MetasObjetivosScreen = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [activeTab, setActiveTab] = useState('activas');
  const [goalDialogVisible, setGoalDialogVisible] = useState(false);
  const [milestoneDialogVisible, setMilestoneDialogVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const { syncStatus, updateRemoteData } = useSyncManager();

  // Form states
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium',
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currentProgress: 0,
    milestones: []
  });

  const [newMilestone, setNewMilestone] = useState<Partial<Milestone>>({
    title: '',
    description: '',
    targetValue: 0,
    currentValue: 0,
    unit: ''
  });

  // Sample goals
  const sampleGoals: Goal[] = [
    {
      id: '1',
      title: 'Conseguir cinturón marrón',
      description: 'Avanzar del cinturón negro actual al marrón en judo',
      category: 'technique',
      priority: 'high',
      targetDate: '2025-12-31',
      currentProgress: 60,
      isCompleted: false,
      milestones: [
        {
          id: '1-1',
          title: 'Dominar 10 técnicas nuevas',
          description: 'Aprender y dominar 10 técnicas de nivel avanzado',
          targetValue: 10,
          currentValue: 6,
          unit: 'técnicas',
          isCompleted: false
        },
        {
          id: '1-2',
          title: 'Participar en 3 competencias',
          description: 'Competir en al menos 3 torneos oficiales',
          targetValue: 3,
          currentValue: 1,
          unit: 'competencias',
          isCompleted: false
        }
      ],
      createdDate: '2025-01-01',
      notes: 'Enfocarme especialmente en técnicas de ne-waza'
    },
    {
      id: '2',
      title: 'Perder 5kg de peso',
      description: 'Reducir peso corporal manteniendo masa muscular',
      category: 'weight',
      priority: 'medium',
      targetDate: '2025-06-30',
      currentProgress: 40,
      isCompleted: false,
      milestones: [
        {
          id: '2-1',
          title: 'Perder 2.5kg',
          description: 'Primera meta intermedia de pérdida de peso',
          targetValue: 2.5,
          currentValue: 2.0,
          unit: 'kg',
          isCompleted: false
        }
      ],
      createdDate: '2025-01-15'
    }
  ];

  // Sample achievements
  const sampleAchievements: Achievement[] = [
    {
      id: '1',
      title: 'Primera victoria',
      description: 'Ganar tu primer combate oficial',
      category: 'competition',
      earnedDate: '2024-12-15',
      icon: 'emoji-events',
      points: 100
    },
    {
      id: '2',
      title: 'Constancia semanal',
      description: 'Entrenar 5 días seguidos',
      category: 'fitness',
      earnedDate: '2024-12-20',
      icon: 'fitness-center',
      points: 50
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [goalsData, achievementsData] = await Promise.all([
        AsyncStorage.getItem('sports-goals'),
        AsyncStorage.getItem('sports-achievements')
      ]);

      if (goalsData) {
        setGoals(JSON.parse(goalsData));
      } else {
        setGoals(sampleGoals);
        saveGoals(sampleGoals);
      }

      if (achievementsData) {
        setAchievements(JSON.parse(achievementsData));
      } else {
        setAchievements(sampleAchievements);
        saveAchievements(sampleAchievements);
      }
    } catch (error) {
      console.error('Error loading goals data:', error);
    }
  };

  const saveGoals = async (newGoals: Goal[]) => {
    try {
      await AsyncStorage.setItem('sports-goals', JSON.stringify(newGoals));
      setGoals(newGoals);
      
      if (syncStatus.isLinked) {
        updateRemoteData({ sportsGoals: newGoals });
      }
    } catch (error) {
      console.error('Error saving goals:', error);
    }
  };

  const saveAchievements = async (newAchievements: Achievement[]) => {
    try {
      await AsyncStorage.setItem('sports-achievements', JSON.stringify(newAchievements));
      setAchievements(newAchievements);
      
      if (syncStatus.isLinked) {
        updateRemoteData({ sportsAchievements: newAchievements });
      }
    } catch (error) {
      console.error('Error saving achievements:', error);
    }
  };

  const addGoal = () => {
    if (!newGoal.title || !newGoal.description) {
      Alert.alert('Error', 'Por favor completa el título y descripción');
      return;
    }

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title!,
      description: newGoal.description!,
      category: newGoal.category!,
      priority: newGoal.priority!,
      targetDate: newGoal.targetDate!,
      currentProgress: 0,
      isCompleted: false,
      milestones: [],
      createdDate: new Date().toISOString(),
      notes: newGoal.notes
    };

    const updatedGoals = [goal, ...goals];
    saveGoals(updatedGoals);
    setGoalDialogVisible(false);
    resetGoalForm();

    Alert.alert('Éxito', 'Meta creada correctamente');
  };

  const updateGoalProgress = (goalId: string, progress: number) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        const isCompleted = progress >= 100;
        return {
          ...goal,
          currentProgress: Math.min(100, Math.max(0, progress)),
          isCompleted,
          completedDate: isCompleted && !goal.completedDate ? new Date().toISOString() : goal.completedDate
        };
      }
      return goal;
    });

    saveGoals(updatedGoals);

    // Check if goal was just completed
    const goal = updatedGoals.find(g => g.id === goalId);
    if (goal?.isCompleted && !goals.find(g => g.id === goalId)?.isCompleted) {
      Alert.alert(
        '¡Meta Completada!',
        `¡Felicitaciones! Has completado: ${goal.title}`,
        [{ text: '¡Genial!', style: 'default' }]
      );
    }
  };

  const markMilestoneComplete = (goalId: string, milestoneId: string) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        const updatedMilestones = goal.milestones.map(milestone => {
          if (milestone.id === milestoneId) {
            return {
              ...milestone,
              isCompleted: !milestone.isCompleted,
              completedDate: !milestone.isCompleted ? new Date().toISOString() : undefined,
              currentValue: !milestone.isCompleted ? milestone.targetValue : milestone.currentValue
            };
          }
          return milestone;
        });

        // Update goal progress based on completed milestones
        const completedMilestones = updatedMilestones.filter(m => m.isCompleted).length;
        const totalMilestones = updatedMilestones.length;
        const newProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : goal.currentProgress;

        return {
          ...goal,
          milestones: updatedMilestones,
          currentProgress: Math.round(newProgress)
        };
      }
      return goal;
    });

    saveGoals(updatedGoals);
  };

  const resetGoalForm = () => {
    setNewGoal({
      title: '',
      description: '',
      category: 'general',
      priority: 'medium',
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      currentProgress: 0,
      milestones: []
    });
  };

  const getGoalStats = () => {
    const activeGoals = goals.filter(g => !g.isCompleted);
    const completedGoals = goals.filter(g => g.isCompleted);
    const highPriorityGoals = activeGoals.filter(g => g.priority === 'high');
    const totalAchievements = achievements.length;

    return {
      active: activeGoals.length,
      completed: completedGoals.length,
      highPriority: highPriorityGoals.length,
      achievements: totalAchievements
    };
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fitness': return 'fitness-center';
      case 'technique': return 'sports';
      case 'competition': return 'emoji-events';
      case 'weight': return 'monitor';
      default: return 'flag';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'fitness': return 'Fitness';
      case 'technique': return 'Técnica';
      case 'competition': return 'Competición';
      case 'weight': return 'Peso';
      default: return 'General';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getDaysRemaining = (targetDate: string) => {
    const target = new Date(targetDate);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderGoalCard = ({ item }: { item: Goal }) => {
    const daysRemaining = getDaysRemaining(item.targetDate);
    
    return (
      <Card style={styles.goalCard}>
        <Card.Content>
          <View style={styles.goalHeader}>
            <View style={styles.goalInfo}>
              <Text style={styles.goalTitle}>{item.title}</Text>
              <Text style={styles.goalDescription} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
            
            <View style={styles.goalMeta}>
              <Chip style={[styles.priorityChip, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
                <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                  {item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Media' : 'Baja'}
                </Text>
              </Chip>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progreso</Text>
              <Text style={styles.progressPercentage}>{item.currentProgress}%</Text>
            </View>
            <ProgressBar 
              progress={item.currentProgress / 100} 
              color="#283750" 
              style={styles.progressBar}
            />
          </View>

          <View style={styles.goalFooter}>
            <View style={styles.goalStats}>
              <MaterialIcons 
                name={getCategoryIcon(item.category) as any} 
                size={16} 
                color="#6B7280" 
              />
              <Text style={styles.categoryText}>{getCategoryLabel(item.category)}</Text>
              
              <MaterialIcons name="schedule" size={16} color="#6B7280" style={{ marginLeft: 16 }} />
              <Text style={styles.daysText}>
                {daysRemaining > 0 ? `${daysRemaining} días` : 'Vencida'}
              </Text>
            </View>

            <View style={styles.goalActions}>
              {item.milestones.length > 0 && (
                <IconButton
                  icon="list"
                  size={20}
                  onPress={() => {
                    setSelectedGoal(item);
                    setMilestoneDialogVisible(true);
                  }}
                />
              )}
              <IconButton
                icon="plus"
                size={20}
                onPress={() => {
                  const newProgress = Math.min(100, item.currentProgress + 10);
                  updateGoalProgress(item.id, newProgress);
                }}
              />
            </View>
          </View>

          {item.milestones.length > 0 && (
            <View style={styles.milestonesPreview}>
              <Text style={styles.milestonesTitle}>
                Hitos: {item.milestones.filter(m => m.isCompleted).length}/{item.milestones.length}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderAchievementCard = ({ item }: { item: Achievement }) => (
    <Card style={styles.achievementCard}>
      <Card.Content>
        <View style={styles.achievementHeader}>
          <MaterialIcons 
            name={item.icon as any} 
            size={32} 
            color="#F59E0B" 
          />
          <View style={styles.achievementInfo}>
            <Text style={styles.achievementTitle}>{item.title}</Text>
            <Text style={styles.achievementDescription}>{item.description}</Text>
            <Text style={styles.achievementDate}>
              {new Date(item.earnedDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.achievementPoints}>
            <Text style={styles.pointsText}>{item.points}pts</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderActivasView = () => {
    const activeGoals = goals.filter(g => !g.isCompleted);
    const stats = getGoalStats();

    return (
      <View>
        {/* Stats Card */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Resumen de Metas</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.active}</Text>
                <Text style={styles.statLabel}>Activas</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.completed}</Text>
                <Text style={styles.statLabel}>Completadas</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.highPriority}</Text>
                <Text style={styles.statLabel}>Alta Prioridad</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.achievements}</Text>
                <Text style={styles.statLabel}>Logros</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Goals List */}
        <FlatList
          data={activeGoals}
          renderItem={renderGoalCard}
          keyExtractor={(item) => item.id}
          style={styles.goalsList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  const renderCompletadasView = () => {
    const completedGoals = goals.filter(g => g.isCompleted);

    return (
      <View>
        {completedGoals.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>No hay metas completadas</Text>
              <Text style={styles.emptySubtext}>Completa tus primeras metas para verlas aquí</Text>
            </Card.Content>
          </Card>
        ) : (
          <FlatList
            data={completedGoals}
            renderItem={renderGoalCard}
            keyExtractor={(item) => item.id}
            style={styles.goalsList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    );
  };

  const renderLogrosView = () => (
    <View>
      <FlatList
        data={achievements}
        renderItem={renderAchievementCard}
        keyExtractor={(item) => item.id}
        style={styles.achievementsList}
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
            { value: 'activas', label: 'Activas' },
            { value: 'completadas', label: 'Completadas' },
            { value: 'logros', label: 'Logros' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <ScrollView style={styles.scrollContainer}>
        {activeTab === 'activas' && renderActivasView()}
        {activeTab === 'completadas' && renderCompletadasView()}
        {activeTab === 'logros' && renderLogrosView()}
      </ScrollView>

      {/* Goal Dialog */}
      <Portal>
        <Dialog visible={goalDialogVisible} onDismiss={() => setGoalDialogVisible(false)}>
          <Dialog.Title>Nueva Meta</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Título"
              value={newGoal.title || ''}
              onChangeText={(text) => setNewGoal({...newGoal, title: text})}
              style={styles.input}
            />
            <TextInput
              label="Descripción"
              value={newGoal.description || ''}
              onChangeText={(text) => setNewGoal({...newGoal, description: text})}
              multiline
              style={styles.input}
            />
            <TextInput
              label="Fecha objetivo (YYYY-MM-DD)"
              value={newGoal.targetDate || ''}
              onChangeText={(text) => setNewGoal({...newGoal, targetDate: text})}
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setGoalDialogVisible(false)}>Cancelar</Button>
            <Button mode="contained" onPress={addGoal}>Crear</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Milestone Dialog */}
      <Portal>
        <Dialog visible={milestoneDialogVisible} onDismiss={() => setMilestoneDialogVisible(false)}>
          <Dialog.Title>
            Hitos - {selectedGoal?.title}
          </Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogContent}>
            <ScrollView>
              {selectedGoal?.milestones.map((milestone) => (
                <View key={milestone.id} style={styles.milestoneItem}>
                  <View style={styles.milestoneHeader}>
                    <IconButton
                      icon={milestone.isCompleted ? "check-circle" : "circle-outline"}
                      iconColor={milestone.isCompleted ? "#10B981" : "#9CA3AF"}
                      onPress={() => markMilestoneComplete(selectedGoal.id, milestone.id)}
                    />
                    <View style={styles.milestoneInfo}>
                      <Text style={[
                        styles.milestoneTitle,
                        milestone.isCompleted && styles.milestoneCompleted
                      ]}>
                        {milestone.title}
                      </Text>
                      <Text style={styles.milestoneDescription}>
                        {milestone.description}
                      </Text>
                      {milestone.targetValue && (
                        <Text style={styles.milestoneProgress}>
                          {milestone.currentValue || 0}/{milestone.targetValue} {milestone.unit}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setMilestoneDialogVisible(false)}>Cerrar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setGoalDialogVisible(true)}
        label="Meta"
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
  goalsList: {
    flex: 1,
  },
  achievementsList: {
    flex: 1,
  },
  goalCard: {
    margin: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#283750',
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  goalMeta: {
    marginLeft: 12,
  },
  priorityChip: {
    marginLeft: 8,
  },
  priorityText: {
    fontWeight: 'bold',
    fontSize: 11,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#374151',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#283750',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  daysText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  goalActions: {
    flexDirection: 'row',
  },
  milestonesPreview: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  milestonesTitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  achievementCard: {
    margin: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementInfo: {
    flex: 1,
    marginLeft: 12,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#283750',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  achievementDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  achievementPoints: {
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F59E0B',
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
  milestoneItem: {
    marginBottom: 16,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  milestoneInfo: {
    flex: 1,
    marginLeft: 8,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#283750',
    marginBottom: 4,
  },
  milestoneCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  milestoneDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  milestoneProgress: {
    fontSize: 12,
    color: '#374151',
    fontWeight: 'bold',
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

export default MetasObjetivosScreen;