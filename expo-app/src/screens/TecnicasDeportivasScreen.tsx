import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, FlatList } from 'react-native';
import { Card, Button, TextInput, Dialog, Portal, SegmentedButtons, Chip, IconButton, FAB, Searchbar } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncManager } from '../hooks/useSyncManager';

interface Technique {
  id: string;
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
}

const TecnicasDeportivasScreen = () => {
  const [techniques, setTechniques] = useState<Technique[]>([]);
  const [filteredTechniques, setFilteredTechniques] = useState<Technique[]>([]);
  const [activeTab, setActiveTab] = useState('explorar');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSport, setSelectedSport] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [techniqueDetailVisible, setTechniqueDetailVisible] = useState(false);
  const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(null);
  const { syncStatus, updateRemoteData } = useSyncManager();

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

  // Sample techniques data
  const sampleTechniques: Technique[] = [
    {
      id: '1',
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
      mastery: 4
    },
    {
      id: '2',
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
      mastery: 3
    },
    {
      id: '3',
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
      mastery: 2
    },
    {
      id: '4',
      name: 'Mae Geri (Patada frontal)',
      category: 'strikes',
      sport: 'karate',
      difficulty: 2,
      description: 'Patada frontal básica en karate',
      steps: [
        'Posición natural de pie',
        'Levanta la rodilla hacia el pecho',
        'Extiende la pierna hacia adelante',
        'Impacta con la bola del pie',
        'Retrae rápidamente la pierna'
      ],
      tips: [
        'Mantén el equilibrio en la pierna de apoyo',
        'El movimiento debe ser explosivo',
        'Practica la flexibilidad de cadera'
      ],
      isFavorite: false,
      timesLearned: 20,
      mastery: 3
    }
  ];

  useEffect(() => {
    loadTechniques();
  }, []);

  useEffect(() => {
    filterTechniques();
  }, [techniques, selectedCategory, selectedSport, searchQuery]);

  const loadTechniques = async () => {
    try {
      const stored = await AsyncStorage.getItem('martial-techniques');
      if (stored) {
        setTechniques(JSON.parse(stored));
      } else {
        // Initialize with sample data
        setTechniques(sampleTechniques);
        saveTechniques(sampleTechniques);
      }
    } catch (error) {
      console.error('Error loading techniques:', error);
      setTechniques(sampleTechniques);
    }
  };

  const saveTechniques = async (newTechniques: Technique[]) => {
    try {
      await AsyncStorage.setItem('martial-techniques', JSON.stringify(newTechniques));
      setTechniques(newTechniques);
      
      if (syncStatus.isLinked) {
        updateRemoteData({ martialTechniques: newTechniques });
      }
    } catch (error) {
      console.error('Error saving techniques:', error);
    }
  };

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
    const updatedTechniques = techniques.map(t => {
      if (t.id === techniqueId) {
        return {
          ...t,
          timesLearned: t.timesLearned + 1,
          lastPracticed: new Date().toISOString(),
          mastery: Math.min(5, t.mastery + (Math.random() > 0.7 ? 1 : 0)) as 1 | 2 | 3 | 4 | 5
        };
      }
      return t;
    });

    saveTechniques(updatedTechniques);
    
    Alert.alert(
      '¡Técnica Practicada!',
      'Has registrado una práctica de esta técnica.',
      [{ text: 'Continuar', style: 'default' }]
    );
  };

  const toggleFavorite = (techniqueId: string) => {
    const updatedTechniques = techniques.map(t => 
      t.id === techniqueId ? { ...t, isFavorite: !t.isFavorite } : t
    );
    saveTechniques(updatedTechniques);
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
        <FlatList
          data={filteredTechniques}
          renderItem={renderTechniqueCard}
          keyExtractor={(item) => item.id}
          style={styles.techniquesList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  const renderFavoritesView = () => {
    const favorites = techniques.filter(t => t.isFavorite);

    return (
      <View>
        {favorites.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>No tienes técnicas favoritas</Text>
              <Text style={styles.emptySubtext}>Marca técnicas como favoritas para acceso rápido</Text>
            </Card.Content>
          </Card>
        ) : (
          <FlatList
            data={favorites}
            renderItem={renderTechniqueCard}
            keyExtractor={(item) => item.id}
            style={styles.techniquesList}
            showsVerticalScrollIndicator={false}
          />
        )}
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

      {/* FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          Alert.alert(
            "Agregar Técnica",
            "Esta funcionalidad estará disponible pronto para agregar técnicas personalizadas.",
            [{ text: 'Entendido', style: 'default' }]
          );
        }}
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
});

export default TecnicasDeportivasScreen;