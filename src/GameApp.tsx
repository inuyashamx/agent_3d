import React, { useEffect, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Viewport } from './components/Viewport';
import { ChatPanel } from './components/ChatPanel';
import { CommandLog } from './components/CommandLog';
import { useGameSceneStore, useGameSceneActions } from './state/gameSceneStore';
import { parseCommand, generateResponse } from './ai/parser';
import { Command } from './state/types';
import { 
  initializeSystem, 
  loadScene, 
  loadConfig, 
  saveScene, 
  saveConfig,
  getSystemStatus,
  loadAssets,
  saveAsset
} from './persist/gameScenePersist';

function GameApp() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  
  const scene = useGameSceneStore(state => state.scene);
  const assets = useGameSceneStore(state => state.assets);
  const config = useGameSceneStore(state => state.config);
  const { 
    loadScene: loadSceneAction, 
    updateConfig: updateConfigAction, 
    addChatEntry, 
    generateUniqueAssetName, 
    getAssetByName, 
    addAsset, 
    updateAsset, 
    deleteAsset,
    addInstance,
    updateInstance,
    deleteInstance,
    exportScene 
  } = useGameSceneActions();

  // Cargar datos iniciales - solo una vez
  useEffect(() => {
    if (initialized) return;
    
    const initializeApp = async () => {
      try {
        // Inicializar sistema MongoDB
        await initializeSystem();
        
        // Obtener estado del sistema
        const status = await getSystemStatus();
        console.log('Estado del sistema:', status);
        
        // Cargar escena guardada
        const savedScene = await loadScene();
        if (savedScene) {
          loadSceneAction(savedScene);
        }

        // Cargar assets
        const savedAssets = await loadAssets();
        if (savedAssets && savedAssets.length > 0) {
          // Cargar assets al store
          savedAssets.forEach(asset => {
            addAsset(asset);
          });
        }

        // Cargar configuración guardada
        const savedConfig = await loadConfig();
        if (savedConfig) {
          updateConfigAction(savedConfig);
        }

        setInitialized(true);
      } catch (error) {
        console.error('Error inicializando aplicación:', error);
        setError(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [initialized, loadSceneAction, updateConfigAction, addAsset]);

  // Auto-guardar escena cuando cambie
  useEffect(() => {
    if (!initialized) return;
    
    const autoSaveScene = async () => {
      try {
        await saveScene(scene);
      } catch (error) {
        console.error('Error auto-guardando escena:', error);
      }
    };

    // Debounce auto-save
    const timer = setTimeout(autoSaveScene, 2000);
    return () => clearTimeout(timer);
  }, [scene, initialized]);

  // Auto-guardar assets cuando cambien
  useEffect(() => {
    if (!initialized) return;
    
    const autoSaveAssets = async () => {
      try {
        // Guardar assets modificados
        const assetEntries = Object.entries(assets);
        for (const [id, asset] of assetEntries) {
          // Solo guardar si el asset fue modificado recientemente
          const lastModified = new Date(asset.updatedAt).getTime();
          const now = Date.now();
          if (now - lastModified < 5000) { // 5 segundos
            await saveAsset(asset);
          }
        }
      } catch (error) {
        console.error('Error auto-guardando assets:', error);
      }
    };

    // Debounce auto-save
    const timer = setTimeout(autoSaveAssets, 3000);
    return () => clearTimeout(timer);
  }, [assets, initialized]);

  // Auto-guardar configuración cuando cambie
  useEffect(() => {
    if (!initialized) return;
    
    const autoSaveConfig = async () => {
      try {
        await saveConfig(config);
      } catch (error) {
        console.error('Error auto-guardando configuración:', error);
      }
    };

    // Debounce auto-save
    const timer = setTimeout(autoSaveConfig, 1000);
    return () => clearTimeout(timer);
  }, [config, initialized]);

  // Manejo de comandos de chat
  const handleCommand = useCallback(async (input: string) => {
    try {
      const context = {
        lastMentionedObject: undefined,
        currentObjects: Object.keys(scene.instances),
        language: 'es' as const
      };
      
      const commands = parseCommand(input, context);
      const response = generateResponse(commands, 'es');
      
      // Agregar entrada al chat
      addChatEntry({
        userInput: input,
        commands: commands,
        response: response,
        success: true
      });
      
      // Ejecutar comandos
      if (commands && commands.length > 0) {
        for (const command of commands) {
          await executeCommand(command);
        }
      }
    } catch (error) {
      console.error('Error procesando comando:', error);
      addChatEntry({
        userInput: input,
        commands: [],
        response: 'Error procesando comando: ' + (error instanceof Error ? error.message : 'Error desconocido'),
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }, [scene, addChatEntry]);

  // Ejecutar comando desde AI
  const executeCommand = useCallback(async (command: Command) => {
    try {
      switch (command.action) {
        case 'add_primitive':
          // Crear asset a partir del comando
          const assetName = generateUniqueAssetName(command.name || command.shape);
          const newAsset = {
            id: `asset_${Date.now()}`,
            name: assetName,
            type: 'prefab' as const,
            data: {
              geometry: {
                type: command.shape === 'capsule' ? 'cylinder' : command.shape as 'box' | 'sphere' | 'cylinder' | 'plane' | 'custom',
                parameters: command.params || {}
              },
              material: {
                color: '#888888',
                opacity: 1.0,
                metallic: 0.2,
                roughness: 0.8,
                emissive: '#000000'
              },
              components: [],
              children: [],
              bounds: {
                min: [-1, -1, -1] as [number, number, number],
                max: [1, 1, 1] as [number, number, number],
                center: [0, 0, 0] as [number, number, number],
                size: [2, 2, 2] as [number, number, number]
              }
            },
            description: `Primitive ${command.shape}`,
            tags: ['primitive', command.shape],
            owner: {
              type: 'user' as const,
              id: 'default'
            },
            visibility: 'private' as const,
            permissions: {},
            collaborators: [],
            lastModified: {
              by: 'default',
              at: new Date().toISOString()
            },
            version: 1,
            usage: 0,
            rating: 0,
            downloads: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          addAsset(newAsset);
          
          // Crear instancia del asset
          const transform = {
            position: command.position || [0, 0, 0] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number]
          };
          
          addInstance(newAsset.id, transform);
          break;
        case 'delete':
          // Eliminar instancia por nombre
          const instanceToDelete = Object.values(scene.instances).find(instance => {
            const asset = assets[instance.prefabId];
            return asset && asset.name === command.target;
          });
          if (instanceToDelete) {
            deleteInstance(instanceToDelete.id);
          }
          break;
        case 'set_position':
          // Mover instancia
          const instanceToMove = Object.values(scene.instances).find(instance => {
            const asset = assets[instance.prefabId];
            return asset && asset.name === command.target;
          });
          if (instanceToMove) {
            updateInstance(instanceToMove.id, {
              transform: {
                ...instanceToMove.transform,
                position: command.position
              }
            });
          }
          break;
        default:
          console.warn('Comando desconocido:', command.action);
      }
    } catch (error) {
      console.error('Error ejecutando comando:', error);
    }
  }, [generateUniqueAssetName, addAsset, addInstance, scene.instances, assets, deleteInstance, updateInstance]);

  // Manejar exportación
  const handleExport = useCallback(() => {
    const exportData = exportScene();
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scene_${scene.name}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportScene, scene.name]);

  // Pantalla de carga
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-lg">Cargando AGI 3D MVP...</p>
          <p className="text-sm text-gray-400">Inicializando sistema de persistencia</p>
        </div>
      </div>
    );
  }

  // Pantalla de error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center max-w-md">
          <div className="bg-red-500 rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold">!</span>
          </div>
          <h2 className="text-xl font-bold mb-2">Error de Inicialización</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Aplicación principal
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex h-screen">
        {/* Panel lateral izquierdo */}
        <div className="w-96 bg-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h1 className="text-xl font-bold">AGI 3D MVP</h1>
            <p className="text-sm text-gray-400">Game Engine System</p>
          </div>
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden">
              <CommandLog />
            </div>
            <div className="flex-shrink-0">
              <ChatPanel onCommand={handleCommand} />
            </div>
          </div>
        </div>

        {/* Área principal */}
        <div className="flex-1 flex flex-col">
          {/* Viewport 3D */}
          <div className="flex-1 relative">
                         <Canvas camera={{ position: [0, 0, 5] }}>
               <Viewport />
             </Canvas>
          </div>

          {/* Estadísticas */}
          <div className="bg-gray-800 p-4 border-t border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <div className="flex space-x-6">
                <span>Assets: {Object.keys(assets).length}</span>
                <span>Instancias: {Object.keys(scene.instances).length}</span>
                <span>Escena: {scene.name}</span>
              </div>
              <div className="flex space-x-2">
                <span className="text-gray-400">
                  {config.showGrid ? '🔲' : '⬜'} Grid
                </span>
                <span className="text-gray-400">
                  {config.showAxes ? '🔴🟢🔵' : '⚪⚪⚪'} Axes
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameApp; 