import { NextApiRequest, NextApiResponse } from 'next';
import { getScenesCollection } from '../../../lib/mongodb';
import { SceneDataSchema } from '../../../src/state/types';

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

    const collection = await getScenesCollection();

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
      const { data: sceneData } = req.body;

      // Validar datos de la escena
      const validatedScene = SceneDataSchema.parse(sceneData);

      const result = await collection.updateOne(
        { id },
        { 
          $set: { 
            data: validatedScene, 
            timestamp: new Date().toISOString() 
          } 
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          error: 'Scene not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: { id, data: validatedScene }
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
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
} 