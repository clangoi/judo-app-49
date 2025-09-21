import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, FlatList } from 'react-native';
import { Card, Button, TextInput, Dialog, Portal, SegmentedButtons, Chip, IconButton, FAB, Searchbar } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useCrudStorage } from '../hooks/useCrudStorage';
import EntryList from '../components/EntryList';
import EntryFormModal from '../components/EntryFormModal';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog';

interface Technique {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  category: 'throws' | 'grappling' | 'strikes' | 'submissions' | 'escapes' | 'combinations';
  sport: 'judo' | 'karate' | 'boxing' | 'bjj' | 'mma' | 'general';
  difficulty: 1 | 2 | 3 | 4 | 5;
  description: string;
  steps: string[];
  tips: string[];
  videoUrl?: string;
  isFavorite: boolean;
  timesLearned: number;
  lastPracticed?: string;
  mastery: 1 | 2 | 3 | 4 | 5; // 1 = Principiante, 5 = Maestro
  isDefault?: boolean; // Para técnicas predefinidas que no se pueden eliminar
}

const TecnicasDeportivasScreen = () => {
  const { items: techniques, isLoading, create, update, remove } = useCrudStorage<Technique>({
    storageKey: 'expo:training:techniques.library',
    remotePayloadKey: 'martialTechniques'
  });
  
  const [filteredTechniques, setFilteredTechniques] = useState<Technique[]>([]);
  const [activeTab, setActiveTab] = useState('explorar');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSport, setSelectedSport] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [techniqueDetailVisible, setTechniqueDetailVisible] = useState(false);
  const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(null);
  const [newTechniqueVisible, setNewTechniqueVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [techniqueToDelete, setTechniqueToDelete] = useState<Technique | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formTechnique, setFormTechnique] = useState<Partial<Technique>>({
    name: '',
    category: 'throws',
    sport: 'judo',
    difficulty: 1,
    description: '',
    steps: [''],
    tips: [''],
    isFavorite: false,
    timesLearned: 0,
    mastery: 1
  });

  // Categories and sports
  const categories = [
    { value: 'all', label: 'Todas' },
    { value: 'throws', label: 'Proyecciones' },
    { value: 'grappling', label: 'Agarre' },
    { value: 'strikes', label: 'Golpes' },
    { value: 'submissions', label: 'Finalizaciones' },
    { value: 'escapes', label: 'Escapes' },
    { value: 'combinations', label: 'Combinaciones' }
  ];

  const sports = [
    { value: 'all', label: 'Todos' },
    { value: 'judo', label: 'Judo' },
    { value: 'karate', label: 'Karate' },
    { value: 'boxing', label: 'Boxeo' },
    { value: 'bjj', label: 'BJJ' },
    { value: 'mma', label: 'MMA' }
  ];

  // Initialize with sample techniques if empty
  const initializeSampleTechniques = async () => {
    if (techniques.length === 0 && !isLoading) {
      const sampleTechniques: Omit<Technique, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          name: 'Seoi Nage (Carga de hombros)',
          category: 'throws',
          sport: 'judo',
          difficulty: 3,
          description: 'Técnica clásica de proyección donde se carga al oponente sobre el hombro',
          steps: [
            'Agarra la solapa y manga del oponente',
            'Da un paso hacia adelante con el pie derecho',
            'Gira el cuerpo metiendo el hombro bajo el brazo del oponente',
            'Flexiona las rodillas y levanta al oponente sobre tu espalda',
            'Proyecta hacia adelante con un movimiento explosivo'
          ],
          tips: [
            'Mantén el contacto cercano durante toda la técnica',
            'El timing es crucial - aprovecha cuando el oponente se inclina hacia adelante',
            'Practica la entrada sin proyección primero'
          ],
          isFavorite: true,
          timesLearned: 25,
          lastPracticed: new Date().toISOString(),
          mastery: 4,
          isDefault: true
        },
        {
          name: 'Jab Cross',
          category: 'strikes',
          sport: 'boxing',
          difficulty: 2,
          description: 'Combinación básica de golpes directos en boxeo',
          steps: [
            'Posición de guardia básica',
            'Lanza jab directo con la mano adelantada',
            'Inmediatamente sigue con cross de la mano trasera',
            'Rota la cadera en el cross para más potencia',
            'Regresa a guardia'
          ],
          tips: [
            'Mantén el mentón protegido',
            'No telegrafíes los golpes',
            'Practica en el saco primero'
          ],
          isFavorite: false,
          timesLearned: 15,
          mastery: 3,
          isDefault: true
        },
        {
          name: 'Armbar desde guardia',
          category: 'submissions',
          sport: 'bjj',
          difficulty: 4,
          description: 'Finalización básica de Brazilian Jiu-Jitsu desde la guardia cerrada',
          steps: [
            'Desde guardia cerrada, controla el brazo del oponente',
            'Abre la guardia y coloca el pie en la cadera',
            'Pivota la cadera hacia el brazo objetivo',
            'Pasa la pierna sobre la cabeza del oponente',
            'Controla la muñeca y extiende la cadera para finalizar'
          ],
          tips: [
            'Control del brazo es fundamental',
            'Mantén las rodillas juntas',
            'Practica lentamente primero'
          ],
          isFavorite: true,
          timesLearned: 8,
          mastery: 2,
          isDefault: true
        }
      ];

      // Create sample techniques
      for (const technique of sampleTechniques) {
        await create(technique);
      }
    }
  };

  useEffect(() => {
    initializeSampleTechniques();
  }, [techniques.length, isLoading]);

  useEffect(() => {
    filterTechniques();
  }, [techniques, selectedCategory, selectedSport, searchQuery]);

  const filterTechniques = () => {
    let filtered = techniques;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    if (selectedSport !== 'all') {
      filtered = filtered.filter(t => t.sport === selectedSport);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query)
      );
    }

    setFilteredTechniques(filtered);
  };

  const practiceStrokeInTechnique = async (techniqueId: string) => {
    const technique = techniques.find(t => t.id === techniqueId);
    if (!technique) return;

    const updatedData = {
      timesLearned: technique.timesLearned + 1,
      lastPracticed: new Date().toISOString(),
      mastery: Math.min(5, technique.mastery + (Math.random() > 0.7 ? 1 : 0)) as 1 | 2 | 3 | 4 | 5
    };

    await update(techniqueId, updatedData);
    
    Alert.alert(
      '¡Técnica Practicada!',
      'Has registrado una práctica de esta técnica.',
      [{ text: 'Continuar', style: 'default' }]
    );
  };

  const toggleFavorite = async (techniqueId: string) => {
    const technique = techniques.find(t => t.id === techniqueId);
    if (!technique) return;

    await update(techniqueId, { isFavorite: !technique.isFavorite });
  };

  const createTechnique = () => {
    setFormTechnique({
      name: '',
      category: 'throws',
      sport: 'judo',
      difficulty: 1,
      description: '',
      steps: [''],
      tips: [''],
      isFavorite: false,
      timesLearned: 0,
      mastery: 1
    });
    setEditMode(false);
    setNewTechniqueVisible(true);
  };

  const editTechnique = (technique: Technique) => {
    setFormTechnique(technique);
    setEditMode(true);
    setNewTechniqueVisible(true);
  };

  const deleteTechnique = (technique: Technique) => {
    if (technique.isDefault) {
      Alert.alert('No se puede eliminar', 'Las técnicas predefinidas no se pueden eliminar.');
      return;
    }
    setTechniqueToDelete(technique);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    if (techniqueToDelete) {
      await remove(techniqueToDelete.id);
      setTechniqueToDelete(null);
    }
  };

  const saveTechnique = async () => {
    if (!formTechnique.name || !formTechnique.description) {
      Alert.alert('Error', 'El nombre y descripción son obligatorios.');
      return;
    }

    try {
      const techniqueData = {
        ...formTechnique,
        steps: formTechnique.steps?.filter(step => step.trim() !== '') || [],
        tips: formTechnique.tips?.filter(tip => tip.trim() !== '') || []
      };

      if (editMode && selectedTechnique?.id) {
        await update(selectedTechnique.id, techniqueData);
        Alert.alert('¡Técnica Actualizada!', 'Los cambios han sido guardados exitosamente.');
      } else {
        await create(techniqueData);
        Alert.alert('¡Técnica Creada!', 'La nueva técnica ha sido agregada a tu biblioteca.');
      }

      setNewTechniqueVisible(false);
      setFormTechnique({
        name: '',
        category: 'throws',
        sport: 'judo',
        difficulty: 1,
        description: '',
        steps: [''],
        tips: [''],
        isFavorite: false,
        timesLearned: 0,
        mastery: 1
      });
      setEditMode(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la técnica. Inténtalo de nuevo.');
    }
  };

  const getMasteryLabel = (mastery: number) => {
    const labels = ['', 'Principiante', 'Básico', 'Intermedio', 'Avanzado', 'Maestro'];
    return labels[mastery];
  };

  const getMasteryColor = (mastery: number) => {
    const colors = ['', '#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6'];
    return colors[mastery];
  };

  const getTechniqueStats = () => {
    const favorites = techniques.filter(t => t.isFavorite).length;
    const mastered = techniques.filter(t => t.mastery >= 4).length;
    const practiced = techniques.filter(t => t.timesLearned > 0).length;
    
    return { favorites, mastered, practiced, total: techniques.length };
  };

  const renderTechniqueCard = ({ item }: { item: Technique }) => (
    <Card style={styles.techniqueCard} onPress={() => {
      setSelectedTechnique(item);
      setTechniqueDetailVisible(true);
    }}>
      <Card.Content>
        <View style={styles.techniqueHeader}>
          <View style={styles.techniqueInfo}>
            <Text style={styles.techniqueName}>{item.name}</Text>
            <Text style={styles.techniqueCategory}>
              {categories.find(c => c.value === item.category)?.label} • {sports.find(s => s.value === item.sport)?.label}
            </Text>
          </View>
          <IconButton
            icon={item.isFavorite ? "heart" : "heart-outline"}
            iconColor={item.isFavorite ? "#EF4444" : "#9CA3AF"}
            onPress={() => toggleFavorite(item.id)}
          />
        </View>

        <View style={styles.techniqueStats}>
          <Chip style={[styles.masteryChip, { backgroundColor: getMasteryColor(item.mastery) + '20' }]}>
            <Text style={[styles.masteryText, { color: getMasteryColor(item.mastery) }]}>
              {getMasteryLabel(item.mastery)}
            </Text>
          </Chip>
          <Chip style={styles.difficultyChip}>
            <Text>Dificultad {item.difficulty}/5</Text>
          </Chip>
          <Chip style={styles.practiceChip}>
            <Text>{item.timesLearned} prácticas</Text>
          </Chip>
        </View>

        <Text style={styles.techniqueDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <Button
          mode="outlined"
          style={styles.practiceButton}
          onPress={() => practiceStrokeInTechnique(item.id)}
          icon={({ size, color }) => (
            <MaterialIcons name="fitness-center" size={size} color={color} />
          )}
        >
          Practicar
        </Button>
      </Card.Content>
    </Card>
  );

  const renderExploreView = () => {
    const stats = getTechniqueStats();

    return (
      <View>
        {/* Stats Card */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Tu Progreso</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.practiced}</Text>
                <Text style={styles.statLabel}>Practicadas</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.mastered}</Text>
                <Text style={styles.statLabel}>Dominadas</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.favorites}</Text>
                <Text style={styles.statLabel}>Favoritas</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Search */}
        <Searchbar
          placeholder="Buscar técnicas..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {categories.map((category) => (
                <Chip
                  key={category.value}
                  selected={selectedCategory === category.value}
                  onPress={() => setSelectedCategory(category.value)}
                  style={styles.filterChip}
                >
                  {category.label}
                </Chip>
              ))}
            </View>
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {sports.map((sport) => (
                <Chip
                  key={sport.value}
                  selected={selectedSport === sport.value}
                  onPress={() => setSelectedSport(sport.value)}
                  style={styles.filterChip}
                >
                  {sport.label}
                </Chip>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Techniques List */}
        <View style={styles.techniquesContainer}>
          <FlatList
            data={filteredTechniques}
            renderItem={renderTechniqueCard}
            keyExtractor={(item) => item.id}
            style={styles.techniquesList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    );
  };

  const renderFavoritesView = () => {
    const favorites = techniques.filter(t => t.isFavorite);
    const listItems = favorites.map(technique => ({
      id: technique.id,
      title: technique.name,
      subtitle: `${categories.find(c => c.value === technique.category)?.label} • ${sports.find(s => s.value === technique.sport)?.label}`,
      description: `${technique.description} • Dificultad ${technique.difficulty}/5 • ${getMasteryLabel(technique.mastery)} • ${technique.timesLearned} prácticas`,
      leftIcon: technique.category === 'throws' ? 'sports-martial-arts' : technique.category === 'strikes' ? 'sports-handball' : 'fitness-center',
      rightText: `${technique.mastery}/5`
    }));

    return (
      <EntryList
        items={listItems}
        onItemPress={(item) => {
          const technique = techniques.find(t => t.id === item.id);
          if (technique) {
            setSelectedTechnique(technique);
            setTechniqueDetailVisible(true);
          }
        }}
        onEdit={(item) => {
          const technique = techniques.find(t => t.id === item.id);
          if (technique) editTechnique(technique);
        }}
        onDelete={(item) => {
          const technique = techniques.find(t => t.id === item.id);
          if (technique) deleteTechnique(technique);
        }}
        emptyStateText="No tienes técnicas favoritas"
        emptyStateSubtext="Marca técnicas como favoritas para acceso rápido"
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
            { value: 'explorar', label: 'Explorar' },
            { value: 'favoritas', label: 'Favoritas' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <ScrollView style={styles.scrollContainer}>
        {activeTab === 'explorar' && renderExploreView()}
        {activeTab === 'favoritas' && renderFavoritesView()}
      </ScrollView>

      {/* Technique Detail Dialog */}
      <Portal>
        <Dialog 
          visible={techniqueDetailVisible} 
          onDismiss={() => setTechniqueDetailVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title>{selectedTechnique?.name}</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogContent}>
            <ScrollView>
              {selectedTechnique && (
                <View>
                  <Text style={styles.dialogDescription}>
                    {selectedTechnique.description}
                  </Text>

                  <View style={styles.dialogStats}>
                    <Chip style={[styles.masteryChip, { backgroundColor: getMasteryColor(selectedTechnique.mastery) + '20' }]}>
                      <Text style={[styles.masteryText, { color: getMasteryColor(selectedTechnique.mastery) }]}>
                        {getMasteryLabel(selectedTechnique.mastery)}
                      </Text>
                    </Chip>
                    <Chip style={styles.difficultyChip}>
                      <Text>Dificultad {selectedTechnique.difficulty}/5</Text>
                    </Chip>
                  </View>

                  <Text style={styles.sectionSubtitle}>Pasos:</Text>
                  {selectedTechnique.steps.map((step, index) => (
                    <Text key={index} style={styles.stepText}>
                      {index + 1}. {step}
                    </Text>
                  ))}

                  <Text style={styles.sectionSubtitle}>Consejos:</Text>
                  {selectedTechnique.tips.map((tip, index) => (
                    <Text key={index} style={styles.tipText}>
                      • {tip}
                    </Text>
                  ))}

                  <View style={styles.practiceInfo}>
                    <Text style={styles.practiceInfoText}>
                      Practicada {selectedTechnique.timesLearned} veces
                    </Text>
                    {selectedTechnique.lastPracticed && (
                      <Text style={styles.lastPracticedText}>
                        Última práctica: {new Date(selectedTechnique.lastPracticed).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setTechniqueDetailVisible(false)}>Cerrar</Button>
            <Button 
              mode="contained" 
              onPress={() => {
                if (selectedTechnique) {
                  practiceStrokeInTechnique(selectedTechnique.id);
                  setTechniqueDetailVisible(false);
                }
              }}
            >
              Practicar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Technique Form Modal */}
      <EntryFormModal
        visible={newTechniqueVisible}
        onDismiss={() => {
          setNewTechniqueVisible(false);
          setFormTechnique({
            name: '',
            category: 'throws',
            sport: 'judo',
            difficulty: 1,
            description: '',
            steps: [''],
            tips: [''],
            isFavorite: false,
            timesLearned: 0,
            mastery: 1
          });
          setEditMode(false);
        }}
        onSubmit={saveTechnique}
        title={editMode ? 'Editar Técnica' : 'Nueva Técnica'}
        submitText={editMode ? 'Actualizar' : 'Crear'}
        submitDisabled={!formTechnique.name || !formTechnique.description}
      >
        <ScrollView style={styles.formScrollView}>
          <View style={styles.formFields}>
            <TextInput
              mode="outlined"
              label="Nombre de la técnica *"
              value={formTechnique.name || ''}
              onChangeText={(text) => setFormTechnique(prev => ({ ...prev, name: text }))}
              style={styles.formInput}
            />
            
            <TextInput
              mode="outlined"
              label="Descripción *"
              value={formTechnique.description || ''}
              onChangeText={(text) => setFormTechnique(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={3}
              style={styles.formInput}
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.fieldLabel}>Categoría</Text>
                <ScrollView horizontal style={styles.chipContainer}>
                  {categories.slice(1).map((category) => (
                    <Chip
                      key={category.value}
                      selected={formTechnique.category === category.value}
                      onPress={() => setFormTechnique(prev => ({ ...prev, category: category.value as any }))}
                      style={styles.selectionChip}
                    >
                      {category.label}
                    </Chip>
                  ))}
                </ScrollView>
              </View>
              
              <View style={styles.halfWidth}>
                <Text style={styles.fieldLabel}>Deporte</Text>
                <ScrollView horizontal style={styles.chipContainer}>
                  {sports.slice(1).map((sport) => (
                    <Chip
                      key={sport.value}
                      selected={formTechnique.sport === sport.value}
                      onPress={() => setFormTechnique(prev => ({ ...prev, sport: sport.value as any }))}
                      style={styles.selectionChip}
                    >
                      {sport.label}
                    </Chip>
                  ))}
                </ScrollView>
              </View>
            </View>

            <Text style={styles.fieldLabel}>Dificultad: {formTechnique.difficulty}/5</Text>
            <View style={styles.difficultyContainer}>
              {[1, 2, 3, 4, 5].map((level) => (
                <Chip
                  key={level}
                  selected={formTechnique.difficulty === level}
                  onPress={() => setFormTechnique(prev => ({ ...prev, difficulty: level as any }))}
                  style={styles.difficultyChip}
                >
                  {level}
                </Chip>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Pasos</Text>
            {formTechnique.steps?.map((step, index) => (
              <View key={index} style={styles.stepInputContainer}>
                <TextInput
                  mode="outlined"
                  label={`Paso ${index + 1}`}
                  value={step}
                  onChangeText={(text) => {
                    const newSteps = [...(formTechnique.steps || [])];
                    newSteps[index] = text;
                    setFormTechnique(prev => ({ ...prev, steps: newSteps }));
                  }}
                  style={styles.stepInput}
                />
                {formTechnique.steps && formTechnique.steps.length > 1 && (
                  <IconButton
                    icon="delete"
                    onPress={() => {
                      const newSteps = formTechnique.steps?.filter((_, i) => i !== index);
                      setFormTechnique(prev => ({ ...prev, steps: newSteps }));
                    }}
                  />
                )}
              </View>
            ))}
            <Button
              mode="outlined"
              onPress={() => {
                const newSteps = [...(formTechnique.steps || []), ''];
                setFormTechnique(prev => ({ ...prev, steps: newSteps }));
              }}
              style={styles.addButton}
            >
              Agregar Paso
            </Button>

            <Text style={styles.fieldLabel}>Consejos</Text>
            {formTechnique.tips?.map((tip, index) => (
              <View key={index} style={styles.stepInputContainer}>
                <TextInput
                  mode="outlined"
                  label={`Consejo ${index + 1}`}
                  value={tip}
                  onChangeText={(text) => {
                    const newTips = [...(formTechnique.tips || [])];
                    newTips[index] = text;
                    setFormTechnique(prev => ({ ...prev, tips: newTips }));
                  }}
                  style={styles.stepInput}
                />
                {formTechnique.tips && formTechnique.tips.length > 1 && (
                  <IconButton
                    icon="delete"
                    onPress={() => {
                      const newTips = formTechnique.tips?.filter((_, i) => i !== index);
                      setFormTechnique(prev => ({ ...prev, tips: newTips }));
                    }}
                  />
                )}
              </View>
            ))}
            <Button
              mode="outlined"
              onPress={() => {
                const newTips = [...(formTechnique.tips || []), ''];
                setFormTechnique(prev => ({ ...prev, tips: newTips }));
              }}
              style={styles.addButton}
            >
              Agregar Consejo
            </Button>
          </View>
        </ScrollView>
      </EntryFormModal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        visible={deleteDialogVisible}
        onDismiss={() => setDeleteDialogVisible(false)}
        onConfirm={confirmDelete}
        title="Eliminar Técnica"
        message={`¿Estás seguro de que quieres eliminar la técnica "${techniqueToDelete?.name}"? Esta acción no se puede deshacer.`}
      />

      {/* FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={createTechnique}
        label="Técnica"
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
  searchbar: {
    margin: 8,
    elevation: 2,
  },
  filtersContainer: {
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  filterChip: {
    marginRight: 4,
  },
  techniquesList: {
    flex: 1,
  },
  techniqueCard: {
    margin: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  techniqueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  techniqueInfo: {
    flex: 1,
  },
  techniqueName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#283750',
    marginBottom: 4,
  },
  techniqueCategory: {
    fontSize: 12,
    color: '#6B7280',
  },
  techniqueStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  masteryChip: {
    marginRight: 4,
  },
  masteryText: {
    fontWeight: 'bold',
    fontSize: 11,
  },
  difficultyChip: {
    backgroundColor: '#F3F4F6',
  },
  practiceChip: {
    backgroundColor: '#DBEAFE',
  },
  techniqueDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  practiceButton: {
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
  dialog: {
    maxHeight: '80%',
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
  dialogStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  stepText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
    paddingLeft: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 6,
    paddingLeft: 8,
  },
  practiceInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  practiceInfoText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: 'bold',
  },
  lastPracticedText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#283750',
  },
  techniquesContainer: {
    flex: 1,
    minHeight: 300,
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
    maxHeight: 40,
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

export default TecnicasDeportivasScreen;