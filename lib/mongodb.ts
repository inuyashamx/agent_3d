import { MongoClient, Db, Collection } from 'mongodb';
import { SceneData } from '@/state/types';

// Tipos para MongoDB
export interface SceneDocument {
  _id?: string;
  id: string;
  data: SceneData;
  timestamp: string;
  userId?: string;
}

export interface AppConfigDocument {
  _id?: string;
  userId: string;
  config: {
    theme: string;
    language: string;
    autoSave: boolean;
    [key: string]: any;
  };
  timestamp: string;
}

// Variables de entorno
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'agi_3d_mvp';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Cache de conexión para evitar múltiples conexiones
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const client = new MongoClient(MONGODB_URI!);
    await client.connect();
    
    const db = client.db(DB_NAME);
    
    cachedClient = client;
    cachedDb = db;
    
    return { client, db };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

// Utilidades para obtener colecciones
export async function getScenesCollection(): Promise<Collection<SceneDocument>> {
  const { db } = await connectToDatabase();
  return db.collection<SceneDocument>('scenes');
}

export async function getConfigCollection(): Promise<Collection<AppConfigDocument>> {
  const { db } = await connectToDatabase();
  return db.collection<AppConfigDocument>('config');
}

// Función para cerrar conexión (útil para cleanup)
export async function closeConnection() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
  }
} 