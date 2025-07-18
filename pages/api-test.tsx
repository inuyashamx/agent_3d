import React, { useState, useEffect } from 'react';
import { 
  saveSceneToAPI, 
  loadSceneFromAPI, 
  listScenesFromAPI, 
  deleteSceneFromAPI, 
  getCurrentSceneId, 
  setCurrentSceneId,
  SceneApiData 
} from '../src/api/scenes';
import { createDefaultScene, createDefaultObj3D } from '../src/state/types';
import { getSystemStatus } from '../src/persist/mongoOnly';

export default function ApiTest() {
  const [scenes, setScenes] = useState<SceneApiData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [currentSceneId, setCurrentSceneIdState] = useState<string | null>(null);

  useEffect(() => {
    checkSystemStatus();
    refreshScenes();
    setCurrentSceneIdState(getCurrentSceneId());
  }, []);

  const checkSystemStatus = async () => {
    try {
      const status = await getSystemStatus();
      setSystemStatus(status);
    } catch (error) {
      console.error('Error checking system status:', error);
    }
  };

  const refreshScenes = async () => {
    setLoading(true);
    try {
      const sceneList = await listScenesFromAPI();
      setScenes(sceneList);
      setError(null);
    } catch (error: any) {
      setError(`Error loading scenes: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createTestScene = async () => {
    setLoading(true);
    try {
      const testScene = createDefaultScene();
      // Agregar algunos objetos de prueba
             const testBox = createDefaultObj3D('box', 'Test Box');
       testBox.id = 'test-box';
       testBox.material.color = '#ff0000';
       testScene.objects['test-box'] = testBox;
      
      const savedScene = await saveSceneToAPI(testScene);
      setCurrentSceneId(savedScene.id);
      setCurrentSceneIdState(savedScene.id);
      await refreshScenes();
      setError(null);
    } catch (error: any) {
      setError(`Error creating scene: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteScene = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta escena?')) return;
    
    setLoading(true);
    try {
      await deleteSceneFromAPI(id);
      if (currentSceneId === id) {
        setCurrentSceneId('');
        setCurrentSceneIdState(null);
      }
      await refreshScenes();
      setError(null);
    } catch (error: any) {
      setError(`Error deleting scene: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadScene = async (id: string) => {
    setLoading(true);
    try {
      const scene = await loadSceneFromAPI(id);
      setCurrentSceneId(id);
      setCurrentSceneIdState(id);
      console.log('Scene loaded:', scene);
      setError(null);
    } catch (error: any) {
      setError(`Error loading scene: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">API Test Page</h1>
        
        {/* System Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          {systemStatus ? (
            <div className="space-y-2">
              <div className={`p-2 rounded ${systemStatus.mongoAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                MongoDB Available: {systemStatus.mongoAvailable ? '✅ Yes' : '❌ No'}
              </div>
              <div className={`p-2 rounded ${systemStatus.currentSceneId ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                Current Scene ID: {systemStatus.currentSceneId || 'None'}
              </div>
            </div>
          ) : (
            <div>Loading system status...</div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <button
              onClick={createTestScene}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? 'Creating...' : 'Create Test Scene'}
            </button>
            <button
              onClick={refreshScenes}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              {loading ? 'Loading...' : 'Refresh Scenes'}
            </button>
          </div>
        </div>

        {/* Scenes List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Saved Scenes</h2>
          {loading ? (
            <div>Loading scenes...</div>
          ) : scenes.length === 0 ? (
            <div className="text-gray-500">No scenes found. Create a test scene to get started.</div>
          ) : (
            <div className="space-y-4">
              {scenes.map((scene) => (
                <div 
                  key={scene.id} 
                  className={`border rounded-lg p-4 ${scene.id === currentSceneId ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">Scene {scene.id}</h3>
                      <p className="text-sm text-gray-600">
                        Created: {new Date(scene.timestamp).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Objects: {Object.keys(scene.data.objects).length}
                      </p>
                      {scene.id === currentSceneId && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Current</span>
                      )}
                    </div>
                    <div className="space-x-2">
                      <button
                        onClick={() => loadScene(scene.id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deleteScene(scene.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 