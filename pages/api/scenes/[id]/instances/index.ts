import { NextApiRequest, NextApiResponse } from 'next';
import { getGameScenesCollection, getAssetsCollection } from '../../../../../lib/mongodb';
import { SceneInstanceSchema, createDefaultTransform } from '../../../../../src/state/gameTypes';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id: sceneId } = req.query;
    
    if (!sceneId || typeof sceneId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid scene ID'
      });
    }

    const scenesCollection = await getGameScenesCollection();
    const assetsCollection = await getAssetsCollection();

    if (req.method === 'GET') {
      // Obtener todas las instancias de la escena
      const scene = await scenesCollection.findOne({ id: sceneId });
      
      if (!scene) {
        return res.status(404).json({
          success: false,
          error: 'Scene not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: scene.instances
      });
    }

    if (req.method === 'POST') {
      // Crear nueva instancia (instantiate prefab)
      const { prefabId, transform, overrides, name } = req.body;

      if (!prefabId) {
        return res.status(400).json({
          success: false,
          error: 'Prefab ID is required'
        });
      }

      // Verificar que el prefab existe
      const prefab = await assetsCollection.findOne({ id: prefabId });
      if (!prefab) {
        return res.status(404).json({
          success: false,
          error: 'Prefab not found'
        });
      }

      // Crear nueva instancia
      const instanceId = uuidv4();
      const newInstance = SceneInstanceSchema.parse({
        id: instanceId,
        prefabId,
        transform: transform || createDefaultTransform(),
        overrides: overrides || {},
        components: [],
        visible: true,
        locked: false,
        spawned: false,
      });

      // Agregar instancia a la escena
      const result = await scenesCollection.updateOne(
        { id: sceneId },
        { 
          $set: { 
            [`instances.${instanceId}`]: newInstance,
            updatedAt: new Date().toISOString(),
            'lastModified.at': new Date().toISOString()
          }
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          error: 'Scene not found'
        });
      }

      // Incrementar uso del prefab
      await assetsCollection.updateOne(
        { id: prefabId },
        { $inc: { usage: 1 } }
      );

      return res.status(201).json({
        success: true,
        data: {
          instanceId,
          instance: newInstance,
          prefab: {
            id: prefab.id,
            name: prefab.name,
            type: prefab.type
          }
        }
      });
    }

    // Método no permitido
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error) {
    console.error('Instances API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
} 