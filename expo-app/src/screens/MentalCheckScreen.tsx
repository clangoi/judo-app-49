import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Card, Button, SegmentedButtons, TextInput, Chip } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MentalCheckScreenProps {
  navigation: any;
  route?: {
    params?: {
      initialTab?: string;
    };
  };
}

interface CheckinData {
  id: string;
  timestamp: string;
  currentMood: number;
  energyLevel: number;
  stressLevel: number;
  protectiveFactors: number;
  quickNote: string;
  contextNote: string;
  timeOfDay: string;
  dayOfWeek: string;
  // Nuevos campos para check-ins de texto libre
  mentalStateText?: string;
  type?: string;
}

interface BienestarData {
  id: string;
  timestamp: string;
  techniqueType: string;
  techniqueName: string;
  completed: boolean;
  evaluationData: {
    stress: number;
    anxiety: number;
    energy: number;
    mood: number;
  };
  duration: number;
}

interface CrisisData {
  id: string;
  timestamp: string;
  techniqueType: string;
  techniqueName: string;
  completed: boolean;
  stepsCompleted: number;
  totalSteps: number;
  evaluationData: {
    intensityLevel: number;
    physicalSymptoms: number;
    emotionalState: number;
    copingCapacity: number;
  };
}

const MentalCheckScreen: React.FC<MentalCheckScreenProps> = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState(route?.params?.initialTab || 'herramientas');
  
  // Estados para analytics
  const [checkinData, setCheckinData] = useState<CheckinData[]>([]);
  const [bienestarData, setBienestarData] = useState<BienestarData[]>([]);
  const [crisisData, setCrisisData] = useState<CrisisData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para historial de check-ins
  const [searchText, setSearchText] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month'>('all');
  const [showHistoryDetails, setShowHistoryDetails] = useState<string[]>([]);
  const mentalHealthOptions = [
    {
      title: "Check-in Rápido",
      description: "Registra rápidamente cómo te sientes en este momento con solo 3 preguntas esenciales",
      icon: "flash-on",
      screen: "CheckinRapido",
      color: "#FF8C00",
      badge: "⚡ 30s",
      details: ["😊 ¿Cómo te sientes ahora?", "🔋 ¿Cuál es tu nivel de energía?", "😌 ¿Qué tan estresado estás?"]
    },
    {
      title: "Evaluación Profunda",
      description: "Análisis completo de tu estado mental, emocional y físico con 15 preguntas y recomendaciones personalizadas",
      icon: "assignment",
      screen: "EvaluacionProfunda",
      color: "#7B1FA2",
      badge: "📊 COMPLETA",
      details: ["Estado emocional detallado", "Análisis de patrones", "Factores de estrés", "Nivel de satisfacción", "Recomendaciones personalizadas"]
    },
    {
      title: "Técnicas de Bienestar", 
      description: "Ejercicios de respiración y mindfulness para reducir estrés, mejorar enfoque y cultivar bienestar mental",
      icon: "psychology",
      screen: "Bienestar",
      color: "#1976D2",
      badge: "🧘 BIENESTAR",
      details: ["Respiración 4-7-8", "Respiración de Caja", "Exploración Corporal", "Observación Consciente", "Bondad Amorosa"]
    },
    {
      title: "Manejo de Crisis",
      description: "Para momentos de alta ansiedad, pánico o estrés intenso. Técnicas de emergencia para recuperar el control",
      icon: "emergency",
      screen: "ManejoCrisis",
      color: "#D32F2F",
      badge: "🚨 SOS",
      details: ["Respiración 4-7-8", "Técnica 5-4-3-2-1", "Visualización", "Movimiento Suave"]
    }
  ];

  const handleNavigation = (screen: string) => {
    navigation.navigate(screen);
  };

  // Cargar datos para analytics
  useEffect(() => {
    if (activeTab === 'analytics') {
      loadAllData();
    }
  }, [activeTab]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      // Cargar datos de check-ins
      try {
        const checkins = await AsyncStorage.getItem('mentalcheck_checkins');
        if (checkins) {
          const parsed = JSON.parse(checkins);
          setCheckinData(Array.isArray(parsed) ? parsed : []);
        } else {
          setCheckinData([]);
        }
      } catch (error) {
        console.error('Error loading checkins:', error);
        setCheckinData([]);
      }

      // Cargar datos de sesiones de bienestar
      try {
        const bienestar = await AsyncStorage.getItem('mentalcheck_wellness_sessions');
        if (bienestar) {
          const parsed = JSON.parse(bienestar);
          setBienestarData(Array.isArray(parsed) ? parsed : []);
        } else {
          setBienestarData([]);
        }
      } catch (error) {
        console.error('Error loading bienestar:', error);
        setBienestarData([]);
      }

      // Cargar datos de sesiones de crisis
      try {
        const crisis = await AsyncStorage.getItem('mentalcheck_crisis_sessions');
        if (crisis) {
          const parsed = JSON.parse(crisis);
          setCrisisData(Array.isArray(parsed) ? parsed : []);
        } else {
          setCrisisData([]);
        }
      } catch (error) {
        console.error('Error loading crisis:', error);
        setCrisisData([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const exportDataObj = {
        checkins: checkinData,
        bienestar: bienestarData,
        crisis: crisisData,
        exportDate: new Date().toISOString(),
      };

      const reportText = generateReport(exportDataObj);
      
      // Crear descarga en web
      const blob = new Blob([reportText], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reporte-bienestar-mental.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      Alert.alert('Error', 'No se pudo exportar los datos');
    }
  };

  const generateReport = (data: any) => {
    const totalCheckins = data.checkins.length;
    const totalSessions = data.bienestar.length + data.crisis.length;
    const avgMood = data.checkins.reduce((sum: number, item: CheckinData) => sum + item.currentMood, 0) / totalCheckins || 0;
    const avgEnergy = data.checkins.reduce((sum: number, item: CheckinData) => sum + item.energyLevel, 0) / totalCheckins || 0;

    return `📊 REPORTE DE BIENESTAR MENTAL
    
🔍 Resumen General:
• Total de check-ins: ${totalCheckins}
• Total de sesiones: ${totalSessions}
• Estado de ánimo promedio: ${avgMood.toFixed(1)}/5
• Nivel de energía promedio: ${avgEnergy.toFixed(1)}/5
    
📈 Tendencias:
${getTrendSummary()}
    
🧘 Técnicas más utilizadas:
${getMostUsedTechniquesForReport()}
    
📅 Fecha del reporte: ${new Date().toLocaleDateString()}`;
  };

  const getTrendSummary = () => {
    if (checkinData.length < 2) return '• Datos insuficientes para analizar tendencias';
    
    const recent = checkinData.slice(-7);
    const older = checkinData.slice(-14, -7);
    
    const recentAvgMood = recent.reduce((sum, item) => sum + item.currentMood, 0) / recent.length;
    const olderAvgMood = older.reduce((sum, item) => sum + item.currentMood, 0) / older.length;
    
    const trend = recentAvgMood > olderAvgMood ? 'mejorado' : 'empeorado';
    return `• Tu estado de ánimo ha ${trend} en la última semana`;
  };

  const getMostUsedTechniquesForReport = () => {
    const techniques = bienestarData.reduce((acc: any, session) => {
      acc[session.techniqueName] = (acc[session.techniqueName] || 0) + 1;
      return acc;
    }, {});
    
    const sorted = Object.entries(techniques).sort(([,a], [,b]) => (b as number) - (a as number));
    return sorted.slice(0, 3).map(([name, count], index) => 
      `${index + 1}. ${name}: ${count} sesiones`
    ).join('\n');
  };

  const filteredData = useMemo(() => {
    const now = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - 7); // Última semana por defecto

    return {
      checkins: checkinData.filter(item => new Date(item.timestamp) >= cutoffDate),
      bienestar: bienestarData.filter(item => new Date(item.timestamp) >= cutoffDate),
      crisis: crisisData.filter(item => new Date(item.timestamp) >= cutoffDate),
    };
  }, [checkinData, bienestarData, crisisData]);

  // Funciones de análisis simplificadas para web
  const getStats = () => {
    const totalSessions = filteredData.bienestar.length + filteredData.crisis.length;
    const completedSessions = [...filteredData.bienestar, ...filteredData.crisis].filter(s => s.completed).length;
    const avgMood = filteredData.checkins.reduce((sum, item) => sum + item.currentMood, 0) / filteredData.checkins.length || 0;
    const consistencyDays = getConsistencyDays(filteredData.checkins);

    return {
      totalSessions,
      completedSessions,
      avgMood,
      consistencyDays
    };
  };

  const getMostUsedTechniques = () => {
    const techniques = filteredData.bienestar.reduce((acc: any, session) => {
      acc[session.techniqueName] = (acc[session.techniqueName] || 0) + 1;
      return acc;
    }, {});
    
    const sorted = Object.entries(techniques).sort(([,a], [,b]) => (b as number) - (a as number));
    return sorted.slice(0, 5).map(([name, count]) => ({ name, count }));
  };

  const getConsistencyDays = (checkins: CheckinData[]) => {
    if (checkins.length === 0) return 0;
    
    const uniqueDays = new Set(
      checkins.map(item => new Date(item.timestamp).toDateString())
    );
    return uniqueDays.size;
  };

  // Funciones para el historial de check-ins
  const getFilteredCheckins = () => {
    let filtered = checkinData;
    
    // Filtrar por fecha
    if (dateFilter !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      if (dateFilter === 'week') {
        cutoffDate.setDate(now.getDate() - 7);
      } else if (dateFilter === 'month') {
        cutoffDate.setDate(now.getDate() - 30);
      }
      
      filtered = filtered.filter(item => new Date(item.timestamp) >= cutoffDate);
    }
    
    // Filtrar por texto de búsqueda
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(item => {
        const textToSearch = (item.mentalStateText || item.quickNote || '').toLowerCase();
        return textToSearch.includes(searchLower);
      });
    }
    
    // Ordenar por fecha (más reciente primero)
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Hoy, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Ayer, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const toggleHistoryDetails = (id: string) => {
    setShowHistoryDetails(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const renderCheckinItem = (checkin: CheckinData) => {
    const isExpanded = showHistoryDetails.includes(checkin.id);
    const displayText = checkin.mentalStateText || checkin.quickNote || 'Sin texto registrado';
    const shouldTruncate = displayText.length > 100;
    
    return (
      <Card key={checkin.id} style={styles.historyCard}>
        <Card.Content>
          <View style={styles.historyHeader}>
            <Text style={styles.historyDate}>{formatDate(checkin.timestamp)}</Text>
            {checkin.type === 'quick_text' && (
              <Chip textStyle={styles.chipText} style={styles.typeChip}>
                Texto libre
              </Chip>
            )}
          </View>
          
          <TouchableOpacity
            onPress={() => shouldTruncate && toggleHistoryDetails(checkin.id)}
            disabled={!shouldTruncate}
          >
            <Text style={styles.historyText}>
              {isExpanded || !shouldTruncate ? displayText : truncateText(displayText)}
            </Text>
            
            {shouldTruncate && (
              <Text style={styles.expandText}>
                {isExpanded ? 'Ver menos' : 'Ver más'}
              </Text>
            )}
          </TouchableOpacity>
          
          {(checkin.contextNote && checkin.contextNote.trim()) && (
            <View style={styles.contextContainer}>
              <Text style={styles.contextLabel}>Contexto:</Text>
              <Text style={styles.contextText}>{checkin.contextNote}</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderHistorialSection = () => {
    const filteredCheckins = getFilteredCheckins();
    
    return (
      <Card style={styles.analyticsCard}>
        <Card.Content>
          <Text style={styles.analyticsSectionTitle}>📝 Historial de Check-ins</Text>
          
          {/* Búsqueda */}
          <TextInput
            mode="outlined"
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Buscar en tus check-ins..."
            left={<TextInput.Icon icon="magnify" />}
            style={styles.searchInput}
            data-testid="input-search-checkins"
          />
          
          {/* Filtros de fecha */}
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Período:</Text>
            <View style={styles.filterChips}>
              <Chip
                selected={dateFilter === 'all'}
                onPress={() => setDateFilter('all')}
                style={styles.filterChip}
                textStyle={styles.filterChipText}
              >
                Todo
              </Chip>
              <Chip
                selected={dateFilter === 'week'}
                onPress={() => setDateFilter('week')}
                style={styles.filterChip}
                textStyle={styles.filterChipText}
              >
                Última semana
              </Chip>
              <Chip
                selected={dateFilter === 'month'}
                onPress={() => setDateFilter('month')}
                style={styles.filterChip}
                textStyle={styles.filterChipText}
              >
                Último mes
              </Chip>
            </View>
          </View>
          
          {/* Resultados */}
          <View style={styles.historyResults}>
            <Text style={styles.resultsCount}>
              {filteredCheckins.length === 0
                ? 'No se encontraron check-ins'
                : `${filteredCheckins.length} check-in${filteredCheckins.length !== 1 ? 's' : ''} encontrado${filteredCheckins.length !== 1 ? 's' : ''}`
              }
            </Text>
            
            {filteredCheckins.length === 0 && (
              <View style={styles.emptyState}>
                <MaterialIcons name="psychology" size={48} color="#E0E0E0" />
                <Text style={styles.emptyStateText}>
                  {searchText.trim() 
                    ? 'No se encontraron check-ins que coincidan con tu búsqueda.'
                    : 'Aún no hay check-ins registrados.'
                  }
                </Text>
                {!searchText.trim() && (
                  <Button
                    mode="contained"
                    onPress={() => navigation.navigate('CheckinRapido')}
                    style={styles.quickActionButton}
                    buttonColor="#283750"
                  >
                    Hacer mi primer check-in
                  </Button>
                )}
              </View>
            )}
            
            {filteredCheckins.map(renderCheckinItem)}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const renderHerramientasView = () => (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.title}>MentalCheck</Text>
        <Text style={styles.subtitle}>¿Cómo quieres evaluar tu bienestar hoy?</Text>
        <Text style={styles.description}>Elige la opción que mejor se adapte a tu tiempo disponible</Text>
      </View>

      {/* Mental Health Options */}
      <View style={styles.cardsContainer}>
        {mentalHealthOptions.map((option, index) => (
          <Card key={index} style={styles.card} elevation={3}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: option.color }]}>
                  <MaterialIcons name={option.icon as any} size={32} color="#FFFFFF" />
                </View>
                <View style={styles.titleContainer}>
                  <Text style={styles.cardTitle}>{option.title}</Text>
                  <View style={[styles.badge, { backgroundColor: option.color }]}>
                    <Text style={styles.badgeText}>{option.badge}</Text>
                  </View>
                </View>
              </View>
              
              <Text style={styles.cardDescription}>{option.description}</Text>
              
              <View style={[styles.detailsContainer, { borderLeftColor: option.color }]}>
                <Text style={[styles.detailsTitle, { color: option.color }]}>
                  {option.title === "Check-in Rápido" ? "Solo 3 preguntas:" : 
                   option.title === "Evaluación Profunda" ? "Incluye:" :
                   option.title === "Técnicas de Bienestar" ? "Técnicas incluidas:" : 
                   "Técnicas incluidas:"}
                </Text>
                {option.details.map((detail, idx) => (
                  <Text key={idx} style={styles.detailItem}>• {detail}</Text>
                ))}
              </View>
              
              <Button
                mode="contained"
                onPress={() => handleNavigation(option.screen)}
                style={[styles.cardButton, { backgroundColor: option.color }]}
                contentStyle={styles.buttonContent}
                data-testid={`button-access-${option.screen.toLowerCase()}`}
              >
                {option.title === "Check-in Rápido" ? "Iniciar Check-in (30s)" :
                 option.title === "Evaluación Profunda" ? "Iniciar Evaluación (5-7 min)" :
                 option.title === "Técnicas de Bienestar" ? "Iniciar Técnicas" :
                 "Iniciar Manejo de Crisis"}
              </Button>
            </Card.Content>
          </Card>
        ))}
      </View>
      
      {/* Espaciado inferior */}
      <View style={styles.bottomSpacing} />
    </View>
  );

  const renderAnalyticsView = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Cargando análisis...</Text>
        </View>
      );
    }

    const stats = getStats();
    const techniques = getMostUsedTechniques();

    return (
      <View>
        <Card style={styles.analyticsCard}>
          <Card.Content>
            <Text style={styles.analyticsSectionTitle}>📊 Resumen de Bienestar</Text>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Check-ins realizados:</Text>
              <Text style={styles.statValue}>{filteredData.checkins.length}</Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Sesiones totales:</Text>
              <Text style={styles.statValue}>{stats.totalSessions}</Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Sesiones completadas:</Text>
              <Text style={styles.statValue}>{stats.completedSessions}</Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Estado de ánimo promedio:</Text>
              <Text style={styles.statValue}>{stats.avgMood.toFixed(1)}/5</Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Días con actividad:</Text>
              <Text style={styles.statValue}>{stats.consistencyDays}</Text>
            </View>
          </Card.Content>
        </Card>

        {techniques.length > 0 && (
          <Card style={styles.analyticsCard}>
            <Card.Content>
              <Text style={styles.analyticsSectionTitle}>🧘 Técnicas Más Utilizadas</Text>
              {techniques.map((technique, index) => (
                <View key={index} style={styles.statRow}>
                  <Text style={styles.statLabel}>{technique.name}:</Text>
                  <Text style={styles.statValue}>{technique.count as number} sesiones</Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Nueva sección: Historial de Check-ins */}
        {renderHistorialSection()}

        <Card style={styles.analyticsCard}>
          <Card.Content>
            <Text style={styles.analyticsSectionTitle}>📈 Análisis Disponible</Text>
            <Text style={styles.analyticsDescription}>
              Esta sección muestra tu progreso de bienestar mental durante la última semana.
              Los datos incluyen check-ins, sesiones de técnicas y manejo de crisis.
            </Text>
            
            <Button 
              mode="contained" 
              onPress={exportData}
              style={styles.exportButton}
            >
              📊 Exportar Reporte Completo
            </Button>
          </Card.Content>
        </Card>
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
            { value: 'herramientas', label: 'Herramientas' },
            { value: 'analytics', label: 'Analytics' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <ScrollView style={styles.scrollContainer}>
        {activeTab === 'herramientas' && renderHerramientasView()}
        {activeTab === 'analytics' && renderAnalyticsView()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#283750',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#283750',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#888888',
    lineHeight: 20,
  },
  cardsContainer: {
    paddingHorizontal: 16,
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283750',
    marginBottom: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 16,
  },
  detailsContainer: {
    backgroundColor: '#F8F9FA',
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  detailItem: {
    fontSize: 11,
    color: '#666666',
    marginBottom: 2,
  },
  cardButton: {
    borderRadius: 8,
  },
  buttonContent: {
    height: 48,
  },
  bottomSpacing: {
    height: 20,
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  analyticsCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    marginHorizontal: 16,
    elevation: 2,
  },
  analyticsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#283750',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#283750',
  },
  analyticsDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  exportButton: {
    backgroundColor: '#283750',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  // Estilos para historial de check-ins
  searchInput: {
    marginBottom: 16,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#283750',
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  filterChipText: {
    fontSize: 12,
  },
  historyResults: {
    marginTop: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
    fontWeight: '500',
  },
  historyCard: {
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  typeChip: {
    backgroundColor: '#E3F2FD',
    height: 24,
  },
  chipText: {
    fontSize: 10,
    color: '#1976D2',
  },
  historyText: {
    fontSize: 14,
    color: '#283750',
    lineHeight: 20,
  },
  expandText: {
    fontSize: 12,
    color: '#1976D2',
    marginTop: 4,
    fontWeight: '500',
  },
  contextContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
  },
  contextLabel: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
    marginBottom: 2,
  },
  contextText: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
    lineHeight: 20,
  },
  quickActionButton: {
    marginTop: 8,
  },
});

export default MentalCheckScreen;