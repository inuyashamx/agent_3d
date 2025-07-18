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

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  
  const scene = useGameSceneStore(state => state.scene);
  const assets = useGameSceneStore(state => state.assets);
  const config = useGameSceneStore(state => state.config);
  const { loadScene: loadSceneAction, updateConfig: updateConfigAction, addChatEntry, generateUniqueAssetName, getAssetByName, addAsset, updateAsset, deleteAsset, addInstance, updateInstance, deleteInstance, exportScene } = useGameSceneActions();

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

        // Cargar configuración guardada
        const savedConfig = await loadConfig();
        if (savedConfig) {
          updateConfigAction(savedConfig);
        }

        setInitialized(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
        setError('Error al cargar los datos guardados');
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [initialized, loadSceneAction, updateConfigAction]);

  // Auto-guardar la escena cuando cambie - solo después de inicializar
  useEffect(() => {
    if (initialized && scene && scene.updatedAt) {
      const timeoutId = setTimeout(() => {
        saveScene(scene).catch(error => {
          console.error('Error al guardar escena:', error);
        });
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [scene, initialized]);

  // Auto-guardar la configuración cuando cambie - solo después de inicializar
  useEffect(() => {
    if (initialized && config) {
      const timeoutId = setTimeout(() => {
        saveConfig(config).catch(error => {
          console.error('Error al guardar configuración:', error);
        });
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [config, initialized]);

  // Obtener parámetros por defecto para cada forma
  const getDefaultParams = useCallback((shape: string) => {
    switch (shape) {
      case 'sphere':
        return { radius: 1, widthSegments: 32, heightSegments: 16 };
      case 'box':
        return { width: 1, height: 1, depth: 1 };
      case 'cylinder':
        return { radiusTop: 1, radiusBottom: 1, height: 2, radialSegments: 32 };
      case 'capsule':
        return { radius: 0.5, length: 2, capSegments: 4, radialSegments: 16 };
      case 'plane':
        return { width: 2, height: 2, widthSegments: 1, heightSegments: 1 };
      default:
        return {};
    }
  }, []);

  // Ejecutar un comando específico
  const executeCommand = useCallback(async (command: Command) => {
    switch (command.action) {
      case 'add_primitive':
        const name = command.name || generateUniqueName(command.shape);
        const newObj = {
          id: `${command.shape}_${Date.now()}`,
          name,
          shape: command.shape,
          params: getDefaultParams(command.shape),
          position: command.position || [0, 0, 0] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          scale: [1, 1, 1] as [number, number, number],
          material: {
            color: command.color || '#4299e1'
          },
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        addObject(newObj);
        break;

      case 'delete':
        const objToDelete = getObjectByName(command.target);
        if (objToDelete) {
          deleteObject(objToDelete.id);
        }
        break;

      case 'set_material':
        const objToColor = getObjectByName(command.target);
        if (objToColor) {
          updateObject(objToColor.id, {
            material: {
              ...objToColor.material,
              color: command.color || objToColor.material.color
            }
          });
        }
        break;

      case 'set_position':
        const objToMove = getObjectByName(command.target);
        if (objToMove) {
          updateObject(objToMove.id, {
            position: command.position
          });
        }
        break;

      case 'place_above':
        const targetObj = getObjectByName(command.target);
        const baseObj = getObjectByName(command.base);
        if (targetObj && baseObj) {
          // Lógica simplificada para colocar arriba
          const newY = baseObj.position[1] + 2; // 2 unidades arriba
          updateObject(targetObj.id, {
            position: [baseObj.position[0], newY, baseObj.position[2]]
          });
        }
        break;
    }
  }, [generateUniqueName, getDefaultParams, addObject, getObjectByName, deleteObject, updateObject]);

  // Procesar comandos del chat
  const handleCommand = useCallback(async (input: string) => {
    try {
      const objectNames = Object.values(scene.objects).map((obj: any) => obj.name);
      const context = {
        lastMentionedObject: scene.lastMention,
        currentObjects: objectNames,
        language: config.language
      };

      const commands = parseCommand(input, context);
      const response = generateResponse(commands, config.language);

      // Ejecutar comandos válidos
      for (const command of commands) {
        if (command.action === 'ask') {
          // Los comandos "ask" solo se muestran en el log
          continue;
        }

        await executeCommand(command);
      }

      // Agregar entrada al log del chat
      addChatEntry({
        userInput: input,
        commands,
        response,
        success: true
      });

    } catch (error) {
      console.error('Error al procesar comando:', error);
      
      addChatEntry({
        userInput: input,
        commands: [],
        response: config.language === 'es' 
          ? 'Hubo un error al procesar tu comando.'
          : 'There was an error processing your command.',
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }, [scene.objects, scene.lastMention, config.language, addChatEntry, executeCommand]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-lg">Cargando AGI 3D MVP...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-400">Error</h2>
          <p className="text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Panel izquierdo - Chat y Log */}
      <div className="w-1/3 flex flex-col border-r border-gray-700 min-h-0">
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <h1 className="text-xl font-bold text-blue-400">
            AGI 3D MVP
          </h1>
          <p className="text-sm text-gray-400">
            Blender para IA - Sandbox 3D
          </p>
        </div>
        
        <div className="flex-1 flex flex-col min-h-0">
          {/* Log de comandos */}
          <div className="flex-1 overflow-auto min-h-0">
            <CommandLog />
          </div>
          
          {/* Panel de chat */}
          <div className="border-t border-gray-700 flex-shrink-0">
            <ChatPanel onCommand={handleCommand} />
          </div>
        </div>
      </div>

      {/* Panel derecho - Viewport 3D */}
      <div className="flex-1 relative">
        <Canvas
          camera={{ position: [5, 5, 5], fov: 60 }}
          className="viewport-container"
        >
          <Viewport />
        </Canvas>
        
        {/* Controles del viewport */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={() => updateConfigAction({ 
              showGrid: !config.showGrid 
            })}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              config.showGrid 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            Grid
          </button>
          
          <button
            onClick={() => updateConfigAction({ 
              showBoundingBoxes: !config.showBoundingBoxes 
            })}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              config.showBoundingBoxes 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            Bounds
          </button>
          
          <button
            onClick={() => {
              const sceneJson = exportScene();
              const blob = new Blob([sceneJson], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `scene-${Date.now()}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-3 py-1 rounded text-sm bg-green-600 hover:bg-green-700 transition-colors"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
}

export default App; 