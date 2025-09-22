import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Dimensions } from 'react-native';
import { Button, Card, TextInput, Snackbar } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CheckinRapidoScreenProps {
  navigation: any;
}

const CheckinRapidoScreen: React.FC<CheckinRapidoScreenProps> = ({ navigation }) => {
  const [mentalStateText, setMentalStateText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');

  const validateInput = (): boolean => {
    setValidationError('');
    
    if (!mentalStateText.trim()) {
      setValidationError('Por favor, describe cómo te sientes');
      return false;
    }
    
    if (mentalStateText.trim().length < 3) {
      setValidationError('El mensaje debe tener al menos 3 caracteres');
      return false;
    }
    
    return true;
  };

  const saveCheckIn = async () => {
    if (!validateInput()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const checkInData = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        mentalStateText: mentalStateText.trim(),
        type: 'quick_text', // Nuevo campo para identificar check-ins de texto libre
        // Mantener compatibilidad con sistema anterior (valores neutros)
        currentMood: 3,
        energyLevel: 3,
        stressLevel: 3,
        protectiveFactors: 3,
        quickNote: mentalStateText.trim(), // Usar el texto principal también aquí para compatibilidad
        contextNote: '',
        timeOfDay: getTimeOfDay(),
        dayOfWeek: getDayOfWeek(),
      };

      // Obtener check-ins existentes
      const existingCheckIns = await AsyncStorage.getItem('mentalcheck_checkins');
      const checkIns = existingCheckIns ? JSON.parse(existingCheckIns) : [];
      
      // Agregar nuevo check-in
      checkIns.push(checkInData);
      
      // Mantener solo los últimos 100 check-ins
      if (checkIns.length > 100) {
        checkIns.splice(0, checkIns.length - 100);
      }
      
      // Guardar en AsyncStorage
      await AsyncStorage.setItem('mentalcheck_checkins', JSON.stringify(checkIns));

      // Mostrar confirmación visual
      setShowSuccessSnackbar(true);
      
      // Limpiar el campo después de guardar exitosamente
      setMentalStateText('');
      
      setTimeout(() => {
        Alert.alert(
          "¡Check-in Registrado! ✅",
          "Gracias por compartir cómo te sientes. Tu bienestar es importante para nosotros.",
          [
            { 
              text: 'Ver Historial', 
              onPress: () => navigation.navigate('MentalCheck', { initialTab: 'analytics' })
            },
            { 
              text: 'Hacer Otro Check-in', 
              onPress: () => {
                // Campo ya limpiado arriba
              }
            }
          ]
        );
      }, 1000);
      
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const getRandomPlaceholder = () => {
    const placeholders = [
      "Ej: Estoy cansado pero motivado para entrenar",
      "Ej: Me siento ansioso por el partido de mañana",
      "Ej: Hoy me levanté con mucha energía y optimismo",
      "Ej: Estoy algo estresado por los exámenes",
      "Ej: Me siento relajado después del entrenamiento",
      "Ej: Tengo ganas de mejorar mi técnica hoy",
      "Ej: Estoy emocionado por la competencia",
      "Ej: Me siento un poco agobiado pero enfocado"
    ];
    return placeholders[Math.floor(Math.random() * placeholders.length)];
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} keyboardShouldPersistTaps="handled">
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
          <Text style={styles.subtitle}>{getGreeting()}, solo toma 30 segundos</Text>
        </View>

        {/* Main Text Input Card */}
        <Card style={styles.mainCard}>
          <Card.Content style={styles.mainCardContent}>
            <View style={styles.questionHeader}>
              <MaterialIcons name="psychology" size={32} color="#283750" />
              <Text style={styles.mainQuestion}>¿Cómo te sientes hoy?</Text>
            </View>
            
            <Text style={styles.mainDescription}>
              Describe libremente tu estado mental, emocional o motivacional del momento
            </Text>
            
            <TextInput
              mode="outlined"
              value={mentalStateText}
              onChangeText={setMentalStateText}
              placeholder={getRandomPlaceholder()}
              multiline
              numberOfLines={4}
              style={styles.mainTextInput}
              outlineColor="#E0E0E0"
              activeOutlineColor="#283750"
              error={!!validationError}
              data-testid="input-mental-state"
            />
            
            {validationError && (
              <Text style={styles.errorText}>{validationError}</Text>
            )}
            
            <View style={styles.characterCountContainer}>
              <Text style={styles.characterCountText}>
                {mentalStateText.length} caracteres
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Quick Tips Card */}
        <Card style={styles.tipsCard}>
          <Card.Content>
            <Text style={styles.tipsTitle}>💡 Sugerencias:</Text>
            <Text style={styles.tipsText}>
              • Describe emociones específicas{'\n'}
              • Menciona qué te motiva o preocupa{'\n'}
              • Comparte tu nivel de energía o cansancio{'\n'}
              • Es completamente privado y confidencial
            </Text>
          </Card.Content>
        </Card>

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={saveCheckIn}
          loading={isSubmitting}
          disabled={isSubmitting || mentalStateText.trim().length < 3}
          style={styles.submitButton}
          buttonColor="#283750"
          contentStyle={styles.submitButtonContent}
          data-testid="button-submit-checkin"
        >
          <MaterialIcons name="check-circle" size={20} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Guardando...' : 'Registrar Check-in'}
          </Text>
        </Button>
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Success Snackbar */}
      <Snackbar
        visible={showSuccessSnackbar}
        onDismiss={() => setShowSuccessSnackbar(false)}
        duration={3000}
        style={styles.snackbar}
      >
        Check-in registrado exitosamente ✅
      </Snackbar>
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
  mainCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 3,
  },
  mainCardContent: {
    padding: 20,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mainQuestion: {
    fontSize: 20,
    fontWeight: '600',
    color: '#283750',
    marginLeft: 12,
    flex: 1,
  },
  mainDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 20,
  },
  mainTextInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    marginTop: 4,
  },
  characterCountContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  characterCountText: {
    fontSize: 12,
    color: '#666666',
  },
  tipsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283750',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  submitButton: {
    marginHorizontal: 16,
    marginTop: 8,
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
  snackbar: {
    backgroundColor: '#10B981',
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
});

export default CheckinRapidoScreen;