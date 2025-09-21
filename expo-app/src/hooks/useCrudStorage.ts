import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncManager } from './useSyncManager';
import { generateId } from '../utils/generateId';

interface CrudStorageOptions {
  storageKey: string;
  remotePayloadKey: string;
}

interface CrudItem {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export function useCrudStorage<T extends CrudItem>(options: CrudStorageOptions) {
  const { storageKey, remotePayloadKey } = options;
  const { updateRemoteData } = useSyncManager();
  
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load items from storage
  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const stored = await AsyncStorage.getItem(storageKey);
      if (stored) {
        const parsedItems = JSON.parse(stored);
        setItems(parsedItems);
      } else {
        setItems([]);
      }
    } catch (err) {
      setError('Error loading data');
      console.error('Error loading items:', err);
    } finally {
      setIsLoading(false);
    }
  }, [storageKey]);

  // Save items to storage and sync
  const saveToStorage = useCallback(async (newItems: T[]) => {
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(newItems));
      setItems(newItems);
      
      // Update remote data for sync
      const syncPayload = {
        [remotePayloadKey]: newItems,
        updatedAt: new Date().toISOString()
      };
      updateRemoteData(syncPayload);
    } catch (err) {
      setError('Error saving data');
      console.error('Error saving items:', err);
    }
  }, [storageKey, remotePayloadKey, updateRemoteData]);

  // Create new item
  const create = useCallback(async (itemData: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newItem: T = {
      ...itemData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    } as T;

    const newItems = [newItem, ...items];
    await saveToStorage(newItems);
    return newItem;
  }, [items, saveToStorage]);

  // Update existing item
  const update = useCallback(async (id: string, itemData: Partial<Omit<T, 'id' | 'createdAt'>>) => {
    const itemIndex = items.findIndex(item => item.id === id);
    if (itemIndex === -1) {
      throw new Error('Item not found');
    }

    const updatedItem: T = {
      ...items[itemIndex],
      ...itemData,
      updatedAt: new Date().toISOString(),
    };

    const newItems = [...items];
    newItems[itemIndex] = updatedItem;
    await saveToStorage(newItems);
    return updatedItem;
  }, [items, saveToStorage]);

  // Remove item
  const remove = useCallback(async (id: string) => {
    const newItems = items.filter(item => item.id !== id);
    await saveToStorage(newItems);
  }, [items, saveToStorage]);

  // Replace all items (for migration or bulk operations)
  const replaceAll = useCallback(async (newItems: T[]) => {
    await saveToStorage(newItems);
  }, [saveToStorage]);

  // Load items on mount
  useEffect(() => {
    load();
  }, [load]);

  return {
    items,
    isLoading,
    error,
    load,
    create,
    update,
    remove,
    replaceAll,
  };
}