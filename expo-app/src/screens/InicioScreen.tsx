import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Button } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

interface InicioScreenProps {
  navigation: any;
}

const InicioScreen = ({ navigation }: InicioScreenProps) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const menuItems = [
    {
      title: "Deporte",
      description: "Accede a todas las funciones deportivas: entrenamiento, técnicas, táctica y más",
      icon: "fitness-center",
      screen: "Deporte",
      color: "#283750",
    },
    {
      title: "MentalCheck",
      description: "Evalúa y mejora tu estado mental y bienestar psicológico",
      icon: "self-improvement",
      screen: "MentalCheck", // Por ahora navega a Configuración
      color: "#283750",
    },
    {
      title: "Gráficos y Análisis",
      description: "Visualiza tu progreso con gráficos detallados",
      icon: "insert-chart-outlined",
      screen: "Graficos", // Por ahora navega a Configuración
      color: "#283750",
    }
  ];

  const handleNavigation = (screen: string) => {
    switch (screen) {
      case "Deporte":
        navigation.navigate("Deporte");
        break;
      case "MentalCheck":
        Alert.alert(
          "MentalCheck",
          "Funcionalidad de evaluación mental y bienestar psicológico.\n\n🧠 Próximamente disponible en la app móvil.\n\nPor ahora, puedes usar las funciones de entrenamiento en la sección Deporte.",
          [{ text: 'Ir a Entrenamientos', onPress: () => navigation.navigate("Deporte") }]
        );
        break;
      case "Graficos":
        Alert.alert(
          "Gráficos y Análisis",
          "Visualización de progreso con gráficos detallados.\n\n📊 Próximamente disponible en la app móvil.\n\nPor ahora, revisa tu configuración de sincronización para conectar dispositivos.",
          [{ text: 'Ver Configuración', onPress: () => navigation.navigate("Configuracion") }]
        );
        break;
      default:
        navigation.navigate("Deporte");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()}, Deportista</Text>
        <Text style={styles.subtitle}>¿Qué quieres hacer hoy?</Text>
      </View>

      {/* Menu Cards */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.cardsContainer}>
          {menuItems.map((item, index) => (
            <Card key={index} style={styles.card} elevation={2}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                    <MaterialIcons name={item.icon as any} size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                </View>
                
                <Text style={styles.cardDescription}>{item.description}</Text>
                
                <Button
                  mode="contained"
                  onPress={() => handleNavigation(item.screen)}
                  style={styles.cardButton}
                  buttonColor="#283750"
                  contentStyle={styles.buttonContent}
                >
                  Acceder
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
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#283750',
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingTop: 40, // Espacio para el status bar
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  scrollContainer: {
    flex: 1,
  },
  cardsContainer: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    borderRadius: 12,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#283750',
    flex: 1,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  cardButton: {
    borderRadius: 8,
  },
  buttonContent: {
    height: 44,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default InicioScreen;