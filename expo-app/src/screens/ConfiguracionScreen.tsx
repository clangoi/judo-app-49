import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Button, TextInput, Switch, Dialog, Portal, Divider } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useSyncManager } from '../hooks/useSyncManager';

const ConfiguracionScreen = () => {
  const { syncStatus, generateDeviceCode, linkDevice, unlinkDevice } = useSyncManager();
  
  const [linkCodeDialogVisible, setLinkCodeDialogVisible] = useState(false);
  const [generateCodeDialogVisible, setGenerateCodeDialogVisible] = useState(false);
  const [linkCode, setLinkCode] = useState('');
  const [deviceName, setDeviceName] = useState('Mi Dispositivo');
  const [generatedCode, setGeneratedCode] = useState('');

  const handleGenerateCode = () => {
    const code = generateDeviceCode();
    setGeneratedCode(code);
    setGenerateCodeDialogVisible(true);
  };

  const handleLinkDevice = async () => {
    if (!linkCode.trim()) {
      Alert.alert('Error', 'Por favor ingresa un código válido');
      return;
    }

    const success = await linkDevice(linkCode.trim().toUpperCase(), deviceName.trim());
    if (success) {
      Alert.alert('Éxito', 'Dispositivo vinculado correctamente');
      setLinkCodeDialogVisible(false);
      setLinkCode('');
    } else {
      Alert.alert('Error', 'No se pudo vincular el dispositivo. Verifica el código.');
    }
  };

  const handleUnlinkDevice = () => {
    Alert.alert(
      'Desvincular Dispositivo',
      '¿Estás seguro de que quieres desvincular este dispositivo? Perderás la sincronización con otros dispositivos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Desvincular', style: 'destructive', onPress: unlinkDevice }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        
        {/* Sync Section */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialIcons name="autorenew" size={24} color="#283750" />
              <Text style={styles.cardTitle}>Sincronización</Text>
            </View>
            
            <View style={styles.syncStatus}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Estado:</Text>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: syncStatus.isLinked ? '#10B981' : '#6B7280' }
                ]}>
                  <Text style={styles.statusText}>
                    {syncStatus.isLinked ? 'Conectado' : 'No conectado'}
                  </Text>
                </View>
              </View>
              
              {syncStatus.isLinked && syncStatus.linkedDeviceName && (
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Dispositivo:</Text>
                  <Text style={styles.statusValue}>{syncStatus.linkedDeviceName}</Text>
                </View>
              )}
              
              {syncStatus.lastSync && (
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Última sincronización:</Text>
                  <Text style={styles.statusValue}>
                    {syncStatus.lastSync.toLocaleString()}
                  </Text>
                </View>
              )}
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.syncButtons}>
              {!syncStatus.isLinked ? (
                <>
                  <Button
                    mode="contained"
                    onPress={() => setLinkCodeDialogVisible(true)}
                    style={styles.syncButton}
                    buttonColor="#283750"
                    icon={({ size, color }) => (
                      <MaterialIcons name="add-link" size={size} color={color} />
                    )}
                  >
                    Vincular Dispositivo
                  </Button>
                  
                  <Button
                    mode="outlined"
                    onPress={handleGenerateCode}
                    style={styles.syncButton}
                    icon={({ size, color }) => (
                      <MaterialIcons name="qr-code" size={size} color={color} />
                    )}
                  >
                    Generar Código
                  </Button>
                </>
              ) : (
                <Button
                  mode="outlined"
                  onPress={handleUnlinkDevice}
                  style={styles.syncButton}
                  buttonColor="#EF4444"
                  icon={({ size, color }) => (
                    <MaterialIcons name="remove-link" size={size} color={color} />
                  )}
                >
                  Desvincular
                </Button>
              )}
            </View>
            
            <Text style={styles.syncInfo}>
              La sincronización te permite compartir configuraciones del timer entre dispositivos usando códigos únicos.
            </Text>
          </Card.Content>
        </Card>

        {/* Timer Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialIcons name="access-time" size={24} color="#283750" />
              <Text style={styles.cardTitle}>Configuración de Timer</Text>
            </View>
            
            <Text style={styles.settingDescription}>
              Las configuraciones del timer se guardan automáticamente y se sincronizan entre dispositivos cuando están vinculados.
            </Text>
          </Card.Content>
        </Card>

        {/* App Info */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialIcons name="info" size={24} color="#283750" />
              <Text style={styles.cardTitle}>Información</Text>
            </View>
            
            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>MentalCheck - Entrenamiento Deportivo</Text>
              <Text style={styles.infoText}>Versión 1.0.0</Text>
              <Text style={styles.infoText}>
                Aplicación móvil para entrenamiento deportivo con sistema de timer Tabata avanzado y sincronización entre dispositivos.
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Link Device Dialog */}
      <Portal>
        <Dialog visible={linkCodeDialogVisible} onDismiss={() => setLinkCodeDialogVisible(false)}>
          <Dialog.Title>Vincular Dispositivo</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              Ingresa el código generado en el otro dispositivo:
            </Text>
            
            <TextInput
              mode="outlined"
              label="Código de sincronización"
              value={linkCode}
              onChangeText={setLinkCode}
              placeholder="Ej: ABC123"
              autoCapitalize="characters"
              maxLength={6}
              style={styles.dialogInput}
            />
            
            <TextInput
              mode="outlined"
              label="Nombre de este dispositivo"
              value={deviceName}
              onChangeText={setDeviceName}
              placeholder="Mi teléfono"
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLinkCodeDialogVisible(false)}>Cancelar</Button>
            <Button 
              onPress={handleLinkDevice}
              loading={syncStatus.isLinking}
              disabled={!linkCode.trim()}
            >
              Vincular
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Generate Code Dialog */}
      <Portal>
        <Dialog visible={generateCodeDialogVisible} onDismiss={() => setGenerateCodeDialogVisible(false)}>
          <Dialog.Title>Código de Sincronización</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              Usa este código en el otro dispositivo para sincronizar:
            </Text>
            
            <View style={styles.codeContainer}>
              <Text style={styles.generatedCode}>{generatedCode}</Text>
            </View>
            
            <Text style={styles.codeInfo}>
              Este código expira en 10 minutos. Compártelo con el dispositivo que quieres sincronizar.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setGenerateCodeDialogVisible(false)}>Cerrar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#283750',
  },
  syncStatus: {
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#283750',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 16,
  },
  syncButtons: {
    gap: 8,
    marginBottom: 16,
  },
  syncButton: {
    borderRadius: 8,
  },
  syncInfo: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  infoSection: {
    gap: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#283750',
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  dialogText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  dialogInput: {
    marginBottom: 12,
  },
  codeContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  generatedCode: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: '#283750',
    letterSpacing: 4,
  },
  codeInfo: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default ConfiguracionScreen;