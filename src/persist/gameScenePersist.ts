import { GameScene, Asset } from '@/state/gameTypes';
import { AppConfig } from '@/state/types';

// Tipos para respuestas de API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
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

// APIs de Game Scenes
export async function saveGameSceneToAPI(scene: GameScene): Promise<GameScene> {
  const response = await fetch('/api/game-scenes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(scene),
  });

  return handleApiResponse<GameScene>(response);
}

export async function loadGameSceneFromAPI(id: string): Promise<GameScene> {
  const response = await fetch(`/api/game-scenes/${id}`);
  return handleApiResponse<GameScene>(response);
}

export async function updateGameSceneInAPI(id: string, scene: GameScene): Promise<GameScene> {
  const response = await fetch(`/api/game-scenes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(scene),
  });

  return handleApiResponse<GameScene>(response);
}

export async function deleteGameSceneFromAPI(id: string): Promise<void> {
  const response = await fetch(`/api/game-scenes/${id}`, {
    method: 'DELETE',
  });

  await handleApiResponse<void>(response);
}

export async function listGameScenesFromAPI(): Promise<GameScene[]> {
  const response = await fetch('/api/game-scenes');
  return handleApiResponse<GameScene[]>(response);
}

// APIs de Assets
export async function saveAssetToAPI(asset: Asset): Promise<Asset> {
  const response = await fetch('/api/assets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(asset),
  });

  return handleApiResponse<Asset>(response);
}

export async function loadAssetFromAPI(id: string): Promise<Asset> {
  const response = await fetch(`/api/assets/${id}`);
  return handleApiResponse<Asset>(response);
}

export async function updateAssetInAPI(id: string, asset: Asset): Promise<Asset> {
  const response = await fetch(`/api/assets/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(asset),
  });

  return handleApiResponse<Asset>(response);
}

export async function deleteAssetFromAPI(id: string): Promise<void> {
  const response = await fetch(`/api/assets/${id}`, {
    method: 'DELETE',
  });

  await handleApiResponse<void>(response);
}

export async function listAssetsFromAPI(): Promise<Asset[]> {
  const response = await fetch('/api/assets');
  return handleApiResponse<Asset[]>(response);
}

// APIs de Instancias
export async function addInstanceToAPI(sceneId: string, assetId: string, transform?: any): Promise<any> {
  const response = await fetch(`/api/game-scenes/${sceneId}/instances`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prefabId: assetId,
      transform: transform,
      overrides: {}
    }),
  });

  return handleApiResponse<any>(response);
}

export async function updateInstanceInAPI(sceneId: string, instanceId: string, updates: any): Promise<any> {
  const response = await fetch(`/api/game-scenes/${sceneId}/instances/${instanceId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  return handleApiResponse<any>(response);
}

export async function deleteInstanceFromAPI(sceneId: string, instanceId: string): Promise<void> {
  const response = await fetch(`/api/game-scenes/${sceneId}/instances/${instanceId}`, {
    method: 'DELETE',
  });

  await handleApiResponse<void>(response);
}

export async function transformInstanceInAPI(sceneId: string, instanceId: string, operation: string, data: any): Promise<any> {
  const response = await fetch(`/api/game-scenes/${sceneId}/instances/${instanceId}/transform`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      operation,
      ...data
    }),
  });

  return handleApiResponse<any>(response);
}

// Funciones de persistencia principales
export async function saveScene(scene: GameScene): Promise<void> {
  const currentId = getCurrentSceneId();
  
  if (currentId) {
    // Actualizar escena existente
    await updateGameSceneInAPI(currentId, scene);
    console.log('Escena actualizada en MongoDB');
  } else {
    // Crear nueva escena
    const savedScene = await saveGameSceneToAPI(scene);
    setCurrentSceneId(savedScene.id);
    console.log('Nueva escena creada en MongoDB:', savedScene.id);
  }
}

export async function loadScene(): Promise<GameScene | null> {
  const currentId = getCurrentSceneId();
  
  if (!currentId) {
    return null;
  }
  
  try {
    const scene = await loadGameSceneFromAPI(currentId);
    return scene;
  } catch (error) {
    console.error('Error cargando escena desde MongoDB:', error);
    throw error;
  }
}

export async function saveAsset(asset: Asset): Promise<Asset> {
  try {
    const savedAsset = await saveAssetToAPI(asset);
    console.log('Asset guardado en MongoDB:', savedAsset.id);
    return savedAsset;
  } catch (error) {
    console.error('Error guardando asset:', error);
    throw error;
  }
}

export async function loadAssets(): Promise<Asset[]> {
  try {
    const assets = await listAssetsFromAPI();
    return assets;
  } catch (error) {
    console.error('Error cargando assets:', error);
    throw error;
  }
}

export async function saveConfig(config: AppConfig): Promise<void> {
  localStorage.setItem('agi-3d-config', JSON.stringify(config));
}

export async function loadConfig(): Promise<AppConfig | null> {
  try {
    const stored = localStorage.getItem('agi-3d-config');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error cargando configuración:', error);
    return null;
  }
}

export async function initializeSystem(): Promise<void> {
  console.log('Inicializando sistema de persistencia GameScene...');
  
  // Verificar si hay assets y escenas en localStorage para migrar
  const legacyScene = localStorage.getItem('agi-3d-scene');
  if (legacyScene) {
    console.log('Detectado scene legacy, considera migrar manualmente');
  }
  
  console.log('Sistema de persistencia inicializado');
}

export function getCurrentSceneId(): string | null {
  return localStorage.getItem('current-scene-id');
}

export function setCurrentSceneId(id: string): void {
  localStorage.setItem('current-scene-id', id);
}

export function clearCurrentSceneId(): void {
  localStorage.removeItem('current-scene-id');
}

export async function createNewScene(scene: GameScene): Promise<string> {
  const savedScene = await saveGameSceneToAPI(scene);
  setCurrentSceneId(savedScene.id);
  return savedScene.id;
}

export async function switchToScene(sceneId: string): Promise<GameScene> {
  const scene = await loadGameSceneFromAPI(sceneId);
  setCurrentSceneId(sceneId);
  return scene;
}

export async function getSystemStatus(): Promise<{
  initialized: boolean;
  currentSceneId: string | null;
  hasConfig: boolean;
}> {
  return {
    initialized: true,
    currentSceneId: getCurrentSceneId(),
    hasConfig: localStorage.getItem('agi-3d-config') !== null,
  };
} 