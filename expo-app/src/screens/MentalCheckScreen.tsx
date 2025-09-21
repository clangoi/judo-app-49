import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Button } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

interface MentalCheckScreenProps {
  navigation: any;
}

const MentalCheckScreen: React.FC<MentalCheckScreenProps> = ({ navigation }) => {
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
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
                     option.title === "Técnicas de Respiración" ? "Técnicas incluidas:" : 
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
                   option.title === "Técnicas de Respiración" ? "Iniciar Respiración" :
                   "Iniciar Manejo de Crisis"}
                </Button>
              </Card.Content>
            </Card>
          ))}
        </View>
        
        {/* Espaciado inferior */}
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
});

export default MentalCheckScreen;