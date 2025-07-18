import { NextApiRequest, NextApiResponse } from 'next';
import { getGameScenesCollection } from '../../../../../../lib/mongodb';
import { Vec3 } from '../../../../../../src/state/gameTypes';

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

    if (req.method === 'PUT') {
      const { operation, delta, absolute, axis, snap, gridSize } = req.body;
      
      if (!operation || !['move', 'rotate', 'scale'].includes(operation)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid operation. Must be move, rotate, or scale'
        });
      }

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

      const instance = scene.instances[instanceId];
      let newTransform = { ...instance.transform };

      // Aplicar transformación
      if (operation === 'move') {
        if (absolute) {
          newTransform.position = absolute as Vec3;
        } else if (delta) {
          const deltaVec = delta as Vec3;
          if (axis) {
            // Restringir movimiento a un eje específico
            const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
            newTransform.position[axisIndex] += deltaVec[axisIndex];
          } else {
            newTransform.position = [
              newTransform.position[0] + deltaVec[0],
              newTransform.position[1] + deltaVec[1],
              newTransform.position[2] + deltaVec[2]
            ];
          }
        }

        // Aplicar snap to grid
        if (snap && gridSize) {
          newTransform.position = newTransform.position.map(
            coord => Math.round(coord / gridSize) * gridSize
          ) as Vec3;
        }
      }

      if (operation === 'rotate') {
        if (absolute) {
          newTransform.rotation = absolute as Vec3;
        } else if (delta) {
          const deltaVec = delta as Vec3;
          if (axis) {
            // Restringir rotación a un eje específico
            const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
            newTransform.rotation[axisIndex] += deltaVec[axisIndex];
          } else {
            newTransform.rotation = [
              newTransform.rotation[0] + deltaVec[0],
              newTransform.rotation[1] + deltaVec[1],
              newTransform.rotation[2] + deltaVec[2]
            ];
          }
        }
      }

      if (operation === 'scale') {
        if (absolute) {
          newTransform.scale = absolute as Vec3;
        } else if (delta) {
          const deltaVec = delta as Vec3;
          if (axis) {
            // Restringir escala a un eje específico
            const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
            newTransform.scale[axisIndex] *= deltaVec[axisIndex];
          } else {
            newTransform.scale = [
              newTransform.scale[0] * deltaVec[0],
              newTransform.scale[1] * deltaVec[1],
              newTransform.scale[2] * deltaVec[2]
            ];
          }
        }
      }

      // Actualizar la instancia en la escena
      const result = await collection.updateOne(
        { id: sceneId },
        { 
          $set: { 
            [`instances.${instanceId}.transform`]: newTransform,
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
        data: {
          sceneId,
          instanceId,
          operation,
          transform: newTransform
        }
      });
    }

    // Método no permitido
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error) {
    console.error('Transform API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
} 