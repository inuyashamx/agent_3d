import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { 
  SceneData, 
  Obj3D, 
  ChatLogEntry, 
  Command, 
  AppConfig, 
  createDefaultScene,
  createDefaultObj3D,
  Vec3
} from './types';

interface SceneStore {
  // Estado principal
  scene: SceneData;
  chatLog: ChatLogEntry[];
  config: AppConfig;
  
  // Acciones de la escena
  addObject: (obj: Obj3D) => void;
  updateObject: (id: string, updates: Partial<Obj3D>) => void;
  deleteObject: (id: string) => void;
  clearScene: () => void;
  loadScene: (scene: SceneData) => void;
  setLastMention: (id?: string) => void;
  
  // Helpers para objetos
  getObjectByName: (name: string) => Obj3D | undefined;
  getObjectById: (id: string) => Obj3D | undefined;
  getObjectNames: () => string[];
  generateUniqueName: (baseName: string) => string;
  
  // Acciones del chat
  addChatEntry: (entry: Omit<ChatLogEntry, 'id' | 'timestamp'>) => void;
  clearChatLog: () => void;
  
  // Configuración
  updateConfig: (updates: Partial<AppConfig>) => void;
  
  // Utilidades
  exportScene: () => string;
  getSceneStats: () => {
    objectCount: number;
    shapeCount: Record<string, number>;
    totalSize: number;
  };
}

export const useSceneStore = create<SceneStore>()(
  subscribeWithSelector((set, get) => ({
    // Estado inicial
    scene: createDefaultScene(),
    chatLog: [],
    config: {
      showBoundingBoxes: false,
      showGrid: true,
      showAxes: true,
      autoSave: true,
      language: 'es'
    },
    
    // Acciones de la escena
    addObject: (obj: Obj3D) => {
      set((state) => {
        const now = Date.now();
        const updatedObj = { ...obj, createdAt: now, updatedAt: now };
        
        return {
          scene: {
            ...state.scene,
            objects: {
              ...state.scene.objects,
              [obj.id]: updatedObj
            },
            lastMention: obj.id,
            updatedAt: now
          }
        };
      });
    },
    
    updateObject: (id: string, updates: Partial<Obj3D>) => {
      set((state) => {
        const existing = state.scene.objects[id];
        if (!existing) return state;
        
        const now = Date.now();
        const updatedObj = { ...existing, ...updates, updatedAt: now };
        
        return {
          scene: {
            ...state.scene,
            objects: {
              ...state.scene.objects,
              [id]: updatedObj
            },
            lastMention: id,
            updatedAt: now
          }
        };
      });
    },
    
    deleteObject: (id: string) => {
      set((state) => {
        const { [id]: removed, ...remaining } = state.scene.objects;
        const now = Date.now();
        
        return {
          scene: {
            ...state.scene,
            objects: remaining,
            lastMention: state.scene.lastMention === id ? undefined : state.scene.lastMention,
            updatedAt: now
          }
        };
      });
    },
    
    clearScene: () => {
      set(() => ({
        scene: createDefaultScene()
      }));
    },
    
    loadScene: (scene: SceneData) => {
      set(() => ({
        scene: { ...scene, updatedAt: Date.now() }
      }));
    },
    
    setLastMention: (id?: string) => {
      set((state) => ({
        scene: {
          ...state.scene,
          lastMention: id,
          updatedAt: Date.now()
        }
      }));
    },
    
    // Helpers para objetos
    getObjectByName: (name: string) => {
      const { scene } = get();
      return Object.values(scene.objects).find(obj => 
        obj.name.toLowerCase() === name.toLowerCase()
      );
    },
    
    getObjectById: (id: string) => {
      const { scene } = get();
      return scene.objects[id];
    },
    
    getObjectNames: () => {
      const { scene } = get();
      return Object.values(scene.objects).map(obj => obj.name);
    },
    
    generateUniqueName: (baseName: string) => {
      const { scene } = get();
      const existingNames = Object.values(scene.objects).map(obj => obj.name.toLowerCase());
      
      let counter = 1;
      let name = baseName;
      
      while (existingNames.includes(name.toLowerCase())) {
        name = `${baseName}${counter}`;
        counter++;
      }
      
      return name;
    },
    
    // Acciones del chat
    addChatEntry: (entry: Omit<ChatLogEntry, 'id' | 'timestamp'>) => {
      set((state) => ({
        chatLog: [
          ...state.chatLog,
          {
            ...entry,
            id: uuidv4(),
            timestamp: Date.now()
          }
        ]
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
        config: {
          ...state.config,
          ...updates
        }
      }));
    },
    
    // Utilidades
    exportScene: () => {
      const { scene } = get();
      return JSON.stringify(scene, null, 2);
    },
    
    getSceneStats: () => {
      const { scene } = get();
      const objects = Object.values(scene.objects);
      
      const shapeCount = objects.reduce((acc, obj) => {
        acc[obj.shape] = (acc[obj.shape] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return {
        objectCount: objects.length,
        shapeCount,
        totalSize: JSON.stringify(scene).length
      };
    }
  }))
);

// Selector hooks para componentes
export const useObjects = () => useSceneStore(state => state.scene.objects);
export const useObjectByName = (name: string) => useSceneStore(state => state.getObjectByName(name));
export const useObjectById = (id: string) => useSceneStore(state => state.getObjectById(id));
export const useLastMention = () => useSceneStore(state => state.scene.lastMention);
export const useChatLog = () => useSceneStore(state => state.chatLog);
export const useConfig = () => useSceneStore(state => state.config);
export const useSceneStats = () => useSceneStore(state => state.getSceneStats());

// Acciones como hooks - memoizadas para evitar recreaciones
const actions = {
  addObject: (state: any) => state.addObject,
  updateObject: (state: any) => state.updateObject,
  deleteObject: (state: any) => state.deleteObject,
  clearScene: (state: any) => state.clearScene,
  loadScene: (state: any) => state.loadScene,
  setLastMention: (state: any) => state.setLastMention,
  addChatEntry: (state: any) => state.addChatEntry,
  clearChatLog: (state: any) => state.clearChatLog,
  updateConfig: (state: any) => state.updateConfig,
  exportScene: (state: any) => state.exportScene,
  generateUniqueName: (state: any) => state.generateUniqueName,
  getObjectByName: (state: any) => state.getObjectByName,
  getObjectById: (state: any) => state.getObjectById
};

export const useSceneActions = () => useSceneStore(state => ({
  addObject: actions.addObject(state),
  updateObject: actions.updateObject(state),
  deleteObject: actions.deleteObject(state),
  clearScene: actions.clearScene(state),
  loadScene: actions.loadScene(state),
  setLastMention: actions.setLastMention(state),
  addChatEntry: actions.addChatEntry(state),
  clearChatLog: actions.clearChatLog(state),
  updateConfig: actions.updateConfig(state),
  exportScene: actions.exportScene(state),
  generateUniqueName: actions.generateUniqueName(state),
  getObjectByName: actions.getObjectByName(state),
  getObjectById: actions.getObjectById(state)
})); 