import { SceneData, SceneDataSchema, AppConfig, AppConfigSchema } from './state/types';

// Claves para localStorage
const SCENE_STORAGE_KEY = 'agi-3d-scene';
const CONFIG_STORAGE_KEY = 'agi-3d-config';
const BACKUP_STORAGE_KEY = 'agi-3d-backup';

// Guardar escena en localStorage
export function saveScene(scene: SceneData): void {
  try {
    // Validar la escena antes de guardar
    const validatedScene = SceneDataSchema.parse(scene);
    
    // Crear backup de la escena actual
    const currentScene = loadScene();
    if (currentScene) {
      localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(currentScene));
    }
    
    // Guardar nueva escena
    localStorage.setItem(SCENE_STORAGE_KEY, JSON.stringify(validatedScene));
  } catch (error) {
    console.error('Error al guardar escena:', error);
    throw new Error('No se pudo guardar la escena');
  }
}

// Cargar escena desde localStorage
export function loadScene(): SceneData | null {
  try {
    const stored = localStorage.getItem(SCENE_STORAGE_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    const validatedScene = SceneDataSchema.parse(parsed);
    
    return validatedScene;
  } catch (error) {
    console.error('Error al cargar escena:', error);
    
    // Intentar cargar desde backup
    return loadBackupScene();
  }
}

// Cargar escena de backup
export function loadBackupScene(): SceneData | null {
  try {
    const stored = localStorage.getItem(BACKUP_STORAGE_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    const validatedScene = SceneDataSchema.parse(parsed);
    
    console.log('Escena de backup cargada correctamente');
    return validatedScene;
  } catch (error) {
    console.error('Error al cargar escena de backup:', error);
    return null;
  }
}

// Guardar configuración en localStorage
export function saveConfig(config: AppConfig): void {
  try {
    const validatedConfig = AppConfigSchema.parse(config);
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(validatedConfig));
  } catch (error) {
    console.error('Error al guardar configuración:', error);
    throw new Error('No se pudo guardar la configuración');
  }
}

// Cargar configuración desde localStorage
export function loadConfig(): AppConfig | null {
  try {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    const validatedConfig = AppConfigSchema.parse(parsed);
    
    return validatedConfig;
  } catch (error) {
    console.error('Error al cargar configuración:', error);
    return null;
  }
}

// Limpiar todos los datos almacenados
export function clearAllData(): void {
  try {
    localStorage.removeItem(SCENE_STORAGE_KEY);
    localStorage.removeItem(CONFIG_STORAGE_KEY);
    localStorage.removeItem(BACKUP_STORAGE_KEY);
    
    console.log('Todos los datos han sido limpiados');
  } catch (error) {
    console.error('Error al limpiar datos:', error);
  }
}

// Exportar escena como archivo JSON
export function exportSceneAsFile(scene: SceneData, filename?: string): void {
  try {
    const validatedScene = SceneDataSchema.parse(scene);
    const jsonString = JSON.stringify(validatedScene, null, 2);
    
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `agi-3d-scene-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    
    console.log('Escena exportada correctamente');
  } catch (error) {
    console.error('Error al exportar escena:', error);
    throw new Error('No se pudo exportar la escena');
  }
}

// Importar escena desde archivo JSON
export function importSceneFromFile(file: File): Promise<SceneData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const jsonString = event.target?.result as string;
        const parsed = JSON.parse(jsonString);
        const validatedScene = SceneDataSchema.parse(parsed);
        
        resolve(validatedScene);
      } catch (error) {
        console.error('Error al importar escena:', error);
        reject(new Error('Archivo de escena inválido'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };
    
    reader.readAsText(file);
  });
}

// Obtener estadísticas de almacenamiento
export function getStorageStats(): {
  sceneSize: number;
  configSize: number;
  backupSize: number;
  totalSize: number;
  available: boolean;
} {
  try {
    const sceneData = localStorage.getItem(SCENE_STORAGE_KEY);
    const configData = localStorage.getItem(CONFIG_STORAGE_KEY);
    const backupData = localStorage.getItem(BACKUP_STORAGE_KEY);
    
    const sceneSize = sceneData ? new Blob([sceneData]).size : 0;
    const configSize = configData ? new Blob([configData]).size : 0;
    const backupSize = backupData ? new Blob([backupData]).size : 0;
    
    return {
      sceneSize,
      configSize,
      backupSize,
      totalSize: sceneSize + configSize + backupSize,
      available: true
    };
  } catch (error) {
    return {
      sceneSize: 0,
      configSize: 0,
      backupSize: 0,
      totalSize: 0,
      available: false
    };
  }
}

// Verificar si localStorage está disponible
export function isStorageAvailable(): boolean {
  try {
    const test = 'test';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
}

// Debounced save function para evitar muchas escrituras
let saveTimeout: ReturnType<typeof setTimeout>;

export function debouncedSaveScene(scene: SceneData, delay: number = 1000): void {
  clearTimeout(saveTimeout);
  
  saveTimeout = setTimeout(() => {
    saveScene(scene);
  }, delay);
}

// Función para migrar datos antiguos (si es necesario)
export function migrateOldData(): void {
  try {
    // Verificar si hay datos en formato antiguo
    const oldData = localStorage.getItem('old-scene-key'); // Ejemplo
    if (oldData) {
      console.log('Migrando datos antiguos...');
      // Aquí iría la lógica de migración
      localStorage.removeItem('old-scene-key');
    }
  } catch (error) {
    console.error('Error al migrar datos antiguos:', error);
  }
}

// Función para validar integridad de datos
export function validateStoredData(): {
  scene: boolean;
  config: boolean;
  backup: boolean;
} {
  const result = {
    scene: false,
    config: false,
    backup: false
  };
  
  try {
    // Validar escena
    const sceneData = localStorage.getItem(SCENE_STORAGE_KEY);
    if (sceneData) {
      const parsed = JSON.parse(sceneData);
      SceneDataSchema.parse(parsed);
      result.scene = true;
    }
  } catch (error) {
    console.error('Escena almacenada inválida:', error);
  }
  
  try {
    // Validar configuración
    const configData = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (configData) {
      const parsed = JSON.parse(configData);
      AppConfigSchema.parse(parsed);
      result.config = true;
    }
  } catch (error) {
    console.error('Configuración almacenada inválida:', error);
  }
  
  try {
    // Validar backup
    const backupData = localStorage.getItem(BACKUP_STORAGE_KEY);
    if (backupData) {
      const parsed = JSON.parse(backupData);
      SceneDataSchema.parse(parsed);
      result.backup = true;
    }
  } catch (error) {
    console.error('Backup almacenado inválido:', error);
  }
  
  return result;
}

// Hook para persistencia automática
export function useAutoPersist() {
  // Esta función se usará en el componente principal
  // para configurar la persistencia automática
  return {
    saveScene: debouncedSaveScene,
    loadScene,
    saveConfig,
    loadConfig,
    clearAllData,
    exportSceneAsFile,
    importSceneFromFile,
    getStorageStats,
    isStorageAvailable,
    validateStoredData
  };
} 