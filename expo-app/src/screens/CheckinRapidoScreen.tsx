import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Card, TextInput } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CheckinRapidoScreenProps {
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

const CheckinRapidoScreen: React.FC<CheckinRapidoScreenProps> = ({ navigation }) => {
  const [currentMood, setCurrentMood] = useState<number>(3);
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [stressLevel, setStressLevel] = useState<number>(3);
  const [quickNote, setQuickNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const saveCheckIn = async () => {
    setIsSubmitting(true);
    
    try {
      const checkInData = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        currentMood,
        energyLevel,
        stressLevel,
        quickNote,
        timeOfDay: getTimeOfDay(),
        dayOfWeek: getDayOfWeek(),
      };

      // Obtener check-ins existentes
      const existingCheckIns = await AsyncStorage.getItem('mentalcheck_checkins');
      const checkIns = existingCheckIns ? JSON.parse(existingCheckIns) : [];
      
      // Agregar nuevo check-in
      checkIns.push(checkInData);
      
      // Mantener solo los últimos 50 check-ins
      if (checkIns.length > 50) {
        checkIns.splice(0, checkIns.length - 50);
      }
      
      // Guardar en AsyncStorage
      await AsyncStorage.setItem('mentalcheck_checkins', JSON.stringify(checkIns));

      Alert.alert(
        "¡Check-in Completado!",
        "Gracias por registrar cómo te sientes. Tu bienestar es importante.",
        [
          { 
            text: 'Ver Resumen', 
            onPress: () => navigation.navigate('MentalCheck') 
          },
          { 
            text: 'Hacer Otro', 
            onPress: () => {
              setCurrentMood(3);
              setEnergyLevel(3);
              setStressLevel(3);
              setQuickNote('');
            }
          }
        ]
      );
      
    } catch (error) {
      Alert.alert(
        "Error",
        "No se pudo guardar tu check-in. Inténtalo nuevamente.",
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
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
          <Text style={styles.title}>Check-in Rápido</Text>
          <Text style={styles.subtitle}>Solo toma 30 segundos registrar cómo te sientes</Text>
        </View>

        {/* Quick Questions */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <EmojiRating
              value={currentMood}
              onChange={setCurrentMood}
              emojis={['😰', '😔', '😐', '😊', '😄']}
              labels={['Muy mal', 'Mal', 'Normal', 'Bien', 'Excelente']}
              title="¿Cómo te sientes ahora?"
              description="Tu estado de ánimo en este momento"
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <EmojiRating
              value={energyLevel}
              onChange={setEnergyLevel}
              emojis={['🪫', '🔋', '🔋', '🔋', '⚡']}
              labels={['Sin energía', 'Poca', 'Normal', 'Buena', 'Mucha energía']}
              title="¿Cuál es tu nivel de energía?"
              description="Qué tan activo te sientes"
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <EmojiRating
              value={stressLevel}
              onChange={setStressLevel}
              emojis={['😌', '😐', '😟', '😰', '😵‍💫']}
              labels={['Muy relajado', 'Relajado', 'Normal', 'Estresado', 'Muy estresado']}
              title="¿Qué tan estresado estás?"
              description="Tu nivel de estrés actual"
            />
          </Card.Content>
        </Card>

        {/* Optional Quick Note */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.noteTitle}>Reflexión rápida (opcional)</Text>
            <Text style={styles.noteDescription}>¿Hay algo específico en tu mente ahora?</Text>
            <TextInput
              mode="outlined"
              value={quickNote}
              onChangeText={setQuickNote}
              placeholder="Ej: Me siento cansado por el trabajo..."
              multiline
              numberOfLines={3}
              style={styles.noteInput}
              maxLength={100}
              data-testid="input-quick-note"
            />
            <Text style={styles.characterCount}>{quickNote.length}/100 caracteres</Text>
          </Card.Content>
        </Card>

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={saveCheckIn}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={styles.submitButton}
          buttonColor="#283750"
          contentStyle={styles.submitButtonContent}
          data-testid="button-submit-checkin"
        >
          <MaterialIcons name="check-circle" size={20} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Guardando...' : 'Completar Check-in'}
          </Text>
        </Button>
        
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
    alignItems: 'center',
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283750',
    textAlign: 'center',
    marginBottom: 8,
  },
  ratingDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  emojisContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  emojiItem: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  emojiButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 8,
  },
  emojiButtonContent: {
    width: 56,
    height: 56,
  },
  emojiText: {
    fontSize: 24,
  },
  emojiLabel: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 12,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283750',
    marginBottom: 8,
  },
  noteDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  noteInput: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'right',
  },
  submitButton: {
    marginHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
  },
  submitButtonContent: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 32,
  },
});

export default CheckinRapidoScreen;