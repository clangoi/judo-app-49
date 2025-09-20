import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
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
}

export interface SyncContextType {
  syncStatus: SyncStatus;
  syncData: SyncData;
  generateDeviceCode: () => string;
  linkDevice: (code: string, deviceName: string) => Promise<boolean>;
  unlinkDevice: () => void;
  updateRemoteData: (data: Partial<SyncData>) => void;
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

export const SyncProvider = ({ children }: { children: ReactNode }) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ isLinked: false });
  const [syncData, setSyncData] = useState<SyncData>({});

  // Load sync status on startup
  useEffect(() => {
    const loadSyncStatus = async () => {
      try {
        const savedStatus = await AsyncStorage.getItem('sync-status');
        const savedData = await AsyncStorage.getItem('sync-data');
        
        if (savedStatus) {
          setSyncStatus(JSON.parse(savedStatus));
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
      // Simulated linking logic - in a real app this would connect to a sync service
      const newStatus = {
        isLinked: true,
        deviceCode: code,
        linkedDeviceName: deviceName,
        lastSync: new Date()
      };
      
      setSyncStatus(newStatus);
      await AsyncStorage.setItem('sync-status', JSON.stringify(newStatus));
      
      return true;
    } catch (error) {
      console.error('Error linking device:', error);
      return false;
    }
  };

  const unlinkDevice = async () => {
    try {
      const newStatus = { isLinked: false };
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
      const newSyncData = { ...syncData, ...data };
      setSyncData(newSyncData);
      await AsyncStorage.setItem('sync-data', JSON.stringify(newSyncData));
      
      // Update last sync time
      const newStatus = { ...syncStatus, lastSync: new Date() };
      setSyncStatus(newStatus);
      await AsyncStorage.setItem('sync-status', JSON.stringify(newStatus));
    } catch (error) {
      console.error('Error updating remote data:', error);
    }
  };

  const syncData = async (): Promise<boolean> => {
    try {
      // In a real implementation, this would sync with a remote service
      // For now, we just update the last sync time
      const newStatus = { ...syncStatus, lastSync: new Date() };
      setSyncStatus(newStatus);
      await AsyncStorage.setItem('sync-status', JSON.stringify(newStatus));
      
      return true;
    } catch (error) {
      console.error('Error syncing data:', error);
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