import React, { useState, useEffect } from 'react';
import { 
  createDefaultAsset, 
  createDefaultGameScene, 
  createDefaultTransform,
  Asset,
  GameScene,
  SceneInstance 
} from '../src/state/gameTypes';

export default function GameEngineDemo() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [scenes, setScenes] = useState<GameScene[]>([]);
  const [selectedScene, setSelectedScene] = useState<GameScene | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar assets
  const loadAssets = async () => {
    try {
      const response = await fetch('/api/assets');
      const data = await response.json();
      if (data.success) {
        setAssets(data.data);
      }
    } catch (error) {
      console.error('Error loading assets:', error);
    }
  };

  // Cargar scenes
  const loadScenes = async () => {
    try {
      const response = await fetch('/api/game-scenes');
      const data = await response.json();
      if (data.success) {
        setScenes(data.data);
      }
    } catch (error) {
      console.error('Error loading scenes:', error);
    }
  };

  // Crear asset de ejemplo
  const createExampleAsset = async (type: 'prefab' | 'material') => {
    setLoading(true);
    try {
      const asset = createDefaultAsset(type, `Example ${type}`);
      
      // Customizar según el tipo
      if (type === 'prefab') {
        asset.name = 'Basic House';
        asset.description = 'A simple house prefab';
        asset.tags = ['building', 'residential'];
        asset.data.material = {
          color: '#8B4513',
          opacity: 1,
          metallic: 0.2,
          roughness: 0.8,
          emissive: '#000000'
        };
      } else if (type === 'material') {
        asset.name = 'Stone Material';
        asset.description = 'A realistic stone material';
        asset.tags = ['material', 'stone'];
        asset.data.material = {
          color: '#696969',
          opacity: 1,
          metallic: 0.1,
          roughness: 0.9,
          emissive: '#000000'
        };
      }

      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(asset)
      });

      if (response.ok) {
        await loadAssets();
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create asset');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Crear escena de ejemplo
  const createExampleScene = async () => {
    setLoading(true);
    try {
      const scene = createDefaultGameScene('Example Scene');
      scene.description = 'A demo scene with various objects';
      scene.tags = ['demo', 'example'];

      const response = await fetch('/api/game-scenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scene)
      });

      if (response.ok) {
        await loadScenes();
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create scene');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Instanciar asset en escena
  const instantiateAsset = async (assetId: string, sceneId: string) => {
    if (!assetId || !sceneId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/scenes/${sceneId}/instances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prefabId: assetId,
          transform: createDefaultTransform(),
          overrides: {}
        })
      });

      if (response.ok) {
        await loadScenes();
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to instantiate asset');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Transformar instancia
  const transformInstance = async (
    sceneId: string, 
    instanceId: string, 
    operation: 'move' | 'rotate' | 'scale',
    delta: [number, number, number]
  ) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/scenes/${sceneId}/instances/${instanceId}/transform`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation,
          delta
        })
      });

      if (response.ok) {
        await loadScenes();
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to transform instance');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
    loadScenes();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">🎮 Game Engine Demo</h1>
        
        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assets Panel */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">📦 Assets Library</h2>
            
            <div className="space-y-2 mb-4">
              <button
                onClick={() => createExampleAsset('prefab')}
                disabled={loading}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
              >
                {loading ? 'Creating...' : 'Create House Prefab'}
              </button>
              <button
                onClick={() => createExampleAsset('material')}
                disabled={loading}
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
              >
                {loading ? 'Creating...' : 'Create Stone Material'}
              </button>
            </div>

            <div className="space-y-2">
              {assets.map((asset) => (
                <div 
                  key={asset.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedAsset?.id === asset.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedAsset(asset)}
                >
                  <h3 className="font-medium">{asset.name}</h3>
                  <p className="text-sm text-gray-600">Type: {asset.type}</p>
                  <p className="text-sm text-gray-600">Usage: {asset.usage}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {asset.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scenes Panel */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🎭 Scenes</h2>
            
            <button
              onClick={createExampleScene}
              disabled={loading}
              className="w-full bg-purple-500 text-white px-4 py-2 rounded mb-4 hover:bg-purple-600 disabled:bg-gray-400"
            >
              {loading ? 'Creating...' : 'Create Example Scene'}
            </button>

            <div className="space-y-2">
              {scenes.map((scene) => (
                <div 
                  key={scene.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedScene?.id === scene.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedScene(scene)}
                >
                  <h3 className="font-medium">{scene.name}</h3>
                  <p className="text-sm text-gray-600">
                    Instances: {Object.keys(scene.instances).length}
                  </p>
                  <p className="text-sm text-gray-600">
                    Created: {new Date(scene.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Scene Details Panel */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🔧 Scene Details</h2>
            
            {selectedScene ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Scene: {selectedScene.name}</h3>
                  <p className="text-sm text-gray-600">{selectedScene.description}</p>
                </div>

                {/* Instantiate Asset */}
                {selectedAsset && (
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <h4 className="font-medium mb-2">Instantiate Asset</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Selected: {selectedAsset.name}
                    </p>
                    <button
                      onClick={() => instantiateAsset(selectedAsset.id, selectedScene.id)}
                      disabled={loading}
                      className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
                    >
                      {loading ? 'Creating...' : 'Add to Scene'}
                    </button>
                  </div>
                )}

                {/* Scene Instances */}
                <div>
                  <h4 className="font-medium mb-2">Scene Instances</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedScene.instances).map(([instanceId, instance]) => (
                      <div key={instanceId} className="border rounded-lg p-3">
                        <h5 className="font-medium">Instance {instanceId.slice(0, 8)}...</h5>
                        <p className="text-sm text-gray-600">Prefab: {instance.prefabId}</p>
                        <p className="text-sm text-gray-600">
                          Position: [{instance.transform.position.join(', ')}]
                        </p>
                        
                        {/* Transform Controls */}
                        <div className="mt-2 space-y-1">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => transformInstance(selectedScene.id, instanceId, 'move', [1, 0, 0])}
                              className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                            >
                              Move +X
                            </button>
                            <button
                              onClick={() => transformInstance(selectedScene.id, instanceId, 'move', [0, 1, 0])}
                              className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                            >
                              Move +Y
                            </button>
                            <button
                              onClick={() => transformInstance(selectedScene.id, instanceId, 'move', [0, 0, 1])}
                              className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                            >
                              Move +Z
                            </button>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => transformInstance(selectedScene.id, instanceId, 'rotate', [0, 0, 45])}
                              className="text-xs bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600"
                            >
                              Rotate Z
                            </button>
                            <button
                              onClick={() => transformInstance(selectedScene.id, instanceId, 'scale', [1.2, 1.2, 1.2])}
                              className="text-xs bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600"
                            >
                              Scale +
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Select a scene to see details</p>
            )}
          </div>
        </div>

        {/* Architecture Info */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">🏗️ Architecture Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="bg-blue-100 rounded-lg p-4 mb-2">
                <h3 className="font-medium">Assets/Prefabs</h3>
                <p className="text-2xl font-bold">{assets.length}</p>
              </div>
              <p className="text-sm text-gray-600">Reusable 3D objects</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-lg p-4 mb-2">
                <h3 className="font-medium">Scenes</h3>
                <p className="text-2xl font-bold">{scenes.length}</p>
              </div>
              <p className="text-sm text-gray-600">Game levels/environments</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-lg p-4 mb-2">
                <h3 className="font-medium">Instances</h3>
                <p className="text-2xl font-bold">
                  {scenes.reduce((acc, scene) => acc + Object.keys(scene.instances).length, 0)}
                </p>
              </div>
              <p className="text-sm text-gray-600">Objects in scenes</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 rounded-lg p-4 mb-2">
                <h3 className="font-medium">Total Usage</h3>
                <p className="text-2xl font-bold">
                  {assets.reduce((acc, asset) => acc + asset.usage, 0)}
                </p>
              </div>
              <p className="text-sm text-gray-600">Asset instances created</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 