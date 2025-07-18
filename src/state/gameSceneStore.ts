import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { 
  GameScene, 
  Asset, 
  SceneInstance, 
  createDefaultGameScene,
  createDefaultAsset,
  createDefaultTransform,
  Vec3
} from './gameTypes';
import { 
  ChatLogEntry, 
  Command, 
  AppConfig 
} from './types';

interface GameSceneStore {
  // Estado principal
  scene: GameScene;
  assets: Record<string, Asset>;
  chatLog: ChatLogEntry[];
  config: AppConfig;
  
  // Acciones de assets
  addAsset: (asset: Asset) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  
  // Acciones de instancias
  addInstance: (assetId: string, transform?: any) => void;
  updateInstance: (id: string, updates: Partial<SceneInstance>) => void;
  deleteInstance: (id: string) => void;
  
  // Acciones de la escena
  clearScene: () => void;
  loadScene: (scene: GameScene) => void;
  setLastMention: (id?: string) => void;
  
  // Helpers para assets
  getAssetByName: (name: string) => Asset | undefined;
  getAssetById: (id: string) => Asset | undefined;
  getAssetNames: () => string[];
  generateUniqueAssetName: (baseName: string) => string;
  
  // Helpers para instancias
  getInstanceById: (id: string) => SceneInstance | undefined;
  getInstancesByAssetId: (assetId: string) => SceneInstance[];
  generateUniqueInstanceName: (baseName: string) => string;
  
  // Acciones del chat
  addChatEntry: (entry: Omit<ChatLogEntry, 'id' | 'timestamp'>) => void;
  clearChatLog: () => void;
  
  // Configuración
  updateConfig: (updates: Partial<AppConfig>) => void;
  
  // Utilidades
  exportScene: () => string;
  getSceneStats: () => {
    assetCount: number;
    instanceCount: number;
    assetTypes: Record<string, number>;
  };
}

export const useGameSceneStore = create<GameSceneStore>()(
  subscribeWithSelector((set, get) => ({
    // Estado inicial
    scene: createDefaultGameScene('Nueva Escena'),
    assets: {},
    chatLog: [],
    config: {
      showBoundingBoxes: false,
      showGrid: true,
      showAxes: true,
      autoSave: true,
      language: 'es'
    },
    
    // Acciones de assets
    addAsset: (asset: Asset) => {
      set((state) => {
        const now = new Date().toISOString();
        const updatedAsset = { ...asset, createdAt: now, updatedAt: now };
        
        return {
          assets: {
            ...state.assets,
            [asset.id]: updatedAsset
          }
        };
      });
    },
    
    updateAsset: (id: string, updates: Partial<Asset>) => {
      set((state) => {
        const existing = state.assets[id];
        if (!existing) return state;
        
        const now = new Date().toISOString();
        const updatedAsset = { ...existing, ...updates, updatedAt: now };
        
        return {
          assets: {
            ...state.assets,
            [id]: updatedAsset
          }
        };
      });
    },
    
    deleteAsset: (id: string) => {
      set((state) => {
        const { [id]: removed, ...remaining } = state.assets;
        
        // También eliminar todas las instancias de este asset
        const instances = { ...state.scene.instances };
        Object.keys(instances).forEach(instanceId => {
          if (instances[instanceId].prefabId === id) {
            delete instances[instanceId];
          }
        });
        
        return {
          assets: remaining,
          scene: {
            ...state.scene,
            instances,
            updatedAt: new Date().toISOString()
          }
        };
      });
    },
    
    // Acciones de instancias
    addInstance: (assetId: string, transform?: any) => {
      set((state) => {
        const asset = state.assets[assetId];
        if (!asset) return state;
        
        const instanceId = uuidv4();
        const newInstance: SceneInstance = {
          id: instanceId,
          prefabId: assetId,
          transform: transform || createDefaultTransform(),
          overrides: {},
          components: [],
          visible: true,
          locked: false,
          spawned: false,
        };
        
        return {
          scene: {
            ...state.scene,
            instances: {
              ...state.scene.instances,
              [instanceId]: newInstance
            },
            updatedAt: new Date().toISOString()
          }
        };
      });
    },
    
    updateInstance: (id: string, updates: Partial<SceneInstance>) => {
      set((state) => {
        const existing = state.scene.instances[id];
        if (!existing) return state;
        
        const updatedInstance = { ...existing, ...updates };
        
        return {
          scene: {
            ...state.scene,
            instances: {
              ...state.scene.instances,
              [id]: updatedInstance
            },
            updatedAt: new Date().toISOString()
          }
        };
      });
    },
    
    deleteInstance: (id: string) => {
      set((state) => {
        const { [id]: removed, ...remaining } = state.scene.instances;
        
        return {
          scene: {
            ...state.scene,
            instances: remaining,
            updatedAt: new Date().toISOString()
          }
        };
      });
    },
    
    // Acciones de la escena
    clearScene: () => {
      set(() => ({
        scene: createDefaultGameScene('Nueva Escena'),
        assets: {},
        chatLog: []
      }));
    },
    
    loadScene: (scene: GameScene) => {
      set(() => ({
        scene
      }));
    },
    
    setLastMention: (id?: string) => {
      set((state) => ({
        scene: {
          ...state.scene,
          lastModified: {
            ...state.scene.lastModified,
            at: new Date().toISOString()
          }
        }
      }));
    },
    
    // Helpers para assets
    getAssetByName: (name: string) => {
      const state = get();
      return Object.values(state.assets).find(asset => asset.name === name);
    },
    
    getAssetById: (id: string) => {
      const state = get();
      return state.assets[id];
    },
    
    getAssetNames: () => {
      const state = get();
      return Object.values(state.assets).map(asset => asset.name);
    },
    
    generateUniqueAssetName: (baseName: string) => {
      const state = get();
      const names = Object.values(state.assets).map(asset => asset.name);
      let counter = 1;
      let uniqueName = baseName;
      
      while (names.includes(uniqueName)) {
        uniqueName = `${baseName}_${counter}`;
        counter++;
      }
      
      return uniqueName;
    },
    
    // Helpers para instancias
    getInstanceById: (id: string) => {
      const state = get();
      return state.scene.instances[id];
    },
    
    getInstancesByAssetId: (assetId: string) => {
      const state = get();
      return Object.values(state.scene.instances).filter(instance => instance.prefabId === assetId);
    },
    
    generateUniqueInstanceName: (baseName: string) => {
      const state = get();
      const instances = Object.values(state.scene.instances);
      let counter = 1;
      let uniqueName = baseName;
      
      while (instances.some(instance => instance.id === uniqueName)) {
        uniqueName = `${baseName}_${counter}`;
        counter++;
      }
      
      return uniqueName;
    },
    
    // Acciones del chat
    addChatEntry: (entry: Omit<ChatLogEntry, 'id' | 'timestamp'>) => {
      set((state) => ({
        chatLog: [...state.chatLog, {
          ...entry,
          id: uuidv4(),
          timestamp: Date.now()
        }]
      }));
    },
    
    clearChatLog: () => {
      set(() => ({
        chatLog: []
      }));
    },
    
    // Configuración
    updateConfig: (updates: Partial<AppConfig>) => {
      set((state) => ({
        config: { ...state.config, ...updates }
      }));
    },
    
    // Utilidades
    exportScene: () => {
      const state = get();
      return JSON.stringify({
        scene: state.scene,
        assets: state.assets
      }, null, 2);
    },
    
    getSceneStats: () => {
      const state = get();
      const assetCount = Object.keys(state.assets).length;
      const instanceCount = Object.keys(state.scene.instances).length;
      const assetTypes: Record<string, number> = {};
      
      Object.values(state.assets).forEach(asset => {
        assetTypes[asset.type] = (assetTypes[asset.type] || 0) + 1;
      });
      
      return {
        assetCount,
        instanceCount,
        assetTypes
      };
    }
  }))
);

// Hook para acciones del store
export const useGameSceneActions = () => {
  const store = useGameSceneStore();
  return {
    // Assets
    addAsset: store.addAsset,
    updateAsset: store.updateAsset,
    deleteAsset: store.deleteAsset,
    getAssetByName: store.getAssetByName,
    getAssetById: store.getAssetById,
    getAssetNames: store.getAssetNames,
    generateUniqueAssetName: store.generateUniqueAssetName,
    
    // Instancias
    addInstance: store.addInstance,
    updateInstance: store.updateInstance,
    deleteInstance: store.deleteInstance,
    getInstanceById: store.getInstanceById,
    getInstancesByAssetId: store.getInstancesByAssetId,
    generateUniqueInstanceName: store.generateUniqueInstanceName,
    
    // Escena
    clearScene: store.clearScene,
    loadScene: store.loadScene,
    setLastMention: store.setLastMention,
    
    // Chat
    addChatEntry: store.addChatEntry,
    clearChatLog: store.clearChatLog,
    
    // Config
    updateConfig: store.updateConfig,
    
    // Utilidades
    exportScene: store.exportScene,
    getSceneStats: store.getSceneStats
  };
}; 