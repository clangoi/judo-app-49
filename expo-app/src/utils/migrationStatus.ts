import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLegacyKeysWithData, clearLegacyData } from './migrateLegacyData';

export interface MigrationStatus {
  totalLegacyKeys: number;
  keysWithData: string[];
  migrationCompleted: boolean;
  lastMigrationCheck: string;
}

/**
 * Gets the current migration status
 */
export async function getMigrationStatus(): Promise<MigrationStatus> {
  const keysWithData = await getLegacyKeysWithData();
  
  return {
    totalLegacyKeys: keysWithData.length,
    keysWithData,
    migrationCompleted: keysWithData.length === 0,
    lastMigrationCheck: new Date().toISOString()
  };
}

/**
 * Clears all legacy data after confirming migration is complete
 */
export async function finalizeMigration(): Promise<boolean> {
  try {
    const status = await getMigrationStatus();
    
    if (!status.migrationCompleted) {
      console.warn('Cannot finalize migration - legacy data still exists');
      return false;
    }
    
    await clearLegacyData();
    
    // Mark migration as finalized
    await AsyncStorage.setItem('migration:finalized', new Date().toISOString());
    
    console.log('✅ Migration finalized - all legacy data cleared');
    return true;
  } catch (error) {
    console.error('❌ Failed to finalize migration:', error);
    return false;
  }
}

/**
 * Checks if migration has been finalized
 */
export async function isMigrationFinalized(): Promise<boolean> {
  try {
    const finalized = await AsyncStorage.getItem('migration:finalized');
    return finalized !== null;
  } catch (error) {
    console.error('Error checking migration finalized status:', error);
    return false;
  }
}