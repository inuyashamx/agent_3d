import { NextApiRequest, NextApiResponse } from 'next';
import { getGameScenesCollection } from '../../../../../lib/mongodb';
import { SceneInstanceSchema } from '../../../../../src/state/gameTypes';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id: sceneId, instanceId } = req.query;
    
    if (!sceneId || !instanceId || typeof sceneId !== 'string' || typeof instanceId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid scene ID or instance ID'
      });
    }

    const collection = await getGameScenesCollection();

    if (req.method === 'GET') {
      // Obtener instancia específica
      const scene = await collection.findOne({ id: sceneId });
      
      if (!scene) {
        return res.status(404).json({
          success: false,
          error: 'Scene not found'
        });
      }

      const instance = scene.instances[instanceId];
      if (!instance) {
        return res.status(404).json({
          success: false,
          error: 'Instance not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: instance
      });
    }

    if (req.method === 'PUT') {
      // Actualizar instancia
      const updates = req.body;

      // Validar datos de la instancia
      const validatedUpdates = SceneInstanceSchema.partial().parse(updates);

      // Obtener la escena
      const scene = await collection.findOne({ id: sceneId });
      if (!scene) {
        return res.status(404).json({
          success: false,
          error: 'Scene not found'
        });
      }

      // Verificar que la instancia existe
      if (!scene.instances[instanceId]) {
        return res.status(404).json({
          success: false,
          error: 'Instance not found'
        });
      }

      // Aplicar actualizaciones
      const currentInstance = scene.instances[instanceId];
      const updatedInstance = { ...currentInstance, ...validatedUpdates };

      // Actualizar la instancia en la escena
      const result = await collection.updateOne(
        { id: sceneId },
        { 
          $set: { 
            [`instances.${instanceId}`]: updatedInstance,
            updatedAt: new Date().toISOString(),
            'lastModified.at': new Date().toISOString()
          }
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          error: 'Failed to update instance'
        });
      }

      return res.status(200).json({
        success: true,
        data: updatedInstance
      });
    }

    if (req.method === 'DELETE') {
      // Eliminar instancia
      const scene = await collection.findOne({ id: sceneId });
      if (!scene) {
        return res.status(404).json({
          success: false,
          error: 'Scene not found'
        });
      }

      if (!scene.instances[instanceId]) {
        return res.status(404).json({
          success: false,
          error: 'Instance not found'
        });
      }

      // Eliminar la instancia
      const result = await collection.updateOne(
        { id: sceneId },
        { 
          $unset: { [`instances.${instanceId}`]: "" },
          $set: {
            updatedAt: new Date().toISOString(),
            'lastModified.at': new Date().toISOString()
          }
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          error: 'Failed to delete instance'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Instance deleted successfully'
      });
    }

    // Método no permitido
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error) {
    console.error('Instance API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
} 