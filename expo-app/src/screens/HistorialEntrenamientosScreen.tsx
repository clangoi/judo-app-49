import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, Dimensions } from 'react-native';
import { Card, SegmentedButtons, Chip, Searchbar } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TrainingEntry {
  id: string;
  date: string;
  type: 'physical' | 'sports' | 'technique' | 'tactical';
  sport?: string;
  duration: number;
  intensity: 1 | 2 | 3 | 4 | 5;
  exercises?: number;
  techniques?: number;
  calories?: number;
  notes?: string;
  completed: boolean;
}

const HistorialEntrenamientosScreen = () => {
  const [trainingHistory, setTrainingHistory] = useState<TrainingEntry[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<TrainingEntry[]>([]);
  const [activeTab, setActiveTab] = useState('historial');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const screenData = Dimensions.get('window');

  useEffect(() => {
    loadTrainingHistory();
  }, []);

  useEffect(() => {
    filterHistory();
  }, [trainingHistory, searchQuery]);

  const loadTrainingHistory = async () => {
    try {
      // Load from multiple sources
      const [physicalSessions, sportsSessions, techniques] = await Promise.all([
        AsyncStorage.getItem('workout-sessions'),
        AsyncStorage.getItem('sports-sessions'),
        AsyncStorage.getItem('martial-techniques')
      ]);

      const history: TrainingEntry[] = [];

      // Convert physical training sessions
      if (physicalSessions) {
        const physical = JSON.parse(physicalSessions);
        physical.forEach((session: any) => {
          history.push({
            id: `physical-${session.id}`,
            date: session.date,
            type: 'physical',
            duration: session.duration,
            intensity: session.intensity,
            exercises: session.exercises?.length || 0,
            completed: true,
            notes: session.notes
          });
        });
      }

      // Convert sports training sessions
      if (sportsSessions) {
        const sports = JSON.parse(sportsSessions);
        sports.forEach((session: any) => {
          history.push({
            id: `sports-${session.id}`,
            date: session.date,
            type: 'sports',
            sport: session.sport,
            duration: session.duration,
            intensity: session.intensity,
            exercises: session.drills?.length || 0,
            completed: true,
            notes: session.notes
          });
        });
      }

      // Convert technique practice
      if (techniques) {
        const techniqueData = JSON.parse(techniques);
        techniqueData.forEach((technique: any) => {
          if (technique.lastPracticed) {
            history.push({
              id: `technique-${technique.id}`,
              date: technique.lastPracticed,
              type: 'technique',
              sport: technique.sport,
              duration: 15, // Estimated duration
              intensity: 3,
              techniques: 1,
              completed: true,
              notes: `Práctica de ${technique.name}`
            });
          }
        });
      }

      // Sort by date (newest first)
      history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setTrainingHistory(history);
    } catch (error) {
      console.error('Error loading training history:', error);
    }
  };

  const filterHistory = () => {
    let filtered = trainingHistory;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.notes?.toLowerCase().includes(query) ||
        entry.sport?.toLowerCase().includes(query) ||
        entry.type.toLowerCase().includes(query)
      );
    }

    setFilteredHistory(filtered);
  };

  const getFilteredByPeriod = () => {
    const now = new Date();
    let startDate: Date;

    switch (selectedPeriod) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    return trainingHistory.filter(entry => 
      new Date(entry.date) >= startDate
    );
  };

  const getTrainingStats = () => {
    const periodData = getFilteredByPeriod();
    
    const totalSessions = periodData.length;
    const totalTime = periodData.reduce((sum, entry) => sum + entry.duration, 0);
    const avgIntensity = totalSessions > 0 
      ? (periodData.reduce((sum, entry) => sum + entry.intensity, 0) / totalSessions).toFixed(1)
      : '0';
    
    const typeBreakdown = {
      physical: periodData.filter(e => e.type === 'physical').length,
      sports: periodData.filter(e => e.type === 'sports').length,
      technique: periodData.filter(e => e.type === 'technique').length,
      tactical: periodData.filter(e => e.type === 'tactical').length,
    };

    return { totalSessions, totalTime, avgIntensity, typeBreakdown };
  };

  const getChartData = () => {
    const periodData = getFilteredByPeriod();
    
    // Group by date
    const dailyData: { [key: string]: { duration: number, sessions: number } } = {};
    
    periodData.forEach(entry => {
      const date = new Date(entry.date).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { duration: 0, sessions: 0 };
      }
      dailyData[date].duration += entry.duration;
      dailyData[date].sessions += 1;
    });

    const sortedDates = Object.keys(dailyData).sort();
    const last7Days = sortedDates.slice(-7);

    return {
      labels: last7Days.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('es-ES', { weekday: 'short' });
      }),
      datasets: [{
        data: last7Days.map(date => dailyData[date]?.duration || 0),
        strokeWidth: 2,
        color: (opacity = 1) => `rgba(40, 55, 80, ${opacity})`,
      }]
    };
  };

  const getTypeDistributionData = () => {
    const stats = getTrainingStats();
    
    return {
      labels: ['Físico', 'Deportivo', 'Técnico', 'Táctico'],
      datasets: [{
        data: [
          stats.typeBreakdown.physical,
          stats.typeBreakdown.sports,
          stats.typeBreakdown.technique,
          stats.typeBreakdown.tactical
        ]
      }]
    };
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'physical': return 'fitness-center';
      case 'sports': return 'sports-martial-arts';
      case 'technique': return 'sports';
      case 'tactical': return 'lightbulb';
      default: return 'sports';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'physical': return 'Físico';
      case 'sports': return 'Deportivo';
      case 'technique': return 'Técnico';
      case 'tactical': return 'Táctico';
      default: return 'Otro';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'physical': return '#EF4444';
      case 'sports': return '#3B82F6';
      case 'technique': return '#10B981';
      case 'tactical': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const renderTrainingItem = ({ item }: { item: TrainingEntry }) => (
    <Card style={styles.trainingCard}>
      <Card.Content>
        <View style={styles.trainingHeader}>
          <View style={styles.trainingInfo}>
            <View style={styles.trainingTitleRow}>
              <MaterialIcons 
                name={getTypeIcon(item.type) as any} 
                size={20} 
                color={getTypeColor(item.type)} 
              />
              <Text style={styles.trainingTitle}>
                {getTypeLabel(item.type)} {item.sport && `- ${item.sport}`}
              </Text>
            </View>
            <Text style={styles.trainingDate}>
              {new Date(item.date).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
          
          <View style={styles.trainingMeta}>
            <Text style={styles.trainingDuration}>{item.duration}min</Text>
            <Text style={styles.trainingIntensity}>Int. {item.intensity}/5</Text>
          </View>
        </View>

        <View style={styles.trainingStats}>
          {item.exercises && (
            <Chip style={styles.statChip}>
              <Text>{item.exercises} ejercicios</Text>
            </Chip>
          )}
          {item.techniques && (
            <Chip style={styles.statChip}>
              <Text>{item.techniques} técnicas</Text>
            </Chip>
          )}
          {item.calories && (
            <Chip style={styles.statChip}>
              <Text>{item.calories} cal</Text>
            </Chip>
          )}
        </View>

        {item.notes && (
          <Text style={styles.trainingNotes} numberOfLines={2}>
            {item.notes}
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  const renderHistoryView = () => (
    <View>
      {/* Search */}
      <Searchbar
        placeholder="Buscar entrenamientos..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      {/* Training List */}
      <FlatList
        data={filteredHistory}
        renderItem={renderTrainingItem}
        keyExtractor={(item) => item.id}
        style={styles.trainingList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  const renderAnalyticsView = () => {
    const stats = getTrainingStats();
    const chartData = getChartData();

    return (
      <View>
        {/* Period Filter */}
        <View style={styles.periodContainer}>
          <SegmentedButtons
            value={selectedPeriod}
            onValueChange={setSelectedPeriod}
            buttons={[
              { value: 'week', label: '7 días' },
              { value: 'month', label: '30 días' },
              { value: 'year', label: '1 año' },
            ]}
            style={styles.periodButtons}
          />
        </View>

        {/* Stats Cards */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Resumen del Período</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalSessions}</Text>
                <Text style={styles.statLabel}>Entrenamientos</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalTime}min</Text>
                <Text style={styles.statLabel}>Tiempo Total</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.avgIntensity}</Text>
                <Text style={styles.statLabel}>Intensidad Media</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {stats.totalSessions > 0 ? Math.round(stats.totalTime / stats.totalSessions) : 0}min
                </Text>
                <Text style={styles.statLabel}>Duración Media</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Daily Duration Chart */}
        {chartData.labels.length > 0 && (
          <Card style={styles.chartCard}>
            <Card.Content>
              <Text style={styles.chartTitle}>Duración Diaria (últimos 7 días)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <LineChart
                  data={chartData}
                  width={Math.max(screenData.width - 60, 350)}
                  height={220}
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(40, 55, 80, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                    propsForDots: {
                      r: "4",
                      strokeWidth: "2",
                      stroke: "#283750"
                    }
                  }}
                  bezier
                  style={styles.chart}
                />
              </ScrollView>
            </Card.Content>
          </Card>
        )}

        {/* Type Distribution */}
        <Card style={styles.chartCard}>
          <Card.Content>
            <Text style={styles.chartTitle}>Distribución por Tipo</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <BarChart
                data={getTypeDistributionData()}
                width={Math.max(screenData.width - 60, 350)}
                height={220}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(40, 55, 80, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  }
                }}
                style={styles.chart}
                yAxisSuffix=""
                yAxisLabel=""
              />
            </ScrollView>
          </Card.Content>
        </Card>

        {/* Type Breakdown */}
        <Card style={styles.breakdownCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Desglose por Tipo</Text>
            <View style={styles.typeBreakdown}>
              {Object.entries(stats.typeBreakdown).map(([type, count]) => (
                <View key={type} style={styles.typeItem}>
                  <View style={styles.typeHeader}>
                    <MaterialIcons 
                      name={getTypeIcon(type) as any} 
                      size={20} 
                      color={getTypeColor(type)} 
                    />
                    <Text style={styles.typeName}>{getTypeLabel(type)}</Text>
                  </View>
                  <Text style={styles.typeCount}>{count} sesiones</Text>
                </View>
              ))}
            </View>
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
            { value: 'historial', label: 'Historial' },
            { value: 'analytics', label: 'Analytics' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <ScrollView style={styles.scrollContainer}>
        {activeTab === 'historial' && renderHistoryView()}
        {activeTab === 'analytics' && renderAnalyticsView()}
      </ScrollView>
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
  searchbar: {
    margin: 8,
    elevation: 2,
  },
  trainingList: {
    flex: 1,
  },
  trainingCard: {
    margin: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  trainingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  trainingInfo: {
    flex: 1,
  },
  trainingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  trainingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#283750',
    marginLeft: 8,
  },
  trainingDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  trainingMeta: {
    alignItems: 'flex-end',
  },
  trainingDuration: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#283750',
  },
  trainingIntensity: {
    fontSize: 12,
    color: '#6B7280',
  },
  trainingStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  statChip: {
    backgroundColor: '#F3F4F6',
  },
  trainingNotes: {
    fontSize: 14,
    color: '#374151',
    fontStyle: 'italic',
    marginTop: 8,
  },
  periodContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  periodButtons: {
    backgroundColor: '#F3F4F6',
  },
  statsCard: {
    margin: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  chartCard: {
    margin: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  breakdownCard: {
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
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#283750',
    marginBottom: 12,
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
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  typeBreakdown: {
    gap: 12,
  },
  typeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  typeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#283750',
    marginLeft: 8,
  },
  typeCount: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default HistorialEntrenamientosScreen;