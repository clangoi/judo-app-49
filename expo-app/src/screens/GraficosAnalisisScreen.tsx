import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert
} from 'react-native';
import { Card, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface GraficosAnalisisScreenProps {
  navigation?: any;
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

// Esta pantalla está temporalmente simplificada para compatibilidad web

const GraficosAnalisisScreen: React.FC<GraficosAnalisisScreenProps> = ({ navigation }) => {
  const [checkinData, setCheckinData] = useState<CheckinData[]>([]);
  const [bienestarData, setBienestarData] = useState<BienestarData[]>([]);
  const [crisisData, setCrisisData] = useState<CrisisData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

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

  // Función auxiliar movida aquí

  const getConsistencyDays = (checkins: CheckinData[]) => {
    if (checkins.length === 0) return 0;
    
    const uniqueDays = new Set(
      checkins.map(item => new Date(item.timestamp).toDateString())
    );
    return uniqueDays.size;
  };

  // Datos eliminados para simplificar

  const renderContent = () => {
    const stats = getStats();
    const techniques = getMostUsedTechniques();

    return (
      <View>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>📊 Resumen de Bienestar</Text>
            
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
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>🧘 Técnicas Más Utilizadas</Text>
              {techniques.map((technique, index) => (
                <View key={index} style={styles.statRow}>
                  <Text style={styles.statLabel}>{technique.name}:</Text>
                  <Text style={styles.statValue}>{technique.count} sesiones</Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>📈 Análisis Disponible</Text>
            <Text style={styles.description}>
              Esta es una versión simplificada de la pantalla de gráficos y análisis. 
              La versión completa con gráficos interactivos estará disponible en la aplicación móvil.
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

  // Funciones de renderizado eliminadas para simplificar

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Cargando análisis...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {navigation && (
          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            ← Atrás
          </Button>
        )}
        <Text style={styles.title}>📊 Gráficos y Análisis</Text>
        <Text style={styles.subtitle}>Resumen de tu progreso de bienestar</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {renderContent()}
      </ScrollView>
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
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#283750',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
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
  description: {
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
});

export default GraficosAnalisisScreen;