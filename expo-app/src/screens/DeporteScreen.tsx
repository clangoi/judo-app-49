import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Button, SegmentedButtons, FAB } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import TabataTimer from '../components/TabataTimer';
import { NavigationProp, useNavigation } from '@react-navigation/native';

type RootStackParamList = {
  PreparacionFisica: undefined;
  EntrenamientoDeportivo: undefined;
  TecnicasDeportivas: undefined;
  TacticaDeportiva: undefined;
  ControlPeso: undefined;
  HistorialEntrenamientos: undefined;
  MetasObjetivos: undefined;
};

const DeporteScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState('resumen');

  const sportsModules = [
    {
      id: 'preparacion',
      title: "Preparación Física",
      description: "Rutinas de entrenamiento, ejercicios y progreso físico",
      icon: "fitness-center",
      color: "#283750",
      route: 'PreparacionFisica' as keyof RootStackParamList,
      stats: { sessions: 12, hours: 18 }
    },
    {
      id: 'entrenamiento', 
      title: "Entrenamientos Deportivos",
      description: "Sesiones específicas del deporte, sparring y práctica",
      icon: "sports-martial-arts",
      color: "#283750",
      route: 'EntrenamientoDeportivo' as keyof RootStackParamList,
      stats: { sessions: 8, hours: 24 }
    },
    {
      id: 'tecnicas',
      title: "Técnicas Deportivas",
      description: "Biblioteca de técnicas, movimientos y fundamentos", 
      icon: "sports",
      color: "#283750",
      route: 'TecnicasDeportivas' as keyof RootStackParamList,
      stats: { learned: 45, mastered: 12 }
    },
    {
      id: 'tactica',
      title: "Táctica y Estrategia",
      description: "Análisis táctico, planes de juego y estrategias",
      icon: "lightbulb",
      color: "#283750",
      route: 'TacticaDeportiva' as keyof RootStackParamList,
      stats: { plans: 6, analyzed: 15 }
    },
    {
      id: 'peso',
      title: "Control de Peso",
      description: "Seguimiento de peso, composición corporal y nutrición",
      icon: "monitor",
      color: "#283750",
      route: 'ControlPeso' as keyof RootStackParamList,
      stats: { goal: '70kg', current: '72kg' }
    }
  ];

  const quickActions = [
    {
      title: "Historial de Entrenamientos",
      description: "Ve todo tu progreso y entrenamientos anteriores",
      icon: "history",
      route: 'HistorialEntrenamientos' as keyof RootStackParamList,
    },
    {
      title: "Metas y Objetivos",
      description: "Define y sigue tus objetivos deportivos",
      icon: "emoji-events",
      route: 'MetasObjetivos' as keyof RootStackParamList,
    }
  ];

  const handleModulePress = (route: keyof RootStackParamList) => {
    try {
      navigation.navigate(route);
    } catch (error) {
      Alert.alert(
        "Próximamente",
        `La sección estará disponible pronto. Mientras tanto, puedes usar el Timer Tabata para tus entrenamientos.`,
        [{ text: 'Entendido', style: 'default' }]
      );
    }
  };

  const renderSummaryView = () => (
    <View>
      {/* Timer Tabata */}
      <TabataTimer />
      
      {/* Quick Stats */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Resumen Semanal</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>20</Text>
              <Text style={styles.statLabel}>Entrenamientos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>42h</Text>
              <Text style={styles.statLabel}>Tiempo Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>57</Text>
              <Text style={styles.statLabel}>Técnicas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>-1kg</Text>
              <Text style={styles.statLabel}>Peso</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Modules Grid */}
      <View style={styles.modulesGrid}>
        {sportsModules.map((module, index) => (
          <Card key={index} style={styles.moduleCard}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{module.title}</Text>
              </View>
              <Text style={styles.cardDescription}>{module.description}</Text>
              
              {/* Module Stats */}
              <View style={styles.moduleStats}>
                {Object.entries(module.stats).map(([key, value]) => (
                  <Text key={key} style={styles.statText}>
                    {key}: {value}
                  </Text>
                ))}
              </View>

              <Button
                mode="contained"
                style={styles.cardButton}
                buttonColor="#283750"
                onPress={() => handleModulePress(module.route)}
              >
                Abrir
              </Button>
            </Card.Content>
          </Card>
        ))}
      </View>
    </View>
  );

  const renderModulesView = () => (
    <View>
      {sportsModules.map((module, index) => (
        <Card key={index} style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={styles.headerText}>
                <Text style={styles.cardTitle}>{module.title}</Text>
                <Text style={styles.cardDescription}>{module.description}</Text>
              </View>
            </View>
            
            <View style={styles.moduleStatsRow}>
              {Object.entries(module.stats).map(([key, value]) => (
                <View key={key} style={styles.statChip}>
                  <Text style={styles.statChipText}>{key}: {value}</Text>
                </View>
              ))}
            </View>

            <Button
              mode="contained"
              style={styles.cardButton}
              buttonColor="#283750"
              onPress={() => handleModulePress(module.route)}
              icon={({ size, color }) => (
                <MaterialIcons name="arrow-forward" size={size} color={color} />
              )}
            >
              Acceder
            </Button>
          </Card.Content>
        </Card>
      ))}
    </View>
  );

  const renderQuickActionsView = () => (
    <View>
      {quickActions.map((action, index) => (
        <Card key={index} style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={styles.headerText}>
                <Text style={styles.cardTitle}>{action.title}</Text>
                <Text style={styles.cardDescription}>{action.description}</Text>
              </View>
            </View>

            <Button
              mode="contained"
              style={styles.cardButton}
              buttonColor="#283750"
              onPress={() => handleModulePress(action.route)}
              icon={({ size, color }) => (
                <MaterialIcons name="arrow-forward" size={size} color={color} />
              )}
            >
              Ver
            </Button>
          </Card.Content>
        </Card>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={setActiveTab}
          buttons={[
            { value: 'resumen', label: 'Resumen' },
            { value: 'modulos', label: 'Módulos' },
            { value: 'acciones', label: 'Historial' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <ScrollView style={styles.scrollContainer}>
        {activeTab === 'resumen' && renderSummaryView()}
        {activeTab === 'modulos' && renderModulesView()}
        {activeTab === 'acciones' && renderQuickActionsView()}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => {
          Alert.alert(
            "Nuevo Entrenamiento",
            "¿Qué tipo de entrenamiento quieres registrar?",
            [
              { text: "Cancelar", style: "cancel" },
              { text: "Preparación Física", onPress: () => handleModulePress('PreparacionFisica') },
              { text: "Entrenamiento Deportivo", onPress: () => handleModulePress('EntrenamientoDeportivo') }
            ]
          );
        }}
        label="Nuevo"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  tabContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  segmentedButtons: {
    backgroundColor: '#F3F4F6',
  },
  scrollContainer: {
    flex: 1,
    padding: 8,
  },
  statsCard: {
    margin: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#283750',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#283750',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 4,
  },
  moduleCard: {
    width: '48%',
    margin: '1%',
    backgroundColor: '#FFFFFF',
    elevation: 2,
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
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#283750',
  },
  cardDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
    marginTop: 4,
  },
  moduleStats: {
    marginBottom: 12,
  },
  moduleStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  statText: {
    fontSize: 12,
    color: '#374151',
    marginRight: 8,
    marginBottom: 4,
  },
  statChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  statChipText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '500',
  },
  cardButton: {
    borderRadius: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#283750',
  },
});

export default DeporteScreen;