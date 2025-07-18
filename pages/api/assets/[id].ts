import { NextApiRequest, NextApiResponse } from 'next';
import { getAssetsCollection } from '../../../lib/mongodb';
import { AssetSchema } from '../../../src/state/gameTypes';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid asset ID'
      });
    }

    const collection = await getAssetsCollection();

    if (req.method === 'GET') {
      // Obtener asset específico
      const asset = await collection.findOne({ id });
      
      if (!asset) {
        return res.status(404).json({
          success: false,
          error: 'Asset not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: asset
      });
    }

    if (req.method === 'PUT') {
      // Actualizar asset
      const assetData = req.body;

      // Validar datos del asset
      const validatedAsset = AssetSchema.parse({
        ...assetData,
        id,
        updatedAt: new Date().toISOString(),
        lastModified: {
          by: assetData.lastModified?.by || 'default',
          at: new Date().toISOString()
        }
      });

      const result = await collection.updateOne(
        { id },
        { $set: validatedAsset }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          error: 'Asset not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: validatedAsset
      });
    }

    if (req.method === 'DELETE') {
      // Eliminar asset
      const result = await collection.deleteOne({ id });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          error: 'Asset not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Asset deleted successfully'
      });
    }

    // Método no permitido
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error) {
    console.error('Asset API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
} 