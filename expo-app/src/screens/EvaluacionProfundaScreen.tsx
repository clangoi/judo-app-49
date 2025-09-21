import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Button, RadioButton, ProgressBar } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Question {
  id: number;
  category: string;
  question: string;
  options: { label: string; value: number }[];
}

interface EvaluationResult {
  id: string;
  date: string;
  scores: { [category: string]: number };
  totalScore: number;
  recommendations: string[];
  answers: { [questionId: number]: number };
}

interface EvaluacionProfundaScreenProps {
  navigation: any;
}

const EvaluacionProfundaScreen: React.FC<EvaluacionProfundaScreenProps> = ({ navigation }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);

  const questions: Question[] = [
    // Bienestar Emocional
    {
      id: 1,
      category: "Emocional",
      question: "¿Cómo describirías tu estado de ánimo general en la última semana?",
      options: [
        { label: "Muy negativo, me he sentido triste o deprimido la mayor parte del tiempo", value: 1 },
        { label: "Algo negativo, he tenido más días malos que buenos", value: 2 },
        { label: "Neutral, ni especialmente bueno ni malo", value: 3 },
        { label: "Positivo, me he sentido bien la mayor parte del tiempo", value: 4 },
        { label: "Muy positivo, me he sentido feliz y optimista", value: 5 }
      ]
    },
    {
      id: 2,
      category: "Emocional",
      question: "¿Con qué frecuencia has experimentado ansiedad o preocupación excesiva?",
      options: [
        { label: "Constantemente, casi todo el tiempo", value: 1 },
        { label: "Frecuentemente, varias veces al día", value: 2 },
        { label: "Ocasionalmente, algunas veces por semana", value: 3 },
        { label: "Raramente, solo en situaciones específicas", value: 4 },
        { label: "Nunca o casi nunca", value: 5 }
      ]
    },
    {
      id: 3,
      category: "Emocional",
      question: "¿Qué tan fácil te resulta manejar tus emociones cuando surgen problemas?",
      options: [
        { label: "Muy difícil, me siento abrumado/a", value: 1 },
        { label: "Difícil, necesito mucho esfuerzo", value: 2 },
        { label: "Moderado, a veces lo logro", value: 3 },
        { label: "Fácil, generalmente lo manejo bien", value: 4 },
        { label: "Muy fácil, tengo buen control emocional", value: 5 }
      ]
    },
    // Bienestar Físico
    {
      id: 4,
      category: "Físico",
      question: "¿Cómo calificarías tu nivel de energía durante el día?",
      options: [
        { label: "Muy bajo, me siento agotado/a constantemente", value: 1 },
        { label: "Bajo, frecuentemente me siento cansado/a", value: 2 },
        { label: "Moderado, tengo energía suficiente", value: 3 },
        { label: "Alto, me siento enérgico/a la mayor parte del tiempo", value: 4 },
        { label: "Muy alto, tengo mucha energía y vitalidad", value: 5 }
      ]
    },
    {
      id: 5,
      category: "Físico",
      question: "¿Cómo ha sido la calidad de tu sueño en la última semana?",
      options: [
        { label: "Muy mala, insomnio frecuente o sueño muy interrumpido", value: 1 },
        { label: "Mala, dificultades para dormir o descansar", value: 2 },
        { label: "Regular, duermo pero no me siento descansado/a", value: 3 },
        { label: "Buena, duermo bien la mayoría de las noches", value: 4 },
        { label: "Excelente, duermo profundamente y me despierto descansado/a", value: 5 }
      ]
    },
    {
      id: 6,
      category: "Físico",
      question: "¿Has experimentado síntomas físicos relacionados con el estrés (dolores de cabeza, tensión muscular, problemas digestivos)?",
      options: [
        { label: "Constantemente, síntomas severos", value: 1 },
        { label: "Frecuentemente, síntomas moderados", value: 2 },
        { label: "Ocasionalmente, síntomas leves", value: 3 },
        { label: "Raramente, síntomas muy leves", value: 4 },
        { label: "Nunca o casi nunca", value: 5 }
      ]
    },
    // Relaciones Sociales
    {
      id: 7,
      category: "Social",
      question: "¿Qué tan satisfecho/a estás con tus relaciones personales (familia, amigos, pareja)?",
      options: [
        { label: "Muy insatisfecho/a, siento que no tengo apoyo", value: 1 },
        { label: "Insatisfecho/a, mis relaciones me generan estrés", value: 2 },
        { label: "Neutral, algunas relaciones están bien", value: 3 },
        { label: "Satisfecho/a, tengo buenas relaciones", value: 4 },
        { label: "Muy satisfecho/a, mis relaciones son una fuente de alegría", value: 5 }
      ]
    },
    {
      id: 8,
      category: "Social",
      question: "¿Con qué frecuencia te sientes solo/a o aislado/a?",
      options: [
        { label: "Constantemente, me siento muy solo/a", value: 1 },
        { label: "Frecuentemente, a menudo me siento aislado/a", value: 2 },
        { label: "Ocasionalmente, a veces me siento solo/a", value: 3 },
        { label: "Raramente, solo en momentos específicos", value: 4 },
        { label: "Nunca, me siento conectado/a con otros", value: 5 }
      ]
    },
    // Estrés y Manejo
    {
      id: 9,
      category: "Estrés",
      question: "¿Cómo calificarías tu nivel de estrés actual?",
      options: [
        { label: "Extremadamente alto, me siento abrumado/a", value: 1 },
        { label: "Alto, frecuentemente me siento estresado/a", value: 2 },
        { label: "Moderado, estrés manejable", value: 3 },
        { label: "Bajo, pocas situaciones me estresan", value: 4 },
        { label: "Muy bajo, rara vez me siento estresado/a", value: 5 }
      ]
    },
    {
      id: 10,
      category: "Estrés",
      question: "¿Qué tan efectivas son tus estrategias actuales para manejar el estrés?",
      options: [
        { label: "Nada efectivas, no sé cómo manejar el estrés", value: 1 },
        { label: "Poco efectivas, me cuesta mucho trabajo", value: 2 },
        { label: "Moderadamente efectivas, a veces funcionan", value: 3 },
        { label: "Efectivas, generalmente manejo bien el estrés", value: 4 },
        { label: "Muy efectivas, tengo excelentes herramientas", value: 5 }
      ]
    },
    // Satisfacción y Propósito
    {
      id: 11,
      category: "Propósito",
      question: "¿Qué tan satisfecho/a te sientes con tu vida en general?",
      options: [
        { label: "Muy insatisfecho/a, siento que mi vida no tiene sentido", value: 1 },
        { label: "Insatisfecho/a, muchas áreas de mi vida no van bien", value: 2 },
        { label: "Neutral, algunas cosas van bien, otras no", value: 3 },
        { label: "Satisfecho/a, en general mi vida va bien", value: 4 },
        { label: "Muy satisfecho/a, me siento pleno/a y realizado/a", value: 5 }
      ]
    },
    {
      id: 12,
      category: "Propósito",
      question: "¿Sientes que tienes un propósito claro en la vida?",
      options: [
        { label: "Para nada, me siento completamente perdido/a", value: 1 },
        { label: "Poco, frecuentemente me pregunto para qué vivo", value: 2 },
        { label: "Algo, tengo algunas ideas pero no muy claras", value: 3 },
        { label: "Bastante, tengo una dirección clara", value: 4 },
        { label: "Completamente, tengo un propósito muy claro", value: 5 }
      ]
    },
    // Autocuidado
    {
      id: 13,
      category: "Autocuidado",
      question: "¿Con qué frecuencia practicas actividades de autocuidado (ejercicio, hobbies, relajación)?",
      options: [
        { label: "Nunca, no tengo tiempo o no las priorizo", value: 1 },
        { label: "Raramente, solo cuando tengo tiempo libre", value: 2 },
        { label: "Ocasionalmente, algunas veces por semana", value: 3 },
        { label: "Frecuentemente, la mayoría de los días", value: 4 },
        { label: "Diariamente, es una prioridad en mi vida", value: 5 }
      ]
    },
    {
      id: 14,
      category: "Autocuidado",
      question: "¿Qué tan bueno eres estableciendo límites saludables con otros?",
      options: [
        { label: "Muy malo, siempre digo que sí a todo", value: 1 },
        { label: "Malo, me cuesta mucho decir que no", value: 2 },
        { label: "Regular, a veces establezco límites", value: 3 },
        { label: "Bueno, generalmente mantengo límites saludables", value: 4 },
        { label: "Excelente, tengo límites claros y los respeto", value: 5 }
      ]
    },
    {
      id: 15,
      category: "Futuro",
      question: "¿Cómo te sientes respecto al futuro?",
      options: [
        { label: "Muy pesimista, no veo mejoras posibles", value: 1 },
        { label: "Pesimista, me preocupa lo que pueda pasar", value: 2 },
        { label: "Neutral, no pienso mucho en el futuro", value: 3 },
        { label: "Optimista, creo que las cosas van a mejorar", value: 4 },
        { label: "Muy optimista, estoy emocionado/a por lo que viene", value: 5 }
      ]
    }
  ];

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const goToNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      calculateResults();
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateResults = () => {
    // Calcular puntuaciones por categoría
    const categoryScores: { [category: string]: number[] } = {};
    
    questions.forEach(question => {
      const answer = answers[question.id];
      if (answer) {
        if (!categoryScores[question.category]) {
          categoryScores[question.category] = [];
        }
        categoryScores[question.category].push(answer);
      }
    });

    // Calcular promedio por categoría
    const scores: { [category: string]: number } = {};
    Object.keys(categoryScores).forEach(category => {
      const categoryAnswers = categoryScores[category];
      scores[category] = categoryAnswers.reduce((sum, score) => sum + score, 0) / categoryAnswers.length;
    });

    // Calcular puntuación total
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;

    // Generar recomendaciones
    const recommendations = generateRecommendations(scores, totalScore);

    const result: EvaluationResult = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      scores,
      totalScore,
      recommendations,
      answers
    };

    setEvaluationResult(result);
    saveEvaluation(result);
    setShowResults(true);
  };

  const generateRecommendations = (scores: { [category: string]: number }, totalScore: number): string[] => {
    const recommendations: string[] = [];

    // Recomendaciones generales basadas en puntuación total
    if (totalScore < 2.5) {
      recommendations.push("Considera buscar apoyo profesional. Tu bienestar general está en un nivel que requiere atención.");
      recommendations.push("Practica técnicas de relajación diariamente para reducir el estrés.");
    } else if (totalScore < 3.5) {
      recommendations.push("Hay áreas de tu bienestar que podrían mejorar. Identifica las más importantes para ti.");
      recommendations.push("Establece una rutina de autocuidado que incluya actividades que disfrutes.");
    } else if (totalScore < 4.5) {
      recommendations.push("Tu bienestar general está bien, pero siempre hay espacio para crecer.");
      recommendations.push("Mantén las prácticas positivas que ya tienes y considera agregar nuevas.");
    } else {
      recommendations.push("¡Excelente! Tu bienestar general está en un muy buen nivel.");
      recommendations.push("Continúa con las estrategias que te están funcionando bien.");
    }

    // Recomendaciones específicas por categoría
    Object.entries(scores).forEach(([category, score]) => {
      if (score < 3) {
        switch (category) {
          case "Emocional":
            recommendations.push("Considera practicar mindfulness o meditación para mejorar tu bienestar emocional.");
            break;
          case "Físico":
            recommendations.push("Prioriza un mejor sueño y considera hacer ejercicio regular.");
            break;
          case "Social":
            recommendations.push("Invierte tiempo en fortalecer tus relaciones sociales.");
            break;
          case "Estrés":
            recommendations.push("Desarrolla mejores estrategias de manejo del estrés.");
            break;
          case "Propósito":
            recommendations.push("Reflexiona sobre tus valores y objetivos de vida.");
            break;
          case "Autocuidado":
            recommendations.push("Dedica más tiempo a actividades de autocuidado.");
            break;
          case "Futuro":
            recommendations.push("Practica ejercicios de visualización positiva del futuro.");
            break;
        }
      }
    });

    return recommendations;
  };

  const saveEvaluation = async (result: EvaluationResult) => {
    try {
      const stored = await AsyncStorage.getItem('deep-evaluations');
      const evaluations = stored ? JSON.parse(stored) : [];
      evaluations.unshift(result);
      
      // Mantener solo las últimas 10 evaluaciones
      if (evaluations.length > 10) {
        evaluations.splice(10);
      }
      
      await AsyncStorage.setItem('deep-evaluations', JSON.stringify(evaluations));
    } catch (error) {
      console.error('Error saving evaluation:', error);
    }
  };

  const resetEvaluation = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setEvaluationResult(null);
  };

  const getScoreColor = (score: number) => {
    if (score < 2.5) return '#D32F2F';
    if (score < 3.5) return '#FF8C00';
    if (score < 4.5) return '#1976D2';
    return '#388E3C';
  };

  const getScoreLabel = (score: number) => {
    if (score < 2.5) return 'Necesita Atención';
    if (score < 3.5) return 'Puede Mejorar';
    if (score < 4.5) return 'Bien';
    return 'Excelente';
  };

  if (showResults && evaluationResult) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.headerResult}>
            <MaterialIcons name="assessment" size={48} color="#7B1FA2" />
            <Text style={styles.titleResult}>Resultados de tu Evaluación</Text>
            <Text style={styles.subtitleResult}>
              Evaluación completada el {new Date(evaluationResult.date).toLocaleDateString()}
            </Text>
          </View>

          {/* Puntuación General */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Puntuación General</Text>
              <View style={styles.totalScoreContainer}>
                <Text style={[styles.totalScoreNumber, { color: getScoreColor(evaluationResult.totalScore) }]}>
                  {evaluationResult.totalScore.toFixed(1)}/5.0
                </Text>
                <Text style={[styles.totalScoreLabel, { color: getScoreColor(evaluationResult.totalScore) }]}>
                  {getScoreLabel(evaluationResult.totalScore)}
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Puntuaciones por Categoría */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Análisis por Área</Text>
              {Object.entries(evaluationResult.scores).map(([category, score]) => (
                <View key={category} style={styles.categoryScore}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryName}>{category}</Text>
                    <Text style={[styles.categoryValue, { color: getScoreColor(score) }]}>
                      {score.toFixed(1)}
                    </Text>
                  </View>
                  <ProgressBar 
                    progress={score / 5} 
                    color={getScoreColor(score)} 
                    style={styles.progressBar}
                  />
                </View>
              ))}
            </Card.Content>
          </Card>

          {/* Recomendaciones */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Recomendaciones Personalizadas</Text>
              {evaluationResult.recommendations.map((recommendation, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Text style={styles.recommendationText}>• {recommendation}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>

          <View style={styles.buttonsContainer}>
            <Button
              mode="outlined"
              onPress={resetEvaluation}
              style={styles.button}
              icon={({ size, color }) => (
                <MaterialIcons name="refresh" size={size} color={color} />
              )}
            >
              Nueva Evaluación
            </Button>
            
            <Button
              mode="contained"
              onPress={() => navigation.goBack()}
              style={styles.button}
              buttonColor="#7B1FA2"
              icon={({ size, color }) => (
                <MaterialIcons name="home" size={size} color={color} />
              )}
            >
              Volver al Inicio
            </Button>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = (currentQuestion + 1) / questions.length;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Header con progreso */}
        <View style={styles.header}>
          <Text style={styles.title}>Evaluación Profunda</Text>
          <Text style={styles.progressText}>
            Pregunta {currentQuestion + 1} de {questions.length}
          </Text>
          <ProgressBar progress={progress} color="#7B1FA2" style={styles.progressBarHeader} />
        </View>

        {/* Pregunta actual */}
        <Card style={styles.questionCard}>
          <Card.Content>
            <Text style={styles.categoryTag}>{currentQ.category}</Text>
            <Text style={styles.questionText}>{currentQ.question}</Text>
            
            <View style={styles.optionsContainer}>
              {currentQ.options.map((option, index) => (
                <View key={index} style={styles.optionRow}>
                  <RadioButton
                    value={option.value.toString()}
                    status={answers[currentQ.id] === option.value ? 'checked' : 'unchecked'}
                    onPress={() => handleAnswer(currentQ.id, option.value)}
                    color="#7B1FA2"
                  />
                  <Text 
                    style={styles.optionText}
                    onPress={() => handleAnswer(currentQ.id, option.value)}
                  >
                    {option.label}
                  </Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Botones de navegación */}
        <View style={styles.navigationButtons}>
          <Button
            mode="outlined"
            onPress={goToPreviousQuestion}
            disabled={currentQuestion === 0}
            style={styles.navButton}
            icon={({ size, color }) => (
              <MaterialIcons name="chevron-left" size={size} color={color} />
            )}
          >
            Anterior
          </Button>
          
          <Button
            mode="contained"
            onPress={goToNextQuestion}
            disabled={!answers[currentQ.id]}
            style={styles.navButton}
            buttonColor="#7B1FA2"
            icon={({ size, color }) => (
              <MaterialIcons name={currentQuestion === questions.length - 1 ? "check" : "chevron-right"} size={size} color={color} />
            )}
          >
            {currentQuestion === questions.length - 1 ? 'Finalizar' : 'Siguiente'}
          </Button>
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
  headerResult: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#283750',
    marginBottom: 8,
  },
  titleResult: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#283750',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitleResult: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  progressText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  progressBarHeader: {
    height: 6,
    borderRadius: 3,
  },
  questionCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  categoryTag: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#7B1FA2',
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  questionText: {
    fontSize: 16,
    color: '#283750',
    lineHeight: 24,
    marginBottom: 20,
    fontWeight: '500',
  },
  optionsContainer: {
    gap: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: '#283750',
    lineHeight: 20,
    marginLeft: 8,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 12,
  },
  navButton: {
    flex: 1,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#283750',
    marginBottom: 16,
  },
  totalScoreContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  totalScoreNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  totalScoreLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryScore: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#283750',
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  recommendationItem: {
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 14,
    color: '#283750',
    lineHeight: 20,
  },
  buttonsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  button: {
    borderRadius: 8,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default EvaluacionProfundaScreen;