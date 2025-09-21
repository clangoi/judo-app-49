import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Card, ProgressBar } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BienestarScreenProps {
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

interface WellnessTechnique {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  type: 'breathing' | 'mindfulness';
  inhale?: number;
  hold?: number;
  exhale?: number;
  pause?: number;
  cycles?: number;
  duration: number;
  steps?: string[];
}

const WELLNESS_TECHNIQUES: WellnessTechnique[] = [
  // Técnicas de Respiración (solo 2)
  { 
    id: '4-7-8', 
    name: 'Respiración 4-7-8', 
    description: 'Inhala 4 segundos, mantén 7, exhala 8. Ideal para relajación y dormir.',
    icon: 'air',
    color: '#1976D2',
    type: 'breathing',
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
    type: 'breathing',
    inhale: 4,
    hold: 4,
    exhale: 4,
    pause: 4,
    cycles: 6,
    duration: 4
  },
  // Técnicas de Mindfulness
  { 
    id: 'body_scan', 
    name: 'Exploración Corporal', 
    description: 'Conecta con tu cuerpo explorando las sensaciones de cada parte.',
    icon: 'accessibility',
    color: '#7B1FA2',
    type: 'mindfulness',
    duration: 10,
    steps: [
      'Siéntate o acuéstate cómodamente',
      'Cierra los ojos y respira profundamente 3 veces',
      'Enfoca tu atención en la parte superior de tu cabeza',
      'Siente cualquier sensación, tensión o relajación',
      'Mueve tu atención lentamente hacia tu frente',
      'Continúa bajando por tu rostro y cuello',
      'Observa tus hombros, ¿están tensos o relajados?',
      'Explora tus brazos hasta las puntas de los dedos',
      'Siente tu pecho subir y bajar al respirar',
      'Observa tu abdomen y espalda',
      'Nota las sensaciones en tus caderas',
      'Explora tus piernas hasta los pies',
      'Toma consciencia de todo tu cuerpo como un todo',
      'Respira profundamente y abre los ojos lentamente'
    ]
  },
  { 
    id: 'mindful_observation', 
    name: 'Observación Consciente', 
    description: 'Desarrolla atención plena observando un objeto con todos tus sentidos.',
    icon: 'visibility',
    color: '#F57C00',
    type: 'mindfulness',
    duration: 8,
    steps: [
      'Elige un objeto pequeño (fruta, piedra, flor)',
      'Siéntate cómodamente con el objeto en tus manos',
      'Observa el objeto como si fuera la primera vez',
      'Nota su forma, tamaño, peso y textura',
      'Observa sus colores y patrones',
      'Si tiene aroma, inhalalo conscientemente',
      'Explora su temperatura y superficie',
      'Si es comestible, nota su sabor lentamente',
      'Observa cualquier sonido que pueda hacer',
      'Nota los pensamientos que surgen, déjalos pasar',
      'Vuelve tu atención al objeto',
      'Agradece este momento de conexión consciente'
    ]
  },
  { 
    id: 'loving_kindness', 
    name: 'Bondad Amorosa', 
    description: 'Cultiva compasión y amor hacia ti mismo y otros.',
    icon: 'favorite',
    color: '#E91E63',
    type: 'mindfulness',
    duration: 12,
    steps: [
      'Siéntate cómodamente y cierra los ojos',
      'Respira profundamente varias veces',
      'Coloca una mano en tu corazón',
      'Repite: "Que sea feliz, que esté en paz"',
      'Siente amor y bondad hacia ti mismo',
      'Visualiza a alguien que amas',
      'Envíale estos deseos: "Que seas feliz, que estés en paz"',
      'Visualiza a un conocido neutral',
      'Extiende los mismos deseos hacia esta persona',
      'Piensa en alguien con quien tienes dificultades',
      'Trata de enviarle bondad: "Que seas feliz"',
      'Extiende estos deseos a todos los seres',
      'Termina enviándote amor a ti mismo nuevamente'
    ]
  },
  { 
    id: 'mindful_walking', 
    name: 'Caminata Consciente', 
    description: 'Practica atención plena mientras caminas lentamente.',
    icon: 'directions-walk',
    color: '#4CAF50',
    type: 'mindfulness',
    duration: 15,
    steps: [
      'Encuentra un espacio donde puedas caminar 10-20 pasos',
      'Párate al inicio, siente tus pies en el suelo',
      'Comienza a caminar muy lentamente',
      'Siente como levantas un pie',
      'Nota el movimiento del pie en el aire',
      'Siente como el pie toca el suelo',
      'Observa el peso transferirse de un pie al otro',
      'Mantén tu atención en las sensaciones de caminar',
      'Si tu mente divaga, regresa suavemente al caminar',
      'Al llegar al final, detente conscientemente',
      'Date la vuelta lentamente',
      'Continúa caminando en la dirección opuesta',
      'Practica por todo el tiempo que desees',
      'Termina parándote y sintiendo tu cuerpo quieto'
    ]
  },
  { 
    id: 'gratitude_meditation', 
    name: 'Meditación de Gratitud', 
    description: 'Cultiva apreciación y reconocimiento por lo bueno en tu vida.',
    icon: 'emoji-emotions',
    color: '#FF9800',
    type: 'mindfulness',
    duration: 8,
    steps: [
      'Siéntate cómodamente y cierra los ojos',
      'Respira profundamente tres veces',
      'Piensa en algo por lo que te sientes agradecido hoy',
      'Puede ser algo pequeño o grande',
      'Siente realmente la gratitud en tu cuerpo',
      'Piensa en una persona que aprecias',
      'Recuerda un momento específico con esa persona',
      'Siente agradecimiento por tener esa relación',
      'Piensa en tu cuerpo y su capacidad de sanarse',
      'Agradece a tu cuerpo por todo lo que hace',
      'Piensa en las oportunidades que tienes',
      'Termina con gratitud hacia ti mismo por practicar'
    ]
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
                value === rating ? { backgroundColor: '#283750' } : { borderColor: '#E0E0E0' }
              ]}
              contentStyle={styles.emojiButtonContent}
              data-testid={`emoji-${title.toLowerCase().replace(/\s+/g, '-')}-${rating}`}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
            </Button>
            <Text style={[
              styles.emojiLabel,
              value === rating ? { color: '#283750', fontWeight: 'bold' } : { color: '#666666' }
            ]}>
              {labels[index]}
            </Text>
          </View>
        );
      })}
    </View>
  </View>
);

const BienestarScreen: React.FC<BienestarScreenProps> = ({ navigation }) => {
  // Estados de evaluación
  const [evaluationCompleted, setEvaluationCompleted] = useState<boolean>(false);
  const [stressLevel, setStressLevel] = useState<number>(3);
  const [anxietyLevel, setAnxietyLevel] = useState<number>(3);
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [moodLevel, setMoodLevel] = useState<number>(3);

  // Estados de sesión
  const [selectedTechnique, setSelectedTechnique] = useState<WellnessTechnique | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  // Estados específicos para técnicas de respiración
  const [currentPhase, setCurrentPhase] = useState<string>('');
  const [phaseTime, setPhaseTime] = useState<number>(0);
  const [currentCycle, setCurrentCycle] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  // Estados específicos para técnicas de mindfulness
  const [currentStep, setCurrentStep] = useState<number>(0);

  const completeEvaluation = () => {
    setEvaluationCompleted(true);
  };

  const startTechniqueSession = (technique: WellnessTechnique) => {
    setSelectedTechnique(technique);
    setIsActive(true);
    setSessionStartTime(new Date());

    if (technique.type === 'breathing') {
      setCurrentPhase('prepare');
      setPhaseTime(3); // 3 segundos de preparación
      setCurrentCycle(0);
      setProgress(0);
    } else {
      setCurrentStep(0);
    }
  };

  const stopTechniqueSession = () => {
    setIsActive(false);
    setSelectedTechnique(null);
    setCurrentPhase('');
    setPhaseTime(0);
    setCurrentCycle(0);
    setProgress(0);
    setCurrentStep(0);
    setSessionStartTime(null);
  };

  const resetSessionOnly = () => {
    setSelectedTechnique(null);
    setIsActive(false);
    setCurrentPhase('');
    setPhaseTime(0);
    setCurrentCycle(0);
    setProgress(0);
    setCurrentStep(0);
    setSessionStartTime(null);
    // Mantener evaluationCompleted y datos de evaluación
  };

  const resetSession = () => {
    setSelectedTechnique(null);
    setIsActive(false);
    setCurrentPhase('');
    setPhaseTime(0);
    setCurrentCycle(0);
    setProgress(0);
    setCurrentStep(0);
    setSessionStartTime(null);
    setEvaluationCompleted(false);
    setStressLevel(3);
    setAnxietyLevel(3);
    setEnergyLevel(3);
    setMoodLevel(3);
  };

  const completeSession = async () => {
    if (!selectedTechnique || !sessionStartTime) return;

    const sessionData = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      techniqueType: selectedTechnique.id,
      techniqueName: selectedTechnique.name,
      category: selectedTechnique.type,
      durationMinutes: Math.round((Date.now() - sessionStartTime.getTime()) / 60000),
      completed: true,
      // Datos de evaluación inicial
      initialStressLevel: stressLevel,
      initialAnxietyLevel: anxietyLevel,
      initialEnergyLevel: energyLevel,
      initialMoodLevel: moodLevel,
      timeOfDay: getTimeOfDay(),
      dayOfWeek: getDayOfWeek(),
      // Datos específicos por tipo
      ...(selectedTechnique.type === 'breathing' ? { cycles: currentCycle } : { stepsCompleted: currentStep + 1 })
    };

    try {
      const existingSessions = await AsyncStorage.getItem('mentalcheck_wellness_sessions');
      const sessions = existingSessions ? JSON.parse(existingSessions) : [];
      sessions.push(sessionData);
      
      if (sessions.length > 50) {
        sessions.splice(0, sessions.length - 50);
      }
      
      await AsyncStorage.setItem('mentalcheck_wellness_sessions', JSON.stringify(sessions));

      Alert.alert(
        "¡Sesión Completada!",
        `Has completado "${selectedTechnique.name}". ¡Excelente trabajo!`,
        [
          { text: 'Volver', onPress: () => navigation.goBack() },
          { text: 'Otra Técnica', onPress: () => resetSessionOnly() }
        ]
      );
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar la sesión.", [{ text: 'OK' }]);
    }
  };

  const nextMindfulnessStep = () => {
    if (selectedTechnique && selectedTechnique.steps) {
      if (currentStep < selectedTechnique.steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        completeSession();
      }
    }
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

  // Lógica de respiración (copiada de TecnicasRespiracionScreen)
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && selectedTechnique && selectedTechnique.type === 'breathing') {
      interval = setInterval(() => {
        setPhaseTime(prev => {
          if (prev <= 1) {
            // Cambiar a la siguiente fase
            if (currentPhase === 'prepare') {
              setCurrentPhase('inhale');
              return selectedTechnique.inhale!;
            } else if (currentPhase === 'inhale') {
              if (selectedTechnique.hold) {
                setCurrentPhase('hold');
                return selectedTechnique.hold;
              } else {
                setCurrentPhase('exhale');
                return selectedTechnique.exhale!;
              }
            } else if (currentPhase === 'hold') {
              setCurrentPhase('exhale');
              return selectedTechnique.exhale!;
            } else if (currentPhase === 'exhale') {
              if (selectedTechnique.pause) {
                setCurrentPhase('pause');
                return selectedTechnique.pause;
              } else {
                // Completar ciclo
                const newCycle = currentCycle + 1;
                setCurrentCycle(newCycle);
                setProgress(newCycle / selectedTechnique.cycles!);
                
                if (newCycle >= selectedTechnique.cycles!) {
                  completeSession();
                  return 0;
                } else {
                  setCurrentPhase('inhale');
                  return selectedTechnique.inhale!;
                }
              }
            } else if (currentPhase === 'pause') {
              // Completar ciclo
              const newCycle = currentCycle + 1;
              setCurrentCycle(newCycle);
              setProgress(newCycle / selectedTechnique.cycles!);
              
              if (newCycle >= selectedTechnique.cycles!) {
                completeSession();
                return 0;
              } else {
                setCurrentPhase('inhale');
                return selectedTechnique.inhale!;
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
            <Text style={styles.title}>Evaluación de Bienestar</Text>
            <Text style={styles.subtitle}>
              Ayúdanos a entender tu estado actual para personalizar tu experiencia
            </Text>
          </View>

          {/* Nivel de Estrés */}
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <EmojiRating
                value={stressLevel}
                onChange={setStressLevel}
                emojis={['😌', '😕', '😰', '😫', '🤯']}
                labels={['Muy relajado', 'Poco', 'Moderado', 'Alto', 'Extremo']}
                title="¿Cómo está tu nivel de estrés?"
                description="Tu sensación de tensión o presión actual"
              />
            </Card.Content>
          </Card>

          {/* Nivel de Ansiedad */}
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <EmojiRating
                value={anxietyLevel}
                onChange={setAnxietyLevel}
                emojis={['😊', '😟', '😨', '😰', '😱']}
                labels={['Muy tranquilo', 'Poco inquieto', 'Nervioso', 'Ansioso', 'Muy ansioso']}
                title="¿Qué tan ansioso te sientes?"
                description="Tu nivel de preocupación o inquietud"
              />
            </Card.Content>
          </Card>

          {/* Nivel de Energía */}
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <EmojiRating
                value={energyLevel}
                onChange={setEnergyLevel}
                emojis={['😴', '😪', '😐', '😊', '🚀']}
                labels={['Agotado', 'Cansado', 'Normal', 'Energético', 'Muy activo']}
                title="¿Cómo está tu energía?"
                description="Tu nivel de vitalidad y disposición"
              />
            </Card.Content>
          </Card>

          {/* Estado de Ánimo */}
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <EmojiRating
                value={moodLevel}
                onChange={setMoodLevel}
                emojis={['😢', '😔', '😐', '😄', '😍']}
                labels={['Muy triste', 'Decaído', 'Neutral', 'Contento', 'Muy feliz']}
                title="¿Cómo está tu estado de ánimo?"
                description="Tu sensación emocional general ahora"
              />
            </Card.Content>
          </Card>

          {/* Continuar Button */}
          <Button
            mode="contained"
            onPress={completeEvaluation}
            style={styles.continueButton}
            buttonColor="#283750"
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

  // Pantalla de sesión activa de respiración
  if (isActive && selectedTechnique && selectedTechnique.type === 'breathing') {
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
            onPress={resetSessionOnly}
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

  // Pantalla de sesión activa de mindfulness
  if (isActive && selectedTechnique && selectedTechnique.type === 'mindfulness') {
    return (
      <View style={styles.container}>
        <View style={styles.sessionContainer}>
          {/* Header */}
          <View style={styles.sessionHeader}>
            <Text style={styles.sessionTitle}>{selectedTechnique.name}</Text>
            <Text style={styles.sessionProgress}>
              Paso {currentStep + 1} de {selectedTechnique.steps?.length}
            </Text>
          </View>

          {/* Step Card */}
          <Card style={styles.stepCard}>
            <Card.Content style={styles.stepContent}>
              <View style={[styles.stepIcon, { backgroundColor: selectedTechnique.color }]}>
                <MaterialIcons name={selectedTechnique.icon as any} size={40} color="#FFFFFF" />
              </View>
              
              <Text style={styles.stepNumber}>Paso {currentStep + 1}</Text>
              <Text style={styles.stepText}>{selectedTechnique.steps?.[currentStep]}</Text>
              
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
                  onPress={nextMindfulnessStep}
                  style={styles.nextButton}
                  buttonColor={selectedTechnique.color}
                  contentStyle={styles.nextButtonContent}
                  data-testid="button-next-step"
                >
                  {currentStep < (selectedTechnique.steps?.length || 0) - 1 ? 'Siguiente' : 'Finalizar'}
                </Button>
              </View>
            </Card.Content>
          </Card>

          {/* Progress Indicators */}
          <View style={styles.progressContainer}>
            {selectedTechnique.steps?.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor: index <= currentStep ? selectedTechnique.color : '#E0E0E0'
                  }
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    );
  }

  // Pantalla principal con lista de técnicas
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
          <Text style={styles.title}>Técnicas de Bienestar</Text>
          <Text style={styles.subtitle}>Respiración y mindfulness para tu bienestar mental</Text>
        </View>

        {/* Emergency Card */}
        <Card style={styles.emergencyCard}>
          <Card.Content style={styles.emergencyContent}>
            <View style={styles.emergencyHeader}>
              <MaterialIcons name="info" size={24} color="#1976D2" />
              <Text style={styles.emergencyTitle}>💡 Recomendación</Text>
            </View>
            <Text style={styles.emergencyText}>
              Practica estas técnicas regularmente para mejores resultados. Encuentra un lugar tranquilo donde no te interrumpan.
            </Text>
          </Card.Content>
        </Card>

        {/* Breathing Techniques Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>🫁 Técnicas de Respiración</Text>
          {WELLNESS_TECHNIQUES.filter(t => t.type === 'breathing').map((technique) => (
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
                  onPress={() => startTechniqueSession(technique)}
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

        {/* Mindfulness Techniques Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>🧘‍♀️ Técnicas de Mindfulness</Text>
          {WELLNESS_TECHNIQUES.filter(t => t.type === 'mindfulness').map((technique) => (
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
                
                <View style={styles.techniqueSteps}>
                  <Text style={styles.techniqueStepsTitle}>Guía paso a paso:</Text>
                  {technique.steps?.slice(0, 3).map((step, index) => (
                    <Text key={index} style={styles.techniqueStep}>
                      {index + 1}. {step}
                    </Text>
                  ))}
                  {technique.steps && technique.steps.length > 3 && (
                    <Text style={styles.techniqueMoreSteps}>
                      ... y {technique.steps.length - 3} pasos más
                    </Text>
                  )}
                </View>
                
                <Button
                  mode="contained"
                  onPress={() => startTechniqueSession(technique)}
                  style={[styles.techniqueButton, { backgroundColor: technique.color }]}
                  contentStyle={styles.techniqueButtonContent}
                  data-testid={`button-start-${technique.id}`}
                >
                  <MaterialIcons name="psychology" size={20} color="#FFFFFF" />
                  <Text style={styles.techniqueButtonText}>Comenzar Práctica</Text>
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
    backgroundColor: '#E3F2FD',
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
    color: '#1976D2',
    marginLeft: 8,
  },
  emergencyText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#283750',
    marginBottom: 16,
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
  // Active Session Styles (Breathing)
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
  // Session Styles (Mindfulness)
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
});

export default BienestarScreen;