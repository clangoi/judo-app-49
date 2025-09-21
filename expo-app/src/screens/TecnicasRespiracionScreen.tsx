import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Card, ProgressBar } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TecnicasRespiracionScreenProps {
  navigation: any;
}

interface BreathingTechnique {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  inhale: number;
  hold?: number;
  exhale: number;
  pause?: number;
  cycles: number;
  duration: number;
}

const BREATHING_TECHNIQUES: BreathingTechnique[] = [
  { 
    id: '4-7-8', 
    name: 'Respiración 4-7-8', 
    description: 'Inhala 4 segundos, mantén 7, exhala 8. Ideal para relajación y dormir.',
    icon: 'air',
    color: '#1976D2',
    inhale: 4,
    hold: 7,
    exhale: 8,
    cycles: 4,
    duration: 3
  },
  { 
    id: 'box_breathing', 
    name: 'Respiración de Caja', 
    description: 'Inhala 4, mantén 4, exhala 4, pausa 4. Perfecta para enfoque y calma.',
    icon: 'crop-square',
    color: '#388E3C',
    inhale: 4,
    hold: 4,
    exhale: 4,
    pause: 4,
    cycles: 6,
    duration: 4
  },
  { 
    id: 'deep_belly', 
    name: 'Respiración Abdominal', 
    description: 'Respiración profunda desde el diafragma. Reduce estrés y ansiedad.',
    icon: 'favorite',
    color: '#7B1FA2',
    inhale: 6,
    hold: 2,
    exhale: 8,
    cycles: 5,
    duration: 5
  },
  { 
    id: 'alternate_nostril', 
    name: 'Respiración Alternada', 
    description: 'Alterna fosas nasales para equilibrar el sistema nervioso.',
    icon: 'auto-awesome',
    color: '#F57C00',
    inhale: 4,
    hold: 4,
    exhale: 4,
    cycles: 8,
    duration: 6
  }
];

const TecnicasRespiracionScreen: React.FC<TecnicasRespiracionScreenProps> = ({ navigation }) => {
  const [selectedTechnique, setSelectedTechnique] = useState<BreathingTechnique | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentPhase, setCurrentPhase] = useState<string>('');
  const [phaseTime, setPhaseTime] = useState<number>(0);
  const [currentCycle, setCurrentCycle] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  // Estados para evaluación antes/después
  const [stressLevelBefore, setStressLevelBefore] = useState<number | null>(null);
  const [anxietyLevelBefore, setAnxietyLevelBefore] = useState<number | null>(null);
  const [energyLevelBefore, setEnergyLevelBefore] = useState<number | null>(null);

  const startBreathingSession = (technique: BreathingTechnique) => {
    setSelectedTechnique(technique);
    setIsActive(true);
    setCurrentPhase('prepare');
    setPhaseTime(3); // 3 segundos de preparación
    setCurrentCycle(0);
    setProgress(0);
    setSessionStartTime(new Date());
  };

  const stopBreathingSession = () => {
    setIsActive(false);
    setSelectedTechnique(null);
    setCurrentPhase('');
    setPhaseTime(0);
    setCurrentCycle(0);
    setProgress(0);
    setSessionStartTime(null);
  };

  const completeSession = async () => {
    if (!selectedTechnique || !sessionStartTime) return;

    const sessionData = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      techniqueType: selectedTechnique.id,
      techniqueName: selectedTechnique.name,
      durationMinutes: Math.round((Date.now() - sessionStartTime.getTime()) / 60000),
      cycles: currentCycle,
      completed: true,
      stressLevelBefore,
      anxietyLevelBefore,
      energyLevelBefore,
      timeOfDay: getTimeOfDay(),
      dayOfWeek: getDayOfWeek(),
    };

    try {
      const existingSessions = await AsyncStorage.getItem('mentalcheck_breathing_sessions');
      const sessions = existingSessions ? JSON.parse(existingSessions) : [];
      sessions.push(sessionData);
      
      if (sessions.length > 50) {
        sessions.splice(0, sessions.length - 50);
      }
      
      await AsyncStorage.setItem('mentalcheck_breathing_sessions', JSON.stringify(sessions));

      Alert.alert(
        "¡Sesión Completada!",
        `Has completado una sesión de ${selectedTechnique.name}. ¡Excelente trabajo!`,
        [
          { text: 'Volver', onPress: () => navigation.goBack() },
          { text: 'Otra Técnica', onPress: () => stopBreathingSession() }
        ]
      );
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar la sesión.", [{ text: 'OK' }]);
    }

    stopBreathingSession();
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && selectedTechnique) {
      interval = setInterval(() => {
        setPhaseTime(prev => {
          if (prev <= 1) {
            // Cambiar a la siguiente fase
            if (currentPhase === 'prepare') {
              setCurrentPhase('inhale');
              return selectedTechnique.inhale;
            } else if (currentPhase === 'inhale') {
              if (selectedTechnique.hold) {
                setCurrentPhase('hold');
                return selectedTechnique.hold;
              } else {
                setCurrentPhase('exhale');
                return selectedTechnique.exhale;
              }
            } else if (currentPhase === 'hold') {
              setCurrentPhase('exhale');
              return selectedTechnique.exhale;
            } else if (currentPhase === 'exhale') {
              if (selectedTechnique.pause) {
                setCurrentPhase('pause');
                return selectedTechnique.pause;
              } else {
                // Completar ciclo
                const newCycle = currentCycle + 1;
                setCurrentCycle(newCycle);
                setProgress(newCycle / selectedTechnique.cycles);
                
                if (newCycle >= selectedTechnique.cycles) {
                  completeSession();
                  return 0;
                } else {
                  setCurrentPhase('inhale');
                  return selectedTechnique.inhale;
                }
              }
            } else if (currentPhase === 'pause') {
              // Completar ciclo
              const newCycle = currentCycle + 1;
              setCurrentCycle(newCycle);
              setProgress(newCycle / selectedTechnique.cycles);
              
              if (newCycle >= selectedTechnique.cycles) {
                completeSession();
                return 0;
              } else {
                setCurrentPhase('inhale');
                return selectedTechnique.inhale;
              }
            }
            return prev;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, currentPhase, currentCycle, selectedTechnique]);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  };

  const getDayOfWeek = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  };

  const getPhaseInstruction = () => {
    switch (currentPhase) {
      case 'prepare':
        return '🧘‍♀️ Prepárate para comenzar...';
      case 'inhale':
        return '📥 Inhala profundamente';
      case 'hold':
        return '⏸️ Mantén la respiración';
      case 'exhale':
        return '📤 Exhala lentamente';
      case 'pause':
        return '⏹️ Pausa sin respirar';
      default:
        return '';
    }
  };

  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'prepare':
        return '#9E9E9E';
      case 'inhale':
        return '#4CAF50';
      case 'hold':
        return '#FF9800';
      case 'exhale':
        return '#2196F3';
      case 'pause':
        return '#9C27B0';
      default:
        return '#283750';
    }
  };

  if (isActive && selectedTechnique) {
    return (
      <View style={styles.container}>
        <View style={styles.activeSessionContainer}>
          {/* Header */}
          <View style={styles.activeHeader}>
            <Text style={styles.activeTitle}>{selectedTechnique.name}</Text>
            <Text style={styles.activeCycle}>
              Ciclo {currentCycle + 1} de {selectedTechnique.cycles}
            </Text>
          </View>

          {/* Progress */}
          <ProgressBar
            progress={progress}
            color={selectedTechnique.color}
            style={styles.progressBar}
          />

          {/* Main Breathing Circle */}
          <View style={styles.breathingCircleContainer}>
            <View style={[
              styles.breathingCircle,
              { 
                backgroundColor: getPhaseColor(),
                transform: [{ scale: currentPhase === 'inhale' ? 1.2 : 1 }]
              }
            ]}>
              <Text style={styles.phaseTime}>{phaseTime}</Text>
              <Text style={styles.phaseInstruction}>{getPhaseInstruction()}</Text>
            </View>
          </View>

          {/* Stop Button */}
          <Button
            mode="outlined"
            onPress={stopBreathingSession}
            style={styles.stopButton}
            textColor="#D32F2F"
            data-testid="button-stop-session"
          >
            Detener Sesión
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            icon="arrow-left"
            data-testid="button-back"
          >
            Atrás
          </Button>
          <Text style={styles.title}>Técnicas de Respiración</Text>
          <Text style={styles.subtitle}>Ejercicios guiados para reducir estrés y mejorar enfoque</Text>
        </View>

        {/* Breathing Techniques */}
        <View style={styles.techniquesContainer}>
          {BREATHING_TECHNIQUES.map((technique) => (
            <Card key={technique.id} style={styles.techniqueCard} elevation={3}>
              <Card.Content style={styles.techniqueContent}>
                <View style={styles.techniqueHeader}>
                  <View style={[styles.techniqueIcon, { backgroundColor: technique.color }]}>
                    <MaterialIcons name={technique.icon as any} size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.techniqueTitleContainer}>
                    <Text style={styles.techniqueName}>{technique.name}</Text>
                    <Text style={styles.techniqueDuration}>⏱️ ~{technique.duration} minutos</Text>
                  </View>
                </View>
                
                <Text style={styles.techniqueDescription}>{technique.description}</Text>
                
                <View style={styles.techniqueDetails}>
                  <Text style={styles.techniqueDetailsTitle}>Pasos del ejercicio:</Text>
                  <Text style={styles.techniqueSteps}>
                    📥 Inhala: {technique.inhale}s
                    {technique.hold ? ` → ⏸️ Mantén: ${technique.hold}s` : ''}
                    {` → 📤 Exhala: ${technique.exhale}s`}
                    {technique.pause ? ` → ⏹️ Pausa: ${technique.pause}s` : ''}
                  </Text>
                  <Text style={styles.techniqueCycles}>🔄 {technique.cycles} ciclos completos</Text>
                </View>
                
                <Button
                  mode="contained"
                  onPress={() => startBreathingSession(technique)}
                  style={[styles.techniqueButton, { backgroundColor: technique.color }]}
                  contentStyle={styles.techniqueButtonContent}
                  data-testid={`button-start-${technique.id}`}
                >
                  <MaterialIcons name="play-arrow" size={20} color="#FFFFFF" />
                  <Text style={styles.techniqueButtonText}>Comenzar Técnica</Text>
                </Button>
              </Card.Content>
            </Card>
          ))}
        </View>
        
        <View style={styles.bottomSpacing} />
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
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#283750',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  techniquesContainer: {
    paddingHorizontal: 16,
  },
  techniqueCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  techniqueContent: {
    padding: 20,
  },
  techniqueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  techniqueIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  techniqueTitleContainer: {
    flex: 1,
  },
  techniqueName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283750',
    marginBottom: 4,
  },
  techniqueDuration: {
    fontSize: 12,
    color: '#666666',
  },
  techniqueDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 16,
  },
  techniqueDetails: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  techniqueDetailsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#283750',
    marginBottom: 8,
  },
  techniqueSteps: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  techniqueCycles: {
    fontSize: 12,
    color: '#666666',
  },
  techniqueButton: {
    borderRadius: 8,
  },
  techniqueButtonContent: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  techniqueButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  // Active Session Styles
  activeSessionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  activeHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  activeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#283750',
    textAlign: 'center',
    marginBottom: 8,
  },
  activeCycle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginBottom: 48,
  },
  breathingCircleContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  breathingCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  phaseTime: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  phaseInstruction: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  stopButton: {
    borderColor: '#D32F2F',
    borderRadius: 8,
  },
  bottomSpacing: {
    height: 32,
  },
});

export default TecnicasRespiracionScreen;