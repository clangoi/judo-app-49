import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Appbar, Card, Button } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import TabataTimer from '../components/TabataTimer';

const DeporteScreen = () => {
  const sportsItems = [
    {
      title: "Preparación Física",
      description: "Registra y administra tus sesiones de entrenamiento físico",
      icon: "fitness-center",
      color: "#283750",
    },
    {
      title: "Entrenamientos Deportivos", 
      description: "Documenta tus sesiones deportivas y combates",
      icon: "sports-mma",
      color: "#283750",
    },
    {
      title: "Técnicas Deportivas",
      description: "Explora y aprende técnicas por categorías", 
      icon: "sports-kabaddi",
      color: "#283750",
    },
    {
      title: "Táctica Deportiva",
      description: "Desarrolla estrategias y tácticas de combate",
      icon: "psychology",
      color: "#283750",
    },
    {
      title: "Control de Peso",
      description: "Monitorea tu peso y progreso físico",
      icon: "monitor-weight",
      color: "#283750",
    }
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Timer Tabata */}
        <TabataTimer />
        
        {/* Sports Items */}
        {sportsItems.map((item, index) => (
          <Card key={index} style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name={item.icon as any} size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
              </View>
              <Text style={styles.cardDescription}>{item.description}</Text>
              <Button
                mode="contained"
                style={styles.cardButton}
                buttonColor="#283750"
                onPress={() => {
                  // En la versión móvil, estas funciones están simplificadas
                  // Solo mostramos el timer por ahora
                }}
              >
                Acceder
              </Button>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    flex: 1,
    padding: 8,
  },
  card: {
    margin: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
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
    backgroundColor: '#283750',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#283750',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  cardButton: {
    borderRadius: 8,
  },
});

export default DeporteScreen;