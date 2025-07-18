import { NextApiRequest, NextApiResponse } from 'next';
import { getScenesCollection, SceneDocument } from '../../../lib/mongodb';
import { SceneDataSchema } from '../../../src/state/types';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const collection = await getScenesCollection();

    if (req.method === 'GET') {
      // Listar todas las escenas
      const scenes = await collection.find({}).sort({ timestamp: -1 }).toArray();
      
      return res.status(200).json({
        success: true,
        data: scenes
      });
    }

    if (req.method === 'POST') {
      // Crear nueva escena
      const { data: sceneData, userId } = req.body;

      // Validar datos de la escena
      const validatedScene = SceneDataSchema.parse(sceneData);

      const newScene: SceneDocument = {
        id: uuidv4(),
        data: validatedScene,
        timestamp: new Date().toISOString(),
        userId: userId || 'default'
      };

      const result = await collection.insertOne(newScene);
      
      return res.status(201).json({
        success: true,
        data: { ...newScene, _id: result.insertedId }
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