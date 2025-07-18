import { SceneData, AppConfig } from '@/state/types';
import { 
  saveSceneToAPI, 
  loadSceneFromAPI, 
  updateSceneInAPI, 
  getCurrentSceneId, 
  setCurrentSceneId
} from '@/api/scenes';

// Función para guardar escena (solo MongoDB)
export async function saveScene(scene: SceneData): Promise<void> {
  const currentId = getCurrentSceneId();
  
  if (currentId) {
    // Actualizar escena existente
    await updateSceneInAPI(currentId, scene);
    console.log('Escena actualizada en MongoDB');
  } else {
    // Crear nueva escena
    const savedScene = await saveSceneToAPI(scene);
    setCurrentSceneId(savedScene.id);
    console.log('Nueva escena creada en MongoDB:', savedScene.id);
  }
}

// Función para cargar escena (solo MongoDB)
export async function loadScene(): Promise<SceneData | null> {
  const currentId = getCurrentSceneId();
  
  if (!currentId) {
    return null;
  }
  
  try {
    const apiScene = await loadSceneFromAPI(currentId);
    return apiScene.data;
  } catch (error) {
    console.error('Error cargando escena desde MongoDB:', error);
    throw error;
  }
}

// Función para guardar configuración (localStorage por ahora)
export async function saveConfig(config: AppConfig): Promise<void> {
  localStorage.setItem('agi-3d-config', JSON.stringify(config));
}

// Función para cargar configuración (localStorage por ahora)
export async function loadConfig(): Promise<AppConfig | null> {
  try {
    const stored = localStorage.getItem('agi-3d-config');
    if (!stored) return null;
    
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error cargando configuración:', error);
    return null;
  }
}

// Función para inicializar sistema
export async function initializeSystem(): Promise<void> {
  console.log('Sistema inicializado: MongoDB only');
  
  // Verificar si hay una escena actual
  const currentId = getCurrentSceneId();
  if (currentId) {
    console.log('Escena actual:', currentId);
  } else {
    console.log('No hay escena actual, se creará una nueva al hacer cambios');
  }
}

// Función para obtener estado del sistema
export async function getSystemStatus(): Promise<{
  mongoAvailable: boolean;
  currentSceneId?: string;
}> {
  try {
    const response = await fetch('/api/scenes', { method: 'GET' });
    const mongoAvailable = response.ok;
    const currentId = getCurrentSceneId();
    
    return {
      mongoAvailable,
      currentSceneId: currentId || undefined
    };
  } catch (error) {
    return {
      mongoAvailable: false,
      currentSceneId: getCurrentSceneId() || undefined
    };
  }
}

// Función para crear nueva escena
export async function createNewScene(scene: SceneData): Promise<string> {
  const savedScene = await saveSceneToAPI(scene);
  setCurrentSceneId(savedScene.id);
  console.log('Nueva escena creada:', savedScene.id);
  return savedScene.id;
}

// Función para cambiar escena activa
export async function switchToScene(sceneId: string): Promise<SceneData> {
  const apiScene = await loadSceneFromAPI(sceneId);
  setCurrentSceneId(sceneId);
  console.log('Cambiado a escena:', sceneId);
  return apiScene.data;
} 