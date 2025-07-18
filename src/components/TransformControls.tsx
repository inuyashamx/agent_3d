import React, { useState, useEffect } from 'react';
import { useGameSceneStore, useGameSceneActions } from '../state/gameSceneStore';
import { SceneInstance, Vec3 } from '../state/gameTypes';
import { transformInstanceInAPI } from '../persist/gameScenePersist';

interface TransformControlsProps {
  selectedInstanceId: string | null;
}

export function TransformControls({ selectedInstanceId }: TransformControlsProps) {
  const scene = useGameSceneStore(state => state.scene);
  const assets = useGameSceneStore(state => state.assets);
  const { updateInstance } = useGameSceneActions();
  
  const [position, setPosition] = useState<Vec3>([0, 0, 0]);
  const [rotation, setRotation] = useState<Vec3>([0, 0, 0]);
  const [scale, setScale] = useState<Vec3>([1, 1, 1]);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [gridSize, setGridSize] = useState(0.5);
  const [isUpdating, setIsUpdating] = useState(false);

  const selectedInstance = selectedInstanceId ? scene.instances[selectedInstanceId] : null;
  const selectedAsset = selectedInstance ? assets[selectedInstance.prefabId] : null;

  // Sincronizar estado con la instancia seleccionada
  useEffect(() => {
    if (selectedInstance) {
      setPosition([...selectedInstance.transform.position]);
      setRotation([...selectedInstance.transform.rotation]);
      setScale([...selectedInstance.transform.scale]);
    }
  }, [selectedInstance]);

  const handleTransform = async (operation: 'move' | 'rotate' | 'scale', value: Vec3, isAbsolute: boolean = true) => {
    if (!selectedInstanceId || !selectedInstance) return;

    // Actualizar el estado local inmediatamente para respuesta rápida
    updateInstance(selectedInstanceId, {
      transform: {
        ...selectedInstance.transform,
        [operation === 'move' ? 'position' : operation === 'rotate' ? 'rotation' : 'scale']: value
      }
    });

    // Luego sincronizar con la API en segundo plano
    setIsUpdating(true);
    try {
      const payload = {
        operation,
        ...(isAbsolute ? { absolute: value } : { delta: value }),
        snap: snapToGrid,
        gridSize: snapToGrid ? gridSize : undefined
      };

      await transformInstanceInAPI(scene.id, selectedInstanceId, operation, payload);
    } catch (error) {
      console.error('Error transforming instance:', error);
      // Si hay error, revertir el cambio local
      updateInstance(selectedInstanceId, {
        transform: selectedInstance.transform
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePositionChange = (axis: 0 | 1 | 2, value: number) => {
    const newPosition = [...position] as Vec3;
    newPosition[axis] = value;
    setPosition(newPosition);
    handleTransform('move', newPosition);
  };

  const handleRotationChange = (axis: 0 | 1 | 2, value: number) => {
    const newRotation = [...rotation] as Vec3;
    newRotation[axis] = value;
    setRotation(newRotation);
    handleTransform('rotate', newRotation);
  };

  const handleScaleChange = (axis: 0 | 1 | 2, value: number) => {
    const newScale = [...scale] as Vec3;
    newScale[axis] = value;
    setScale(newScale);
    handleTransform('scale', newScale);
  };

  const handleUniformScale = (value: number) => {
    const newScale: Vec3 = [value, value, value];
    setScale(newScale);
    handleTransform('scale', newScale);
  };

  const handleReset = () => {
    setPosition([0, 0, 0]);
    setRotation([0, 0, 0]);
    setScale([1, 1, 1]);
    handleTransform('move', [0, 0, 0]);
    handleTransform('rotate', [0, 0, 0]);
    handleTransform('scale', [1, 1, 1]);
  };

  const handleQuickMove = (axis: 0 | 1 | 2, direction: 1 | -1) => {
    const step = snapToGrid ? gridSize : 0.1;
    const newPosition = [...position] as Vec3;
    newPosition[axis] += direction * step;
    setPosition(newPosition);
    handleTransform('move', newPosition);
  };

  const handleQuickRotate = (axis: 0 | 1 | 2, direction: 1 | -1) => {
    const step = 15; // 15 grados
    const newRotation = [...rotation] as Vec3;
    newRotation[axis] += direction * step * (Math.PI / 180);
    setRotation(newRotation);
    handleTransform('rotate', newRotation);
  };

  if (!selectedInstance || !selectedAsset) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Controles de Transformación</h3>
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2">🎛️</div>
          <p>Selecciona un objeto para transformar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Controles de Transformación</h3>
        {isUpdating && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
        )}
      </div>

      {/* Info del objeto seleccionado */}
      <div className="mb-4 p-2 bg-gray-700 rounded">
        <p className="text-sm text-gray-300">
          <strong>Objeto:</strong> {selectedAsset.name}
        </p>
        <p className="text-sm text-gray-300">
          <strong>Tipo:</strong> {selectedAsset.type}
        </p>
      </div>

      {/* Opciones de Grid */}
      <div className="mb-4 p-2 bg-gray-700 rounded">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-gray-300">
            <input
              type="checkbox"
              checked={snapToGrid}
              onChange={(e) => setSnapToGrid(e.target.checked)}
              className="mr-2"
            />
            Snap to Grid
          </label>
          <input
            type="number"
            value={gridSize}
            onChange={(e) => setGridSize(Number(e.target.value))}
            min="0.1"
            max="2"
            step="0.1"
            className="w-16 px-2 py-1 bg-gray-600 text-white text-xs rounded"
            disabled={!snapToGrid}
          />
        </div>
      </div>

      {/* Controles de Posición */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-white">Posición</h4>
          <button
            onClick={() => handleTransform('move', [0, 0, 0])}
            className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-xs rounded"
          >
            Reset
          </button>
        </div>
        <div className="space-y-2">
          {['X', 'Y', 'Z'].map((axis, index) => (
            <div key={axis} className="flex items-center gap-2">
              <label className="text-sm text-gray-300 w-4">{axis}:</label>
              <button
                onClick={() => handleQuickMove(index as 0 | 1 | 2, -1)}
                className="px-2 py-1 bg-red-600 hover:bg-red-500 text-xs rounded"
              >
                -
              </button>
              <input
                type="number"
                value={position[index].toFixed(2)}
                onChange={(e) => handlePositionChange(index as 0 | 1 | 2, Number(e.target.value))}
                className="flex-1 px-2 py-1 bg-gray-600 text-white text-sm rounded"
                step="0.1"
              />
              <button
                onClick={() => handleQuickMove(index as 0 | 1 | 2, 1)}
                className="px-2 py-1 bg-green-600 hover:bg-green-500 text-xs rounded"
              >
                +
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Controles de Rotación */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-white">Rotación (grados)</h4>
          <button
            onClick={() => handleTransform('rotate', [0, 0, 0])}
            className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-xs rounded"
          >
            Reset
          </button>
        </div>
        <div className="space-y-2">
          {['X', 'Y', 'Z'].map((axis, index) => (
            <div key={axis} className="flex items-center gap-2">
              <label className="text-sm text-gray-300 w-4">{axis}:</label>
              <button
                onClick={() => handleQuickRotate(index as 0 | 1 | 2, -1)}
                className="px-2 py-1 bg-red-600 hover:bg-red-500 text-xs rounded"
              >
                -15°
              </button>
              <input
                type="number"
                value={(rotation[index] * 180 / Math.PI).toFixed(1)}
                onChange={(e) => handleRotationChange(index as 0 | 1 | 2, Number(e.target.value) * Math.PI / 180)}
                className="flex-1 px-2 py-1 bg-gray-600 text-white text-sm rounded"
                step="15"
              />
              <button
                onClick={() => handleQuickRotate(index as 0 | 1 | 2, 1)}
                className="px-2 py-1 bg-green-600 hover:bg-green-500 text-xs rounded"
              >
                +15°
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Controles de Escala */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-white">Escala</h4>
          <button
            onClick={() => handleTransform('scale', [1, 1, 1])}
            className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-xs rounded"
          >
            Reset
          </button>
        </div>
        
        {/* Escala uniforme */}
        <div className="mb-2">
          <label className="text-sm text-gray-300">Uniforme:</label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={scale[0]}
            onChange={(e) => handleUniformScale(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-gray-400 text-center">{scale[0].toFixed(1)}x</div>
        </div>

        {/* Escala por eje */}
        <div className="space-y-2">
          {['X', 'Y', 'Z'].map((axis, index) => (
            <div key={axis} className="flex items-center gap-2">
              <label className="text-sm text-gray-300 w-4">{axis}:</label>
              <input
                type="number"
                value={scale[index].toFixed(2)}
                onChange={(e) => handleScaleChange(index as 0 | 1 | 2, Number(e.target.value))}
                className="flex-1 px-2 py-1 bg-gray-600 text-white text-sm rounded"
                min="0.1"
                max="5"
                step="0.1"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-2">
        <button
          onClick={handleReset}
          className="flex-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-500 text-white text-sm rounded"
        >
          Reset Todo
        </button>
        <button
          onClick={() => {
            // Duplicar objeto (crear nueva instancia)
            // Esta funcionalidad podría implementarse más adelante
          }}
          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded"
          disabled
        >
          Duplicar
        </button>
      </div>
    </div>
  );
} 