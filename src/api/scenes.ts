import { SceneData } from '@/state/types';

// Tipos para respuestas de API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SceneApiData {
  _id?: string;
  id: string;
  data: SceneData;
  timestamp: string;
  userId?: string;
}

// Clase para manejar errores de API
export class ApiError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = 'ApiError';
  }
}

// Función helper para manejar respuestas
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.error || `HTTP error! status: ${response.status}`,
      response.status
    );
  }
  
  const data = await response.json();
  if (!data.success) {
    throw new ApiError(data.error || 'Unknown API error', 500);
  }
  
  return data.data;
}

// Funciones para el API de escenas
export async function saveSceneToAPI(sceneData: SceneData, userId?: string): Promise<SceneApiData> {
  const response = await fetch('/api/scenes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: sceneData,
      userId: userId || 'default'
    }),
  });

  return handleApiResponse<SceneApiData>(response);
}

export async function loadSceneFromAPI(id: string): Promise<SceneApiData> {
  const response = await fetch(`/api/scenes/${id}`);
  return handleApiResponse<SceneApiData>(response);
}

export async function updateSceneInAPI(id: string, sceneData: SceneData): Promise<SceneApiData> {
  const response = await fetch(`/api/scenes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: sceneData
    }),
  });

  return handleApiResponse<SceneApiData>(response);
}

export async function deleteSceneFromAPI(id: string): Promise<void> {
  const response = await fetch(`/api/scenes/${id}`, {
    method: 'DELETE',
  });

  await handleApiResponse<void>(response);
}

export async function listScenesFromAPI(): Promise<SceneApiData[]> {
  const response = await fetch('/api/scenes');
  return handleApiResponse<SceneApiData[]>(response);
}

// Función para migrar datos de localStorage a API
export async function migrateFromLocalStorage(): Promise<void> {
  try {
    // Obtener datos actuales del localStorage
    const storedScene = localStorage.getItem('agi-3d-scene');
    
    if (storedScene) {
      const sceneData = JSON.parse(storedScene);
      
      // Validar que los datos sean válidos
      if (sceneData && sceneData.objects) {
        console.log('Migrando escena desde localStorage...');
        
        // Guardar en API
        const savedScene = await saveSceneToAPI(sceneData);
        
        // Guardar el ID de la escena en localStorage para referencia
        localStorage.setItem('current-scene-id', savedScene.id);
        
        console.log('Migración completada. ID de escena:', savedScene.id);
      }
    }
  } catch (error) {
    console.error('Error durante la migración:', error);
    throw error;
  }
}

// Función para obtener el ID de la escena actual
export function getCurrentSceneId(): string | null {
  return localStorage.getItem('current-scene-id');
}

// Función para establecer el ID de la escena actual
export function setCurrentSceneId(id: string): void {
  localStorage.setItem('current-scene-id', id);
} 