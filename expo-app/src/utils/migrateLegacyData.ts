import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from './generateId';

interface CrudItem {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Mapping of legacy keys to new namespaced keys
 */
const LEGACY_KEY_MAPPING: Record<string, string> = {
  // Physical Training
  'workout-sessions': 'expo:fisica:sessions',
  
  // Sports Training 
  'sports-sessions': 'expo:deportivo:sessions',
  
  // Techniques
  'techniques': 'expo:tecnicas:techniques',
  
  // Tactics
  'tactical-plans': 'expo:tactica:plans',
  'opponent-analyses': 'expo:tactica:opponents',
  'training-drills': 'expo:tactica:drills',
  
  // Weight Control
  'weight-entries': 'expo:weight:entries',
  'weight-goals': 'expo:weight:goals',
  'nutrition-entries': 'expo:weight:nutrition'
};

/**
 * Migrates data from a legacy storage key to a new namespaced key
 * Automatically adds required CrudItem fields (id, createdAt, updatedAt) if missing
 */
export async function migrateLegacyData<T extends CrudItem>(
  newKey: string,
  transformLegacyItem?: (item: any) => Partial<T>
): Promise<T[]> {
  try {
    // Find the legacy key that maps to this new key
    const legacyKey = Object.keys(LEGACY_KEY_MAPPING).find(
      key => LEGACY_KEY_MAPPING[key] === newKey
    );

    if (!legacyKey) {
      // No legacy mapping found, return empty array
      return [];
    }

    // Check if migration already happened
    const migrationMarker = `${newKey}:migrated`;
    const alreadyMigrated = await AsyncStorage.getItem(migrationMarker);
    
    if (alreadyMigrated) {
      // Migration already completed
      return [];
    }

    // Check if new key already has data
    const existingData = await AsyncStorage.getItem(newKey);
    if (existingData) {
      // New key already has data, mark as migrated and skip
      await AsyncStorage.setItem(migrationMarker, 'true');
      return [];
    }

    // Get legacy data
    const legacyData = await AsyncStorage.getItem(legacyKey);
    if (!legacyData) {
      // No legacy data to migrate
      await AsyncStorage.setItem(migrationMarker, 'true');
      return [];
    }

    let legacyItems: any[] = [];
    try {
      legacyItems = JSON.parse(legacyData);
    } catch (error) {
      console.warn(`Failed to parse legacy data for key ${legacyKey}:`, error);
      await AsyncStorage.setItem(migrationMarker, 'true');
      return [];
    }

    if (!Array.isArray(legacyItems)) {
      console.warn(`Legacy data for key ${legacyKey} is not an array`);
      await AsyncStorage.setItem(migrationMarker, 'true');
      return [];
    }

    // Transform legacy items to new format
    const migratedItems: T[] = legacyItems.map((legacyItem) => {
      // Apply custom transformation if provided
      const transformedItem = transformLegacyItem ? transformLegacyItem(legacyItem) : legacyItem;
      
      // Ensure required CrudItem fields exist
      const now = new Date().toISOString();
      
      return {
        ...transformedItem,
        id: transformedItem.id || legacyItem.id || generateId(),
        createdAt: transformedItem.createdAt || legacyItem.createdAt || legacyItem.date || now,
        updatedAt: transformedItem.updatedAt || legacyItem.updatedAt || legacyItem.date || now
      } as T;
    });

    // Save migrated data to new key
    if (migratedItems.length > 0) {
      await AsyncStorage.setItem(newKey, JSON.stringify(migratedItems));
      console.log(`✅ Migrated ${migratedItems.length} items from ${legacyKey} to ${newKey}`);
    }

    // Mark migration as completed
    await AsyncStorage.setItem(migrationMarker, 'true');
    
    // Optionally remove legacy data (commented out for safety)
    // await AsyncStorage.removeItem(legacyKey);
    
    return migratedItems;
  } catch (error) {
    console.error(`❌ Failed to migrate legacy data for key ${newKey}:`, error);
    return [];
  }
}

/**
 * Gets a list of all legacy keys that still have data
 */
export async function getLegacyKeysWithData(): Promise<string[]> {
  const legacyKeysWithData: string[] = [];
  
  for (const legacyKey of Object.keys(LEGACY_KEY_MAPPING)) {
    try {
      const data = await AsyncStorage.getItem(legacyKey);
      if (data) {
        legacyKeysWithData.push(legacyKey);
      }
    } catch (error) {
      console.warn(`Failed to check legacy key ${legacyKey}:`, error);
    }
  }
  
  return legacyKeysWithData;
}

/**
 * Clears all legacy data (use with caution)
 */
export async function clearLegacyData(): Promise<void> {
  const legacyKeys = Object.keys(LEGACY_KEY_MAPPING);
  
  for (const legacyKey of legacyKeys) {
    try {
      await AsyncStorage.removeItem(legacyKey);
      console.log(`🗑️ Cleared legacy key: ${legacyKey}`);
    } catch (error) {
      console.warn(`Failed to clear legacy key ${legacyKey}:`, error);
    }
  }
}