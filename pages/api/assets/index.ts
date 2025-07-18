import { NextApiRequest, NextApiResponse } from 'next';
import { getAssetsCollection } from '../../../lib/mongodb';
import { AssetSchema, createDefaultAsset } from '../../../src/state/gameTypes';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const collection = await getAssetsCollection();

    if (req.method === 'GET') {
      // Obtener parámetros de query
      const { 
        owner, 
        type, 
        visibility, 
        tags, 
        search, 
        limit = '20', 
        offset = '0' 
      } = req.query;

      // Construir filtros
      const filters: any = {};
      
      if (owner) filters['owner.id'] = owner;
      if (type) filters.type = type;
      if (visibility) filters.visibility = visibility;
      if (tags) filters.tags = { $in: Array.isArray(tags) ? tags : [tags] };
      
      // Búsqueda por texto
      if (search) {
        filters.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } }
        ];
      }

      // Obtener assets con paginación
      const assets = await collection
        .find(filters)
        .sort({ createdAt: -1 })
        .skip(parseInt(offset as string))
        .limit(parseInt(limit as string))
        .toArray();

      // Contar total para paginación
      const total = await collection.countDocuments(filters);

      return res.status(200).json({
        success: true,
        data: assets,
        pagination: {
          total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore: total > parseInt(offset as string) + parseInt(limit as string)
        }
      });
    }

    if (req.method === 'POST') {
      // Crear nuevo asset
      const assetData = req.body;

      // Validar datos del asset
      const validatedAsset = AssetSchema.parse({
        ...assetData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastModified: {
          by: assetData.owner?.id || 'default',
          at: new Date().toISOString()
        }
      });

      const result = await collection.insertOne(validatedAsset);
      
      return res.status(201).json({
        success: true,
        data: { ...validatedAsset, _id: result.insertedId }
      });
    }

    // Método no permitido
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error) {
    console.error('Assets API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
} 