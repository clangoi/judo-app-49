import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ManejoCrisisScreenProps {
  navigation: any;
}

interface EmojiRatingProps {
  value: number;
  onChange: (value: number) => void;
  emojis: string[];
  labels: string[];
  title: string;
  description: string;
}

interface CrisisTechnique {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  steps: string[];
  duration: string;
}

const CRISIS_TECHNIQUES: CrisisTechnique[] = [
  {
    id: 'breathing_4_7_8',
    name: 'Respiración 4-7-8',
    description: 'Técnica rápida para calmar la ansiedad y el pánico en pocos minutos',
    icon: 'air',
    color: '#2196F3',
    steps: [
      'Exhala completamente por la boca',
      'Cierra la boca e inhala por la nariz durante 4 segundos',
      'Mantén la respiración durante 7 segundos',
      'Exhala por la boca durante 8 segundos',
      'Repite 4 ciclos'
    ],
    duration: '2-3 minutos'
  },
  {
    id: 'grounding_5_4_3_2_1',
    name: 'Técnica 5-4-3-2-1',
    description: 'Usa tus 5 sentidos para volver al momento presente durante crisis de ansiedad',
    icon: 'psychology',
    color: '#4CAF50',
    steps: [
      'Identifica 5 cosas que puedes VER a tu alrededor',
      'Identifica 4 cosas que puedes TOCAR',
      'Identifica 3 cosas que puedes ESCUCHAR',
      'Identifica 2 cosas que puedes OLER',
      'Identifica 1 cosa que puedes SABOREAR'
    ],
    duration: '3-5 minutos'
  },
  {
    id: 'progressive_relaxation',
    name: 'Relajación Progresiva',
    description: 'Libera la tensión física para calmar la mente durante momentos de crisis',
    icon: 'self-improvement',
    color: '#9C27B0',
    steps: [
      'Siéntate o acuéstate cómodamente',
      'Tensa los músculos de los pies durante 5 segundos, luego relaja',
      'Sube por las piernas, abdomen, brazos, cuello y cara',
      'Tensa cada grupo muscular 5 segundos y relaja',
      'Respira profundamente entre cada grupo muscular'
    ],
    duration: '5-10 minutos'
  },
  {
    id: 'safe_visualization',
    name: 'Visualización del Lugar Seguro',
    description: 'Crea un refugio mental para encontrar calma en momentos de crisis intensa',
    icon: 'landscape',
    color: '#FF9800',
    steps: [
      'Cierra los ojos y respira profundamente',
      'Imagina un lugar donde te sientes completamente seguro',
      'Visualiza todos los detalles: colores, sonidos, olores',
      'Siente la paz y seguridad de ese lugar',
      'Permanece allí hasta que te sientas más calmado'
    ],
    duration: '5-15 minutos'
  }
];

const EmojiRating: React.FC<EmojiRatingProps> = ({ 
  value, 
  onChange, 
  emojis, 
  labels, 
  title, 
  description 
}) => (
  <View style={styles.ratingContainer}>
    <Text style={styles.ratingTitle}>{title}</Text>
    <Text style={styles.ratingDescription}>{description}</Text>
    
    <View style={styles.emojisContainer}>
      {emojis.map((emoji, index) => {
        const rating = index + 1;
        return (
          <View key={index} style={styles.emojiItem}>
            <Button
              mode={value === rating ? 'contained' : 'outlined'}
              onPress={() => onChange(rating)}
              style={[
                styles.emojiButton,
                value === rating ? { backgroundColor: '#D32F2F' } : { borderColor: '#E0E0E0' }
              ]}
              contentStyle={styles.emojiButtonContent}
              data-testid={`emoji-${title.toLowerCase().replace(/\s+/g, '-')}-${rating}`}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
            </Button>
            <Text style={[
              styles.emojiLabel,
              value === rating ? { color: '#D32F2F', fontWeight: 'bold' } : { color: '#666666' }
            ]}>
              {labels[index]}
            </Text>
          </View>
        );
      })}
    </View>
  </View>
);

const ManejoCrisisScreen: React.FC<ManejoCrisisScreenProps> = ({ navigation }) => {
  const [currentTechnique, setCurrentTechnique] = useState<CrisisTechnique | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [sessionStarted, setSessionStarted] = useState<boolean>(false);
  
  // Estados para evaluación inicial
  const [evaluationCompleted, setEvaluationCompleted] = useState<boolean>(false);
  const [intensityLevel, setIntensityLevel] = useState<number>(3);
  const [physicalSymptoms, setPhysicalSymptoms] = useState<number>(3);
  const [emotionalState, setEmotionalState] = useState<number>(3);
  const [copingCapacity, setCopingCapacity] = useState<number>(3);

  const startTechnique = (technique: CrisisTechnique) => {
    setCurrentTechnique(technique);
    setCurrentStep(0);
    setSessionStarted(true);
  };

  const nextStep = () => {
    if (currentTechnique && currentStep < currentTechnique.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTechnique();
    }
  };

  const completeEvaluation = () => {
    setEvaluationCompleted(true);
  };

  const completeTechnique = async () => {
    if (!currentTechnique) return;

    const sessionData = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      techniqueType: currentTechnique.id,
      techniqueName: currentTechnique.name,
      completed: true,
      stepsCompleted: currentStep + 1,
      totalSteps: currentTechnique.steps.length,
      // Datos de evaluación inicial
      initialIntensityLevel: intensityLevel,
      initialPhysicalSymptoms: physicalSymptoms,
      initialEmotionalState: emotionalState,
      initialCopingCapacity: copingCapacity,
      timeOfDay: getTimeOfDay(),
      dayOfWeek: getDayOfWeek(),
    };

    try {
      const existingSessions = await AsyncStorage.getItem('mentalcheck_crisis_sessions');
      const sessions = existingSessions ? JSON.parse(existingSessions) : [];
      sessions.push(sessionData);
      
      if (sessions.length > 50) {
        sessions.splice(0, sessions.length - 50);
      }
      
      await AsyncStorage.setItem('mentalcheck_crisis_sessions', JSON.stringify(sessions));

      Alert.alert(
        "¡Técnica Completada!",
        `Has completado la técnica "${currentTechnique.name}". Esperamos que te sientas mejor.`,
        [
          { text: 'Volver', onPress: () => navigation.goBack() },
          { text: 'Otra Técnica', onPress: () => resetSessionOnly() }
        ]
      );
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar la sesión.", [{ text: 'OK' }]);
    }
  };

  const resetSessionOnly = () => {
    setCurrentTechnique(null);
    setCurrentStep(0);
    setSessionStarted(false);
    // Mantener evaluationCompleted y datos de evaluación
  };

  const resetSession = () => {
    setCurrentTechnique(null);
    setCurrentStep(0);
    setSessionStarted(false);
    setEvaluationCompleted(false);
    setIntensityLevel(3);
    setPhysicalSymptoms(3);
    setEmotionalState(3);
    setCopingCapacity(3);
  };

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

  // Pantalla de evaluación inicial
  if (!evaluationCompleted) {
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
            <Text style={styles.title}>Evaluación de Crisis</Text>
            <Text style={styles.subtitle}>
              Ayúdanos a entender tu situación actual para recomendarte la mejor técnica
            </Text>
          </View>

          {/* Intensidad de Crisis */}
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <EmojiRating
                value={intensityLevel}
                onChange={setIntensityLevel}
                emojis={['😌', '😟', '😰', '😨', '🆘']}
                labels={['Muy leve', 'Leve', 'Moderada', 'Intensa', 'Extrema']}
                title="¿Qué tan intensa sientes la crisis ahora?"
                description="Nivel de malestar emocional que experimentas"
              />
            </Card.Content>
          </Card>

          {/* Síntomas Físicos */}
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <EmojiRating
                value={physicalSymptoms}
                onChange={setPhysicalSymptoms}
                emojis={['💚', '💛', '🧡', '❤️', '💔']}
                labels={['Ninguno', 'Leves', 'Moderados', 'Intensos', 'Muy intensos']}
                title="¿Tienes síntomas físicos?"
                description="Tensión, palpitaciones, sudoración, temblores, etc."
              />
            </Card.Content>
          </Card>

          {/* Estado Emocional */}
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <EmojiRating
                value={emotionalState}
                onChange={setEmotionalState}
                emojis={['😊', '😕', '😔', '😰', '😭']}
                labels={['Tranquilo', 'Inquieto', 'Triste', 'Ansioso', 'Desesperado']}
                title="¿Cómo describirías tu estado emocional?"
                description="La emoción principal que sientes ahora"
              />
            </Card.Content>
          </Card>

          {/* Capacidad de Afrontamiento */}
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <EmojiRating
                value={copingCapacity}
                onChange={setCopingCapacity}
                emojis={['🌊', '⛅', '🌤️', '☀️', '🌈']}
                labels={['Abrumado', 'Limitado', 'Suficiente', 'Bueno', 'Excelente']}
                title="¿Qué tan capaz te sientes de manejar esto?"
                description="Tu confianza en tu capacidad actual de afrontamiento"
              />
            </Card.Content>
          </Card>

          {/* Continuar Button */}
          <Button
            mode="contained"
            onPress={completeEvaluation}
            style={styles.continueButton}
            buttonColor="#D32F2F"
            contentStyle={styles.continueButtonContent}
            data-testid="button-complete-evaluation"
          >
            <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
            <Text style={styles.continueButtonText}>Ver Técnicas Disponibles</Text>
          </Button>
          
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    );
  }

  if (sessionStarted && currentTechnique) {
    return (
      <View style={styles.container}>
        <View style={styles.sessionContainer}>
          {/* Header */}
          <View style={styles.sessionHeader}>
            <Text style={styles.sessionTitle}>{currentTechnique.name}</Text>
            <Text style={styles.sessionProgress}>
              Paso {currentStep + 1} de {currentTechnique.steps.length}
            </Text>
          </View>

          {/* Current Step */}
          <Card style={styles.stepCard} elevation={4}>
            <Card.Content style={styles.stepContent}>
              <View style={[styles.stepIcon, { backgroundColor: currentTechnique.color }]}>
                <MaterialIcons name={currentTechnique.icon as any} size={48} color="#FFFFFF" />
              </View>
              
              <Text style={styles.stepNumber}>Paso {currentStep + 1}</Text>
              <Text style={styles.stepText}>{currentTechnique.steps[currentStep]}</Text>
              
              <View style={styles.stepActions}>
                <Button
                  mode="outlined"
                  onPress={resetSessionOnly}
                  style={styles.cancelButton}
                  textColor="#D32F2F"
                  data-testid="button-cancel-session"
                >
                  Detener
                </Button>
                
                <Button
                  mode="contained"
                  onPress={nextStep}
                  style={[styles.nextButton, { backgroundColor: currentTechnique.color }]}
                  contentStyle={styles.nextButtonContent}
                  data-testid="button-next-step"
                >
                  {currentStep < currentTechnique.steps.length - 1 ? 'Siguiente Paso' : 'Completar'}
                </Button>
              </View>
            </Card.Content>
          </Card>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            {currentTechnique.steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor: index <= currentStep ? currentTechnique.color : '#E0E0E0'
                  }
                ]}
              />
            ))}
          </View>
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
          <Text style={styles.title}>Manejo de Crisis</Text>
          <Text style={styles.subtitle}>
            Técnicas de emergencia para momentos de alta ansiedad, pánico o estrés intenso
          </Text>
        </View>

        {/* Emergency Notice */}
        <Card style={styles.emergencyCard} elevation={2}>
          <Card.Content style={styles.emergencyContent}>
            <View style={styles.emergencyHeader}>
              <MaterialIcons name="emergency" size={24} color="#D32F2F" />
              <Text style={styles.emergencyTitle}>¿Te sientes en crisis?</Text>
            </View>
            <Text style={styles.emergencyText}>
              Estas técnicas pueden ayudarte a recuperar el control. Si sientes que necesitas ayuda profesional inmediata, no dudes en contactar a un profesional de la salud mental.
            </Text>
          </Card.Content>
        </Card>

        {/* Crisis Techniques */}
        <View style={styles.techniquesContainer}>
          {CRISIS_TECHNIQUES.map((technique) => (
            <Card key={technique.id} style={styles.techniqueCard} elevation={3}>
              <Card.Content style={styles.techniqueContent}>
                <View style={styles.techniqueHeader}>
                  <View style={[styles.techniqueIcon, { backgroundColor: technique.color }]}>
                    <MaterialIcons name={technique.icon as any} size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.techniqueTitleContainer}>
                    <Text style={styles.techniqueName}>{technique.name}</Text>
                    <Text style={styles.techniqueDuration}>⏱️ {technique.duration}</Text>
                  </View>
                </View>
                
                <Text style={styles.techniqueDescription}>{technique.description}</Text>
                
                <View style={styles.techniqueSteps}>
                  <Text style={styles.techniqueStepsTitle}>Qué harás:</Text>
                  {technique.steps.slice(0, 3).map((step, index) => (
                    <Text key={index} style={styles.techniqueStep}>
                      {index + 1}. {step}
                    </Text>
                  ))}
                  {technique.steps.length > 3 && (
                    <Text style={styles.techniqueMoreSteps}>
                      ... y {technique.steps.length - 3} pasos más
                    </Text>
                  )}
                </View>
                
                <Button
                  mode="contained"
                  onPress={() => startTechnique(technique)}
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
  emergencyCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
  },
  emergencyContent: {
    padding: 16,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D32F2F',
    marginLeft: 8,
  },
  emergencyText: {
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
  techniqueSteps: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  techniqueStepsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#283750',
    marginBottom: 8,
  },
  techniqueStep: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  techniqueMoreSteps: {
    fontSize: 12,
    color: '#888888',
    fontStyle: 'italic',
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
  // Session Styles
  sessionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  sessionHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  sessionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#283750',
    textAlign: 'center',
    marginBottom: 8,
  },
  sessionProgress: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  stepCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 32,
  },
  stepContent: {
    padding: 32,
    alignItems: 'center',
  },
  stepIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  stepText: {
    fontSize: 18,
    color: '#283750',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
  },
  stepActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    borderColor: '#D32F2F',
    borderRadius: 8,
  },
  nextButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 8,
  },
  nextButtonContent: {
    height: 48,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  bottomSpacing: {
    height: 32,
  },
  // Evaluation Styles
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  cardContent: {
    padding: 20,
  },
  ratingContainer: {
    marginBottom: 8,
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283750',
    marginBottom: 4,
  },
  ratingDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  emojisContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emojiItem: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 2,
  },
  emojiButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  emojiButtonContent: {
    height: 50,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 20,
  },
  emojiLabel: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 12,
  },
  continueButton: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  continueButtonContent: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});

export default ManejoCrisisScreen;