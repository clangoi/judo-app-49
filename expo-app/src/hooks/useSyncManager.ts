import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SyncData {
  // Timer related data
  timerMode?: string;
  timerTabataConfig?: any;
  timerTimerConfig?: any;
  timerTabataSequence?: any[];
  timerSequenceMode?: boolean;
  
  // Other sync data can be added here
  [key: string]: any;
}

export interface SyncStatus {
  isLinked: boolean;
  lastSync?: Date;
  deviceCode?: string;
  linkedDeviceName?: string;
  error?: string;
  isGenerating?: boolean;
  isLinking?: boolean;
  isSyncing?: boolean;
}

export interface SyncContextType {
  syncStatus: SyncStatus;
  syncData: SyncData;
  generateDeviceCode: () => string;
  linkDevice: (code: string, deviceName: string) => Promise<boolean>;
  unlinkDevice: () => void;
  updateRemoteData: (data: Partial<SyncData>) => Promise<void>;
  syncData: () => Promise<boolean>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const useSyncManager = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSyncManager must be used within a SyncProvider');
  }
  return context;
};

const generateRandomCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Simular fingerprint del dispositivo
const generateDeviceFingerprint = (): string => {
  // En React Native, creamos un fingerprint simple basado en timestamp
  // En una implementación real, usaríamos Device info
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 10);
  return `RN-${timestamp.slice(-6)}-${random}`;
};

export const SyncProvider = ({ children }: { children: ReactNode }) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ 
    isLinked: false,
    isGenerating: false,
    isLinking: false,
    isSyncing: false
  });
  const [syncData, setSyncData] = useState<SyncData>({});

  // Load sync status on startup
  useEffect(() => {
    const loadSyncStatus = async () => {
      try {
        const savedStatus = await AsyncStorage.getItem('sync-status');
        const savedData = await AsyncStorage.getItem('sync-data');
        
        if (savedStatus) {
          const parsedStatus = JSON.parse(savedStatus);
          // Convert date strings back to Date objects
          if (parsedStatus.lastSync) {
            parsedStatus.lastSync = new Date(parsedStatus.lastSync);
          }
          setSyncStatus(parsedStatus);
        }
        if (savedData) {
          setSyncData(JSON.parse(savedData));
        }
      } catch (error) {
        console.warn('Error loading sync status:', error);
      }
    };
    
    loadSyncStatus();
  }, []);

  const generateDeviceCode = (): string => {
    const code = generateRandomCode();
    return code;
  };

  const linkDevice = async (code: string, deviceName: string): Promise<boolean> => {
    try {
      setSyncStatus(prev => ({ ...prev, isLinking: true, error: undefined }));
      
      // Simulated linking logic - in a real app this would connect to a sync service
      // For now, we'll just simulate a successful link locally
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      const newStatus = {
        isLinked: true,
        deviceCode: code,
        linkedDeviceName: deviceName,
        lastSync: new Date(),
        isLinking: false
      };
      
      setSyncStatus(newStatus);
      await AsyncStorage.setItem('sync-status', JSON.stringify(newStatus));
      
      return true;
    } catch (error) {
      console.error('Error linking device:', error);
      setSyncStatus(prev => ({
        ...prev,
        isLinking: false,
        error: error instanceof Error ? error.message : 'Failed to link device'
      }));
      return false;
    }
  };

  const unlinkDevice = async () => {
    try {
      const newStatus = { 
        isLinked: false,
        isGenerating: false,
        isLinking: false,
        isSyncing: false
      };
      setSyncStatus(newStatus);
      setSyncData({});
      
      await AsyncStorage.removeItem('sync-status');
      await AsyncStorage.removeItem('sync-data');
    } catch (error) {
      console.error('Error unlinking device:', error);
    }
  };

  const updateRemoteData = async (data: Partial<SyncData>) => {
    try {
      setSyncStatus(prev => ({ ...prev, isSyncing: true, error: undefined }));
      
      const newSyncData = { ...syncData, ...data };
      setSyncData(newSyncData);
      await AsyncStorage.setItem('sync-data', JSON.stringify(newSyncData));
      
      // Update last sync time
      const newStatus = { 
        ...syncStatus, 
        lastSync: new Date(),
        isSyncing: false 
      };
      setSyncStatus(newStatus);
      await AsyncStorage.setItem('sync-status', JSON.stringify(newStatus));
    } catch (error) {
      console.error('Error updating remote data:', error);
      setSyncStatus(prev => ({ 
        ...prev, 
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Failed to update remote data' 
      }));
    }
  };

  const syncData = async (): Promise<boolean> => {
    try {
      setSyncStatus(prev => ({ ...prev, isSyncing: true, error: undefined }));
      
      // In a real implementation, this would sync with a remote service
      // For now, we just simulate the sync process
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      // Update last sync time
      const newStatus = { 
        ...syncStatus, 
        lastSync: new Date(),
        isSyncing: false 
      };
      setSyncStatus(newStatus);
      await AsyncStorage.setItem('sync-status', JSON.stringify(newStatus));
      
      return true;
    } catch (error) {
      console.error('Error syncing data:', error);
      setSyncStatus(prev => ({ 
        ...prev, 
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Failed to sync data' 
      }));
      return false;
    }
  };

  const value: SyncContextType = {
    syncStatus,
    syncData,
    generateDeviceCode,
    linkDevice,
    unlinkDevice,
    updateRemoteData,
    syncData
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
};