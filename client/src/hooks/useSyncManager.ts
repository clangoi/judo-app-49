import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export interface SyncStatus {
  isLinked: boolean;
  syncCode?: string;
  deviceFingerprint?: string;
  lastSync?: Date;
  expiresAt?: Date;
  isExpired?: boolean;
  isGenerating?: boolean;
  isLinking?: boolean;
  isSyncing?: boolean;
  error?: string;
}

export interface DeviceData {
  timer?: any;
  mentalHealth?: any;
  settings?: any;
  [key: string]: any;
}

export interface SyncManagerResult {
  // Estado de sincronización
  status: SyncStatus;
  
  // Funciones principales
  generateSyncCode: (deviceData: DeviceData) => Promise<string | null>;
  linkDevice: (syncCode: string) => Promise<boolean>;
  syncData: (forceUpdate?: boolean) => Promise<boolean>;
  updateRemoteData: (deviceData: DeviceData) => Promise<boolean>;
  
  // Utilidades
  getDeviceFingerprint: () => string;
  clearSyncData: () => void;
  checkSyncStatus: () => Promise<void>;
}

const STORAGE_KEYS = {
  SYNC_CODE: 'mentalcheck_sync_code',
  DEVICE_FINGERPRINT: 'mentalcheck_device_fingerprint',
  LAST_SYNC: 'mentalcheck_last_sync',
  SYNC_EXPIRES: 'mentalcheck_sync_expires'
};

export function useSyncManager(): SyncManagerResult {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<SyncStatus>({
    isLinked: false,
    isGenerating: false,
    isLinking: false,
    isSyncing: false
  });

  // Generar device fingerprint único y persistente
  const getDeviceFingerprint = useCallback((): string => {
    let fingerprint = localStorage.getItem(STORAGE_KEYS.DEVICE_FINGERPRINT);
    
    if (!fingerprint) {
      // Generar fingerprint basado en características del dispositivo
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx?.fillText('MentalCheck-FP', 10, 10);
      const canvasFingerprint = canvas.toDataURL();
      
      const deviceInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen: `${screen.width}x${screen.height}`,
        canvas: canvasFingerprint.slice(0, 50), // Primeros 50 chars
        // timestamp: Date.now() // Removed for better stability
      };
      
      fingerprint = btoa(JSON.stringify(deviceInfo)).replace(/[/+=]/g, '').substring(0, 32);
      localStorage.setItem(STORAGE_KEYS.DEVICE_FINGERPRINT, fingerprint);
    }
    
    return fingerprint;
  }, []);

  // Cargar estado de sincronización desde localStorage
  const loadSyncStatus = useCallback(() => {
    const syncCode = localStorage.getItem(STORAGE_KEYS.SYNC_CODE);
    const deviceFingerprint = getDeviceFingerprint();
    const lastSyncStr = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    const expiresAtStr = localStorage.getItem(STORAGE_KEYS.SYNC_EXPIRES);
    
    const lastSync = lastSyncStr ? new Date(lastSyncStr) : undefined;
    const expiresAt = expiresAtStr ? new Date(expiresAtStr) : undefined;
    const isExpired = expiresAt ? new Date() > expiresAt : false;
    
    setStatus(prev => ({
      ...prev,
      isLinked: !!syncCode && !isExpired,
      syncCode: syncCode || undefined,
      deviceFingerprint,
      lastSync,
      expiresAt,
      isExpired
    }));
  }, [getDeviceFingerprint]);

  // Generar código de sincronización y subir datos iniciales
  const generateSyncCode = useCallback(async (deviceData: DeviceData): Promise<string | null> => {
    try {
      setStatus(prev => ({ ...prev, isGenerating: true, error: undefined }));
      
      const deviceFingerprint = getDeviceFingerprint();
      
      const response = await fetch('/api/sync/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceData,
          deviceFingerprint
        })
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to generate sync code';
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch {
          errorMessage = await response.text() || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      
      // Guardar información de sincronización
      localStorage.setItem(STORAGE_KEYS.SYNC_CODE, result.syncCode);
      localStorage.setItem(STORAGE_KEYS.DEVICE_FINGERPRINT, result.deviceFingerprint);
      localStorage.setItem(STORAGE_KEYS.SYNC_EXPIRES, result.expiresAt);
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      
      // Actualizar estado
      setStatus(prev => ({
        ...prev,
        isLinked: true,
        syncCode: result.syncCode,
        deviceFingerprint: result.deviceFingerprint,
        expiresAt: new Date(result.expiresAt),
        lastSync: new Date(),
        isExpired: false,
        isGenerating: false,
        error: undefined
      }));
      
      return result.syncCode;
    } catch (error) {
      console.error('Error generating sync code:', error);
      setStatus(prev => ({
        ...prev,
        isGenerating: false,
        error: error instanceof Error ? error.message : 'Failed to generate sync code'
      }));
      return null;
    }
  }, [getDeviceFingerprint]);

  // Vincular dispositivo con código existente
  const linkDevice = useCallback(async (syncCode: string): Promise<boolean> => {
    try {
      setStatus(prev => ({ ...prev, isLinking: true, error: undefined }));
      
      const deviceFingerprint = getDeviceFingerprint();
      
      const response = await fetch('/api/sync/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syncCode,
          deviceFingerprint
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to link device');
      }
      
      const result = await response.json();
      
      // Guardar información de sincronización
      localStorage.setItem(STORAGE_KEYS.SYNC_CODE, syncCode);
      localStorage.setItem(STORAGE_KEYS.DEVICE_FINGERPRINT, deviceFingerprint);
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      
      // Save expiresAt from server for proper expiration tracking
      if (result.expiresAt) {
        localStorage.setItem(STORAGE_KEYS.SYNC_EXPIRES, result.expiresAt);
      }
      
      // Actualizar estado
      setStatus(prev => ({
        ...prev,
        isLinked: true,
        syncCode,
        deviceFingerprint,
        lastSync: new Date(),
        expiresAt: result.deviceData?.expiresAt ? new Date(result.deviceData.expiresAt) : prev.expiresAt,
        isLinking: false,
        error: undefined
      }));
      
      return true;
    } catch (error) {
      console.error('Error linking device:', error);
      setStatus(prev => ({
        ...prev,
        isLinking: false,
        error: error instanceof Error ? error.message : 'Failed to link device'
      }));
      return false;
    }
  }, [getDeviceFingerprint]);

  // Sincronizar datos (descargar desde servidor)
  const syncData = useCallback(async (forceUpdate = false): Promise<boolean> => {
    try {
      const syncCode = localStorage.getItem(STORAGE_KEYS.SYNC_CODE);
      const deviceFingerprint = getDeviceFingerprint();
      
      if (!syncCode || !deviceFingerprint) {
        throw new Error('No sync code or device fingerprint available');
      }
      
      setStatus(prev => ({ ...prev, isSyncing: true, error: undefined }));
      
      const response = await fetch(`/api/sync/data/${syncCode}?deviceFingerprint=${encodeURIComponent(deviceFingerprint)}`, {
        method: 'GET'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to sync data');
      }
      
      const result = await response.json();
      
      // Actualizar localStorage con datos sincronizados si es necesario
      if (forceUpdate && result.deviceData) {
        // Aquí se integraría con otros hooks/contexts para actualizar datos
        console.log('Sync data received:', result.deviceData);
        
        // Invalidar caches de React Query para forzar actualización
        queryClient.invalidateQueries({ queryKey: ['/api'] });
      }
      
      // Actualizar estado
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      setStatus(prev => ({
        ...prev,
        lastSync: new Date(),
        expiresAt: new Date(result.expiresAt),
        isSyncing: false,
        error: undefined
      }));
      
      return true;
    } catch (error) {
      console.error('Error syncing data:', error);
      setStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Failed to sync data'
      }));
      return false;
    }
  }, [getDeviceFingerprint]);

  // Actualizar datos remotos (subir al servidor)
  const updateRemoteData = useCallback(async (deviceData: DeviceData): Promise<boolean> => {
    try {
      const syncCode = localStorage.getItem(STORAGE_KEYS.SYNC_CODE);
      const deviceFingerprint = getDeviceFingerprint();
      
      if (!syncCode || !deviceFingerprint) {
        throw new Error('No sync code or device fingerprint available');
      }
      
      setStatus(prev => ({ ...prev, isSyncing: true, error: undefined }));
      
      const response = await fetch('/api/sync/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syncCode,
          deviceFingerprint,
          deviceData
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update remote data');
      }
      
      const result = await response.json();
      
      // Actualizar estado
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, result.lastSync);
      setStatus(prev => ({
        ...prev,
        lastSync: new Date(result.lastSync),
        isSyncing: false,
        error: undefined
      }));
      
      return true;
    } catch (error) {
      console.error('Error updating remote data:', error);
      setStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Failed to update remote data'
      }));
      return false;
    }
  }, [getDeviceFingerprint]);

  // Verificar estado de sincronización en el servidor
  const checkSyncStatus = useCallback(async (): Promise<void> => {
    try {
      const syncCode = localStorage.getItem(STORAGE_KEYS.SYNC_CODE);
      const deviceFingerprint = getDeviceFingerprint();
      
      if (!syncCode || !deviceFingerprint) return;
      
      const response = await fetch(`/api/sync/status?syncCode=${encodeURIComponent(syncCode)}&deviceFingerprint=${encodeURIComponent(deviceFingerprint)}`, {
        method: 'GET'
      });
      
      if (!response.ok) return;
      
      const result = await response.json();
      
      setStatus(prev => ({
        ...prev,
        isLinked: result.isLinked && !result.isExpired,
        isExpired: result.isExpired,
        lastSync: result.lastSync ? new Date(result.lastSync) : prev.lastSync,
        expiresAt: result.expiresAt ? new Date(result.expiresAt) : prev.expiresAt
      }));
      
      // Si expiró o no está vinculado, limpiar datos locales
      if (result.isExpired || !result.isLinked) {
        clearSyncData();
      }
    } catch (error) {
      console.error('Error checking sync status:', error);
    }
  }, [getDeviceFingerprint]);

  // Limpiar todos los datos de sincronización
  const clearSyncData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.SYNC_CODE);
    localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
    localStorage.removeItem(STORAGE_KEYS.SYNC_EXPIRES);
    // Mantener device fingerprint para futuras sincronizaciones
    
    setStatus(prev => ({
      ...prev,
      isLinked: false,
      syncCode: undefined,
      lastSync: undefined,
      expiresAt: undefined,
      isExpired: false,
      error: undefined
    }));
  }, []);

  // Cargar estado inicial
  useEffect(() => {
    loadSyncStatus();
    checkSyncStatus();
  }, [loadSyncStatus, checkSyncStatus]);

  // Verificar estado periódicamente (cada 5 minutos)
  useEffect(() => {
    const interval = setInterval(checkSyncStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkSyncStatus]);

  return {
    status,
    generateSyncCode,
    linkDevice,
    syncData,
    updateRemoteData,
    getDeviceFingerprint,
    clearSyncData,
    checkSyncStatus
  };
}