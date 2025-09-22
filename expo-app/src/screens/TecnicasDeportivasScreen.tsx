import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, FlatList } from 'react-native';
import { Card, Button, TextInput, Dialog, Portal, SegmentedButtons, Chip, IconButton, FAB, Searchbar } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useCrudStorage } from '../hooks/useCrudStorage';
import { transformLegacyTechnique } from '../utils/legacyTransformations';
import EntryList from '../components/EntryList';
import EntryFormModal from '../components/EntryFormModal';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog';

interface Technique {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string;
  category?: 'nage-waza' | 'katame-waza' | 'atemi-waza' | 'kata' | 'ukemi' | 'randori' | 'otros';
  grade?: 'blanco' | 'amarillo' | 'naranja' | 'verde' | 'azul' | 'marron' | 'negro-1dan' | 'negro-2dan' | 'negro-3dan+';
  keyPoints?: string[]; // Puntos clave
  commonErrors?: string[]; // Errores comunes
  videoUrl?: string; // Video de YouTube
  videoFile?: string; // Video local
  isFavorite: boolean;
  timesLearned: number;
  lastPracticed?: string;
  mastery: 1 | 2 | 3 | 4 | 5; // 1 = Principiante, 5 = Maestro
  isDefault?: boolean; // Para técnicas predefinidas que no se pueden eliminar
}

const TecnicasDeportivasScreen = () => {
  const { items: techniques, isLoading, create, update, remove } = useCrudStorage<Technique>({
    storageKey: 'expo:tecnicas:techniques',
    remotePayloadKey: 'martialTechniques',
    transformLegacyItem: transformLegacyTechnique
  });
  
  const [filteredTechniques, setFilteredTechniques] = useState<Technique[]>([]);
  const [activeTab, setActiveTab] = useState('explorar');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [techniqueDetailVisible, setTechniqueDetailVisible] = useState(false);
  const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(null);
  const [newTechniqueVisible, setNewTechniqueVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [techniqueToDelete, setTechniqueToDelete] = useState<Technique | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formTechnique, setFormTechnique] = useState<Partial<Technique>>({
    name: '',
    description: '',
    category: undefined,
    grade: undefined,
    keyPoints: [''],
    commonErrors: [''],
    videoUrl: '',
    videoFile: '',
    isFavorite: false,
    timesLearned: 0,
    mastery: 1
  });

  // Categories specific to Judo
  const categories = [
    { value: 'all', label: 'Todas' },
    { value: 'nage-waza', label: 'Nage-waza (Técnicas de Proyección)' },
    { value: 'katame-waza', label: 'Katame-waza (Técnicas de Control)' },
    { value: 'atemi-waza', label: 'Atemi-waza (Golpes — solo en kata)' },
    { value: 'kata', label: 'Kata (Formas preestablecidas)' },
    { value: 'ukemi', label: 'Ukemi (Caídas)' },
    { value: 'randori', label: 'Randori (Entrenamiento libre)' },
    { value: 'otros', label: 'Otros' }
  ];

  // Belt grades for Judo
  const grades = [
    { value: '', label: 'Seleccionar grado...' },
    { value: 'blanco', label: 'Blanco' },
    { value: 'amarillo', label: 'Amarillo' },
    { value: 'naranja', label: 'Naranja' },
    { value: 'verde', label: 'Verde' },
    { value: 'azul', label: 'Azul' },
    { value: 'marron', label: 'Marrón' },
    { value: 'negro-1dan', label: 'Negro (1er Dan)' },
    { value: 'negro-2dan', label: 'Negro (2do Dan)' },
    { value: 'negro-3dan+', label: 'Negro (3er Dan+)' }
  ];

  // Initialize with sample Judo techniques if empty
  const initializeSampleTechniques = async () => {
    if (techniques.length === 0 && !isLoading) {
      const sampleTechniques: Omit<Technique, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          name: 'O-soto-gari',
          description: 'Técnica fundamental de proyección que utiliza la pierna para barrer al oponente hacia atrás',
          category: 'nage-waza',
          grade: 'amarillo',
          keyPoints: [
            'Agarre firme en solapa y manga',
            'Paso profundo con pie exterior',
            'Contacto de la pierna con la pierna del oponente',
            'Acción de barrido hacia arriba y atrás',
            'Proyección con control del cuerpo'
          ],
          commonErrors: [
            'No dar paso suficientemente profundo',
            'Barrer demasiado bajo en la pierna del oponente',
            'Perder el equilibrio durante la ejecución',
            'No mantener el agarre firme'
          ],
          isFavorite: true,
          timesLearned: 25,
          lastPracticed: new Date().toISOString(),
          mastery: 4,
          isDefault: true
        },
        {
          name: 'Seoi-nage',
          description: 'Técnica de proyección por encima del hombro, una de las más emblemáticas del Judo',
          category: 'nage-waza',
          grade: 'naranja',
          keyPoints: [
            'Entrada rápida y baja',
            'Colocación correcta del hombro bajo el brazo del oponente',
            'Flexión de rodillas para cargar al oponente',
            'Extensión explosiva de piernas',
            'Proyección hacia adelante manteniendo el control'
          ],
          commonErrors: [
            'Entrada demasiado alta',
            'No flexionar suficiente las rodillas',
            'Perder el agarre durante la proyección',
            'No sincronizar brazos y piernas'
          ],
          isFavorite: false,
          timesLearned: 15,
          mastery: 3,
          isDefault: true
        },
        {
          name: 'Kesa-gatame',
          description: 'Inmovilización lateral fundamental donde se controla al oponente desde el costado',
          category: 'katame-waza',
          grade: 'verde',
          keyPoints: [
            'Posición lateral al oponente',
            'Control de cabeza y brazo',
            'Peso distribuido sobre el oponente',
            'Piernas abiertas para estabilidad',
            'Pegado al cuerpo del oponente'
          ],
          commonErrors: [
            'Dejar espacio entre los cuerpos',
            'No controlar bien la cabeza',
            'Piernas demasiado juntas',
            'Levantarse demasiado del oponente'
          ],
          isFavorite: true,
          timesLearned: 20,
          mastery: 4,
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
  }, [techniques, selectedCategory, selectedGrade, searchQuery]);

  const filterTechniques = () => {
    let filtered = techniques;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    if (selectedGrade !== 'all') {
      filtered = filtered.filter(t => t.grade === selectedGrade);
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
      description: '',
      category: undefined,
      grade: undefined,
      keyPoints: [''],
      commonErrors: [''],
      videoUrl: '',
      videoFile: '',
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
        name: formTechnique.name!,
        description: formTechnique.description!,
        category: formTechnique.category,
        grade: formTechnique.grade,
        keyPoints: formTechnique.keyPoints?.filter(point => point.trim() !== '') || [],
        commonErrors: formTechnique.commonErrors?.filter(error => error.trim() !== '') || [],
        videoUrl: formTechnique.videoUrl,
        videoFile: formTechnique.videoFile,
        isFavorite: formTechnique.isFavorite || false,
        timesLearned: formTechnique.timesLearned || 0,
        mastery: formTechnique.mastery || 1
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
        description: '',
        category: undefined,
        grade: undefined,
        keyPoints: [''],
        commonErrors: [''],
        videoUrl: '',
        videoFile: '',
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
              {categories.find(c => c.value === item.category)?.label || 'Sin categoría'}
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
              {[{ value: 'all', label: 'Todos los grados' }, ...grades.slice(1)].map((grade) => (
                <Chip
                  key={grade.value}
                  selected={selectedGrade === grade.value}
                  onPress={() => setSelectedGrade(grade.value)}
                  style={styles.filterChip}
                >
                  {grade.label}
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
      subtitle: `${categories.find(c => c.value === technique.category)?.label || 'Sin categoría'}${technique.grade ? ` • ${grades.find(g => g.value === technique.grade)?.label}` : ''}`,
      description: `${technique.description} • ${getMasteryLabel(technique.mastery)} • ${technique.timesLearned} prácticas`,
      leftIcon: technique.category === 'nage-waza' ? 'sports-martial-arts' : technique.category === 'katame-waza' ? 'fitness-center' : 'sports',
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
                  </View>

                  {selectedTechnique.keyPoints && selectedTechnique.keyPoints.length > 0 && (
                    <>
                      <Text style={styles.sectionSubtitle}>Puntos Clave:</Text>
                      {selectedTechnique.keyPoints.map((point, index) => (
                        <Text key={index} style={styles.stepText}>
                          • {point}
                        </Text>
                      ))}
                    </>
                  )}

                  {selectedTechnique.commonErrors && selectedTechnique.commonErrors.length > 0 && (
                    <>
                      <Text style={styles.sectionSubtitle}>Errores Comunes:</Text>
                      {selectedTechnique.commonErrors.map((error, index) => (
                        <Text key={index} style={styles.tipText}>
                          • {error}
                        </Text>
                      ))}
                    </>
                  )}

                  {selectedTechnique.grade && (
                    <>
                      <Text style={styles.sectionSubtitle}>Grado Recomendado:</Text>
                      <Text style={styles.gradeText}>
                        {grades.find(g => g.value === selectedTechnique.grade)?.label}
                      </Text>
                    </>
                  )}

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
            description: '',
            category: undefined,
            grade: undefined,
            keyPoints: [''],
            commonErrors: [''],
            videoUrl: '',
            videoFile: '',
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
                <Text style={styles.fieldLabel}>Tipo (opcional)</Text>
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
                <Text style={styles.fieldLabel}>Grado (Cinturón) (opcional)</Text>
                <ScrollView horizontal style={styles.chipContainer}>
                  {grades.slice(1).map((grade) => (
                    <Chip
                      key={grade.value}
                      selected={formTechnique.grade === grade.value}
                      onPress={() => setFormTechnique(prev => ({ ...prev, grade: grade.value as any }))}
                      style={styles.selectionChip}
                    >
                      {grade.label}
                    </Chip>
                  ))}
                </ScrollView>
              </View>
            </View>


            <Text style={styles.fieldLabel}>Puntos Clave (opcional)</Text>
            {formTechnique.keyPoints?.map((point, index) => (
              <View key={index} style={styles.stepInputContainer}>
                <TextInput
                  mode="outlined"
                  label={`Punto Clave ${index + 1}`}
                  value={point}
                  onChangeText={(text) => {
                    const newPoints = [...(formTechnique.keyPoints || [])];
                    newPoints[index] = text;
                    setFormTechnique(prev => ({ ...prev, keyPoints: newPoints }));
                  }}
                  style={styles.stepInput}
                />
                {formTechnique.keyPoints && formTechnique.keyPoints.length > 1 && (
                  <IconButton
                    icon="delete"
                    onPress={() => {
                      const newPoints = formTechnique.keyPoints?.filter((_, i) => i !== index);
                      setFormTechnique(prev => ({ ...prev, keyPoints: newPoints }));
                    }}
                  />
                )}
              </View>
            ))}
            <Button
              mode="outlined"
              onPress={() => {
                const newPoints = [...(formTechnique.keyPoints || []), ''];
                setFormTechnique(prev => ({ ...prev, keyPoints: newPoints }));
              }}
              style={styles.addButton}
            >
              Agregar Punto Clave
            </Button>

            <Text style={styles.fieldLabel}>Errores Comunes (opcional)</Text>
            {formTechnique.commonErrors?.map((error, index) => (
              <View key={index} style={styles.stepInputContainer}>
                <TextInput
                  mode="outlined"
                  label={`Error Común ${index + 1}`}
                  value={error}
                  onChangeText={(text) => {
                    const newErrors = [...(formTechnique.commonErrors || [])];
                    newErrors[index] = text;
                    setFormTechnique(prev => ({ ...prev, commonErrors: newErrors }));
                  }}
                  style={styles.stepInput}
                />
                {formTechnique.commonErrors && formTechnique.commonErrors.length > 1 && (
                  <IconButton
                    icon="delete"
                    onPress={() => {
                      const newErrors = formTechnique.commonErrors?.filter((_, i) => i !== index);
                      setFormTechnique(prev => ({ ...prev, commonErrors: newErrors }));
                    }}
                  />
                )}
              </View>
            ))}
            <Button
              mode="outlined"
              onPress={() => {
                const newErrors = [...(formTechnique.commonErrors || []), ''];
                setFormTechnique(prev => ({ ...prev, commonErrors: newErrors }));
              }}
              style={styles.addButton}
            >
              Agregar Error Común
            </Button>
            
            <TextInput
              mode="outlined"
              label="Video de YouTube (opcional)"
              value={formTechnique.videoUrl || ''}
              onChangeText={(text) => setFormTechnique(prev => ({ ...prev, videoUrl: text }))}
              style={styles.formInput}
              placeholder="https://youtube.com/watch?v=..."
            />
            
            <TextInput
              mode="outlined"
              label="Video local (opcional)"
              value={formTechnique.videoFile || ''}
              onChangeText={(text) => setFormTechnique(prev => ({ ...prev, videoFile: text }))}
              style={styles.formInput}
              placeholder="Ruta del archivo de video local"
            />
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
  gradeText: {
    fontSize: 14,
    color: '#283750',
    fontWeight: '500',
    paddingVertical: 4,
  },
});

export default TecnicasDeportivasScreen;