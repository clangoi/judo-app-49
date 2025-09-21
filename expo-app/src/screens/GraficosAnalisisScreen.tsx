import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Dimensions, 
  Alert,
  Share
} from 'react-native';
import { 
  Button, 
  Card, 
  Divider, 
  SegmentedButtons,
  FAB
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart
} from 'react-native-chart-kit';
import { Calendar } from 'react-native-calendars';

interface GraficosAnalisisScreenProps {
  navigation: any;
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

const screenData = Dimensions.get('window');

const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(40, 55, 80, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(40, 55, 80, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#283750',
  },
};

const chartConfigSecondary = {
  ...chartConfig,
  color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#4CAF50',
  },
};

const GraficosAnalisisScreen: React.FC<GraficosAnalisisScreenProps> = ({ navigation }) => {
  const [activeSection, setActiveSection] = useState('resumen');
  const [checkinData, setCheckinData] = useState<CheckinData[]>([]);
  const [bienestarData, setBienestarData] = useState<BienestarData[]>([]);
  const [crisisData, setCrisisData] = useState<CrisisData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    loadAllData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadAllData();
    }, [])
  );

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
      const exportData = {
        checkins: checkinData,
        bienestar: bienestarData,
        crisis: crisisData,
        exportDate: new Date().toISOString(),
      };

      const reportText = generateReport(exportData);
      
      await Share.share({
        message: reportText,
        title: 'Reporte de Bienestar Mental',
      });
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
${getMostUsedTechniques()}
    
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

  const getMostUsedTechniques = () => {
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
    
    switch (timeRange) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case 'year':
        cutoffDate.setDate(now.getDate() - 365);
        break;
      default:
        cutoffDate.setDate(now.getDate() - 7);
    }

    return {
      checkins: checkinData.filter(item => new Date(item.timestamp) >= cutoffDate),
      bienestar: bienestarData.filter(item => new Date(item.timestamp) >= cutoffDate),
      crisis: crisisData.filter(item => new Date(item.timestamp) >= cutoffDate),
    };
  }, [checkinData, bienestarData, crisisData, timeRange]);

  const trendChartData = useMemo(() => {
    if (filteredData.checkins.length === 0) {
      return null; // Return null for empty state handling
    }

    // Agrupar por días usando ISO dates
    const groupedByDay = filteredData.checkins.reduce((acc: any, item) => {
      const date = new Date(item.timestamp).toISOString().split('T')[0]; // YYYY-MM-DD
      if (!acc[date]) {
        acc[date] = {
          mood: [],
          energy: [],
          stress: [],
          timestamp: new Date(item.timestamp).getTime(), // For sorting
        };
      }
      acc[date].mood.push(item.currentMood);
      acc[date].energy.push(item.energyLevel);
      acc[date].stress.push(item.stressLevel);
      return acc;
    }, {});

    // Sort by timestamp and take last 7 days
    const sortedDates = Object.keys(groupedByDay)
      .sort((a, b) => groupedByDay[a].timestamp - groupedByDay[b].timestamp)
      .slice(-7);

    const moodData = sortedDates.map(date => {
      const dayData = groupedByDay[date].mood;
      return dayData.reduce((sum: number, val: number) => sum + val, 0) / dayData.length;
    });

    const energyData = sortedDates.map(date => {
      const dayData = groupedByDay[date].energy;
      return dayData.reduce((sum: number, val: number) => sum + val, 0) / dayData.length;
    });

    return {
      labels: sortedDates.map(date => new Date(date).getDate().toString()),
      datasets: [
        {
          data: moodData,
          color: (opacity = 1) => `rgba(40, 55, 80, ${opacity})`,
          strokeWidth: 2,
        },
        {
          data: energyData,
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          strokeWidth: 2,
        }
      ]
    };
  }, [filteredData]);

  const techniquesUsageData = useMemo(() => {
    const techniques = filteredData.bienestar.reduce((acc: any, session) => {
      const name = session.techniqueName.length > 10 
        ? session.techniqueName.substring(0, 10) + '...'
        : session.techniqueName;
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    const entries = Object.entries(techniques);
    if (entries.length === 0) {
      return null; // Return null for empty state handling
    }

    return {
      labels: entries.map(([name]) => name),
      datasets: [{
        data: entries.map(([, count]) => count as number)
      }]
    };
  }, [filteredData]);

  const statsCards = useMemo(() => {
    const totalSessions = filteredData.bienestar.length + filteredData.crisis.length;
    const completedSessions = [...filteredData.bienestar, ...filteredData.crisis].filter(s => s.completed).length;
    const avgMood = filteredData.checkins.reduce((sum, item) => sum + item.currentMood, 0) / filteredData.checkins.length || 0;
    const consistencyDays = getConsistencyDays(filteredData.checkins);

    return [
      {
        title: 'Sesiones Totales',
        value: totalSessions,
        icon: 'psychology',
        color: '#2196F3',
      },
      {
        title: 'Tasa de Completado',
        value: totalSessions > 0 ? `${Math.round((completedSessions / totalSessions) * 100)}%` : '0%',
        icon: 'check-circle',
        color: '#4CAF50',
      },
      {
        title: 'Estado de Ánimo Promedio',
        value: `${avgMood.toFixed(1)}/5`,
        icon: 'mood',
        color: '#FF9800',
      },
      {
        title: 'Días Consistentes',
        value: consistencyDays,
        icon: 'calendar-today',
        color: '#9C27B0',
      },
    ];
  }, [filteredData]);

  const getConsistencyDays = (checkins: CheckinData[]) => {
    if (checkins.length === 0) return 0;
    
    const uniqueDays = new Set(
      checkins.map(item => new Date(item.timestamp).toDateString())
    );
    return uniqueDays.size;
  };

  const calendarData = useMemo(() => {
    const markedDates: any = {};

    // Marcar días con check-ins
    filteredData.checkins.forEach(item => {
      const date = new Date(item.timestamp).toISOString().split('T')[0];
      const avgMood = item.currentMood;
      
      let color = '#E0E0E0';
      if (avgMood >= 4) color = '#4CAF50';
      else if (avgMood >= 3) color = '#FF9800';
      else color = '#F44336';

      markedDates[date] = {
        customStyles: {
          container: {
            backgroundColor: color,
            borderRadius: 15,
          },
          text: {
            color: 'white',
            fontWeight: 'bold',
          },
        },
      };
    });

    return markedDates;
  }, [filteredData]);

  const progressChartData = useMemo(() => ({
    labels: ['Ánimo', 'Energía', 'Calma'],
    data: [
      filteredData.checkins.reduce((sum, item) => sum + item.currentMood, 0) / filteredData.checkins.length / 5 || 0,
      filteredData.checkins.reduce((sum, item) => sum + item.energyLevel, 0) / filteredData.checkins.length / 5 || 0,
      filteredData.checkins.reduce((sum, item) => sum + (6 - item.stressLevel), 0) / filteredData.checkins.length / 5 || 0,
    ],
  }), [filteredData]);

  const pieChartData = useMemo(() => {
    const data = [
      {
        name: 'Respiración',
        population: filteredData.bienestar.filter(s => s.techniqueType.includes('breathing') || s.techniqueType.includes('4-7-8') || s.techniqueType.includes('box')).length,
        color: '#2196F3',
        legendFontColor: '#7F7F7F',
        legendFontSize: 15,
      },
      {
        name: 'Mindfulness',
        population: filteredData.bienestar.filter(s => !s.techniqueType.includes('breathing') && !s.techniqueType.includes('4-7-8') && !s.techniqueType.includes('box')).length,
        color: '#4CAF50',
        legendFontColor: '#7F7F7F',
        legendFontSize: 15,
      },
      {
        name: 'Crisis',
        population: filteredData.crisis.length,
        color: '#F44336',
        legendFontColor: '#7F7F7F',
        legendFontSize: 15,
      },
    ];

    const totalPopulation = data.reduce((sum, item) => sum + item.population, 0);
    return totalPopulation > 0 ? data : null;
  }, [filteredData]);

  const renderResumenSection = () => (
    <View>
      {/* Estadísticas principales */}
      <View style={styles.statsGrid}>
        {statsCards.map((stat, index) => (
          <Card key={index} style={styles.statCard}>
            <Card.Content style={styles.statCardContent}>
              <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                <MaterialIcons name={stat.icon as any} size={24} color="white" />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </Card.Content>
          </Card>
        ))}
      </View>

      <Divider style={styles.divider} />

      {/* Gráfico de tendencias */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Text style={styles.chartTitle}>Tendencias de Bienestar</Text>
          <Text style={styles.chartSubtitle}>Estado de ánimo (azul) y energía (verde)</Text>
          {trendChartData ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={trendChartData}
                width={Math.max(screenData.width - 60, 350)}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Sin datos suficientes para mostrar tendencias</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </View>
  );

  const renderTendenciasSection = () => (
    <View>
      <Card style={styles.chartCard}>
        <Card.Content>
          <Text style={styles.chartTitle}>Análisis de Tendencias</Text>
          {trendChartData ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={trendChartData}
                width={Math.max(screenData.width - 60, 400)}
                height={250}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Sin datos suficientes para mostrar tendencias</Text>
            </View>
          )}
          <Text style={styles.chartLegend}>
            📈 Azul: Estado de ánimo | 🟢 Verde: Nivel de energía
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.chartCard}>
        <Card.Content>
          <Text style={styles.chartTitle}>Progreso Semanal</Text>
          <ProgressChart
            data={progressChartData}
            width={screenData.width - 60}
            height={220}
            strokeWidth={16}
            radius={32}
            chartConfig={chartConfig}
            hideLegend={false}
          />
        </Card.Content>
      </Card>
    </View>
  );

  const renderTecnicasSection = () => (
    <View>
      <Card style={styles.chartCard}>
        <Card.Content>
          <Text style={styles.chartTitle}>Uso de Técnicas</Text>
          {techniquesUsageData ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <BarChart
                data={techniquesUsageData}
                width={Math.max(screenData.width - 60, 350)}
                height={220}
                chartConfig={chartConfigSecondary}
                style={styles.chart}
                yAxisSuffix=""
                yAxisLabel=""
              />
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Sin técnicas utilizadas en este período</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.chartCard}>
        <Card.Content>
          <Text style={styles.chartTitle}>Distribución por Tipo</Text>
          {pieChartData ? (
            <PieChart
              data={pieChartData}
              width={screenData.width - 60}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              center={[10, 10]}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Sin sesiones registradas en este período</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </View>
  );

  const renderCalendarioSection = () => (
    <View>
      <Card style={styles.chartCard}>
        <Card.Content>
          <Text style={styles.chartTitle}>Calendario de Actividad</Text>
          <Text style={styles.chartSubtitle}>
            🟢 Días buenos • 🟠 Días regulares • 🔴 Días difíciles
          </Text>
          <Calendar
            markedDates={calendarData}
            markingType="custom"
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#283750',
              selectedDayBackgroundColor: '#283750',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#283750',
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              dotColor: '#283750',
              selectedDotColor: '#ffffff',
              arrowColor: '#283750',
              disabledArrowColor: '#d9e1e8',
              monthTextColor: '#283750',
              indicatorColor: '#283750',
            }}
          />
        </Card.Content>
      </Card>

      <Card style={styles.chartCard}>
        <Card.Content>
          <Text style={styles.chartTitle}>Patrones Semanales</Text>
          <Text style={styles.chartDescription}>
            Análisis de tus patrones de bienestar por día de la semana
          </Text>
          {/* Aquí podrías agregar un gráfico de patrones semanales */}
        </Card.Content>
      </Card>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Cargando análisis...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          icon="arrow-left"
        >
          Atrás
        </Button>
        <Text style={styles.title}>Gráficos y Análisis</Text>
        <Text style={styles.subtitle}>Visualiza tu progreso de bienestar</Text>
      </View>

      {/* Filtros de tiempo */}
      <View style={styles.timeFilterContainer}>
        <SegmentedButtons
          value={timeRange}
          onValueChange={setTimeRange}
          buttons={[
            { value: 'week', label: '7 días' },
            { value: 'month', label: '30 días' },
            { value: 'year', label: '1 año' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      {/* Navegación de secciones */}
      <View style={styles.sectionNavigation}>
        <SegmentedButtons
          value={activeSection}
          onValueChange={setActiveSection}
          buttons={[
            { value: 'resumen', label: 'Resumen' },
            { value: 'tendencias', label: 'Tendencias' },
            { value: 'tecnicas', label: 'Técnicas' },
            { value: 'calendario', label: 'Calendario' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <ScrollView style={styles.scrollContainer}>
        {activeSection === 'resumen' && renderResumenSection()}
        {activeSection === 'tendencias' && renderTendenciasSection()}
        {activeSection === 'tecnicas' && renderTecnicasSection()}
        {activeSection === 'calendario' && renderCalendarioSection()}
      </ScrollView>

      {/* FAB para exportar */}
      <FAB
        icon="download"
        style={styles.fab}
        onPress={exportData}
        label="Exportar"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#283750',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 10,
  },
  timeFilterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
  },
  sectionNavigation: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  segmentedButtons: {
    backgroundColor: 'white',
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    marginBottom: 15,
    backgroundColor: 'white',
    elevation: 2,
  },
  statCardContent: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#283750',
    marginBottom: 5,
  },
  statTitle: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: 'white',
    marginBottom: 20,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#283750',
    marginBottom: 5,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 15,
  },
  chartDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartLegend: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginTop: 10,
  },
  divider: {
    marginVertical: 20,
    backgroundColor: '#E0E0E0',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  fab: {
    position: 'absolute',
    margin: 20,
    right: 0,
    bottom: 0,
    backgroundColor: '#283750',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default GraficosAnalisisScreen;