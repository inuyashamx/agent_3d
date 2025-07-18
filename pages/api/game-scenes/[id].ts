import { NextApiRequest, NextApiResponse } from 'next';
import { getGameScenesCollection } from '../../../lib/mongodb';
import { GameSceneSchema } from '../../../src/state/gameTypes';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid scene ID'
      });
    }

    const collection = await getGameScenesCollection();

    if (req.method === 'GET') {
      // Obtener escena específica
      const scene = await collection.findOne({ id });
      
      if (!scene) {
        return res.status(404).json({
          success: false,
          error: 'Scene not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: scene
      });
    }

    if (req.method === 'PUT') {
      // Actualizar escena
      const sceneData = req.body;

      // Validar datos de la escena
      const validatedScene = GameSceneSchema.parse(sceneData);

      const result = await collection.updateOne(
        { id },
        { 
          $set: { 
            ...validatedScene,
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

      const updatedScene = await collection.findOne({ id });
      
      return res.status(200).json({
        success: true,
        data: updatedScene
      });
    }

    if (req.method === 'DELETE') {
      // Eliminar escena
      const result = await collection.deleteOne({ id });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          error: 'Scene not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Scene deleted successfully'
      });
    }

    // Método no permitido
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error) {
    console.error('Game Scene API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
} 